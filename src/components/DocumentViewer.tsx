"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Loader2,
  Wand2,
  Copy,
  Download,
  Upload,
  Trash2,
  FileUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { createDocument } from "@/api/documents";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import TemplateDrawer from "@/components/chat page/TemplateDrawer";
import { INITIAL_TEMPLATES } from "@/lib/mockData";

// Utils
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function cls(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

async function extractTextFromFile(file: File): Promise<string> {
  const text = await file.text();
  if (file.name.toLowerCase().endsWith(".json")) {
    try {
      const json = JSON.parse(text);
      return JSON.stringify(json, null, 2);
    } catch {
      return text;
    }
  }
  if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
    return text;
  }
  if (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  ) {
    try {
      const data = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;
      let fullText = "";
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        const strings = content.items.map((it: any) => (it.str ? it.str : ""));
        fullText += strings.join(" ") + "\n\n";
      }
      return fullText.trim() || "PDF matni topilmadi.";
    } catch (e) {
      console.warn("PDF extraction failed:", e);
      return "PDF matnini ajratish uchun pdfjs-dist kerak. Iltimos, kutubxona o'rnatilganligini tekshiring.";
    }
  }
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const plain = result.value.trim();
      return plain || "DOCX matni topilmadi.";
    } catch (e) {
      console.warn("DOCX extraction failed:", e);
      return "DOCX matnini ajratish uchun mammoth.js kerak. Iltimos, kutubxona o'rnatilganligini tekshiring.";
    }
  }
  if (file.name.toLowerCase().endsWith(".doc")) {
    return "DOC fayl yuklandi. Matn ekstraktsiya uchun maxsus kutubxona kerak bo'ladi.";
  }
  return text;
}

// Use global app templates

