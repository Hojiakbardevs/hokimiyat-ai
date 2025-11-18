"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SearchIcon,
  Plus,
  Star,
  Clock,
  FolderIcon,
  FileText,
  Settings,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cls } from "@/lib/utils";
import SidebarSection from "./SidebarSection";
import ConversationRow from "./ConversationRow";
import FolderRow from "./FolderRow";
import TemplateRow from "./TemplateRow";
import ThemeToggle from "./ThemeToggle";
import CreateFolderModal from "./CreateFolderModal";
import CreateTemplateModal from "./CreateTemplateModal";
import SearchModal from "./SearchModal";
import SettingsPopover from "./SettingsPopover";
import { Link, useNavigate } from "react-router-dom";
import Logoss from "@/assets/logowhite.svg";
import { useAuth } from "@/hooks/useAuth";
import { getMe, type UserProfile } from "@/api/users";
interface CustomSidebarProps {
  open: boolean;
  onClose: () => void;
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  collapsed: any;
  setCollapsed: React.Dispatch<any>;
  sidebarCollapsed: any;
  setSidebarCollapsed: React.Dispatch<any>;
  conversations: any[];
  pinned: any[];
  recent: any[];
  folders: any[];
  folderCounts: Record<string, number>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  togglePin: (id: string) => void;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  searchRef: React.RefObject<HTMLInputElement | null>;
  createFolder: (name?: string) => void;
  createNewChat: () => void;
  templates: any[];
  setTemplates: React.Dispatch<any>;
  onUseTemplate: (template: { content: string }) => void;
  onReloadConversations?: () => Promise<void>;
}

