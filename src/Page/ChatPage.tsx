"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  INITIAL_CONVERSATIONS,
  INITIAL_TEMPLATES,
  INITIAL_FOLDERS,
} from "@/lib/mockData";

import Header from "@/components/chat page/Header";
import ChatPane from "@/components/chat page/chatpane";
import { CustomSidebar } from "@/components/chat page/CustomSidebar";
import TemplateDrawer from "@/components/chat page/TemplateDrawer";
import { chatCompletion } from "@/api/chat";
import { toast } from "sonner";

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
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);

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
        />

        <main className="relative flex min-w-0 flex-1 flex-col">
          <Header
            setSidebarOpen={setSidebarOpen}
            onTemplateClick={() => setIsTemplateDrawerOpen(true)}
          />
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

      <TemplateDrawer
        isOpen={isTemplateDrawerOpen}
        onClose={() => setIsTemplateDrawerOpen(false)}
        templates={templates}
        onSelectTemplate={handleUseTemplate}
      />
    </div>
  );
}
