"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  INITIAL_CONVERSATIONS,
  INITIAL_TEMPLATES,
  INITIAL_FOLDERS,
} from "@/lib/mockData";

import ChatPane from "@/components/chat page/chatpane";
import { CustomSidebar } from "@/components/chat page/CustomSidebar";
import {
  chatCompletion,
  getConversations,
  getConversationById,
} from "@/api/chat";
import { toast } from "sonner";
import DocumentViewer from "@/components/DocumentViewer";

export default function ChatPage() {
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const raw = localStorage.getItem("sidebar-collapsed");
      return raw
        ? JSON.parse(raw)
        : { pinned: true, recent: false, folders: true, templates: true };
    } catch {
      return { pinned: true, recent: false, folders: true, templates: true };
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    } catch {}
  }, [collapsed]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed-state");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "sidebar-collapsed-state",
        JSON.stringify(sidebarCollapsed)
      );
    } catch {}
  }, [sidebarCollapsed]);

  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [folders, setFolders] = useState(INITIAL_FOLDERS);

  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const [isThinking, setIsThinking] = useState(false);
  const [thinkingConvId, setThinkingConvId] = useState<string | null>(null);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);

  // Load conversations from backend and localStorage on mount
  useEffect(() => {
    loadConversationsFromBackend();
  }, []);

  async function loadConversationsFromBackend() {
    try {
      // Save current conversations with messages before reloading
      const currentConversationsMap = new Map(
        conversations.map((c) => [c.id, c])
      );

      // Try to load from localStorage first (for offline support)
      const savedConversations = localStorage.getItem("chat-conversations");
      if (savedConversations && conversations.length === 0) {
        // Only load from localStorage if we don't have conversations yet
        try {
          const parsed = JSON.parse(savedConversations);
          setConversations(parsed);
          console.log("Loaded conversations from localStorage:", parsed.length);
        } catch (e) {
          console.error("Failed to parse saved conversations:", e);
        }
      }

      // Then fetch from backend
      const backendConversations = await getConversations();
      console.log("Backend conversations:", backendConversations);

      // If backend returned empty or invalid data, use mock data
      if (!backendConversations || backendConversations.length === 0) {
        console.log("Backend returned empty, keeping current conversations");
        if (conversations.length === 0) {
          setConversations(INITIAL_CONVERSATIONS);
          toast.info("Demo rejimda ishlamoqda (mock data)");
        }
        setConversationsLoaded(true);
        return;
      }

      // Convert backend format to frontend format
      const converted = backendConversations.map((conv) => {
        const existingConv = currentConversationsMap.get(conv.id.toString());

        return {
          id: conv.id.toString(),
          title: conv.title || "New Chat",
          updatedAt: conv.updated_at,
          messageCount:
            typeof conv.message_count === "string"
              ? parseInt(conv.message_count)
              : conv.message_count,
          preview: conv.last_message_preview || "No messages yet",
          pinned: existingConv?.pinned || false,
          folder: existingConv?.folder || "Work Projects",
          // Preserve existing messages if available
          messages: existingConv?.messages || [],
        };
      });

      setConversations(converted);
      setConversationsLoaded(true);

      // Save to localStorage for offline support
      localStorage.setItem("chat-conversations", JSON.stringify(converted));

      console.log(`${converted.length} ta suhbat yangilandi`);
    } catch (error: any) {
      console.error("Failed to load conversations:", error);

      // If backend fails, keep current conversations
      if (conversations.length === 0) {
        console.log("Backend failed, using mock data as fallback");
        setConversations(INITIAL_CONVERSATIONS);
        toast.error(
          "Backend bilan bog'lanishda xatolik. Demo rejimda ishlamoqda."
        );
      }
      setConversationsLoaded(true);
    }
  }

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversationsLoaded && conversations.length > 0) {
      try {
        localStorage.setItem(
          "chat-conversations",
          JSON.stringify(conversations)
        );
      } catch (e) {
        console.error("Failed to save conversations to localStorage:", e);
      }
    }
  }, [conversations, conversationsLoaded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createNewChat();
      }
      if (!e.metaKey && !e.ctrlKey && e.key === "/") {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }
      if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, conversations]);

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      createNewChat();
    }
  }, []);

  // Load conversation messages when selected
  useEffect(() => {
    if (selectedId && !selectedId.includes(".")) {
      // If selectedId is a number (from backend), load messages
      loadConversationMessages(selectedId);
    }
  }, [selectedId]);

  async function loadConversationMessages(convId: string) {
    try {
      const numericId = parseInt(convId);
      if (isNaN(numericId)) return; // Skip for local conversations

      const conversationDetail = await getConversationById(numericId);
      console.log("Loaded conversation detail:", conversationDetail);

      // Handle paginated response format
      let messages: any[] = [];
      if (conversationDetail.results) {
        // Paginated format: {count, next, previous, results: {...}}
        messages = conversationDetail.results.messages || [];
      } else if (conversationDetail.messages) {
        // Direct format: {messages: [...]}
        messages = conversationDetail.messages;
      }

      // Convert backend messages to frontend format
      const convertedMessages = messages.map((msg) => ({
        id: msg.id?.toString() || Math.random().toString(36).slice(2),
        role: msg.role,
        content: msg.content,
        createdAt: msg.created_at || new Date().toISOString(),
      }));

      // Update conversation with messages
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: convertedMessages,
                title:
                  conversationDetail?.results?.title ||
                  conversationDetail?.title ||
                  c.title,
                messageCount: convertedMessages.length,
              }
            : c
        )
      );

      console.log(
        `Loaded ${convertedMessages.length} messages for conversation ${convId}`
      );
    } catch (error: any) {
      console.error("Failed to load conversation messages:", error);
      toast.error(
        "Xabarlarni yuklashda xatolik: " + (error.message || "Server xatosi")
      );
    }
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)
    );
  }, [conversations, query]);

  const pinned = filtered
    .filter((c) => c.pinned)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const recent = filtered
    .filter((c) => !c.pinned)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 10);

  const folderCounts = React.useMemo(() => {
    const map = Object.fromEntries(folders.map((f) => [f.name, 0]));
    for (const c of conversations)
      if (map[c.folder] != null) map[c.folder] += 1;
    return map;
  }, [conversations, folders]);

  function togglePin(id: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  }

  function createNewChat() {
    const id = Math.random().toString(36).slice(2);
    const item = {
      id,
      title: "New Chat",
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      preview: "Say hello to start...",
      pinned: false,
      folder: "Work Projects",
      messages: [], // Ensure messages array is empty for new chats
    };
    setConversations((prev) => [item, ...prev]);
    setSelectedId(id);
    setSidebarOpen(false);
  }

  function createFolder(name?: string) {
    const folderName = name || prompt("Folder name");
    if (!folderName) return;
    if (folders.some((f) => f.name.toLowerCase() === folderName.toLowerCase()))
      return alert("Folder already exists.");
    setFolders((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), name: folderName },
    ]);
  }

  async function sendMessage(
    convId: string,
    content: string,
    attachments: File[] = []
  ) {
    if (!content.trim()) return;
    const now = new Date().toISOString();
    const userMsg = {
      id: Math.random().toString(36).slice(2),
      role: "user" as const,
      content,
      createdAt: now,
      attachments: attachments.length ? attachments : undefined,
    };

    // Optimistic user message append
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...(c.messages || []), userMsg];
        return {
          ...c,
          messages: msgs,
          updatedAt: now,
          messageCount: msgs.length,
          preview: (
            content ||
            (attachments.length ? `Attached ${attachments.length} file(s)` : "")
          ).slice(0, 80),
        };
      })
    );

    setIsThinking(true);
    setThinkingConvId(convId);

    try {
      // Backend expects simple message + system_prompt format
      const payload = {
        message: content,
        system_prompt:
          "Siz hokimiyat hujjatlari bilan ishlaydigan yordamchi AI assistantsiz. Foydalanuvchilarga rasmiy hujjatlar tayyorlashda yordam bering.",
      };
      const res = await chatCompletion(payload);

      // Debug: Log full response to see what backend returns
      console.log("Chat response:", res);

      // Try multiple possible response fields
      const text =
        res?.response ||
        res?.message ||
        res?.content ||
        res?.reply ||
        res?.output ||
        res?.text ||
        (typeof res === "string" ? res : null) ||
        JSON.stringify(res) ||
        "Javob topilmadi.";

      console.log("Extracted text:", text);
      appendAssistant(convId, text);

      // If backend returned a conversation_id, update the local conversation ID
      if (res?.conversation_id && convId !== res.conversation_id.toString()) {
        const backendConvId = res.conversation_id.toString();
        console.log(
          `Updating conversation ID from ${convId} to ${backendConvId}`
        );

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === convId) {
              return { ...c, id: backendConvId };
            }
            return c;
          })
        );

        // Update selected ID
        setSelectedId(backendConvId);
      }

      // Reload conversations list from backend after a delay (without clearing messages)
      setTimeout(() => {
        loadConversationsFromBackend();
      }, 2000);
    } catch (e: any) {
      const errText = e?.message || "Server xatosi";
      appendAssistant(convId, `⚠️ Xato: ${errText}`);
      toast.error(errText);
    } finally {
      setIsThinking(false);
      setThinkingConvId(null);
    }
  }

  function appendAssistant(convId: string, content: string) {
    const now = new Date().toISOString();
    const asstMsg = {
      id: Math.random().toString(36).slice(2),
      role: "assistant" as const,
      content,
      createdAt: now,
    };
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...(c.messages || []), asstMsg];
        return {
          ...c,
          messages: msgs,
          updatedAt: now,
          messageCount: msgs.length,
          preview: asstMsg.content.slice(0, 80),
        };
      })
    );
  }

  function editMessage(convId: string, messageId: string, newContent: string) {
    const now = new Date().toISOString();
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = (c.messages || []).map((m) =>
          m.id === messageId ? { ...m, content: newContent, editedAt: now } : m
        );
        return {
          ...c,
          messages: msgs,
          preview: msgs[msgs.length - 1]?.content?.slice(0, 80) || c.preview,
        };
      })
    );
  }

  async function resendMessage(convId: string, messageId: string) {
    const conv = conversations.find((c) => c.id === convId);
    const msg = conv?.messages?.find((m) => m.id === messageId);
    if (!msg) return;
    await sendMessage(convId, msg.content);
  }

  function pauseThinking() {
    setIsThinking(false);
    setThinkingConvId(null);
  }

  function handleUseTemplate(template: { content: string }) {
    // This will be passed down to the Composer component
    // The Composer will handle inserting the template content
    if (
      composerRef.current &&
      typeof (composerRef.current as any).insertTemplate === "function"
    ) {
      (composerRef.current as any).insertTemplate(template.content);
    }
  }

  const composerRef = useRef<any>(null);

  const selected = conversations.find((c) => c.id === selectedId) || null;

  return (
    <div className="flex justify-center">
      <div className="mx-auto flex  h-[calc(100vh-0px)] w-full   bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <CustomSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          theme={theme}
          setTheme={setTheme}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          conversations={conversations}
          pinned={pinned}
          recent={recent}
          folders={folders}
          folderCounts={folderCounts}
          selectedId={selectedId}
          onSelect={(id: string) => setSelectedId(id)}
          togglePin={togglePin}
          query={query}
          setQuery={setQuery}
          searchRef={searchRef}
          createFolder={createFolder}
          createNewChat={createNewChat}
          templates={templates}
          setTemplates={setTemplates}
          onUseTemplate={handleUseTemplate}
          onReloadConversations={loadConversationsFromBackend}
        />
        <DocumentViewer></DocumentViewer>
        <main className="relative flex w-1/3 flex-col">
          {!conversationsLoaded && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Suhbatlar yuklanmoqda...
                </p>
              </div>
            </div>
          )}
          <ChatPane
            key={selected?.id}
            ref={composerRef}
            conversation={selected}
            onSend={(content: string, attachments: File[]) =>
              selected && sendMessage(selected.id, content, attachments)
            }
            onEditMessage={(messageId: string, newContent: string) =>
              selected && editMessage(selected.id, messageId, newContent)
            }
            onResendMessage={(messageId: string) =>
              selected && resendMessage(selected.id, messageId)
            }
            isThinking={isThinking && thinkingConvId === selected?.id}
            onPauseThinking={pauseThinking}
          />
        </main>
      </div>
    </div>
  );
}
