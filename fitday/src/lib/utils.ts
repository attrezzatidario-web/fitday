import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function clampPct(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.max(0, value / max)
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export function greetingForHour(hour: number): string {
  if (hour < 6) return 'Buonanotte'
  if (hour < 12) return 'Buongiorno'
  if (hour < 18) return 'Buon pomeriggio'
  return 'Buonasera'
}
