"use client";

import { motion } from "framer-motion";
import FeatureCard from "./feature-card";
import {
  BotIcon,
  DatabaseIcon,
  FileTextIcon,
  LockIcon,
  ServerIcon,
  ShieldIcon,
  SparklesIcon,
  ZapIcon,
} from "./features-icon";

export default function FeaturesSection() {
  const features = [
    {
      icon: <BotIcon />,
      title: "AI bilan muloqot tizimi",
      description:
        "Turli sun'iy intellekt modellarini sinab ko'ring va o'zingizga mosini tanlang — tizim ichida ishlash samaradorligi avtomatik tahlil qilinadi.",
      accentColor: "rgba(36, 101, 237, 0.5)",
    },
    {
      icon: <SparklesIcon />,
      title: "Moslashtiriladigan AI agentlar",
      description:
        "Tayyor agentlardan foydalaning yoki o'zingiznikini yarating — murakkab ish jarayonlarini avtomatlashtiring.",
      accentColor: "rgba(236, 72, 153, 0.5)",
    },
    {
      icon: <DatabaseIcon />,
      title: "Bilim bazasi va hujjatlar ombori",
      description:
        "Xavfsiz ma'lumot boshqaruvi, rollar asosidagi kirish huquqlari va izchil havolalar tizimi.",
      accentColor: "rgba(34, 211, 238, 0.5)",
    },
    {
      icon: <ShieldIcon />,
      title: "Tashkilot darajasidagi xavfsizlik",
      description:
        "Bank darajasidagi ma'lumot shifrlash, maxfiylik siyosatlari va huquqiy moslik nazorati.",
      accentColor: "rgba(132, 204, 22, 0.5)",
    },
    {
      icon: <FileTextIcon />,
      title: "Hujjat shablonlari",
      description:
        "Ariza, shartnoma, bayonnoma, taklifnoma va ma'lumotnoma uchun tayyor AI shablonlardan foydalaning.",
      accentColor: "rgba(249, 115, 22, 0.5)",
    },
    {
      icon: <ServerIcon />,
      title: "MCP server qo'llovi",
      description:
        "O'zingizga xos MCP serverlarni sozlang — ishlash tezligi va nazoratni oshiring.",
      accentColor: "rgba(168, 85, 247, 0.5)",
    },
    {
      icon: <LockIcon />,
      title: "Ma'lumot maxfiyligi va qonuniy moslik",
      description:
        "GDPR, HIPAA va mahalliy qonunchilik talablariga to'liq mos keluvchi xavfsizlik va hisobot mexanizmlari.",
      accentColor: "rgba(251, 191, 36, 0.5)",
    },
    {
      icon: <ZapIcon />,
      title: "Birgalikda real vaqtli ish",
      description:
        "Bir nechta foydalanuvchi bir vaqtning o'zida AI yordamida hujjat ustida ishlashi mumkin — jamoaviy hamkorlikni kuchaytiradi.",
      accentColor: "rgba(16, 185, 129, 0.5)",
    },
  ];

  // Animation variants for repeating stagger effect with exit
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1, // Reverse order when exiting
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as const, // easeOut cubic-bezier
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 1, 1] as const, // easeIn
      },
    },
  };

  return (
    <section
      className="pb-20 bg-muted/50 dark:bg-muted/10"
      id="features"
      aria-labelledby="features-heading">
      <div className="container px-4 md:px-6 m-auto">
        {/* Animated heading section - repeating animation */}
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, margin: "-100px", amount: 0.3 }}>
          <div className="space-y-2">
            <motion.div
              className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground mb-2"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: false, amount: 0.5 }}>
              Asosiy imkoniyatlar
            </motion.div>
            <h2
              id="features-heading"
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Hokimiyat AI — Aqlli hujjatlar platformasi
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Xavfsizlik, moslashuvchanlik va to'liq nazoratni talab qiluvchi
              tashkilotlar uchun mo'ljallangan sun'iy intellekt tizimi.
            </p>
          </div>
        </motion.div>

        {/* Animated grid with repeating stagger effect */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          exit="exit"
          viewport={{ once: false, margin: "-80px", amount: 0.2 }}>
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                accentColor={feature.accentColor}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
