import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Masks an email address for privacy
 * Example: john.smith@email.com -> jo***@email.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email

  const [localPart, domain] = email.split('@')
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`
  }

  return `${localPart.substring(0, 2)}***@${domain}`
}

/**
 * Masks a phone number for privacy
 * Example: 555-123-4567 -> ***-***-4567
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return phone

  // Handle formats like "555-123-4567" or "5551234567"
  const digitsOnly = phone.replace(/\D/g, '')

  if (digitsOnly.length === 10) {
    // Show only last 4 digits
    const lastFour = digitsOnly.slice(-4)
    return `***-***-${lastFour}`
  }

  // If format is unexpected, just mask all but last 4 characters
  if (phone.length > 4) {
    return '*'.repeat(phone.length - 4) + phone.slice(-4)
  }

  return phone
}
