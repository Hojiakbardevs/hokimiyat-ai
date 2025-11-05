import { Star, MessageSquare } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface ConversationRowProps {
  data: {
    id: string;
    title: string;
    preview: string;
    messageCount: number;
    updatedAt: string;
    pinned: boolean;
  };
  active: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  showMeta?: boolean;
}

export default function ConversationRow({
  data,
  active,
  onSelect,
  onTogglePin,
  showMeta = false,
}: ConversationRowProps) {
  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-lg px-3 py-2.5 transition-colors ${
        active
          ? "bg-blue-50 dark:bg-blue-900/20"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
      }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={`truncate text-sm font-medium ${
                active
                  ? "text-blue-900 dark:text-blue-100"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}>
              {data.title}
            </h3>
            {data.pinned && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {data.preview}
          </p>
          {showMeta && (
            <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {data.messageCount}
              </span>
              <span>·</span>
              <span>{timeAgo(data.updatedAt)}</span>
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
          <Star
            className={`h-4 w-4 ${
              data.pinned
                ? "fill-yellow-400 text-yellow-400"
                : "text-zinc-400 hover:text-yellow-400"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
