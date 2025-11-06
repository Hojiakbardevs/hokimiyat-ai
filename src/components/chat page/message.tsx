import { cls } from "@/lib/utils";
import React from "react";
import Logos from "@/assets/logowhite.svg"

interface MessageProps {
  role: string;
  children: React.ReactNode;
}

export default function Message({ role, children }: MessageProps) {
  const isUser = role === "user";
  return (
    <div
      className={cls("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
         <img src={Logos} alt="Logos" />
        </div>
      )}
      <div
        className={cls(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          isUser
            ? "bg-primary/10 text-foreground border border-primary/30 dark:bg-primary/20"
            : "bg-muted text-foreground border border-border"
        )}>
        {children}
      </div>
      {isUser && (
        <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
          HJ
        </div>
      )}
    </div>
  );
}
