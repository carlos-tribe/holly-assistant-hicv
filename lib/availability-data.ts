export interface FlexibleDateOption {
  id: string
  checkIn: Date
  checkOut: Date
  nights: number
  label: string // User-friendly label like "First Weekend of November"
  propertyId: number
  propertyName: string
  priceIndicator: 'standard' | 'peak' | 'value'
}

export interface DestinationAvailability {
  sep: 'good' | 'limited' | 'low' | 'none'
  oct: 'good' | 'limited' | 'low' | 'none'
  nov: 'good' | 'limited' | 'low' | 'none'
  dec: 'good' | 'limited' | 'low' | 'none'
}

// Aggregate availability for each destination (union of all properties)
export const destinationAvailability: Record<string, DestinationAvailability> = {
  'orlando': { sep: 'good', oct: 'good', nov: 'good', dec: 'limited' },
  'cocoa-beach': { sep: 'good', oct: 'good', nov: 'good', dec: 'limited' },
  'las-vegas': { sep: 'good', oct: 'good', nov: 'limited', dec: 'low' },
  'myrtle-beach': { sep: 'good', oct: 'good', nov: 'limited', dec: 'low' },
  'new-orleans': { sep: 'good', oct: 'good', nov: 'good', dec: 'limited' },
  'galveston': { sep: 'good', oct: 'good', nov: 'good', dec: 'limited' },
  'gatlinburg': { sep: 'good', oct: 'limited', nov: 'good', dec: 'good' },
  'lake-tahoe': { sep: 'good', oct: 'limited', nov: 'good', dec: 'good' },
  'branson': { sep: 'good', oct: 'good', nov: 'limited', dec: 'limited' },
  'scottsdale': { sep: 'limited', oct: 'good', nov: 'good', dec: 'good' },
  'williamsburg': { sep: 'good', oct: 'good', nov: 'limited', dec: 'low' }
}

