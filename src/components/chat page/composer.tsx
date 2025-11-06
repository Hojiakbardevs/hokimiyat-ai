"use client";

import {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  Send,
  Loader2,
  Plus,
  Mic,
  X,
  Paperclip,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ComposerActionsPopover from "@/components/chat page/ComposerActionsPopover";
import { cls, formatBytes } from "@/lib/utils";

interface ComposerProps {
  onSend?: (text: string, attachments: File[]) => Promise<void> | void;
  busy?: boolean;
}

const Composer = forwardRef<any, ComposerProps>(function Composer(
  { onSend, busy },
  ref
) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [lineCount, setLineCount] = useState(1);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      const lineHeight = 20; // Approximate line height in pixels
      const minHeight = 40;

      // Reset height to calculate scroll height
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const calculatedLines = Math.max(
        1,
        Math.floor((scrollHeight - 16) / lineHeight)
      ); // 16px for padding

      setLineCount(calculatedLines);

      if (calculatedLines <= 12) {
        // Auto-expand for 1-12 lines
        textarea.style.height = `${Math.max(minHeight, scrollHeight)}px`;
        textarea.style.overflowY = "hidden";
      } else {
        // Fixed height with scroll for 12+ lines
        textarea.style.height = `${minHeight + 11 * lineHeight}px`; // 12 lines total
        textarea.style.overflowY = "auto";
      }
    }
  }, [value]);

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent: string) => {
        setValue((prev) => {
          const newValue = prev
            ? `${prev}\n\n${templateContent}`
            : templateContent;
          setTimeout(() => {
            inputRef.current?.focus();
            const length = newValue.length;
            inputRef.current?.setSelectionRange(length, length);
          }, 0);
          return newValue;
        });
      },
      focus: () => {
        inputRef.current?.focus();
      },
    }),
    []
  );

  async function handleSend() {
    if ((!value.trim() && attachments.length === 0) || sending) return;
    setSending(true);
    try {
      await onSend?.(value, attachments);
      setValue("");
      setAttachments([]);
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  }

  function openInGenerate() {
    if (!value.trim() && attachments.length === 0) return;
    // Pass current input and attachments to Generate page and let it auto-run
    navigate("/generate", {
      state: {
        from: "chat",
        content: value,
        attachments,
      },
    });
  }

  function addFiles(files: FileList | File[]) {
    const maxPerFile = 25 * 1024 * 1024; // 25MB
    const maxCount = 10;
    const list = Array.from(files);
    const filtered: File[] = [];
    for (const f of list) {
      if (f.size > maxPerFile) {
        // Siz limitini oshgan faylni tashlab yuboramiz
        continue;
      }
      filtered.push(f);
      if (filtered.length + attachments.length >= maxCount) break;
    }
    if (filtered.length) setAttachments((prev) => [...prev, ...filtered]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  return (
    <div className="border-t border-zinc-200/60 p-4 dark:border-zinc-800">
      <div
        className={cls(
          "mx-auto flex flex-col rounded-2xl border bg-card shadow-sm dark:bg-card transition-all duration-200 relative",
          "max-w-3xl border-border p-3",
          isDragging &&
            "ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent"
        )}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={onDragLeave}>
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-blue-500/5 backdrop-blur-[1px]">
            <div className="rounded-full border border-blue-300/60 bg-white/80 px-3 py-1 text-xs text-blue-700 shadow-sm dark:bg-zinc-900/80 dark:text-blue-300">
              Drop files to attach
            </div>
          </div>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="How can I help you today?"
            rows={1}
            className={cls(
              "w-full resize-none bg-transparent text-sm outline-none placeholder:text-zinc-400 transition-all duration-200",
              "px-0 py-2 min-h-10 text-left"
            )}
            style={{
              height: "auto",
              overflowY: lineCount > 12 ? "auto" : "hidden",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* Always-visible drop hint removed from here; moved next to + icon below */}

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((f, idx) => (
              <div
                key={`${f.name}-${f.size}-${idx}`}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-muted px-2 py-1 text-[11px] text-foreground/80"
                title={f.name}>
                <Paperclip className="h-3.5 w-3.5" />
                <span className="max-w-48 truncate">{f.name}</span>
                <span className="text-muted-foreground">
                  · {formatBytes(f.size)}
                </span>
                <button
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-card hover:text-foreground transition"
                  aria-label="Remove attachment">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <ComposerActionsPopover>
              <button
                className="inline-flex shrink-0 items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                title="Add attachment"
                onClick={() => fileInputRef.current?.click()}>
                <Plus className="h-4 w-4" />
              </button>
            </ComposerActionsPopover>
            {/* Always-visible drop hint near + icon */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                if (e.dataTransfer?.files?.length)
                  addFiles(e.dataTransfer.files);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={onDragLeave}
              className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted px-3 py-2 text-xs text-muted-foreground hover:border-ring/40 cursor-pointer select-none">
              <Paperclip className="h-3.5 w-3.5" />
              <span>Faylni tashlang yoki oching</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                // reset so same file can be re-selected
                e.currentTarget.value = "";
              }}
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={openInGenerate}
              disabled={!value.trim() && attachments.length === 0}
              className={cls(
                "inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition",
                !value.trim() &&
                  attachments.length === 0 &&
                  "opacity-50 cursor-not-allowed"
              )}
              title="Open in Generate">
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              title="Voice input">
              <Mic className="h-4 w-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={
                sending || busy || (!value.trim() && attachments.length === 0)
              }
              className={cls(
                "inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-2 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                (sending ||
                  busy ||
                  (!value.trim() && attachments.length === 0)) &&
                  "opacity-50 cursor-not-allowed"
              )}>
              {sending || busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-2 max-w-3xl px-1 text-[11px] text-muted-foreground">
        Press{" "}
        <kbd className="rounded border border-border bg-muted px-1">Enter</kbd>{" "}
        to send ·{" "}
        <kbd className="rounded border border-border bg-muted px-1">Shift</kbd>+
        <kbd className="rounded border border-border bg-muted px-1">Enter</kbd>{" "}
        for newline
      </div>
    </div>
  );
});

export default Composer;
