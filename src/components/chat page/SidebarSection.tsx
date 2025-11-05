import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface SidebarSectionProps {
  icon: ReactNode;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export default function SidebarSection({
  icon,
  title,
  collapsed,
  onToggle,
  children,
}: SidebarSectionProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-2 text-xs font-semibold tracking-wider text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
        {icon}
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            collapsed ? "-rotate-90" : ""
          }`}
        />
      </button>
      {!collapsed && <div className="space-y-1">{children}</div>}
    </div>
  );
}
