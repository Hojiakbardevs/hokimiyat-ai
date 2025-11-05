import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Clock } from "lucide-react";

interface Template {
  id: string;
  name: string;
  content: string;
  snippet?: string;
  updatedAt?: string;
}

interface TemplateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
}

export default function TemplateDrawer({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
}: TemplateDrawerProps) {
  const handleTemplateClick = (template: Template) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ zIndex: 100 }}
            className="fixed inset-0 bg-black/50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{ zIndex: 100 }}
            className="fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl dark:bg-zinc-900">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                <h2 className="text-lg font-semibold">Choose a Template</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {templates.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                  <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    No templates yet
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Create your first template in the sidebar to get started.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateClick(template)}
                      className="group relative flex flex-col items-start gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-left transition-all hover:border-blue-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-500">
                      <div className="flex w-full items-start justify-between">
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                          {template.name}
                        </h3>
                        <FileText className="h-4 w-4 text-zinc-400 group-hover:text-blue-500" />
                      </div>

                      <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {template.snippet || template.content}
                      </p>

                      {template.updatedAt && (
                        <div className="mt-auto flex items-center gap-1 text-xs text-zinc-400">
                          <Clock className="h-3 w-3" />
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
