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
    <motion.div
      className={cn("relative group h-full", className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}>
      <Card
        className={cn(
          "h-full overflow-hidden backdrop-blur-sm border transition-all duration-300",
          "bg-background/60 hover:shadow-lg hover:border-primary/20",
          "dark:bg-background/80 dark:hover:shadow-primary/10"
        )}>
        <div className="p-6 h-full flex flex-col relative z-10">
          <FrostedGlassIcon
            icon={icon}
            color={accentColor}
            className="mb-4 self-start"
          />

          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground grow leading-relaxed">
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
    </motion.div>
  );
}
