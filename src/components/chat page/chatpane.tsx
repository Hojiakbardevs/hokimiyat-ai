"use client";

import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Pencil, RefreshCw, Check, X, Square, Download } from "lucide-react";
import Message from "@/components/chat page/message";
import Composer from "@/components/chat page/composer";
import { timeAgo, formatBytes } from "@/lib/utils";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

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
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50/80 px-2.5 py-1 text-xs text-red-600 transition-all hover:bg-red-100 hover:shadow-md hover:scale-105 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60">
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
  onMergeFromAssistant?: (text: string) => void;
}

const ChatPane = forwardRef<any, ChatPaneProps>(function ChatPane(
  {
    conversation,
    onSend,
    onEditMessage,
    onResendMessage,
    isThinking,
    onPauseThinking,
    onMergeFromAssistant,
  },
  ref
) {
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
    <div className="flex h-full min-h-0 flex-1 flex-col bg-white dark:bg-zinc-900">
      {/* Header - conversation title */}
      <div className="sticky top-0 z-10 border-b border-zinc-200/60 bg-white/80 backdrop-blur-sm px-6 py-4 dark:border-zinc-800/60 dark:bg-zinc-900/80">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {conversation.title}
        </h1>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {count} {count === 1 ? "message" : "messages"} · Updated{" "}
          {timeAgo(conversation.updatedAt)}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-zinc-300 scrollbar-track-transparent dark:scrollbar-thumb-zinc-700">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="rounded-3xl border border-border bg-linear-to-br from-zinc-50 to-white p-6 dark:from-zinc-800/50 dark:to-zinc-900 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <svg
                    className="h-8 w-8 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  Suhbatni boshlang
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Xabar yozing va AI bilan suhbatlashing
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <div key={m.id}>
                  {editingId === m.id ? (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-full resize-none rounded-lg border-0 bg-white p-3 text-sm outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:ring-zinc-700"
                        rows={4}
                        autoFocus
                      />
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={saveEdit}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                          <Check className="h-4 w-4" /> Save
                        </button>
                        <button
                          onClick={saveAndResend}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                          <RefreshCw className="h-4 w-4" /> Save & Resend
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                          <X className="h-4 w-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Message role={m.role}>
                      <div className="prose prose-zinc max-w-none dark:prose-invert">
                        {m.role === "assistant" ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="prose prose-zinc max-w-none dark:prose-invert">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkBreaks]}>
                              {m.content}
                            </ReactMarkdown>
                          </motion.div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {m.content}
                          </p>
                        )}
                      </div>

                      {m.attachments && m.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {m.attachments.map((f, i) => (
                            <div
                              key={`${m.id}-att-${i}`}
                              className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
                              <svg
                                className="h-5 w-5 text-zinc-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                  {f.name}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {formatBytes(f.size)}
                                </p>
                              </div>
                              <button
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
                                }}
                                className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700">
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {m.role === "user" && (
                        <div className="mt-2 flex gap-1.5">
                          <button
                            onClick={() => startEdit(m)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => onResendMessage?.(m.id)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                            <RefreshCw className="h-3 w-3" /> Resend
                          </button>
                        </div>
                      )}
                      {m.role === "assistant" && (
                        <div className="mt-2 flex gap-1.5">
                          {/* Show Merge button only for the last assistant message */}
                          {messages
                            .slice()
                            .reverse()
                            .find((msg) => msg.role === "assistant")?.id ===
                            m.id && (
                            <button
                              onClick={() => onMergeFromAssistant?.(m.content)}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
                              <Check className="h-3 w-3" /> Merge to Document
                            </button>
                          )}
                        </div>
                      )}
                    </Message>
                  )}
                </div>
              ))}
              {isThinking && onPauseThinking && (
                <ThinkingMessage onPause={onPauseThinking} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Composer Area */}
      <div className="border-t border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900">
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
    </div>
  );
});

export default ChatPane;
