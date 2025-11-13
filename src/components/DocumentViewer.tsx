"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Loader2,
  Wand2,
  Copy,
  Download,
  Trash2,
  FileUp,
  Sparkles,
} from "lucide-react";
import { createDocument } from "@/api/documents";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [detectedTemplate, setDetectedTemplate] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI generation
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showLogs, setShowLogs] = useState(true);

  // Template and description
  const [selectedTemplate, setSelectedTemplate] = useState<string>("ariza");
  const [description, setDescription] = useState("");

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
      const detected = (response as any).template_type || "ariza";
      setDetectedTemplate(detected);
      toast.success(`AI shablon aniqladi: ${detected}`);
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
      toast.info(`AI tahlil: ${detected} aniqlandi`);
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
    if (loading || !originalText || !uploadedFile) {
      toast.error("Iltimos, avval fayl yuklang!");
      return;
    }

    setLoading(true);

    try {
      // Backend integration with selected template
      const response = await createDocument({
        original_file: uploadedFile,
        content: originalText,
        description: description || `AI javob: ${uploadedFile?.name || ""}`,
        template_type: selectedTemplate || detectedTemplate || "ariza",
        language_code: "uz",
        script_type: "latin",
      });

      console.log("Backend response:", response);

      // Backend darhol javob qaytarishi mumkin
      if (response.content && response.content.trim()) {
        setGeneratedText(response.content);
        toast.success("AI javob muvaffaqiyatli yaratildi!");
        return;
      }

      // Agar status pending/processing bo'lsa, polling qilamiz
      if (
        response.id &&
        (response.status === "pending" || response.status === "processing")
      ) {
        toast.info("Hujjat qayta ishlanmoqda...");

        // Polling - har 2 sekundda status tekshirish
        let attempts = 0;
        const maxAttempts = 30; // 1 daqiqa

        const pollInterval = setInterval(async () => {
          attempts++;

          try {
            const { getDocument } = await import("@/api/documents");
            const updatedDoc = await getDocument(response.id);

            console.log(`Polling attempt ${attempts}:`, updatedDoc);

            if (
              updatedDoc.status === "done" ||
              updatedDoc.status === "completed"
            ) {
              clearInterval(pollInterval);
              if (updatedDoc.content) {
                setGeneratedText(updatedDoc.content);
                toast.success("AI javob muvaffaqiyatli yaratildi!");
              } else {
                setGeneratedText("Hujjat muvaffaqiyatli qayta ishlandi!");
                toast.success("Hujjat tayyor!");
              }
              setLoading(false);
            } else if (updatedDoc.status === "failed") {
              clearInterval(pollInterval);
              throw new Error(
                updatedDoc.error_message || "Hujjat yaratishda xatolik"
              );
            } else if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              throw new Error(
                "Kutish vaqti tugadi. Iltimos, qayta urinib ko'ring."
              );
            }
          } catch (pollError: any) {
            clearInterval(pollInterval);
            console.error("Polling error:", pollError);
            throw pollError;
          }
        }, 2000);

        return; // Don't stop loading yet
      }

      // Agar output_file mavjud bo'lsa
      if (response.output_file) {
        toast.success("Hujjat yaratildi! Faylni yuklab olishingiz mumkin.");
        setGeneratedText(
          `Hujjat muvaffaqiyatli yaratildi!\n\n` +
            `Fayl: ${response.output_file}\n` +
            `Status: ${response.status || "completed"}\n\n` +
            `Faylni yuklab olish uchun yuqoridagi tugmani bosing.`
        );
        return;
      }

      // Agar hech narsa bo'lmasa
      throw new Error("Backend javob qaytardi, lekin content topilmadi");
    } catch (error: any) {
      console.error("Document generation error:", error);
      toast.error(error.message || "Xatolik yuz berdi");

      // Fallback simulation
      const templateName = selectedTemplate || detectedTemplate || "ariza";
      setGeneratedText(
        `${templateName.toUpperCase()}\n\n` +
          `Yuklangan hujjat: ${uploadedFile?.name || ""}\n` +
          `Shablon turi: ${templateName}\n` +
          `Tavsif: ${description || "Yo'q"}\n\n` +
          `JAVOB:\n\n` +
          `Hurmatli [Ism],\n\n` +
          `Sizning ${new Date().toLocaleDateString(
            "uz-UZ"
          )} sanasidagi murojaatingizga javoban ma'lumot beramiz:\n\n` +
          `[AI tomonidan yaratilgan javob matni]\n\n` +
          `Hujjat tahlili asosida tayyorlangan javob.\n\n` +
          `Hurmat bilan,\n` +
          `[Mas'ul shaxs]\n` +
          `Sana: ${new Date().toLocaleDateString("uz-UZ")}`
      );
      toast.info("Demo rejimda ishlayapti");
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
    setDetectedTemplate(null);
  }

  return (
    <div className="flex min-h-screen flex-col w-2/3 from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      {/* Main Content */}
      <main className="mx-auto w-full flex-1 p-6">
        <div className="grid h-full gap-6 lg:grid-cols-2">
          {/* Left Panel - Input */}
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/50 bg-white p-6  dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-zinc-950/50">
            <div className="mb-2">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Hujjat yuklash
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                PDF, DOCX, TXT formatdagi hujjatlarni yuklang va AI javob oling
              </p>
            </div>
            {/* Template Selection */}
            <div className="space-y-3">
              <Label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Shablon turini tanlang
              </Label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Shablon tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ariza">Ariza</SelectItem>
                  <SelectItem value="bayonnoma">Bayonnoma</SelectItem>
                  <SelectItem value="shartnoma">Shartnoma</SelectItem>
                  <SelectItem value="malumotnoma">Ma'lumotnoma</SelectItem>
                  <SelectItem value="buyruq">Buyruq</SelectItem>
                  <SelectItem value="hisobot">Hisobot</SelectItem>
                  <SelectItem value="dalolatnoma">Dalolatnoma</SelectItem>
                  <SelectItem value="xat">Xat</SelectItem>
                </SelectContent>
              </Select>

              {detectedTemplate && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  💡 AI taklifi: {detectedTemplate}
                </p>
              )}
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Tavsif (ixtiyoriy)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hujjat haqida qo'shimcha ma'lumot kiriting..."
                rows={3}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

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
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition",
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20"
                  : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
              )}>
              {uploadedFile ? (
                <div className="flex w-full flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
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
                      setDetectedTemplate(null);
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
                className="flex flex-col rounded-lg border border-border bg-zinc-50 p-3 dark:bg-zinc-800/50 h-126"
                style={{ minHeight: "300px", maxHeight: "400px" }}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase mx-auto">
                    Original matn
                  </h3>
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      AI tahlil qilmoqda...
                    </div>
                  )}
                </div>

                {/* Console log toggle tugmalari */}
                <div className="mb-3 flex items-center gap-2">
                  <button
                    onClick={() => setShowLogs(true)}
                    className={cls(
                      "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                      showLogs
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                    )}>
                    Ko'rsatish
                  </button>
                  <button
                    onClick={() => setShowLogs(false)}
                    className={cls(
                      "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                      !showLogs
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                    )}>
                    Yashirish
                  </button>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    (Console loglar)
                  </span>
                </div>

                {/* AI aniqlangan shablon */}
                {detectedTemplate && (
                  <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                    <div className="mb-1 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        AI tomonidan aniqlangan shablon
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {detectedTemplate}
                    </p>
                  </div>
                )}

                <div
                  className="flex-1 overflow-y-auto rounded-lg bg-white p-3 dark:bg-zinc-900"
                  style={{ display: showLogs ? "block" : "none" }}>
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

                {/* Yashirilgan holatda xabar */}
                {!showLogs && (
                  <div className="flex-1 flex items-center justify-center rounded-lg bg-white p-6 dark:bg-zinc-900">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Console loglar yashirilgan. Ko'rish uchun "Ko'rsatish"
                      tugmasini bosing.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading || !originalText || !uploadedFile}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50">
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
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/50 bg-white p-6  dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-zinc-950/50">
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
                        `${uploadedFile?.name || "document"}.txt`,
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
                          title: uploadedFile?.name || "",
                          templateId: detectedTemplate || "auto_detect",
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

            <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-linear-to-br from-zinc-50 to-white p-6 dark:from-zinc-800/50 dark:to-zinc-900">
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
                      Hujjat tahlil qilinmoqda
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
    </div>
  );
}

export default DocumentViewer;
