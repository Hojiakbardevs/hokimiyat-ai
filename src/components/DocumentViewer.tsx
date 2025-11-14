import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Loader2,
  Wand2,
  Copy,
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
import { motion } from "framer-motion";

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
      return "DOCX matnini ajratish uchun mammoth.js kerak. Iltimos, kutubxona o'rnatilganligini tekshiring.";
    }
  }
  if (file.name.toLowerCase().endsWith(".doc")) {
    return "DOC fayl yuklandi. Matn ekstraktsiya uchun maxsus kutubxona kerak bo'ladi.";
  }
  return text;
}

// Use global app templates

export type MergeMode = "merge" | "append" | "replace";

export interface DocumentViewerHandle {
  applyMerge: (replacement: string, mode?: MergeMode) => void;
  getSelectedText: () => string;
}

export interface DocumentViewerProps {
  onSendSelectionToChat?: (selected: string) => void;
}

export const DocumentViewer = forwardRef<
  DocumentViewerHandle,
  DocumentViewerProps
>(function DocumentViewer({ onSendSelectionToChat }, ref) {
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
  // Original matnni ko'rsatish toggli (default: yashirin)
  const [showOriginal, setShowOriginal] = useState(false);
  // Selection state for AI result area
  const resultContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectionText, setSelectionText] = useState<string>("");
  const [selectionRange, setSelectionRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  // Animation trigger for merge updates
  const [animationKey, setAnimationKey] = useState(0);

  useImperativeHandle(ref, () => ({
    applyMerge: (replacement: string, mode: MergeMode = "merge") => {
      if (!replacement) return;
      if (mode === "append" || !selectionRange) {
        setGeneratedText((prev) =>
          prev ? prev + "\n" + replacement : replacement
        );
        setAnimationKey((k) => k + 1);
        return;
      }
      if (mode === "replace") {
        setGeneratedText(replacement);
        setAnimationKey((k) => k + 1);
        return;
      }
      // merge: replace selected range if available, else append
      setGeneratedText((prev) => {
        if (!prev || !selectionRange)
          return prev ? prev + "\n" + replacement : replacement;
        const before = prev.slice(0, selectionRange.start);
        const after = prev.slice(selectionRange.end);
        return before + replacement + after;
      });
      setAnimationKey((k) => k + 1);
    },
    getSelectedText: () => selectionText,
  }));

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
      // Yuklangandan so'ng avtomatik ko'rsatmaymiz
      setShowOriginal(false);

      // Avtomatik shablon aniqlash
      if (text.trim().length > 50) {
        await detectTemplateFromText(text);
      }
    } catch (error: any) {
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

  function resetAll() {
    setUploadedFile(null);
    setOriginalText("");
    setGeneratedText("");
    setDetectedTemplate(null);
    setSelectionText("");
    setSelectionRange(null);
  }

  return (
    <div className="flex h-screen max-h-screen flex-col shrink-0 w-2/3 bg-linear-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      {/* Main Content */}
      <main className="mx-auto w-full flex-1  overflow-hidden">
        <div className="grid h-full   lg:grid-cols-2">
          {/* Left Panel - Input */}
          <div className="flex flex-col h-full bg-white p-4 xl:p-6 dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-zinc-950/50 overflow-y-auto scrollbar-thin">
            <div className="mb-2">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Hujjat yuklash
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                PDF, DOCX, TXT formatdagi hujjatlarni yuklang va AI orqali javob
                oling
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
              <label className="block text-sm my-2 font-semibold text-zinc-900 dark:text-zinc-100">
                Tavsirlab bering (ixtiyoriy)
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
                "flex flex-col items-center justify-center rounded-xl border border-dashed my-2 p-4 transition ",
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20"
                  : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
              )}>
              {uploadedFile ? (
                <div className="flex w-full flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center w-full flex flex-col items-center">
                    <p
                      className="font-medium text-zinc-900 dark:text-zinc-100 w-full truncate max-w-[220px] sm:max-w-[400px]"
                      title={uploadedFile.name}>
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

            {/* Action buttons - fixed bottom area */}
            <div className="mt-auto flex items-center gap-3 pt-4 my-3">
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

            {/* Original text preview (collapsible) */}
            {originalText && (
              <div
                className={cls(
                  "rounded-lg border border-border bg-zinc-50 dark:bg-zinc-800/50 transition-all",
                  showOriginal
                    ? "flex flex-col flex-1 min-h-[220px]"
                    : "flex flex-col"
                )}>
                {/* Header bar */}
                <div
                  className={cls(
                    "flex items-center justify-between gap-2 px-3 py-2",
                    showOriginal
                      ? "border-b border-zinc-200/60 dark:border-zinc-700/60"
                      : ""
                  )}>
                  <h3 className="text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-200 uppercase">
                    Original matn
                  </h3>
                  <div className="flex items-center gap-2">
                    {isAnalyzing && (
                      <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        AI
                      </div>
                    )}
                    <button
                      onClick={() => setShowOriginal((p) => !p)}
                      className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                      {showOriginal ? "Yashirish" : "Ko'rsatish"}
                    </button>
                  </div>
                </div>
                {/* Collapsed hint */}
                {!showOriginal && (
                  <div className="px-3 pb-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Matn yashirin. Ko'rish uchun tugmani bosing.
                  </div>
                )}
                {/* Expanded content */}
                {showOriginal && (
                  <div className="flex flex-col flex-1">
                    {detectedTemplate && (
                      <div className="mx-3 mt-2 mb-2 rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 dark:border-blue-900 dark:bg-blue-950/30">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                            AI shablon: {detectedTemplate}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="relative flex-1 overflow-hidden">
                      <div className="absolute inset-0 overflow-y-auto scrollbar-thin px-3 pb-4">
                        {extracting ? (
                          <div className="flex items-center gap-2 text-zinc-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Matn ajratilmoqda...
                          </div>
                        ) : (
                          <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-zinc-900 dark:text-zinc-100">
                            {originalText}
                          </pre>
                        )}
                      </div>
                      {/* Fade mask bottom */}
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-zinc-50 dark:from-zinc-900 to-transparent" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Generated Result */}
          <div className="flex flex-col h-full  bg-white p-4 xl:p-6 dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-zinc-950/50">
            <div className="flex text-left flex-col">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  AI Natija
                </h2>
                <p className="my-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Sun'iy intellekt tomonidan yaratilgan
                </p>
              </div>
              {generatedText && (
                <div className="flex items-center gap-2 my-2">
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
                      navigate("/final", {
                        state: {
                          content: generatedText,
                          title: uploadedFile?.name || "",
                          templateId:
                            detectedTemplate ||
                            selectedTemplate ||
                            "auto_detect",
                          documentData: {
                            template_type:
                              detectedTemplate || selectedTemplate || "ariza",
                            language_code: "uz",
                            script_type: "latin",
                            description: description || undefined,
                            status: "completed",
                          },
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

            <div
              ref={resultContainerRef}
              className="flex-1 overflow-y-auto rounded-xl border border-border bg-linear-to-br from-zinc-50 to-white p-4 xl:p-6 dark:from-zinc-800/50 dark:to-zinc-900"
              onMouseUp={() => {
                try {
                  const sel = window.getSelection();
                  if (!sel || sel.rangeCount === 0) {
                    setSelectionText("");
                    setSelectionRange(null);
                    return;
                  }
                  const text = sel.toString();
                  setSelectionText(text);
                  if (text && generatedText) {
                    // Compute first matching range in generatedText
                    const idx = generatedText.indexOf(text);
                    if (idx !== -1) {
                      setSelectionRange({ start: idx, end: idx + text.length });
                    } else {
                      setSelectionRange(null);
                    }
                  } else {
                    setSelectionRange(null);
                  }
                } catch {
                  // ignore
                }
              }}>
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
                animationKey > 0 ? (
                  <motion.pre
                    key={animationKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                    {generatedText.split("").map((char, index) => (
                      <motion.span
                        key={`${animationKey}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.05,
                          delay: index * 0.01,
                          ease: "easeOut",
                        }}>
                        {char}
                      </motion.span>
                    ))}
                  </motion.pre>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                    {generatedText}
                  </pre>
                )
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
});

export default DocumentViewer;