export function CustomSidebar({
  open,
  onClose,
  theme,
  setTheme,
  collapsed,
  setCollapsed,
  conversations,
  pinned,
  recent,
  folders,
  folderCounts,
  selectedId,
  onSelect,
  togglePin,
  query,
  setQuery,
  searchRef,
  createFolder,
  createNewChat,
  templates = [],
  setTemplates = () => {},
  onUseTemplate = () => {},
  sidebarCollapsed = false,
  setSidebarCollapsed = () => {},
  onReloadConversations = async () => {},
}: CustomSidebarProps) {
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) {
        console.log("❌ User not authenticated, skipping profile fetch");
        return;
      }

      const token = localStorage.getItem("access_token");
      console.log("🔑 Access Token exists:", !!token);

      if (!token) {
        console.log("❌ No access token found in localStorage");
        return;
      }

      try {
        console.log("📡 Fetching user profile from API...");

        const profile = await getMe();

        console.log("✅ User profile fetched successfully:", profile);
        console.log("🆔 ID:", profile.id);
        console.log("� Phone:", profile.phone);
        console.log("👨 First Name:", profile.first_name);
        console.log("👨 Last Name:", profile.last_name);

        setUserProfile(profile);
      } catch (error) {
        console.error("❌ Failed to fetch user profile:", error);
        console.error("Error details:", {
          message: (error as any)?.message,
          response: (error as any)?.response,
          status: (error as any)?.status,
        });

        // Agar token muammosi bo'lsa, logout qil
        if (
          (error as any)?.message?.includes("401") ||
          (error as any)?.message?.includes("unauthorized")
        ) {
          console.log("🚪 Token invalid, redirecting to login...");
          navigate("/login");
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, navigate]);

  const getUserInitials = () => {
    if (!userProfile) return "??";

    const firstName = userProfile.first_name || "";
    const lastName = userProfile.last_name || "";

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }

    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }

    if (lastName) {
      return lastName.substring(0, 2).toUpperCase();
    }

    return "??";
  };

  const getUserFullName = () => {
    if (!userProfile) return "Loading...";

    const firstName = userProfile.first_name || "";
    const lastName = userProfile.last_name || "";

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    if (firstName) {
      return firstName;
    }

    if (lastName) {
      return lastName;
    }

    if (userProfile.phone) {
      return userProfile.phone;
    }

    return "User";
  };

  const getConversationsByFolder = (folderName: string) => {
    return conversations.filter((conv) => conv.folder === folderName);
  };

  const handleCreateFolder = (folderName: string) => {
    createFolder(folderName);
  };

  const handleDeleteFolder = (folderName: string) => {
    const updatedConversations = conversations.map((conv) =>
      conv.folder === folderName ? { ...conv, folder: null } : conv
    );
    console.log(
      "Delete folder:",
      folderName,
      "Updated conversations:",
      updatedConversations
    );
  };

  const handleRenameFolder = (oldName: string, newName: string) => {
    const updatedConversations = conversations.map((conv) =>
      conv.folder === oldName ? { ...conv, folder: newName } : conv
    );
    console.log(
      "Rename folder:",
      oldName,
      "to",
      newName,
      "Updated conversations:",
      updatedConversations
    );
  };

  const handleCreateTemplate = (templateData: any) => {
    if (editingTemplate) {
      const updatedTemplates = templates.map((t: any) =>
        t.id === editingTemplate.id
          ? { ...templateData, id: editingTemplate.id }
          : t
      );
      setTemplates(updatedTemplates);
      setEditingTemplate(null);
    } else {
      const newTemplate = {
        ...templateData,
        id: Date.now().toString(),
      };
      setTemplates([...templates, newTemplate]);
    }
    setShowCreateTemplateModal(false);
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setShowCreateTemplateModal(true);
  };

  const handleRenameTemplate = (templateId: string, newName: string) => {
    const updatedTemplates = templates.map((t: any) =>
      t.id === templateId
        ? { ...t, name: newName, updatedAt: new Date().toISOString() }
        : t
    );
    setTemplates(updatedTemplates);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter((t: any) => t.id !== templateId);
    setTemplates(updatedTemplates);
  };

  const handleUseTemplate = (template: any) => {
    onUseTemplate(template);
  };

  if (sidebarCollapsed) {
    return (
      <motion.aside
        initial={{ width: 320 }}
        animate={{ width: 64 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="z-50 flex h-full shrink-0 flex-col border-r border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* Sidebar Header - Expand Button */}
        <div className="flex items-center justify-center border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            style={{ WebkitTapHighlightColor: "transparent" }}
            aria-label="Open sidebar"
            title="Open sidebar (⌘B)">
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        </div>

        {/* Main Actions */}
        <div className="flex flex-1 flex-col items-center gap-2 px-2 pt-3">
          {/* New Chat Button */}
          <button
            onClick={createNewChat}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            style={{ WebkitTapHighlightColor: "transparent" }}
            title="New Chat (⌘N)">
            <Plus className="h-5 w-5" />
          </button>

          {/* Recent Conversations Icons */}
          <div className="flex flex-col items-center gap-1 w-full">
            {recent.slice(0, 5).map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cls(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors text-xs font-medium",
                  conv.id === selectedId
                    ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                )}
                title={conv.title}
                style={{ WebkitTapHighlightColor: "transparent" }}>
                <FileText className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-2 border-t border-zinc-200/60 px-2 py-3 dark:border-zinc-800">
          <button
            onClick={onReloadConversations}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            style={{ WebkitTapHighlightColor: "transparent" }}
            title="Reload Conversations">
            <RefreshCw className="h-5 w-5" />
          </button>

          <SettingsPopover
            userProfile={userProfile}
            theme={theme}
            onThemeChange={setTheme}>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              title="Settings"
              style={{ WebkitTapHighlightColor: "transparent" }}>
              <Settings className="h-5 w-5" />
            </button>
          </SettingsPopover>

          {/* User Avatar */}
          <div
            className="user-avatar grid h-10 w-10 place-items-center rounded-lg text-xs font-bold"
            title={getUserFullName()}
            style={{ WebkitTapHighlightColor: "transparent" }}>
            {getUserInitials()}
          </div>
        </div>
      </motion.aside>
    );
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            style={{
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              pointerEvents: "auto",
              touchAction: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile aside - no motion */}
      {open && (
        <aside
          className={cls(
            "z-50 flex md:hidden h-full w-80 shrink-0 flex-col border-r border-border bg-background",
            "fixed inset-y-0 left-0"
          )}
          style={{
            touchAction: "pan-y",
            WebkitTapHighlightColor: "transparent",
          }}
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 border-b border-border px-3 py-3">
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="flex items-center space-x-2"
                aria-label="Enterprise AI Homepage">
                <img src={Logoss} alt="Logo" className="h-8" />
                <span className="text-2xl font-bold">Hokimiyat AI</span>
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="sidebar-button"
                style={{ WebkitTapHighlightColor: "transparent" }}
                aria-label="Close sidebar">
                <PanelLeftClose className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-3 pt-3">
            <label htmlFor="search" className="sr-only">
              Ma'lumotlarni qidirish
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="search"
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                onClick={() => setShowSearchModal(true)}
                onFocus={() => setShowSearchModal(true)}
                className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                style={{ WebkitTapHighlightColor: "transparent" }}
              />
            </div>
          </div>

          <div className="px-3 pt-3">
            <button
              onClick={createNewChat}
              className="btn-primary flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2"
              style={{
                WebkitTapHighlightColor: "transparent",
              }}
              title="New Chat (⌘N)">
              <Plus className="h-4 w-4" /> Start New Chat
            </button>
          </div>

          <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
            <SidebarSection
              icon={<Star className="h-4 w-4" />}
              title="PINNED CHATS"
              collapsed={collapsed.pinned}
              onToggle={() =>
                setCollapsed((s: any) => ({ ...s, pinned: !s.pinned }))
              }>
              {pinned.length === 0 ? (
                <div className="select-none rounded-lg border border-dashed border-border px-3 py-3 text-center text-xs text-muted-foreground">
                  Pin important threads for quick access.
                </div>
              ) : (
                pinned.map((c) => (
                  <ConversationRow
                    key={c.id}
                    data={c}
                    active={c.id === selectedId}
                    onSelect={() => onSelect(c.id)}
                    onTogglePin={() => togglePin(c.id)}
                  />
                ))
              )}
            </SidebarSection>

            {false && (
              <SidebarSection
                icon={<Clock className="h-4 w-4" />}
                title="RECENT"
                collapsed={collapsed.recent}
                onToggle={() =>
                  setCollapsed((s: any) => ({ ...s, recent: !s.recent }))
                }>
                {recent.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed border-border px-3 py-3 text-center text-xs text-muted-foreground">
                    No conversations yet. Start a new one!
                  </div>
                ) : (
                  recent.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                      showMeta
                    />
                  ))
                )}
              </SidebarSection>
            )}

            {false && (
              <SidebarSection
                icon={<FolderIcon className="h-4 w-4" />}
                title="FOLDERS"
                collapsed={collapsed.folders}
                onToggle={() =>
                  setCollapsed((s: any) => ({ ...s, folders: !s.folders }))
                }>
                <div className="-mx-1">
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="mb-2 inline-flex w-full items-center gap-2 sidebar-item text-foreground"
                    style={{ WebkitTapHighlightColor: "transparent" }}>
                    <Plus className="h-4 w-4" /> Create folder
                  </button>

                  {folders.map((f) => (
                    <FolderRow
                      key={f.id}
                      name={f.name}
                      count={folderCounts[f.name] || 0}
                      conversations={getConversationsByFolder(f.name)}
                      selectedId={selectedId}
                      onSelect={onSelect}
                      togglePin={togglePin}
                      onDeleteFolder={handleDeleteFolder}
                      onRenameFolder={handleRenameFolder}
                    />
                  ))}
                </div>
              </SidebarSection>
            )}

            <SidebarSection
              icon={<FileText className="h-4 w-4" />}
              title="TEMPLATES"
              collapsed={collapsed.templates}
              onToggle={() =>
                setCollapsed((s: any) => ({ ...s, templates: !s.templates }))
              }>
              <div className="-mx-1">
                <button
                  onClick={() => setShowCreateTemplateModal(true)}
                  className="mb-2 inline-flex w-full items-center gap-2 sidebar-item text-foreground"
                  style={{ WebkitTapHighlightColor: "transparent" }}>
                  <Plus className="h-4 w-4" /> Create template
                </button>

                {(Array.isArray(templates) ? templates : []).map(
                  (template: any) => (
                    <TemplateRow
                      key={template.id}
                      template={template}
                      onUseTemplate={handleUseTemplate}
                      onEditTemplate={handleEditTemplate}
                      onRenameTemplate={handleRenameTemplate}
                      onDeleteTemplate={handleDeleteTemplate}
                    />
                  )
                )}

                {(!templates || templates.length === 0) && (
                  <div className="select-none rounded-lg border border-dashed border-border px-3 py-3 text-center text-xs text-muted-foreground">
                    No templates yet. Create your first prompt template.
                  </div>
                )}
              </div>
            </SidebarSection>
          </nav>

          <div className="mt-auto border-t border-border px-3 py-3">
            <div className="flex items-center gap-2">
              <SettingsPopover
                userProfile={userProfile}
                theme={theme}
                onThemeChange={setTheme}>
                <button className="inline-flex items-center gap-2 sidebar-item">
                  <Settings className="h-4 w-4" /> Settings
                </button>
              </SettingsPopover>
              <div className="ml-auto">
                <ThemeToggle theme={theme} setTheme={setTheme} />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-muted p-2">
              <div className="user-avatar grid h-8 w-8 place-items-center rounded-full text-xs font-bold">
                {getUserInitials()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {getUserFullName()}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {userProfile?.phone || "No phone"}
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      <AnimatePresence>
        {typeof window !== "undefined" && (
          <motion.aside
            key="sidebar"
            initial={{ x: -340 }}
            animate={{ x: open ? 0 : 0 }}
            exit={{ x: -340 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            drag={false}
            dragConstraints={{ left: 0, right: 0 }}
            className={cls(
              "z-50 hidden md:flex h-full w-80 shrink-0 flex-col border-r border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900",
              "md:static md:translate-x-0"
            )}
            style={{
              touchAction: "pan-y",
              WebkitTapHighlightColor: "transparent",
            }}
            onPointerDown={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  className="flex items-center space-x-2"
                  aria-label="Enterprise AI Homepage">
                  <img src={Logoss} alt="Logo" className="h-8" />
                  <span className="text-2xl font-bold">Hokimiyat AI</span>
                </Link>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden md:block sidebar-button"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  aria-label="Close sidebar"
                  title="Close sidebar">
                  <PanelLeftClose className="h-5 w-5" />
                </button>

                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                  }}
                  className="md:hidden sidebar-button"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  aria-label="Close sidebar">
                  <PanelLeftClose className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-3 pt-3">
              <label htmlFor="search" className="sr-only">
                Search conversations
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="search"
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  onClick={() => setShowSearchModal(true)}
                  onFocus={() => setShowSearchModal(true)}
                  className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950/50"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                />
              </div>
            </div>

            <div className="px-3 pt-3">
              <button
                onClick={createNewChat}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                style={{ WebkitTapHighlightColor: "transparent" }}
                title="New Chat (⌘N)">
                <Plus className="h-4 w-4" /> Start New Chat
              </button>
            </div>

            <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
              <SidebarSection
                icon={<Star className="h-4 w-4" />}
                title="PINNED CHATS"
                collapsed={collapsed.pinned}
                onToggle={() =>
                  setCollapsed((s: any) => ({ ...s, pinned: !s.pinned }))
                }>
                {pinned.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    Pin important threads for quick access.
                  </div>
                ) : (
                  pinned.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                    />
                  ))
                )}
              </SidebarSection>

              <SidebarSection
                icon={<Clock className="h-4 w-4" />}
                title="RECENT"
                collapsed={collapsed.recent}
                onToggle={() =>
                  setCollapsed((s: any) => ({ ...s, recent: !s.recent }))
                }>
                {recent.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    No conversations yet. Start a new one!
                  </div>
                ) : (
                  recent.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                      showMeta
                    />
                  ))
                )}
              </SidebarSection>

              <SidebarSection
                icon={<FolderIcon className="h-4 w-4" />}
                title="FOLDERS"
                collapsed={collapsed.folders}
                onToggle={() =>
                  setCollapsed((s: any) => ({ ...s, folders: !s.folders }))
                }>
                <div className="-mx-1">
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="mb-2 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    style={{ WebkitTapHighlightColor: "transparent" }}>
                    <Plus className="h-4 w-4" /> Create folder
                  </button>

                  {folders.map((f) => (
                    <FolderRow
                      key={f.id}
                      name={f.name}
                      count={folderCounts[f.name] || 0}
                      conversations={getConversationsByFolder(f.name)}
                      selectedId={selectedId}
                      onSelect={onSelect}
                      togglePin={togglePin}
                      onDeleteFolder={handleDeleteFolder}
                      onRenameFolder={handleRenameFolder}
                    />
                  ))}
                </div>
              </SidebarSection>

              <SidebarSection
                icon={<FileText className="h-4 w-4" />}
                title="TEMPLATES"
                collapsed={collapsed.templates}
                onToggle={() =>
                  setCollapsed((s: any) => ({ ...s, templates: !s.templates }))
                }>
                <div className="-mx-1">
                  <button
                    onClick={() => setShowCreateTemplateModal(true)}
                    className="mb-2 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    style={{ WebkitTapHighlightColor: "transparent" }}>
                    <Plus className="h-4 w-4" /> Create template
                  </button>

                  {(Array.isArray(templates) ? templates : []).map(
                    (template: any) => (
                      <TemplateRow
                        key={template.id}
                        template={template}
                        onUseTemplate={handleUseTemplate}
                        onEditTemplate={handleEditTemplate}
                        onRenameTemplate={handleRenameTemplate}
                        onDeleteTemplate={handleDeleteTemplate}
                      />
                    )
                  )}

                  {(!templates || templates.length === 0) && (
                    <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      No templates yet. Create your first prompt template.
                    </div>
                  )}
                </div>
              </SidebarSection>
            </nav>

            <div className="mt-auto border-t border-border px-3 py-3">
              <div className="flex items-center gap-2">
                <SettingsPopover
                  userProfile={userProfile}
                  theme={theme}
                  onThemeChange={setTheme}>
                  <button className="inline-flex items-center gap-2 sidebar-item">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                </SettingsPopover>
                <div className="ml-auto">
                  <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-muted p-2">
                <div className="user-avatar grid h-8 w-8 place-items-center rounded-full text-xs font-bold">
                  {getUserInitials()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {getUserFullName()}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {userProfile?.phone || "No phone"}
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />

      <CreateTemplateModal
        isOpen={showCreateTemplateModal}
        onClose={() => {
          setShowCreateTemplateModal(false);
          setEditingTemplate(null);
        }}
        onCreateTemplate={handleCreateTemplate}
        editingTemplate={editingTemplate}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        togglePin={togglePin}
        createNewChat={createNewChat}
      />
    </>
  );
}
