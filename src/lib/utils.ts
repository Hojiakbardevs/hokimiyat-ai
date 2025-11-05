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
