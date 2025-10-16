/**
 * Date Ranges Generator
 * Generates available date range options for the 4-day/3-night package
 * based on user preferences (month, flexibility, weekend preference, etc.)
 */

export interface DateRangeOption {
  id: string
  checkInDate: Date
  checkInDay: string // e.g., "Thu"
  checkInFormatted: string // e.g., "Nov 14"
  checkOutDate: Date
  checkOutDay: string // e.g., "Sun"
  checkOutFormatted: string // e.g., "Nov 17"
  isPeak: boolean
  nights: number
}

export interface DateRangeFilters {
  month?: string // e.g., "november", "nov", "11"
  preferWeekends?: boolean
  preferWeekdays?: boolean
  timeOfMonth?: 'early' | 'mid' | 'late' // first 10 days, middle 10, last 10
  exactDates?: { checkIn: Date; checkOut: Date } // User has exact dates in mind
}

/**
 * Determines if a date falls on a weekend or holiday (peak pricing)
 */
function isPeakDate(date: Date): boolean {
  const day = date.getDay()
  const isWeekend = day === 0 || day === 6

  // Check for major holidays
  const month = date.getMonth()
  const dayOfMonth = date.getDate()

  const isHoliday =
    (month === 10 && dayOfMonth >= 22 && dayOfMonth <= 28 && day === 4) || // Thanksgiving week
    (month === 11 && dayOfMonth >= 24 && dayOfMonth <= 26) || // Christmas
    (month === 11 && dayOfMonth === 31) || // New Year's Eve
    (month === 0 && dayOfMonth === 1) || // New Year's Day
    (month === 6 && dayOfMonth === 4) // July 4th

  return isWeekend || isHoliday
}

/**
 * Checks if a date range spans a weekend (contains Sat or Sun)
 */
function includesWeekend(checkIn: Date, checkOut: Date): boolean {
  const current = new Date(checkIn)
  while (current <= checkOut) {
    const day = current.getDay()
    if (day === 0 || day === 6) return true
    current.setDate(current.getDate() + 1)
  }
  return false
}

/**
 * Gets day abbreviation (Mon, Tue, etc.)
 */
