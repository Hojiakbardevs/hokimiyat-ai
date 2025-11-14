"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import ChatPane from "@/components/chat page/chatpane";
import { CustomSidebar } from "@/components/chat page/CustomSidebar";
import {
  chatCompletion,
  sendMessageToConversation,
  getConversations,
  getConversationById,
  getConversationPageByUrl,
} from "@/api/chat";
import { toast } from "sonner";
import DocumentViewer from "@/components/DocumentViewer";

// Conversation type definition
interface Message {
  id: string;
  role: "user" | "assistant";
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

export default function ChatPage() {
  // Theme management
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem("theme");
      if (!saved) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return { pinned: true, recent: false, folders: true, templates: true };
    }
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
    if (typeof window === "undefined") return;
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem("sidebar-collapsed-state");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "sidebar-collapsed-state",
      JSON.stringify(sidebarCollapsed)
    );
  }, [sidebarCollapsed]);

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("chat-conversations");
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log("Loaded conversations from localStorage:", parsed.length);
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse saved conversations:", e);
    }
    return [];
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("chat-selected-id") || null;
    } catch {
      return null;
    }
  });

  const [templates, setTemplates] = useState<any[]>([]);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingConvId, setThinkingConvId] = useState<string | null>(null);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);

  // Save selectedId to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (selectedId) {
        localStorage.setItem("chat-selected-id", selectedId);
      } else {
        localStorage.removeItem("chat-selected-id");
      }
    } catch (e) {
      console.error("Failed to save selectedId:", e);
    }
  }, [selectedId]);

  // Load conversations from backend on mount
  useEffect(() => {
    loadConversationsFromBackend();
  }, []);

  async function loadConversationsFromBackend() {
    try {
      const currentConversationsMap = new Map(
        conversations.map((c) => [c.id, c])
      );

      const backendConversations = await getConversations();
      console.log("Backend conversations:", backendConversations);

      if (!backendConversations || backendConversations.length === 0) {
        console.log("Backend returned empty, keeping current conversations");
        setConversationsLoaded(true);
        return;
      }

      const converted: Conversation[] = backendConversations.map(
        (conv: any) => {
          const existingConv = currentConversationsMap.get(conv.id.toString());

          return {
            id: conv.id.toString(),
            title: conv.title || "New Chat",
            updatedAt: conv.updated_at,
            messageCount:
              typeof conv.message_count === "string"
                ? parseInt(conv.message_count, 10)
                : conv.message_count,
            preview: conv.last_message_preview || "No messages yet",
            pinned: existingConv?.pinned || false,
            folder: existingConv?.folder || "Work Projects",
            messages: existingConv?.messages || [],
          };
        }
      );

      setConversations(converted);
      setConversationsLoaded(true);

      if (typeof window !== "undefined") {
        localStorage.setItem("chat-conversations", JSON.stringify(converted));
      }

      console.log(`${converted.length} ta suhbat yangilandi`);
    } catch (error: any) {
      console.error("Failed to load conversations:", error);
      toast.error(
        "Backend bilan bog'lanishda xatolik: " + (error.message || "")
      );
      setConversationsLoaded(true);
    }
  }

  // Save conversations to localStorage
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !conversationsLoaded ||
      conversations.length === 0
    ) {
      return;
    }

    try {
      localStorage.setItem("chat-conversations", JSON.stringify(conversations));
    } catch (e) {
      console.error("Failed to save conversations to localStorage:", e);
    }
  }, [conversations, conversationsLoaded]);

  // Keyboard shortcuts
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
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  // Create new chat on initial load if needed
  useEffect(() => {
    if (!selectedId && conversations.length > 0 && conversationsLoaded) {
      createNewChat();
    }
  }, [conversationsLoaded]);

  // Loaded conversations tracking
  const [loadedConversations, setLoadedConversations] = useState<Set<string>>(
    () => {
      if (typeof window === "undefined") return new Set();
      try {
        const saved = localStorage.getItem("chat-loaded-conversations");
        if (saved) {
          return new Set(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to parse loaded conversations:", e);
      }
      return new Set();
    }
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "chat-loaded-conversations",
        JSON.stringify(Array.from(loadedConversations))
      );
    } catch (e) {
      console.error("Failed to save loaded conversations:", e);
    }
  }, [loadedConversations]);

  // Load conversation messages when selected
  useEffect(() => {
    // Faqat haqiqiy backend conversation ID lar uchun xabarlarni yuklash
    if (
      selectedId &&
      !selectedId.startsWith("temp-") &&
      !selectedId.includes(".")
    ) {
      const numericId = parseInt(selectedId, 10);
      if (
        !isNaN(numericId) &&
        numericId > 0 &&
        !loadedConversations.has(selectedId)
      ) {
        loadConversationMessages(selectedId);
        setLoadedConversations((prev) => new Set(prev).add(selectedId));
      }
    }
  }, [selectedId, loadedConversations]);

  async function loadConversationMessages(convId: string) {
    try {
      const numericId = parseInt(convId, 10);
      if (isNaN(numericId)) return;

      const firstPage = await getConversationById(numericId);
      console.log("Loaded conversation first page:", firstPage);

      let allMsgs: any[] = [];
      const extract = (page: any): any[] => {
        if (page?.results?.messages) return page.results.messages;
        if (page?.messages) return page.messages;
        return [];
      };

      allMsgs = allMsgs.concat(extract(firstPage));

      let nextUrl: string | null | undefined = (firstPage as any)?.next;
      while (nextUrl) {
        const nextPage = await getConversationPageByUrl(nextUrl);
        console.log("Loaded conversation next page:", nextPage);
        allMsgs = allMsgs.concat(extract(nextPage));
        nextUrl = (nextPage as any)?.next;
      }

      const normalized: Message[] = allMsgs
        .map((msg) => ({
          id: msg.id?.toString() || Math.random().toString(36).slice(2),
          role: msg.role as "user" | "assistant",
          content: msg.content,
          createdAt: msg.created_at || new Date().toISOString(),
        }))
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: normalized,
                title:
                  (firstPage as any)?.results?.title ||
                  (firstPage as any)?.title ||
                  c.title,
                messageCount: normalized.length,
              }
            : c
        )
      );

      console.log(
        `Loaded ${normalized.length} messages for conversation ${convId}`
      );
    } catch (error: any) {
      console.error("Failed to load conversation messages:", error);
      toast.error(
        "Xabarlarni yuklashda xatolik: " + (error.message || "Server xatosi")
      );
    }
  }

  // Filtered conversations
  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)
    );
  }, [conversations, query]);

  const pinned = useMemo(
    () =>
      filtered
        .filter((c) => c.pinned)
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [filtered]
  );

  const recent = useMemo(
    () =>
      filtered
        .filter((c) => !c.pinned)
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .slice(0, 10),
    [filtered]
  );

  const folderCounts = useMemo(() => {
    const map = Object.fromEntries(folders.map((f) => [f.name, 0]));
    for (const c of conversations) {
      if (map[c.folder] != null) map[c.folder] += 1;
    }
    return map;
  }, [conversations, folders]);

  function togglePin(id: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  }

  async function createNewChat() {
    // Yangi chat yaratish - bu faqat UI da placeholder
    const tempId = "temp-" + Math.random().toString(36).slice(2);
    const item: Conversation = {
      id: tempId,
      title: "New Chat",
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      preview: "Say hello to start...",
      pinned: false,
      folder: "Work Projects",
      messages: [],
    };
    setConversations((prev) => [item, ...prev]);
    setSelectedId(tempId);
    setSidebarOpen(false);
  }

  function createFolder(name?: string) {
    const folderName = name || prompt("Folder name");
    if (!folderName) return;
    if (
      folders.some((f) => f.name.toLowerCase() === folderName.toLowerCase())
    ) {
      alert("Folder already exists.");
      return;
    }
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
    const userMsg: Message = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content,
      createdAt: now,
      attachments: attachments.length ? attachments : undefined,
    };

    // Optimistic user message append
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages, userMsg];
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
      const payload = {
        message: content,
        system_prompt:
          "Siz hokimiyat hujjatlari bilan ishlaydigan yordamchi AI assistantsiz. Foydalanuvchilarga rasmiy hujjatlar tayyorlashda yordam bering.",
      };

      let res: any;
      const numericId = parseInt(convId, 10);

      // Agar conversation ID temp yoki noto'g'ri bo'lsa, yangi conversation yaratish
      if (
        isNaN(numericId) ||
        convId.startsWith("temp-") ||
        convId.includes(".")
      ) {
        console.log("Sending to new conversation (POST /chat/)");
        res = await chatCompletion(payload);
      } else {
        console.log(
          `Sending to existing conversation ${numericId} (POST /chat/conversations/${numericId}/messages/)`
        );
        res = await sendMessageToConversation(numericId, payload);
      }

      console.log("Chat response:", res);

      const text =
        res?.reply ||
        res?.response ||
        res?.message ||
        res?.content ||
        res?.output ||
        res?.text ||
        (typeof res === "string" ? res : null) ||
        "Javob topilmadi.";

      console.log("Extracted text:", text);
      appendAssistant(convId, text);

      if (res?.conversation_id && convId !== res.conversation_id.toString()) {
        const backendConvId = res.conversation_id.toString();
        console.log(
          `Updating conversation ID from ${convId} to ${backendConvId}`
        );

        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, id: backendConvId } : c))
        );

        setSelectedId(backendConvId);
        setLoadedConversations((prev) => new Set(prev).add(backendConvId));
      }
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
    const asstMsg: Message = {
      id: Math.random().toString(36).slice(2),
      role: "assistant",
      content,
      createdAt: now,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages, asstMsg];
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
        const msgs = c.messages.map((m) =>
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
    await sendMessage(convId, msg.content, msg.attachments);
  }

  function pauseThinking() {
    setIsThinking(false);
    setThinkingConvId(null);
  }

  function handleUseTemplate(template: { content: string }) {
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
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
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

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Document Viewer - Conditional rendering, takes 50% when visible */}
        <DocumentViewer />
        {/* Chat Pane - Takes remaining space or 50% if DocumentViewer is present */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-900">
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
