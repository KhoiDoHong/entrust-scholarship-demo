import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parse Japanese / ISO date strings → ISO YYYY-MM-DD */
export function toISODateString(value: string | undefined | null): string {
  if (!value?.trim()) return ""
  const v = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v

  const full = v.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日/)
  if (full) {
    const [, y, m, d] = full
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }

  const yearMonth = v.match(/^(\d{4})年(\d{1,2})月$/)
  if (yearMonth) {
    const [, y, m] = yearMonth
    return `${y}-${m.padStart(2, "0")}-01`
  }

  return v
}

/** Display date as ISO YYYY-MM-DD (empty → em dash) */
export function formatDateDisplay(value: string | undefined | null): string {
  if (!value?.trim()) return "—"
  const iso = toISODateString(value)
  return iso || value
}

/** Today's date in ISO (Asia/Tokyo) */
export function getTodayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

/** Format datetime for display: YYYY-MM-DD HH:mm */
export function formatDateTimeDisplay(value: string | undefined | null): string {
  if (!value?.trim()) return "—"
  const v = value.trim()

  const jp = v.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})$/)
  if (jp) {
    const [, y, m, d, h, min] = jp
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")} ${h.padStart(2, "0")}:${min}`
  }

  const isoDt = v.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/)
  if (isoDt) return `${isoDt[1]} ${isoDt[2]}`

  const dateOnly = toISODateString(v)
  if (dateOnly !== v) return dateOnly
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  return v
}

/** Current datetime for display: YYYY-MM-DD HH:mm (Asia/Tokyo) */
export function getNowDateTimeDisplay(): string {
  const now = new Date()
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now)
  return `${date} ${time}`
}