function getDayAbbr(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

/**
 * Formats date as "Mon DD" (e.g., "Nov 14")
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Parses month string to month number (0-11)
 */
function parseMonth(monthStr: string): number | null {
  const monthLower = monthStr.toLowerCase()

  // Handle numeric months
  const numericMonth = parseInt(monthStr)
  if (!isNaN(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
    return numericMonth - 1
  }

  // Handle month names
  const monthMap: Record<string, number> = {
    'january': 0, 'jan': 0,
    'february': 1, 'feb': 1,
    'march': 2, 'mar': 2,
    'april': 3, 'apr': 3,
    'may': 4,
    'june': 5, 'jun': 5,
    'july': 6, 'jul': 6,
    'august': 7, 'aug': 7,
    'september': 8, 'sep': 8, 'sept': 8,
    'october': 9, 'oct': 9,
    'november': 10, 'nov': 10,
    'december': 11, 'dec': 11
  }

  return monthMap[monthLower] ?? null
}

/**
 * Generates date range options based on filters
 * Returns 4-6 options by default, more if requested
 */
export function generateDateRangeOptions(
  filters: DateRangeFilters = {},
  limit: number = 5
): DateRangeOption[] {
  const options: DateRangeOption[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // If user has exact dates, find ranges near those dates
  if (filters.exactDates) {
    return generateNearExactDates(filters.exactDates.checkIn, filters.exactDates.checkOut, limit)
  }

  // Determine start and end date for search window
  let searchStart = new Date(today)
  searchStart.setDate(searchStart.getDate() + 7) // Start 1 week from today

  let searchEnd = new Date(today)
  searchEnd.setMonth(searchEnd.getMonth() + 8) // Search up to 8 months out

  // If month is specified, narrow the search window
  if (filters.month) {
    const monthNum = parseMonth(filters.month)
    if (monthNum !== null) {
      const currentYear = today.getFullYear()
      const nextYear = currentYear + 1

      // If month is in the past (relative to today), use next year
      const targetYear = monthNum < today.getMonth() ? nextYear : currentYear

      searchStart = new Date(targetYear, monthNum, 1)
      searchEnd = new Date(targetYear, monthNum + 1, 0) // Last day of month

      // Adjust based on time of month preference
      if (filters.timeOfMonth === 'early') {
        searchEnd = new Date(targetYear, monthNum, 10)
      } else if (filters.timeOfMonth === 'mid') {
        searchStart = new Date(targetYear, monthNum, 11)
        searchEnd = new Date(targetYear, monthNum, 20)
      } else if (filters.timeOfMonth === 'late') {
        searchStart = new Date(targetYear, monthNum, 21)
      }
    }
  }

  // Generate potential check-in dates
  const current = new Date(searchStart)
  const seenRanges = new Set<string>() // Prevent duplicates

  while (current <= searchEnd && options.length < limit * 2) {
    const checkIn = new Date(current)
    const checkOut = new Date(current)
    checkOut.setDate(checkOut.getDate() + 4) // 4 days, 3 nights

    // Apply filters
    const hasWeekend = includesWeekend(checkIn, checkOut)

    // Skip if doesn't match weekend preference
    if (filters.preferWeekends && !hasWeekend) {
      current.setDate(current.getDate() + 1)
      continue
    }

    if (filters.preferWeekdays && hasWeekend) {
      current.setDate(current.getDate() + 1)
      continue
    }

    // Create option
    const rangeKey = `${checkIn.toISOString()}-${checkOut.toISOString()}`
    if (!seenRanges.has(rangeKey)) {
      seenRanges.add(rangeKey)

      options.push({
        id: `range-${checkIn.getTime()}`,
        checkInDate: checkIn,
        checkInDay: getDayAbbr(checkIn),
        checkInFormatted: formatDate(checkIn),
        checkOutDate: checkOut,
        checkOutDay: getDayAbbr(checkOut),
        checkOutFormatted: formatDate(checkOut),
        isPeak: isPeakDate(checkIn) || isPeakDate(checkOut),
        nights: 3
      })
    }

    // Move to next potential check-in date
    // If looking for weekends, jump to next Friday
    if (filters.preferWeekends) {
      const dayOfWeek = current.getDay()
      const daysUntilFriday = (5 - dayOfWeek + 7) % 7
      current.setDate(current.getDate() + (daysUntilFriday || 7))
    } else {
      current.setDate(current.getDate() + 3) // Jump 3 days for variety
    }
  }

  // Sort by check-in date
  options.sort((a, b) => a.checkInDate.getTime() - b.checkInDate.getTime())

  // Return limited set
  return options.slice(0, limit)
}

/**
 * Generates date ranges near user's exact dates
 */
function generateNearExactDates(
  targetCheckIn: Date,
  targetCheckOut: Date,
  limit: number
): DateRangeOption[] {
  const options: DateRangeOption[] = []

  // Add the exact dates if valid
  const exactNights = Math.ceil((targetCheckOut.getTime() - targetCheckIn.getTime()) / (1000 * 60 * 60 * 24))

  if (exactNights === 4) {
    // Exact match for 4-day package
    options.push({
      id: `range-${targetCheckIn.getTime()}`,
      checkInDate: new Date(targetCheckIn),
      checkInDay: getDayAbbr(targetCheckIn),
      checkInFormatted: formatDate(targetCheckIn),
      checkOutDate: new Date(targetCheckOut),
      checkOutDay: getDayAbbr(targetCheckOut),
      checkOutFormatted: formatDate(targetCheckOut),
      isPeak: isPeakDate(targetCheckIn) || isPeakDate(targetCheckOut),
      nights: 3
    })
  }

  // Generate nearby alternatives (±3 days, ±7 days)
  const offsets = [-7, -3, 0, 3, 7, 10, 14]

  for (const offset of offsets) {
    if (options.length >= limit) break

    const checkIn = new Date(targetCheckIn)
    checkIn.setDate(checkIn.getDate() + offset)

    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 4)

    // Skip if already added (for exact dates)
    const rangeKey = `${checkIn.toISOString()}-${checkOut.toISOString()}`
    if (options.some(opt => opt.id === `range-${checkIn.getTime()}`)) {
      continue
    }

    options.push({
      id: `range-${checkIn.getTime()}`,
      checkInDate: checkIn,
      checkInDay: getDayAbbr(checkIn),
      checkInFormatted: formatDate(checkIn),
      checkOutDate: checkOut,
      checkOutDay: getDayAbbr(checkOut),
      checkOutFormatted: formatDate(checkOut),
      isPeak: isPeakDate(checkIn) || isPeakDate(checkOut),
      nights: 3
    })
  }

  // Sort by proximity to target date
  options.sort((a, b) => {
    const distA = Math.abs(a.checkInDate.getTime() - targetCheckIn.getTime())
    const distB = Math.abs(b.checkInDate.getTime() - targetCheckIn.getTime())
    return distA - distB
  })

  return options.slice(0, limit)
}

/**
 * Gets month options for narrowing phase
 */
export function getAvailableMonths(): Array<{ id: string; name: string; year: number }> {
  const today = new Date()
  const months: Array<{ id: string; name: string; year: number }> = []

  // Show next 6 months
  for (let i = 0; i < 6; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
    const monthName = date.toLocaleDateString('en-US', { month: 'long' })
    const monthAbbr = date.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()

    months.push({
      id: monthAbbr,
      name: monthName,
      year: date.getFullYear()
    })
  }

  return months
}
