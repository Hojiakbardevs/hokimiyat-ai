"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import RichTextEditor from "@/components/rich-text-editor";
import { INITIAL_TEMPLATES } from "@/lib/mockData";

export function FinalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location as any).state as
    | { content?: string; title?: string; templateId?: string }
    | undefined;
  const [content, setContent] = useState<string>(state?.content || "");
  const title = state?.title || "Yaratilgan hujjat";
  const template = useMemo(
    () => INITIAL_TEMPLATES.find((t) => t.id === state?.templateId),
    [state?.templateId]
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
      {/* Page header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/generate")}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
              <ArrowLeft className="h-4 w-4" /> Orqaga
            </button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Final ko'rib chiqish
              </h1>
              {template && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {template.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => downloadTxt(`${title || "document"}.txt`, content)}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            <Download className="h-4 w-4" /> Yuklab olish
          </button>
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
            <div className="flex justify-end">
              <button
                onClick={() =>
                  downloadTxt(`${title || "document"}.txt`, content)
                }
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
                <Download className="h-4 w-4" /> Yuklab olish
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto w-full max-w-5xl px-4 py-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <p>Yuklab olishdan oldin so'nggi tahrirlarni kiriting.</p>
            <div className="flex items-center gap-3">
              <span>Format: Plain Text (.txt)</span>
              <span>•</span>
              <span>Shablon: {template?.name || title}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalPage;