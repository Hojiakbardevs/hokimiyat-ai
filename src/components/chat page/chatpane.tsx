"use client";

import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import {
  Pencil,
  RefreshCw,
  Check,
  X,
  Square,
  Eye,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Message from "@/components/chat page/message";
import Composer from "@/components/chat page/composer";
import { cls, timeAgo, formatBytes } from "@/lib/utils";

interface ThinkingMessageProps {
  onPause: () => void;
}

function ThinkingMessage({ onPause }: ThinkingMessageProps) {
  return (
    <Message role="assistant">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
        </div>
        <span className="text-sm text-zinc-500">AI is thinking...</span>
        <button
          onClick={onPause}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
          <Square className="h-3 w-3" /> Pause
        </button>
      </div>
    </Message>
  );
}

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  attachments?: File[];
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
  pinned: boolean;
  folder: string;
  messages: Message[];
}

interface ChatPaneProps {
  conversation: Conversation | null;
  onSend?: (text: string, attachments: File[]) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onResendMessage?: (messageId: string) => void;
  isThinking?: boolean;
  onPauseThinking?: () => void;
}

const ChatPane = forwardRef<any, ChatPaneProps>(function ChatPane(
  {
    conversation,
    onSend,
    onEditMessage,
    onResendMessage,
    isThinking,
    onPauseThinking,
  },
  ref
) {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const composerRef = useRef<any>(null);

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent: string) => {
        if (
          composerRef.current &&
          typeof composerRef.current.insertTemplate === "function"
        ) {
          composerRef.current.insertTemplate(templateContent);
        }
      },
    }),
    []
  );

  if (!conversation) return null;

  const tags = ["Certified", "Personalized", "Experienced", "Helpful"];
  const messages = Array.isArray(conversation.messages)
    ? conversation.messages
    : [];
  const count = messages.length || conversation.messageCount || 0;

  function startEdit(m: Message) {
    setEditingId(m.id);
    setDraft(m.content);
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft("");
  }
  function saveEdit() {
    if (!editingId) return;
    onEditMessage?.(editingId, draft);
    cancelEdit();
  }
  function saveAndResend() {
    if (!editingId) return;
    onEditMessage?.(editingId, draft);
    onResendMessage?.(editingId);
    cancelEdit();
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8 bg-background/60 scrollbar-thin">
        <div className="mb-2 text-3xl font-serif tracking-tight sm:text-4xl md:text-5xl">
          <span className="block leading-[1.05] font-sans text-2xl">
            {conversation.title}
          </span>
        </div>
        <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Updated {timeAgo(conversation.updatedAt)} · {count} messages
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-5">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground/80">
              {t}
            </span>
          ))}
        </div>

        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground">
            No messages yet. Say hello to start.
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <div key={m.id} className="space-y-2">
                {editingId === m.id ? (
                  <div
                    className={cls(
                      "rounded-2xl border p-2",
                      "border-zinc-200 dark:border-zinc-800"
                    )}>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="w-full resize-y rounded-xl bg-transparent p-2 text-sm outline-none"
                      rows={3}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={saveEdit}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-zinc-900">
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        onClick={saveAndResend}
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs">
                        <RefreshCw className="h-3.5 w-3.5" /> Save & Resend
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs">
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <Message role={m.role}>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.attachments.map((f, i) => (
                          <div
                            key={`${m.id}-att-${i}`}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-2 py-1 text-[11px] text-foreground/80">
                            <span className="max-w-40 truncate" title={f.name}>
                              {f.name}
                            </span>
                            <span className="text-muted-foreground">
                              · {formatBytes(f.size)}
                            </span>
                            <button
                              className="ml-1 inline-flex items-center gap-1 rounded-full border border-border bg-card/80 px-2 py-0.5 text-[11px] text-foreground hover:bg-muted transition"
                              onClick={() =>
                                navigate("/generate", {
                                  state: { file: f, fileName: f.name },
                                })
                              }>
                              <Eye className="h-3 w-3" /> View
                            </button>
                            <button
                              className="ml-1 inline-flex items-center gap-1 rounded-full border border-border bg-card/80 px-2 py-0.5 text-[11px] text-foreground hover:bg-muted transition"
                              onClick={() => {
                                const url = URL.createObjectURL(f);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = f.name;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                setTimeout(
                                  () => URL.revokeObjectURL(url),
                                  1000
                                );
                              }}>
                              <Download className="h-3 w-3" /> Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {m.role === "user" && (
                      <div className="mt-1 flex gap-2 text-[11px]">
                        <button
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-card/70 px-2 py-1 text-foreground/80 hover:bg-muted transition"
                          onClick={() => startEdit(m)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-card/70 px-2 py-1 text-foreground/80 hover:bg-muted transition"
                          onClick={() => onResendMessage?.(m.id)}>
                          <RefreshCw className="h-3.5 w-3.5" /> Resend
                        </button>
                      </div>
                    )}
                  </Message>
                )}
              </div>
            ))}
            {isThinking && onPauseThinking && (
              <ThinkingMessage onPause={onPauseThinking} />
            )}
          </>
        )}
      </div>

      <Composer
        key={conversation?.id}
        ref={composerRef}
        onSend={async (text: string, attachments: File[]) => {
          if (!text.trim() && attachments.length === 0) return;
          setBusy(true);
          await onSend?.(text, attachments);
          setBusy(false);
        }}
        busy={busy}
      />
    </div>
  );
});

export default ChatPane;
