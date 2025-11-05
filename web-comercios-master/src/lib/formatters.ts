import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { DATE_FORMATS, PHONE } from './constants'

/**
 * Format Venezuelan phone number
 * Input: +584121234567
 * Output: +58 412-123-4567
 */
export function formatPhone(phone: string): string {
  if (!phone) return ''

  // Remove all non-numeric characters except leading +
  const cleaned = phone.replace(/(?!^\+)\D/g, '')

  // If it doesn't start with +58, return as is
  if (!cleaned.startsWith('+58')) return phone

  // Extract parts: +58 XXX XXXXXXX
  const countryCode = cleaned.slice(0, 3) // +58
  const areaCode = cleaned.slice(3, 6) // 412
  const firstPart = cleaned.slice(6, 9) // 123
  const secondPart = cleaned.slice(9, 13) // 4567

  if (secondPart) {
    return `${countryCode} ${areaCode}-${firstPart}-${secondPart}`
  } else if (firstPart) {
    return `${countryCode} ${areaCode}-${firstPart}`
  } else if (areaCode) {
    return `${countryCode} ${areaCode}`
  }

  return countryCode
}

/**
 * Format Venezuelan currency (Bolívares)
 * Input: 1234.56
 * Output: Bs. 1.234,56
 */
export function formatCurrency(amount: number): string {
  if (amount === null || amount === undefined) return 'Bs. 0,00'

  // Convert to Venezuelan format: thousands with dots, decimals with comma
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return `Bs. ${formatted}`
}

/**
 * Format points with thousands separator
 * Input: 1234
 * Output: 1.234 puntos
 */
export function formatPoints(points: number): string {
  if (points === null || points === undefined) return '0 puntos'

  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(points)

  const label = points === 1 ? 'punto' : 'puntos'

  return `${formatted} ${label}`
}

/**
 * Format relative time in Spanish
 * Input: "2024-01-15T10:30:00"
 * Output: "hace 2 horas"
 */
export function formatRelativeTime(date: string | Date): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date

    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: es,
    })
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return ''
  }
}

/**
 * Format date with Venezuelan locale
 * Input: "2024-01-15T10:30:00", "dd/MM/yyyy"
 * Output: "15/01/2024"
 */
export function formatDate(
  date: string | Date,
  formatStr: string = DATE_FORMATS.DISPLAY
): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date

    return format(dateObj, formatStr, { locale: es })
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

/**
 * Truncate text with ellipsis
 * Input: "Very long text here", 10
 * Output: "Very long..."
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text

  return `${text.slice(0, maxLength)}...`
}

/**
 * Generate initials from name
 * Input: "Juan Pérez"
 * Output: "JP"
 */
export function getInitials(name: string): string {
  if (!name) return ''

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Format number with Venezuelan locale
 * Input: 1234567.89
 * Output: "1.234.567,89"
 */
export function formatNumber(num: number, decimals: number = 0): string {
  if (num === null || num === undefined) return '0'

  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format percentage
 * Input: 0.1234
 * Output: "12,34%"
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (value === null || value === undefined) return '0%'

  const percentage = value * 100

  return `${formatNumber(percentage, decimals)}%`
}

/**
 * Parse Venezuelan phone to E.164 format
 * Input: "0412-123-4567" or "412 123 4567"
 * Output: "+584121234567"
 */
export function parsePhone(phone: string): string {
  if (!phone) return ''

  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '')

  // If starts with 0, remove it (Venezuelan local format)
  const withoutLeadingZero = digits.startsWith('0') ? digits.slice(1) : digits

  // If it already has country code, return it
  if (withoutLeadingZero.length === PHONE.TOTAL_LENGTH) {
    return `${PHONE.COUNTRY_CODE}${withoutLeadingZero}`
  }

  // If it includes country code (58), format it
  if (withoutLeadingZero.startsWith('58') && withoutLeadingZero.length === PHONE.TOTAL_LENGTH + 2) {
    return `+${withoutLeadingZero}`
  }

  return phone // Return original if can't parse
}

/**
 * Format file size
 * Input: 1536
 * Output: "1.5 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Capitalize first letter of each word
 * Input: "juan pérez"
 * Output: "Juan Pérez"
 */
export function capitalize(text: string): string {
  if (!text) return ''

  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format date for transaction timeline
 * Input: "2024-01-15T10:30:00"
 * Output: "Hoy 10:30am" | "Ayer 6:20pm" | "Lunes 3:15pm" | "13 Feb"
 */
export function formatTransactionDate(date: string | Date): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24))

    // Today
    if (diffInDays === 0) {
      return `Hoy ${format(dateObj, 'h:mma', { locale: es })}`
    }

    // Yesterday
    if (diffInDays === 1) {
      return `Ayer ${format(dateObj, 'h:mma', { locale: es })}`
    }

    // This week (last 7 days)
    if (diffInDays < 7) {
      return format(dateObj, "EEEE h:mma", { locale: es })
    }

    // Older dates
    return format(dateObj, 'd MMM', { locale: es })
  } catch (error) {
    console.error('Error formatting transaction date:', error)
    return ''
  }
}
