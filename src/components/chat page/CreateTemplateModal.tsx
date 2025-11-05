import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Template {
  id?: string;
  name: string;
  content: string;
  snippet?: string;
}

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate: (template: Template) => void;
  editingTemplate?: Template | null;
}

export default function CreateTemplateModal({
  isOpen,
  onClose,
  onCreateTemplate,
  editingTemplate,
}: CreateTemplateModalProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name);
      setContent(editingTemplate.content);
    } else {
      setName("");
      setContent("");
    }
  }, [editingTemplate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && content.trim()) {
      const snippet = content.slice(0, 80) + (content.length > 80 ? "..." : "");
      onCreateTemplate({
        name: name.trim(),
        content: content.trim(),
        snippet,
      });
      setName("");
      setContent("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {editingTemplate ? "Edit Template" : "Create New Template"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ariza shabloni"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your template content..."
              rows={10}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
              {editingTemplate ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
