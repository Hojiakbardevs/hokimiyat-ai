"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Wand2,
  ArrowRight,
  Copy,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { extractTextFromFile } from "@/lib/utils";
import { createDocument } from "@/api/documents";
import { toast } from "sonner";

export function DocumentViewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location as any).state as
    | { file?: File; fileName?: string }
    | undefined;

  const [originalText, setOriginalText] = useState<string>("");
  const [generatedText, setGeneratedText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(true);
  const [fileName, setFileName] = useState<string>("Document");
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  useEffect(() => {
    if (!state?.file) {
      navigate("/chat-assistant");
      return;
    }
    setFileName(state.fileName || state.file.name || "Document");
    setCurrentFile(state.file);
    extractDocument(state.file);
  }, [state, navigate]);

  async function extractDocument(file: File) {
    setExtracting(true);
    try {
      const text = await extractTextFromFile(file);
      setOriginalText(text);
    } catch (error) {
      setOriginalText(
        "Fayldan matn ajratib bo'lmadi. Faqat .txt va .json formatlar qo'llab-quvvatlanadi."
      );
    } finally {
      setExtracting(false);
    }
  }

  async function handleGenerate() {
    if (!originalText.trim() || loading || !currentFile) return;
    setLoading(true);
    try {
      // Backend'ga hujjatni yuboring va AI tahlilini oling
      const response = await createDocument({
        original_file: currentFile,
        content: originalText,
        description: `AI tahlil: ${fileName}`,
        template_type: "ariza", // default, keyin o'zgartirishingiz mumkin
        language_code: "uz",
        script_type: "latin",
      });

      console.log("Document created:", response);

      // Backend javobidan AI tahlilini olish
      if (response.content) {
        setGeneratedText(response.content);
        toast.success("AI tahlil muvaffaqiyatli yaratildi!");
      } else if (
        response.status === "pending" ||
        response.status === "processing"
      ) {
        toast.info("Hujjat tahlil qilinmoqda, iltimos biroz kuting...");
        setGeneratedText("Hujjat backend'da tahlil qilinmoqda...");
      } else {
        throw new Error("Backend AI tahlilini qaytarmadi");
      }
    } catch (error: any) {
      console.error("AI tahlil xatosi:", error);
      toast.error(error.message || "AI tahlilda xatolik yuz berdi");
      setGeneratedText(
        "Xatolik: " + (error.message || "Tahlil amalga oshmadi")
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadTxt(filename: string, text: string) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Orqaga
            </Button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Hujjatni ko'rish
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {fileName}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {generatedText && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate("/final", {
                    state: {
                      content: generatedText,
                      title: `AI tahlil: ${fileName}`,
                    },
                  })
                }
                className="gap-2">
                Final <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={loading || !originalText.trim()}
              className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Tahlil
                  qilinmoqda...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> AI Tahlil
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Panel - Original Document */}
        <div className="flex w-1/2 flex-col border-r border-zinc-200 dark:border-zinc-800">
          <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Original hujjat
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Yuklangan fayl matni
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <Card className="min-h-full p-6">
              {extracting ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Matn ajratilmoqda...
                    </p>
                  </div>
                </div>
              ) : originalText ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                    {originalText}
                  </pre>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Matn topilmadi.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Panel - AI Generated Analysis */}
        <div className="flex w-1/2 flex-col">
          <div className="border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  AI tahlil
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Sun'iy intellekt javob
                </p>
              </div>
              {generatedText && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      navigator.clipboard?.writeText(generatedText)
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                    <Copy className="h-3.5 w-3.5" /> Nusxa
                  </button>
                  <button
                    onClick={() =>
                      downloadTxt(`${fileName}_AI_tahlil.txt`, generatedText)
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                    <Download className="h-3.5 w-3.5" /> Yuklab olish
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <Card className="min-h-full p-6">
              {loading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <div className="text-center">
                    <p className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">
                      AI tahlil qilinmoqda...
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Hujjat tahlil qilinmoqda va javob tayyorlanmoqda
                    </p>
                  </div>
                </div>
              ) : generatedText ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                    {generatedText}
                  </pre>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    "AI Tahlil" tugmasini bosib, hujjat tahlilini boshlang.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocumentViewPage;
