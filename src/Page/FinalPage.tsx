import { useEffect, useState } from "react";
import {
  Download,
  ArrowLeft,
  Sun,
  Moon,
  FileText,
  File,
  Calendar,
  Clock,
  Globe,
  Type,
  FileEdit,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Share2,
  Printer,
  ExternalLink,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import RichTextEditor from "@/components/rich-text-editor";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from "docx";
import { saveAs } from "file-saver";
import Logoss from "@/assets/logowhite.svg";

interface DocumentData {
  id?: number;
  original_file?: string;
  output_file?: string;
  status?: "pending" | "processing" | "completed" | "failed";
  content?: string;
  error_message?: string;
  description?: string;
  language_code?: string;
  script_type?: string;
  template_type?: string;
  created_at?: string;
  updated_at?: string;
}

export function FinalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location as any).state as
    | {
        content?: string;
        title?: string;
        templateId?: string;
        documentData?: DocumentData;
      }
    | undefined;

  const [content, setContent] = useState<string>(state?.content || "");
  const [documentData, setDocumentData] = useState<DocumentData>(
    state?.documentData || {}
  );
  const title =
    state?.title || documentData?.description || "Yaratilgan hujjat";
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"docx" | "pdf" | "txt">(
    "docx"
  );

  // Theme management (consistent with ChatPage)
  const [theme, setTheme] = useState(() => {
    const saved =
      typeof window !== "undefined" && localStorage.getItem("theme");
    if (saved) return saved;
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    )
      return "dark";
    return "light";
  });

  useEffect(() => {
    try {
      if (theme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.style.colorScheme = theme;
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  // Keep in sync with system preference when user hasn't explicitly chosen
  useEffect(() => {
    try {
      const media =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
      if (!media) return;
      const listener = (e: MediaQueryListEvent) => {
        const saved = localStorage.getItem("theme");
        if (!saved) setTheme(e.matches ? "dark" : "light");
      };
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    } catch {}
  }, []);

  // Format time helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status?: string) => {
    const badges = {
      pending: {
        icon: Clock,
        text: "Kutilmoqda",
        className:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      },
      processing: {
        icon: Loader2,
        text: "Qayta ishlanmoqda",
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      },
      completed: {
        icon: CheckCircle2,
        text: "Tayyor",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
      failed: {
        icon: AlertCircle,
        text: "Xatolik",
        className:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>
        <Icon
          className={`h-3.5 w-3.5 ${
            status === "processing" ? "animate-spin" : ""
          }`}
        />
        {badge.text}
      </span>
    );
  };

  const getTemplateIcon = (type?: string) => {
    const icons = {
      ariza: "📝",
      buyruq: "📋",
      xat: "✉️",
      hisobot: "📊",
      shartnoma: "📄",
    };
    return icons[type as keyof typeof icons] || "📄";
  };

  const getLanguageName = (code?: string) => {
    const languages = {
      uz: "O'zbekcha",
      ru: "Русский",
      en: "English",
    };
    return languages[code as keyof typeof languages] || code || "N/A";
  };

  const getScriptName = (script?: string) => {
    const scripts = {
      latin: "Lotin",
      cyrillic: "Kirill",
    };
    return scripts[script as keyof typeof scripts] || script || "N/A";
  };

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

  async function downloadDocx(filename: string, text: string) {
    try {
      setIsDownloading(true);
      const lines = text.split("\n");
      const children: any[] = [];

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
          children.push(new Paragraph({ text: "" }));
          continue;
        }

        if (trimmed.startsWith("# ")) {
          children.push(
            new Paragraph({
              text: trimmed.slice(2),
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 200 },
            })
          );
        } else if (trimmed.startsWith("## ")) {
          children.push(
            new Paragraph({
              text: trimmed.slice(3),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 },
            })
          );
        } else if (trimmed.startsWith("### ")) {
          children.push(
            new Paragraph({
              text: trimmed.slice(4),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            })
          );
        } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmed.slice(2, -2),
                  bold: true,
                }),
              ],
              spacing: { before: 100, after: 100 },
            })
          );
        } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          children.push(
            new Paragraph({
              text: trimmed.slice(2),
              bullet: { level: 0 },
              spacing: { before: 50, after: 50 },
            })
          );
        } else {
          children.push(
            new Paragraph({
              text: trimmed,
              spacing: { before: 100, after: 100 },
            })
          );
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, filename);
    } catch (error) {
      console.error("Error creating DOCX:", error);
      alert(
        "DOCX yaratishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring."
      );
    } finally {
      setIsDownloading(false);
    }
  }

  const handleDownload = async () => {
    const filename = `${title || "document"}`;

    switch (selectedFormat) {
      case "docx":
        await downloadDocx(`${filename}.docx`, content);
        break;
      case "txt":
        downloadTxt(`${filename}.txt`, content);
        break;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    alert("Matn nusxalandi!");
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl supports-backdrop-filter:bg-white/60 dark:border-zinc-800/50 dark:bg-zinc-900/60">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/chat-assistant")}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
              <ArrowLeft className="h-4 w-4" /> Orqaga
            </button>
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-2xl shadow-lg">
                {getTemplateIcon(documentData?.template_type)}
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {title}
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Hujjatni tahrirlash va yuklab olish
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition-all hover:bg-zinc-100 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Toggle theme">
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {!content ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <FileText className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Hech qanday mazmun topilmadi
            </h3>
            <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
              Avval hujjat yaratish sahifasiga o'ting va AI yordamida hujjat
              yarating
            </p>
            <button
              onClick={() => navigate("/generate")}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600">
              <FileEdit className="h-4 w-4" /> Hujjat yaratish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Sidebar - Document Info */}
            <div className="space-y-6 lg:col-span-1">
              {/* Status Card */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Hujjat holati
                </h3>
                <div className="space-y-3">
                  {getStatusBadge(documentData?.status || "completed")}

                  {documentData?.error_message && (
                    <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
                      <AlertCircle className="mb-1 h-4 w-4" />
                      {documentData.error_message}
                    </div>
                  )}
                </div>
              </div>

              {/* Document Details */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Hujjat ma'lumotlari
                </h3>
                <div className="space-y-4">
                  {documentData?.id && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <File className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          ID
                        </p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          #{documentData.id}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <FileEdit className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Turi
                      </p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {documentData?.template_type || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <Globe className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Til
                      </p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {getLanguageName(documentData?.language_code)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <Type className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Yozuv
                      </p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {getScriptName(documentData?.script_type)}
                      </p>
                    </div>
                  </div>

                  {documentData?.created_at && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Yaratilgan sana
                        </p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {formatDate(documentData.created_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {documentData?.updated_at && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          O'zgartirilgan sana
                        </p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {formatDate(documentData.updated_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Tez amallar
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                    <Copy className="h-4 w-4" /> Nusxalash
                  </button>
                  <button
                    onClick={printDocument}
                    className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                    <Printer className="h-4 w-4" /> Chop etish
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                    <Share2 className="h-4 w-4" /> Ulashish
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content - Editor & Download */}
            <div className="space-y-6 lg:col-span-2">
              {/* Editor */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Hujjat matni
                  </h3>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {content.length} belgi
                  </span>
                </div>
                <RichTextEditor content={content} onChange={setContent} />
              </div>

              {/* Download Section */}
              <div className="rounded-xl border border-zinc-200 bg-linear-to-br from-blue-50 to-blue-100 p-6 shadow-sm dark:border-zinc-800 dark:from-blue-950/30 dark:to-blue-900/30">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Yuklab olish
                </h3>

                {/* Format Selection */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedFormat("docx")}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      selectedFormat === "docx"
                        ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/50"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
                    }`}>
                    <FileText
                      className={`h-6 w-6 ${
                        selectedFormat === "docx"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        selectedFormat === "docx"
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}>
                      DOCX
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Word
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedFormat("txt")}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      selectedFormat === "txt"
                        ? "border-zinc-600 bg-zinc-50 dark:border-zinc-500 dark:bg-zinc-950/50"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
                    }`}>
                    <FileEdit
                      className={`h-6 w-6 ${
                        selectedFormat === "txt"
                          ? "text-zinc-600 dark:text-zinc-400"
                          : "text-zinc-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        selectedFormat === "txt"
                          ? "text-zinc-700 dark:text-zinc-300"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}>
                      TXT
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Text
                    </span>
                  </button>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600">
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      {selectedFormat.toUpperCase()} formatda yuklab olish
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-xs text-zinc-600 dark:text-zinc-400">
                  Hujjat {selectedFormat.toUpperCase()} formatda yuklab olinadi
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/50 bg-white/80 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/60">
        <div className="mx-auto w-full max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-3">
              <img
                src={Logoss}
                alt="Hokimiyat AI logotipi"
                className="w-10 h-10"
              />
              <div className="flex flex-col">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Hokimiyat AI
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Hujjatni tahrirlang va kerakli formatda yuklab oling
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-zinc-400">© 2025</span>
              <span className="truncate max-w-[200px] sm:max-w-none">
                DeepMinds Group jamoasi bilan hamkorlikda
              </span>
              <span className="text-zinc-400">•</span>
              <a
                href="https://airi.uz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                aria-label="Airi.uz rasmiy sayti ochish">
                Airi.uz <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FinalPage;
