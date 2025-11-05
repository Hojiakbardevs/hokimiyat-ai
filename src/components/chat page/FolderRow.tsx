import { useState } from "react";
import {
  ChevronRight,
  Folder,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import ConversationRow from "./ConversationRow";

interface FolderRowProps {
  name: string;
  count: number;
  conversations: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  togglePin: (id: string) => void;
  onDeleteFolder: (name: string) => void;
  onRenameFolder: (oldName: string, newName: string) => void;
}

export default function FolderRow({
  name,
  count,
  conversations,
  selectedId,
  onSelect,
  togglePin,
  onDeleteFolder,
  onRenameFolder,
}: FolderRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);

  const handleRename = () => {
    if (newName.trim() && newName !== name) {
      onRenameFolder(name, newName.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  return (
    <div className="space-y-1">
      <div className="group relative flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-1 items-center gap-2 text-left">
          <ChevronRight
            className={`h-4 w-4 shrink-0 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
          <Folder className="h-4 w-4 shrink-0 text-zinc-500" />
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setIsRenaming(false);
                  setNewName(name);
                }
              }}
              className="flex-1 rounded border border-blue-500 bg-white px-2 py-0.5 text-sm outline-none dark:bg-zinc-900"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 truncate text-sm font-medium">{name}</span>
          )}
          <span className="text-xs text-zinc-400">{count}</span>
        </button>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 transition-opacity group-hover:opacity-100">
            <MoreVertical className="h-4 w-4 text-zinc-400" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700">
                  <Pencil className="h-4 w-4" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    onDeleteFolder(name);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {conversations.length === 0 ? (
            <div className="px-3 py-2 text-xs text-zinc-400">
              No conversations in this folder
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationRow
                key={conv.id}
                data={conv}
                active={conv.id === selectedId}
                onSelect={() => onSelect(conv.id)}
                onTogglePin={() => togglePin(conv.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
