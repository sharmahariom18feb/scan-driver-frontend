import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMonthlyDutyHours(duration?: string | null): string | null {
  if (!duration) return null
  const match = duration.match(/(?:x\s*|×\s*)?(\d+(?:\.\d+)?\s*(?:hrs?|hours)(?:\/day)?)/i)
  if (match) {
    let hrs = match[1].trim()
    if (!hrs.toLowerCase().includes('/day') && !hrs.toLowerCase().includes('per day')) {
      hrs = `${hrs}/day`
    }
    return hrs
  }
  return null
}

export function getMonthlyDays(duration?: string | null): string | null {
  if (!duration) return null
  const match = duration.match(/(\d+)\s*Days?/i)
  if (match) {
    return `${match[1]} Days`
  }
  return null
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function formatBookingDateTime(dateTimeStr?: string | null): string {
  if (!dateTimeStr) return ''
  const trimmed = dateTimeStr.trim()
  if (!trimmed) return ''
  if (trimmed.toLowerCase() === 'immediate') return 'Immediate'

  // Preserve prefix like "Interview: "
  const prefixMatch = trimmed.match(/^([a-zA-Z\s]+:\s*)/i)
  const prefix = prefixMatch ? prefixMatch[1] : ''
  const coreStr = prefix ? trimmed.slice(prefix.length).trim() : trimmed

  // 1. Matches YYYY-MM-DD HH:MM (e.g., 2026-10-17 12:30 or 2026-10-20 18:00)
  const ymdTimeMatch = coreStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2}))?/)
  if (ymdTimeMatch) {
    const [_, year, month, day, hours, minutes] = ymdTimeMatch
    const monthNum = parseInt(month, 10)
    const dayNum = parseInt(day, 10)
    const monthName = MONTH_NAMES[monthNum - 1] || month

    if (hours !== undefined && minutes !== undefined) {
      let hr = parseInt(hours, 10)
      const ampm = hr >= 12 ? 'pm' : 'am'
      hr = hr % 12
      hr = hr ? hr : 12
      return `${prefix}${dayNum} ${monthName} , ${hr}:${minutes} ${ampm}`
    }
    return `${prefix}${dayNum} ${monthName}`
  }

  // 2. Matches DD-MM-YYYY or DD/MM/YYYY
  const dmyTimeMatch = coreStr.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})(?:[T\s]+(\d{1,2}):(\d{2}))?/)
  if (dmyTimeMatch) {
    const [_, day, month, year, hours, minutes] = dmyTimeMatch
    const monthNum = parseInt(month, 10)
    const dayNum = parseInt(day, 10)
    const monthName = MONTH_NAMES[monthNum - 1] || month

    if (hours !== undefined && minutes !== undefined) {
      let hr = parseInt(hours, 10)
      const ampm = hr >= 12 ? 'pm' : 'am'
      hr = hr % 12
      hr = hr ? hr : 12
      return `${prefix}${dayNum} ${monthName} , ${hr}:${minutes} ${ampm}`
    }
    return `${prefix}${dayNum} ${monthName}`
  }

  // 3. Fallback to Date parser
  try {
    const parsed = new Date(coreStr.includes('T') ? coreStr : coreStr.replace(' ', 'T'))
    if (!isNaN(parsed.getTime())) {
      const dayNum = parsed.getDate()
      const monthName = MONTH_NAMES[parsed.getMonth()]
      let hr = parsed.getHours()
      const ampm = hr >= 12 ? 'pm' : 'am'
      hr = hr % 12
      hr = hr ? hr : 12
      const min = String(parsed.getMinutes()).padStart(2, '0')
      return `${prefix}${dayNum} ${monthName} , ${hr}:${min} ${ampm}`
    }
  } catch {}

  return trimmed
}


