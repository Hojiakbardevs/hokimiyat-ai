"use client";

import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  Send,
  Loader2,
  Mic,
} from "lucide-react";
import { cls } from "@/lib/utils";

interface ComposerProps {
  onSend?: (text: string, attachments: File[]) => Promise<void> | void;
  busy?: boolean;
}

const Composer = forwardRef<any, ComposerProps>(function Composer(
  { onSend, busy },
  ref
) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [lineCount, setLineCount] = useState(1);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Attachments and drag-drop removed for text-only composer

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
    if (!value.trim() || sending) return;
    setSending(true);
    try {
      await onSend?.(value, []);
      setValue("");
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  }


  return (
    <div className="border-t border-zinc-200/60 p-4 dark:border-zinc-800">
      <div
        className={cls(
          "mx-auto flex flex-col rounded-2xl border bg-card shadow-sm dark:bg-card transition-all duration-200 relative",
          "max-w-3xl border-border p-3"
        )}>

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

        {/* Attachments removed for text-only composer */}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2"></div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              title="Voice input">
              <Mic className="h-4 w-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={sending || busy || !value.trim()}
              className={cls(
                "inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-2 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                (sending || busy || !value.trim()) && "opacity-50 cursor-not-allowed"
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
