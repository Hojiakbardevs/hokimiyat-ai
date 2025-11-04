"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FrostedGlassIconProps {
  icon: ReactNode;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeVariants = {
  sm: "w-12 h-12 sm:w-10 sm:h-10",
  md: "w-14 h-14 sm:w-12 sm:h-12",
  lg: "w-16 h-16 sm:w-14 sm:h-14",
};

export default function FrostedGlassIcon({
  icon,
  color = "rgb(36 101 237 / 0.8)",
  size = "md",
  className = "",
}: FrostedGlassIconProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl flex items-center justify-center transition-all duration-300",
        // Backdrop blur
        "backdrop-blur-[10px]",
        // Light mode: white gradient + borders + shadows
        "bg-linear-to-[135deg] from-white/80 to-white/40",
        "border border-white/70",
        "shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.7)]",
        // Dark mode overrides
        "dark:bg-linear-to-[135deg] dark:from-white/10 dark:to-white/5",
        "dark:border-white/10",
        "dark:shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]",
        // Hover effects
        "hover:scale-105 hover:shadow-lg dark:hover:shadow-primary/20",
        sizeVariants[size],
        className
      )}>
      {/* Color accent overlay */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
          }}
        />
      </div>

      {/* Icon content */}
      <div className="relative z-10 transition-transform group-hover:scale-110 [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
        {icon}
      </div>
    </div>
  );
}
