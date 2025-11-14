import type { TextareaHTMLAttributes } from "react";

type Props = {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">;

// Lightweight editor: a styled textarea to keep dependencies small.
export function RichTextEditor({
  content,
  onChange,
  placeholder,
  ...rest
}: Props) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Matnni tahrirlang..."}
      className="min-h-96 w-full resize-y rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-900 outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
      {...rest}
    />
  );
}

export default RichTextEditor;
