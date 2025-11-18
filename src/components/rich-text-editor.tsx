import type { TextareaHTMLAttributes } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDocumentStats } from "@/utils/exportService";

type Props = {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showStats?: boolean;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">;

// Lightweight editor: a styled textarea to keep dependencies small.
export function RichTextEditor({
  content,
  onChange,
  placeholder,
  showStats = true,
  ...rest
}: Props) {
  const stats = showStats ? getDocumentStats(content) : null;

  return (
    <div className="relative w-full">
      {/* Statistics bar */}
      {showStats && stats && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <strong className="text-foreground">
                {stats.characters.toLocaleString()}
              </strong>{" "}
              belgi
            </span>
            <span className="flex items-center gap-1">
              <strong className="text-foreground">
                {stats.words.toLocaleString()}
              </strong>{" "}
              so'z
            </span>
            <span className="flex items-center gap-1">
              <strong className="text-foreground">{stats.pages}</strong> bet
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Taxminiy bet soni Times New Roman 14pt, A4 format uchun
                      hisoblab chiqarilgan (1 bet ≈ 1800 belgi)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 cursor-help">
                    Markdown formatlash
                    <Info className="h-3 w-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-md">
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold">Markdown formatlash:</p>
                    <p>
                      <code className="bg-muted px-1"># Sarlavha</code> - Katta
                      sarlavha (o'rtaga)
                    </p>
                    <p>
                      <code className="bg-muted px-1">## Sarlavha</code> -
                      Kichik sarlavha
                    </p>
                    <p>
                      <code className="bg-muted px-1">**qalin**</code> - Qalin
                      matn
                    </p>
                    <p>
                      <code className="bg-muted px-1">*kursiv*</code> - Kursiv
                      matn
                    </p>
                    <p>
                      <code className="bg-muted px-1">- element</code> - Ro'yxat
                      elementi
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Oddiy matn avtomatik ravishda justify (tekis) qilinadi
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Chiroyli textarea editor */}
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Matn kiriting..."}
        className="min-h-96 w-full resize-y rounded-xl border border-zinc-200 bg-white p-4 text-base leading-relaxed text-zinc-900 outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
        style={{
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
        {...rest}
      />
    </div>
  );
}

export default RichTextEditor;
