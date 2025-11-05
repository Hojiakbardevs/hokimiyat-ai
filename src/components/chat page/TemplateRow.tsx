import { useState } from "react";
import { FileText, MoreVertical, Pencil, Trash2, Play } from "lucide-react";

interface Template {
  id: string;
  name: string;
  snippet: string;
  content: string;
}

interface TemplateRowProps {
  template: Template;
  onUseTemplate: (template: Template) => void;
  onEditTemplate: (template: Template) => void;
  onRenameTemplate: (id: string, newName: string) => void;
  onDeleteTemplate: (id: string) => void;
}

export default function TemplateRow({
  template,
  onUseTemplate,
  onEditTemplate,
  onRenameTemplate,
  onDeleteTemplate,
}: TemplateRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(template.name);

  const handleRename = () => {
    if (newName.trim() && newName !== template.name) {
      onRenameTemplate(template.id, newName.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  return (
    <div className="group relative rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
      <div className="flex items-start gap-2">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
        <div className="min-w-0 flex-1">
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
                  setNewName(template.name);
                }
              }}
              className="w-full rounded border border-blue-500 bg-white px-2 py-0.5 text-sm outline-none dark:bg-zinc-900"
              autoFocus
            />
          ) : (
            <>
              <h4 className="truncate text-sm font-medium">{template.name}</h4>
              <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                {template.snippet}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUseTemplate(template)}
            className="opacity-0 transition-opacity group-hover:opacity-100"
            title="Use template">
            <Play className="h-4 w-4 text-blue-500" />
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
                      onUseTemplate(template);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700">
                    <Play className="h-4 w-4" />
                    Use
                  </button>
                  <button
                    onClick={() => {
                      onEditTemplate(template);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
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
                      onDeleteTemplate(template.id);
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
      </div>
    </div>
  );
}
