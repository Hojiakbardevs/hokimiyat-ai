import { useState } from "react";
import { X, Search } from "lucide-react";
import ConversationRow from "./ConversationRow";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  togglePin: (id: string) => void;
  createNewChat: () => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  conversations,
  selectedId,
  onSelect,
  togglePin,
}: SearchModalProps) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const filtered = query.trim()
    ? conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.preview.toLowerCase().includes(query.toLowerCase())
      )
    : conversations;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl dark:bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <Search className="h-5 w-5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No conversations found
            </div>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  onSelect(conv.id);
                  onClose();
                }}>
                <ConversationRow
                  data={conv}
                  active={conv.id === selectedId}
                  onSelect={() => {}}
                  onTogglePin={() => togglePin(conv.id)}
                  showMeta
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
