"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import FrostedGlassIcon from "./frosted-glass-icon";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  accentColor?: string;
  className?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  accentColor = "rgb(120 120 255 / 0.5)",
  className,
}: FeatureCardProps) {
  return (
    <div className={cn("relative group h-full", className)}>
      <Card
        className={cn(
          "h-full overflow-hidden backdrop-blur-sm border transition-all duration-300",
          "bg-background/60 hover:shadow-lg hover:border-primary/20",
          "dark:bg-background/80 dark:hover:shadow-primary/10"
        )}>
        <div className="p-5 sm:p-6 h-full flex flex-col relative z-10">
          <FrostedGlassIcon
            icon={icon}
            color={accentColor}
            className="self-start m-auto mb-4"
          />

          <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-primary transition-colors text-center">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground grow leading-relaxed text-center">
            {description}
          </p>
        </div>

        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-30"
          initial={{ opacity: 0 }}
          animate={{
            background: [
              `radial-gradient(circle at 30% 30%, ${accentColor} 0%, transparent 60%)`,
              `radial-gradient(circle at 70% 70%, ${accentColor} 0%, transparent 60%)`,
            ],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </Card>
    </div>
  );
}