// Curated flexible date ranges per destination (6-8 options each)
export const flexibleDateRanges: Record<string, FlexibleDateOption[]> = {
  'orlando': [
    {
      id: 'orl-1',
      checkIn: new Date(2025, 10, 7), // Nov 7, 2025 (Friday)
      checkOut: new Date(2025, 10, 10), // Nov 10, 2025 (Monday)
      nights: 3,
      label: "First Weekend of November",
      propertyId: 1,
      propertyName: "Holiday Inn International Drive",
      priceIndicator: 'standard'
    },
    {
      id: 'orl-2',
      checkIn: new Date(2025, 10, 14), // Nov 14, 2025 (Friday)
      checkOut: new Date(2025, 10, 17), // Nov 17, 2025 (Monday)
      nights: 3,
      label: "Mid-November Weekend",
      propertyId: 2,
      propertyName: "Holiday Inn & Suites Celebration Area",
      priceIndicator: 'standard'
    },
    {
      id: 'orl-3',
      checkIn: new Date(2025, 11, 19), // Dec 19, 2025 (Friday)
      checkOut: new Date(2025, 11, 22), // Dec 22, 2025 (Monday)
      nights: 3,
      label: "Holiday Season Weekend",
      propertyId: 3,
      propertyName: "Crowne Plaza Lake Buena Vista",
      priceIndicator: 'peak'
    },
    {
      id: 'orl-4',
      checkIn: new Date(2025, 9, 20), // Oct 20, 2025 (Monday)
      checkOut: new Date(2025, 9, 23), // Oct 23, 2025 (Thursday)
      nights: 3,
      label: "Midweek October Escape",
      propertyId: 1,
      propertyName: "Holiday Inn International Drive",
      priceIndicator: 'value'
    },
    {
      id: 'orl-5',
      checkIn: new Date(2025, 8, 12), // Sep 12, 2025 (Friday)
      checkOut: new Date(2025, 8, 15), // Sep 15, 2025 (Monday)
      nights: 3,
      label: "Early September Weekend",
      propertyId: 2,
      propertyName: "Holiday Inn & Suites Celebration Area",
      priceIndicator: 'value'
    },
    {
      id: 'orl-6',
      checkIn: new Date(2025, 10, 26), // Nov 26, 2025 (Wednesday)
      checkOut: new Date(2025, 10, 29), // Nov 29, 2025 (Saturday)
      nights: 3,
      label: "Thanksgiving Week",
      propertyId: 3,
      propertyName: "Crowne Plaza Lake Buena Vista",
      priceIndicator: 'peak'
    }
  ],
  'cocoa-beach': [
    {
      id: 'cb-1',
      checkIn: new Date(2025, 10, 7), // Nov 7, 2025 (Friday)
      checkOut: new Date(2025, 10, 10), // Nov 10, 2025 (Monday)
      nights: 3,
      label: "First Weekend of November",
      propertyId: 1,
      propertyName: "Holiday Inn Express® & Suites Cocoa Beach",
      priceIndicator: 'standard'
    },
    {
      id: 'cb-2',
      checkIn: new Date(2025, 11, 22), // Dec 22, 2025 (Monday)
      checkOut: new Date(2025, 11, 25), // Dec 25, 2025 (Thursday)
      nights: 3,
      label: "Christmas Week",
      propertyId: 2,
      propertyName: "Crowne Plaza® Melbourne – Oceanfront",
      priceIndicator: 'peak'
    },
    {
      id: 'cb-3',
      checkIn: new Date(2025, 9, 10), // Oct 10, 2025 (Friday)
      checkOut: new Date(2025, 9, 13), // Oct 13, 2025 (Monday)
      nights: 3,
      label: "October Beach Weekend",
      propertyId: 1,
      propertyName: "Holiday Inn Express® & Suites Cocoa Beach",
      priceIndicator: 'standard'
    },
    {
      id: 'cb-4',
      checkIn: new Date(2025, 8, 15), // Sep 15, 2025 (Monday)
      checkOut: new Date(2025, 8, 18), // Sep 18, 2025 (Thursday)
      nights: 3,
      label: "Midweek September Special",
      propertyId: 3,
      propertyName: "Holiday Inn Express® & Suites Cocoa",
      priceIndicator: 'value'
    },
    {
      id: 'cb-5',
      checkIn: new Date(2025, 10, 21), // Nov 21, 2025 (Friday)
      checkOut: new Date(2025, 10, 24), // Nov 24, 2025 (Monday)
      nights: 3,
      label: "Pre-Thanksgiving Getaway",
      propertyId: 2,
      propertyName: "Crowne Plaza® Melbourne – Oceanfront",
      priceIndicator: 'standard'
    },
    {
      id: 'cb-6',
      checkIn: new Date(2025, 11, 5), // Dec 5, 2025 (Friday)
      checkOut: new Date(2025, 11, 8), // Dec 8, 2025 (Monday)
      nights: 3,
      label: "Early December Beach Escape",
      propertyId: 1,
      propertyName: "Holiday Inn Express® & Suites Cocoa Beach",
      priceIndicator: 'standard'
    }
  ],
  'las-vegas': [
    {
      id: 'lv-1',
      checkIn: new Date(2025, 9, 17), // Oct 17, 2025 (Friday)
      checkOut: new Date(2025, 9, 20), // Oct 20, 2025 (Monday)
      nights: 3,
      label: "October Vegas Weekend",
      propertyId: 1,
      propertyName: "Desert Springs Resort",
      priceIndicator: 'standard'
    },
    {
      id: 'lv-2',
      checkIn: new Date(2025, 10, 7), // Nov 7, 2025 (Friday)
      checkOut: new Date(2025, 10, 10), // Nov 10, 2025 (Monday)
      nights: 3,
      label: "Vegas Entertainment Weekend",
      propertyId: 1,
      propertyName: "Desert Springs Resort",
      priceIndicator: 'standard'
    },
    {
      id: 'lv-3',
      checkIn: new Date(2025, 8, 22), // Sep 22, 2025 (Monday)
      checkOut: new Date(2025, 8, 25), // Sep 25, 2025 (Thursday)
      nights: 3,
      label: "Midweek September Deal",
      propertyId: 1,
      propertyName: "Desert Springs Resort",
      priceIndicator: 'value'
    },
    {
      id: 'lv-4',
      checkIn: new Date(2025, 11, 31), // Dec 31, 2025 (Wednesday)
      checkOut: new Date(2026, 0, 3), // Jan 3, 2026 (Saturday)
      nights: 3,
      label: "New Year's Eve Celebration",
      propertyId: 1,
      propertyName: "Desert Springs Resort",
      priceIndicator: 'peak'
    }
  ],
  'myrtle-beach': [
    {
      id: 'mb-1',
      checkIn: new Date(2025, 9, 3), // Oct 3, 2025 (Friday)
      checkOut: new Date(2025, 9, 6), // Oct 6, 2025 (Monday)
      nights: 3,
      label: "Fall Beach Weekend",
      propertyId: 1,
      propertyName: "Myrtle Beach Oceanfront Resort",
      priceIndicator: 'standard'
    },
    {
      id: 'mb-2',
      checkIn: new Date(2025, 8, 8), // Sep 8, 2025 (Monday)
      checkOut: new Date(2025, 8, 11), // Sep 11, 2025 (Thursday)
      nights: 3,
      label: "Late Summer Escape",
      propertyId: 1,
      propertyName: "Myrtle Beach Oceanfront Resort",
      priceIndicator: 'value'
    },
    {
      id: 'mb-3',
      checkIn: new Date(2025, 10, 14), // Nov 14, 2025 (Friday)
      checkOut: new Date(2025, 10, 17), // Nov 17, 2025 (Monday)
      nights: 3,
      label: "Peaceful November Getaway",
      propertyId: 1,
      propertyName: "Myrtle Beach Oceanfront Resort",
      priceIndicator: 'value'
    }
  ],
  // Add placeholders for other destinations (can be expanded later)
  'new-orleans': [],
  'galveston': [],
  'gatlinburg': [],
  'lake-tahoe': [],
  'branson': [],
  'scottsdale': [],
  'williamsburg': []
}

// Helper function to get availability label with color
export function getAvailabilityDisplay(status: DestinationAvailability[keyof DestinationAvailability]) {
  switch (status) {
    case 'good':
      return { label: 'Great', color: 'green' }
    case 'limited':
      return { label: 'Limited', color: 'amber' }
    case 'low':
      return { label: 'Almost full', color: 'red' }
    case 'none':
      return { label: 'Sold out', color: 'gray' }
  }
}

// Helper to get flexible date options for a destination
export function getFlexibleDatesForDestination(destinationId: string): FlexibleDateOption[] {
  return flexibleDateRanges[destinationId] || []
}

// Helper to find a flexible date option by ID
export function getFlexibleDateOptionById(id: string): FlexibleDateOption | null {
  for (const options of Object.values(flexibleDateRanges)) {
    const found = options.find(opt => opt.id === id)
    if (found) return found
  }
  return null
}
