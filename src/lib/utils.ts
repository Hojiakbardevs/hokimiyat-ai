import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind klasslarini xavfsiz birlashtiruvchi funksiya
 * Misol: cn("btn", isActive && "btn-active") => "btn btn-active"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * cls funksiyasi - cn funksiyasining aliasi
 */
export const cls = cn

/**
 * Sana yoki vaqtni “necha daqiqa/soat oldin” formatida ko‘rsatadi
 * Masalan: timeAgo("2025-11-05T08:00:00Z") => "2 soat oldin"
 */
export function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const sec = Math.max(1, Math.floor((now.getTime() - d.getTime()) / 1000))

  const rtf = new Intl.RelativeTimeFormat("uz", { numeric: "auto" }) // lokal til: o'zbek
  const ranges = [
    [60, "seconds"],
    [3600, "minutes"],
    [86400, "hours"],
    [604800, "days"],
    [2629800, "weeks"],
    [31557600, "months"],
  ]

  let unit: Intl.RelativeTimeFormatUnit = "years"
  let value = -Math.floor(sec / 31557600)

  for (const [limit, u] of ranges as [number, Intl.RelativeTimeFormatUnit][]) {
    if (sec < limit) {
      unit = u
      const div =
        unit === "seconds"
          ? 1
          : limit /
          (unit === "minutes"
            ? 60
            : unit === "hours"
              ? 3600
              : unit === "days"
                ? 86400
                : unit === "weeks"
                  ? 604800
                  : 2629800)
      value = -Math.floor(sec / div)
      break
    }
  }

  return rtf.format(value, unit)
}

/**
 * Unikal ID yaratish uchun funksiya
 * Misol: makeId("m") => "m8sjk23fg"
 */
export const makeId = (p: string) => `${p}${Math.random().toString(36).slice(2, 10)}`

/**
 * Fayl o'lchamini inson o'qiy oladigan formatga aylantiradi
 * Masalan: formatBytes(1536000) => "1.46 MB"
 */
export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Fayldan matn ajratib olish funksiyasi
 * Faqat .txt va .json formatlarni qo'llab-quvvatlaydi
 * PDF va DOCX uchun backend kerak
 */
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || "");
    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi"));

    if (
      file.type === "text/plain" ||
      file.type === "application/json" ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".json")
    ) {
      reader.readAsText(file);
    } else {
      resolve(
        "Faqat .txt va .json formatlar qo'llab-quvvatlanadi. PDF va DOCX uchun backend kerak."
      );
    }
  });
}
