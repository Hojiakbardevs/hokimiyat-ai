"use client";

import { useEffect, useState } from "react";
import { Download, ArrowLeft, Sun, Moon, FileText } from "lucide-react";
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

export function FinalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location as any).state as
    | { content?: string; title?: string; templateId?: string }
    | undefined;
  const [content, setContent] = useState<string>(state?.content || "");
  const title = state?.title || "Yaratilgan hujjat";

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
      // Parse content and create document
      const lines = text.split("\n");
      const children: any[] = [];

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
          // Empty line
          children.push(new Paragraph({ text: "" }));
          continue;
        }

        // Check for markdown headers
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
          // Bold text
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
          // Bullet point
          children.push(
            new Paragraph({
              text: trimmed.slice(2),
              bullet: { level: 0 },
              spacing: { before: 50, after: 50 },
            })
          );
        } else {
          // Regular paragraph
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
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-900">
      {/* Page header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/chat-assistant")}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
              <ArrowLeft className="h-4 w-4" /> Orqaga
            </button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Final ko'rib chiqish
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setTheme(theme === "dark" ? ("light" as any) : ("dark" as any))
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Toggle theme">
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() =>
                downloadDocx(`${title || "document"}.docx`, content)
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              <FileText className="h-4 w-4" /> DOCX
            </button>
            <button
              onClick={() => downloadTxt(`${title || "document"}.txt`, content)}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              <Download className="h-4 w-4" /> TXT
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {!content ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Hech qanday mazmun topilmadi. Avval <b>Generate</b> sahifasida
            hujjat yarating.
            <div className="mt-3">
              <button
                onClick={() => navigate("/generate")}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Generate sahifasiga o'tish
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <RichTextEditor content={content} onChange={setContent} />
            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  downloadDocx(`${title || "document"}.docx`, content)
                }
                className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900">
                <FileText className="h-4 w-4" /> DOCX yuklab olish
              </button>
              <button
                onClick={() =>
                  downloadTxt(`${title || "document"}.txt`, content)
                }
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
                <Download className="h-4 w-4" /> TXT yuklab olish
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto w-full max-w-5xl px-4 py-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shadow-sm">
                AI
              </div>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Hokimiyat AI
              </span>
              <span className="text-zinc-400">•</span>
              <span>Yuklab olishdan oldin so'nggi tahrirlarni kiriting</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Format: DOCX / TXT</span>
              <span>•</span>
              <span>Hujjat: {title}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalPage;
