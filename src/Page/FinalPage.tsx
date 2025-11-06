"use client";

import { useMemo, useState } from "react";
import { Download, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
      {/* Page header (local) */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/generate")}
              className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Edit
            </Button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Final Review
              </h1>
              {template && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {template.name}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={() => downloadTxt(`${title || "document"}.txt`, content)}
            className="gap-2">
            <Download className="h-4 w-4" /> Download .txt
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {!content ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Hech qanday mazmun topilmadi. Avval <b>Generate</b> sahifasida
            hujjat yarating.
            <div className="mt-3">
              <Button onClick={() => navigate("/generate")}>
                Generate sahifasiga o‘tish
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <RichTextEditor content={content} onChange={setContent} />
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() =>
                  downloadTxt(`${title || "document"}.txt`, content)
                }
                className="gap-2">
                <Download className="h-4 w-4" /> Download .txt
              </Button>
            </div>
          </div>
        )}
      </main>

      <div className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto w-full max-w-5xl px-4 py-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <p>Yuklab olishdan oldin so‘nggi tahrirlarni kiriting.</p>
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
