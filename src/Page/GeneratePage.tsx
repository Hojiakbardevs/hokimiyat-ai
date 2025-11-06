"use client";

import { useMemo, useState } from "react";
import Header from "@/components/chat page/Header";
import { INITIAL_TEMPLATES } from "@/lib/mockData";
import { cls, formatBytes } from "@/lib/utils";
import {
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  Download,
  Copy,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function GeneratePage() {
  const navigate = useNavigate();

  const templates = INITIAL_TEMPLATES;
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id ?? ""
  );
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || templates[0],
    [templates, selectedTemplateId]
  );

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  function addFiles(files: FileList | File[]) {
    const maxPerFile = 25 * 1024 * 1024;
    const maxCount = 10;
    const list = Array.from(files);
    const filtered: File[] = [];
    for (const f of list) {
      if (f.size > maxPerFile) continue;
      filtered.push(f);
      if (filtered.length + attachments.length >= maxCount) break;
    }
    if (filtered.length) setAttachments((prev) => [...prev, ...filtered]);
  }

  async function handleGenerate() {
    if (loading) return;
    setLoading(true);
    const base = selectedTemplate?.content || "";
    const header = title ? `\n\n— ${title} —\n\n` : "\n\n";
    const attNote = attachments.length
      ? `\n\n(Ilovalar soni: ${attachments.length}. Ilova nomlari: ${attachments
          .map((f) => f.name)
          .join(", ")})\n`
      : "";
    const userPrompt = prompt ? `\n\nKo'rsatma:\n${prompt}\n` : "";

    await new Promise((r) => setTimeout(r, 900));
    setResult(`${base}${header}${userPrompt}${attNote}`.trim());
    setLoading(false);
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
      <Header setSidebarOpen={() => {}} onTemplateClick={() => {}} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Hujjat yaratish
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Backend yo‘q bo‘lsa ham, tayyor shablonlardan foydalangan holda UI
            darajasida natija hosil qilamiz.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: form */}
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            {/* Template select */}
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Shablon turi
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition hover:bg-zinc-50 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <FileText className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-zinc-400" />
            </div>

            {/* Title */}
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Hujjat sarlavhasi (ixtiyoriy)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Yig‘ilish bayonnomasi (06.11.2025)"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition hover:bg-zinc-50 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />

            {/* Prompt */}
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Ko‘rsatma / izoh
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Qanday o‘zgartirishlar kerak, bandlar, ohang va h.k."
              className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition hover:bg-zinc-50 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />

            {/* Attachments */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer?.files?.length)
                  addFiles(e.dataTransfer.files);
              }}
              className={cls(
                "rounded-xl border-2 border-dashed px-4 py-4 text-xs text-zinc-600 dark:text-zinc-400",
                isDragging
                  ? "border-blue-500 bg-blue-500/5"
                  : "border-zinc-300 dark:border-zinc-700"
              )}>
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span>Fayl(lar)ni bu yerga tashlang yoki tanlang</span>
                <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-300 bg-white px-2 py-1 text-[11px] hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                  Fayl tanlash
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) addFiles(e.target.files);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
              {attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {attachments.map((f, idx) => (
                    <div
                      key={`${f.name}-${f.size}-${idx}`}
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
                      <Paperclip className="h-3.5 w-3.5" />
                      <span className="max-w-48 truncate" title={f.name}>
                        {f.name}
                      </span>
                      <span className="text-zinc-400">
                        · {formatBytes(f.size)}
                      </span>
                      <button
                        className="ml-1 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        aria-label="Remove attachment">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                disabled={loading}
                onClick={handleGenerate}
                className={cls(
                  "inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white dark:text-zinc-900",
                  loading && "opacity-50"
                )}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Generate
              </button>
              <button
                onClick={() => {
                  setPrompt("");
                  setTitle("");
                  setAttachments([]);
                  setResult("");
                }}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                Clear
              </button>
            </div>
          </div>

          {/* Right: result preview */}
          <div className="flex min-h-64 flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Natija
              </h2>
              <div className="flex items-center gap-1">
                <button
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs disabled:opacity-50"
                  disabled={!result}
                  onClick={() => {
                    navigator.clipboard?.writeText(result);
                  }}>
                  <Copy className="h-3.5 w-3.5" /> Nusxa olish
                </button>
                <button
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs disabled:opacity-50"
                  disabled={!result}
                  onClick={() =>
                    downloadTxt(
                      `${title || selectedTemplate?.name || "document"}.txt`,
                      result
                    )
                  }>
                  <Download className="h-3.5 w-3.5" /> Yuklab olish
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
              {loading ? (
                <div className="flex items-center gap-2 text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Generatsiya
                  qilinmoqda...
                </div>
              ) : result ? (
                <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                  {result}
                </pre>
              ) : (
                <div className="text-xs text-zinc-500">
                  Natija bu yerda ko‘rinadi.
                </div>
              )}
            </div>

            <div className="mt-1 flex justify-end">
              <button
                disabled={!result}
                onClick={() =>
                  navigate("/final", {
                    state: {
                      content: result,
                      title: title || selectedTemplate?.name,
                      templateId: selectedTemplate?.id,
                    },
                  })
                }
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50">
                Final sahifaga o‘tish <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GeneratePage;