export function DocumentViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location as any).state as
    | { file?: File; fileName?: string }
    | undefined;

  // State
  const [mode, setMode] = useState<"upload" | "template">("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [extracting, setExtracting] = useState(false);

  // Template mode
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    INITIAL_TEMPLATES[0].id
  );
  const [detectedTemplate, setDetectedTemplate] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);

  // AI generation
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const selectedTemplate =
    INITIAL_TEMPLATES.find((t: any) => t.id === selectedTemplateId) ||
    INITIAL_TEMPLATES[0];

  useEffect(() => {
    if (state?.file) {
      setUploadedFile(state.file);
      handleFileUpload(state.file);
    }
  }, [state]);

  // AI shablon aniqlash
  async function detectTemplateFromText(text: string) {
    setIsAnalyzing(true);
    try {
      // Backend API orqali shablon aniqlash
      const response = await createDocument({
        content: text,
        description: "Detect template type",
        template_type: "auto_detect",
        language_code: "uz",
        script_type: "latin",
      });

      // Backend javobidan shablon turini ajratib olish
      const detected = response.template_type || "ariza";
      setDetectedTemplate(detected);
      setSelectedTemplateId(detected);
      toast.success(
        `AI shablon aniqladi: ${
          INITIAL_TEMPLATES.find((t) => t.id === detected)?.name || detected
        }`
      );
    } catch (error) {
      // Fallback: oddiy matn tahlili
      const lowerText = text.toLowerCase();
      let detected = "ariza";

      if (lowerText.includes("buyruq") || lowerText.includes("qarori")) {
        detected = "buyruq";
      } else if (
        lowerText.includes("shartnoma") ||
        lowerText.includes("kelishuv")
      ) {
        detected = "shartnoma";
      } else if (
        lowerText.includes("hisobot") ||
        lowerText.includes("ma'lumot")
      ) {
        detected = "hisobot";
      } else if (
        lowerText.includes("dalolatnoma") ||
        lowerText.includes("bayonnoma")
      ) {
        detected = "dalolatnoma";
      } else if (lowerText.includes("xat") || lowerText.includes("maktub")) {
        detected = "xat";
      }

      setDetectedTemplate(detected);
      setSelectedTemplateId(detected);
      toast.info(
        `AI tahlil: ${
          INITIAL_TEMPLATES.find((t) => t.id === detected)?.name || "Ariza"
        } aniqlandi`
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Handle file upload
  async function handleFileUpload(file: File) {
    setUploadedFile(file);
    setExtracting(true);
    setOriginalText("");
    setDetectedTemplate(null);

    try {
      const text = await extractTextFromFile(file);
      setOriginalText(text);
      toast.success(`${file.name} muvaffaqiyatli yuklandi!`);

      // Avtomatik shablon aniqlash
      if (text.trim().length > 50) {
        await detectTemplateFromText(text);
      }
    } catch (error: any) {
      console.error("Fayl yuklash xatosi:", error);
      setOriginalText("Faylni o'qishda xatolik yuz berdi.");
      toast.error(error.message || "Faylni o'qishda xatolik yuz berdi");
    } finally {
      setExtracting(false);
    }
  }

  // Handle AI generation
  async function handleGenerate() {
    if (loading) return;
    setLoading(true);

    try {
      if (mode === "upload" && originalText) {
        // Backend integration
        if (uploadedFile) {
          const response = await createDocument({
            original_file: uploadedFile,
            content: originalText,
            description: `AI tahlil: ${uploadedFile.name}`,
            template_type: selectedTemplateId,
            language_code: "uz",
            script_type: "latin",
          });

          if (response.content) {
            setGeneratedText(response.content);
            toast.success("AI tahlil muvaffaqiyatli yaratildi!");
          } else {
            throw new Error("Backend AI tahlilini qaytarmadi");
          }
        } else {
          // Fallback simulation
          await new Promise((r) => setTimeout(r, 1500));
          setGeneratedText(
            `AI TAHLIL\n\nYuklangan hujjat: Document\n\nTahlil:\n${originalText.slice(
              0,
              500
            )}...\n\n[AI tomonidan tahlil qilingan mazmun]\n\nXulosa: Hujjat muvaffaqiyatli tahlil qilindi.`
          );
        }
      } else if (mode === "template") {
        // Generate from template
        const base = selectedTemplate.content;
        const header = title ? `\n\n— ${title} —\n\n` : "\n\n";
        const attNote = attachments.length
          ? `\n\n(Ilovalar: ${attachments.map((f) => f.name).join(", ")})\n`
          : "";
        const userPrompt = prompt ? `\n\nQo'shimcha:\n${prompt}\n` : "";

        await new Promise((r) => setTimeout(r, 900));
        setGeneratedText(`${base}${header}${userPrompt}${attNote}`.trim());
        toast.success("Hujjat yaratildi!");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Xatolik yuz berdi");
      setGeneratedText("Xatolik yuz berdi.");
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

  function resetAll() {
    setUploadedFile(null);
    setOriginalText("");
    setGeneratedText("");
    setTitle("");
    setPrompt("");
    setAttachments([]);
  }

  return (
    <div className="flex min-h-screen flex-col  w-2/3 from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50  border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {/* Mode selector */}
            <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
              <button
                onClick={() => {
                  setMode("upload");
                  resetAll();
                }}
                className={cls(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition",
                  mode === "upload"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                )}>
                <Upload className="h-4 w-4" />
                Yuklash
              </button>
              <button
                onClick={() => {
                  setMode("template");
                  resetAll();
                }}
                className={cls(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition",
                  mode === "template"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                )}>
                <FileText className="h-4 w-4" />
                Shablon
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full flex-1 p-6">
        <div className="grid h-full gap-6 lg:grid-cols-2">
          {/* Left Panel - Input */}
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {mode === "upload" ? "Fayl yuklash" : "Shablon tanlash"}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {mode === "upload"
                  ? "PDF, DOCX, TXT yoki boshqa hujjatlarni yuklang"
                  : "Tayyor shablonlardan foydalanib hujjat yarating"}
              </p>
            </div>

            {mode === "upload" ? (
              <>
                {/* File upload area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer?.files?.[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={cls(
                    "flex min-h-28 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition",
                    isDragging
                      ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20"
                      : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
                  )}>
                  {uploadedFile ? (
                    <div className="flex w-full flex-col items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {formatBytes(uploadedFile.size)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setUploadedFile(null);
                          setOriginalText("");
                          setGeneratedText("");
                        }}
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40">
                        <Trash2 className="h-4 w-4" />
                        O'chirish
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        <FileUp className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="mb-1 text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Faylni bu yerga tashlang yoki tanlang
                      </p>
                      <p className="mb-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        PDF, DOCX, TXT va boshqa formatlar
                      </p>
                      <label className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                        Fayl tanlash
                        <input
                          type="file"
                          className="hidden"
                          accept=".txt,.json,.pdf,.docx,.doc"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </>
                  )}
                </div>

                {/* Original text preview */}
                {originalText && (
                  <div
                    className="flex flex-col rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                    style={{ minHeight: "300px", maxHeight: "400px" }}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Original matn
                      </h3>
                      {isAnalyzing && (
                        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          AI tahlil qilmoqda...
                        </div>
                      )}
                    </div>

                    {/* AI aniqlangan shablon */}
                    {detectedTemplate && (
                      <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                        <div className="mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            AI tomonidan aniqlangan shablon
                          </span>
                        </div>
                        <div className="space-y-2">
                          <select
                            value={selectedTemplateId}
                            onChange={(e) =>
                              setSelectedTemplateId(e.target.value)
                            }
                            className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-blue-800 dark:bg-zinc-900 dark:text-zinc-100">
                            {INITIAL_TEMPLATES.map((t: any) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Shablon to'g'ri bo'lmasa, yuqoridan
                            o'zgartirishingiz mumkin
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto rounded-lg bg-white p-3 dark:bg-zinc-900">
                      {extracting ? (
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Matn ajratilmoqda...
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-900 dark:text-zinc-100">
                          {originalText}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Template mode */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Shablon turi
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-zinc-300 bg-white px-4 py-2 pr-10 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400">
                        {INITIAL_TEMPLATES.map((t: any) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-zinc-400" />
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => setIsTemplateDrawerOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                        <FileText className="h-4 w-4" /> Barcha shablonlar
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Sarlavha (ixtiyoriy)
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Hujjat sarlavhasi"
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Qo'shimcha ko'rsatmalar
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      placeholder="Qanday o'zgartirishlar kerak..."
                      className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Ilovalar
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((f, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800">
                          <FileText className="h-3 w-3" />
                          <span className="max-w-32 truncate">{f.name}</span>
                          <button
                            onClick={() =>
                              setAttachments((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="text-zinc-400 hover:text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-zinc-300 bg-white px-3 py-1 text-xs transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                        + Fayl qo'shish
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept=".txt,.json,.pdf,.docx,.doc"
                          onChange={(e) => {
                            if (e.target.files) {
                              setAttachments((prev) => [
                                ...prev,
                                ...Array.from(e.target.files!),
                              ]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleGenerate}
                disabled={
                  loading || (mode === "upload" ? !originalText : false)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Ishlanmoqda...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    AI Generatsiya
                  </>
                )}
              </button>
              <button
                onClick={resetAll}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-3 font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                Tozalash
              </button>
            </div>
          </div>

          {/* Right Panel - Generated Result */}
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  AI Natija
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Sun'iy intellekt tomonidan yaratilgan
                </p>
              </div>
              {generatedText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      navigator.clipboard?.writeText(generatedText)
                    }
                    className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                    <Copy className="h-4 w-4" />
                    Nusxa
                  </button>
                  <button
                    onClick={() =>
                      downloadTxt(
                        `${title || uploadedFile?.name || "document"}.txt`,
                        generatedText
                      )
                    }
                    className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                    <Download className="h-4 w-4" />
                    Yuklab olish
                  </button>
                  <button
                    onClick={() =>
                      navigate("/final", {
                        state: {
                          content: generatedText,
                          title: title || uploadedFile?.name || "",
                          templateId: selectedTemplateId,
                        },
                      })
                    }
                    className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                    <FileText className="h-4 w-4" />
                    Finalga o'tish
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-zinc-200 bg-linear-to-br from-zinc-50 to-white p-6 dark:border-zinc-800 dark:from-zinc-800/50 dark:to-zinc-900">
              {loading ? (
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-400" />
                    <Wand2 className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      AI ishlamoqda...
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {mode === "upload"
                        ? "Hujjat tahlil qilinmoqda"
                        : "Hujjat yaratilmoqda"}
                    </p>
                  </div>
                </div>
              ) : generatedText ? (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                  {generatedText}
                </pre>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                    <Sparkles className="h-8 w-8 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      Natija bu yerda ko'rinadi
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      "AI Generatsiya" tugmasini bosing
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Templates Drawer */}
      <TemplateDrawer
        isOpen={isTemplateDrawerOpen}
        onClose={() => setIsTemplateDrawerOpen(false)}
        templates={INITIAL_TEMPLATES as any}
        onSelectTemplate={(t: any) => {
          setSelectedTemplateId(t.id);
          if (!title) setTitle(t.name);
          setIsTemplateDrawerOpen(false);
        }}
      />
    </div>
  );
}

export default DocumentViewer;
