"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BuildingIcon,
  GovernmentIcon,
  FinanceIcon,
  HealthcareIcon,
  LegalIcon,
  EducationIcon,
} from "./use-case-icons";
import FrostedGlassIcon from "./frosted-glass-icon";

export default function UseCases() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener("change", update);
    } else {
      // @ts-ignore
      mq.addListener(update);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", update);
      } else {
        // @ts-ignore
        mq.removeListener(update);
      }
    };
  }, []);

  const useCases = [
    {
      icon: <GovernmentIcon />,
      title: "Davlat boshqaruvi va Institut idoralari",
      description:
        "Institut AI kuniga yuzlab murojaatlarni tahlil qiladi, javob loyihalarini tayyorlaydi va hujjat aylanishini tartibga soladi. Har bir hujjat tizimda saqlanadi va audit orqali tekshiriladi.",
      accentColor: "rgba(139, 92, 246, 0.5)",
    },
    {
      icon: <BuildingIcon />,
      title: "Tashkilot bilim markazlari",
      description:
        "Minglab hujjatlar, yig'ilish bayonnomalari va arxiv materiallari bir joyda. AI ularni to'plab, 'jonli bilim bazasi' yaratadi va kerakli ma'lumotni topib, hujjat shaklida beradi.",
      accentColor: "rgba(59, 130, 246, 0.5)",
    },
    {
      icon: <LegalIcon />,
      title: "Yuridik xizmatlar va huquqiy bo'limlar",
      description:
        "AI shartnoma yoki qaror loyihasini o'qib, xatoliklarni aniqlaydi, izoh beradi va kerak bo'lsa yangisini yaratadi. Hujjatlar tezroq tayyorlanadi, inson xatosi kamayadi.",
      accentColor: "rgba(132, 204, 22, 0.5)",
    },
    {
      icon: <FinanceIcon />,
      title: "Moliya va iqtisodiyot sohalari",
      description:
        "Byudjet, shartnoma va to'lov hujjatlarini avtomatlashtiring. AI risklarni oldindan aniqlaydi, muvofiqlikni tekshiradi va hisobotlarni bir tugma bilan yaratadi.",
      accentColor: "rgba(245, 158, 11, 0.5)",
    },
    {
      icon: <HealthcareIcon />,
      title: "Sog'liqni saqlash muassasalari",
      description:
        "Shifokorlar endi hujjat yozish bilan vaqt yo'qotmaydi. AI bemor uchun kerakli ma'lumotnomani tayyorlab beradi. Tibbiy ma'lumotlar HIPAA va mahalliy qonunlarga mos saqlanadi.",
      accentColor: "rgba(239, 68, 68, 0.5)",
    },
    {
      icon: <EducationIcon />,
      title: "Ta'lim muassasalari",
      description:
        "Buyruqlar, ma'lumotnomalar, o'quv hisobotlari — barchasi bir platformada. Direktorlar yoki kotibalar AI yordamida hujjatlarni bir necha soniyada yaratishadi.",
      accentColor: "rgba(14, 165, 233, 0.5)",
    },
  ];

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Animation variants for individual items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <section className="py-20 bg-linear-to-b from-background to-muted/30 dark:from-background dark:to-muted/10 m-auto">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}>
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground mb-2">
              Qo'llanish sohalari
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Institut AI — Qayerda ishlaydi?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Sun'iy intellekt davlat boshqaruvini yangi bosqichga olib
              chiqmoqda. Bu oddiy hujjat tizimi emas — rasmiy yozishmalarni
              o'qiydigan, mazmunini anglaydigan va javob tayyorlaydigan raqamli
              yordamchi.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={isDesktop ? containerVariants : undefined}
          initial={isDesktop ? "hidden" : false}
          whileInView={isDesktop ? "visible" : undefined}
          viewport={isDesktop ? { once: true, margin: "-100px" } : undefined}>
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              variants={isDesktop ? itemVariants : undefined}>
              <Card className="h-full bg-background/60 backdrop-blur-sm border transition-all duration-300 hover:shadow-lg dark:bg-background/80">
                <CardHeader className="pb-2">
                  <FrostedGlassIcon
                    icon={useCase.icon}
                    color={useCase.accentColor}
                    className="mb-4"
                  />
                  <CardTitle className="text-lg sm:text-xl">
                    {useCase.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base leading-relaxed">
                    {useCase.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
