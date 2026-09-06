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

