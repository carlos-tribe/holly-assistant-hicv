import { BookingState, BookingStep } from "@/components/holly-assistant"
import { destinations, categoryMappings, attributeMappings, getDestinationById, getDestinationsByCategory, getDestinationsByAttribute, searchDestinations } from "@/lib/destinations-data"
import { getFlexibleDatesForDestination, type FlexibleDateOption } from "@/lib/availability-data"

export interface VoiceIntent {
  type: 'destination_selection' | 'date_selection' | 'date_narrowing' | 'date_refinement' | 'flexible_date_selection' | 'property_matching' | 'time_selection' | 'details_verification' | 'confirmation' | 'question' | 'correction' | 'unknown'
  confidence: number
  entities: Record<string, any>
  rawText: string
}

export interface PropertySelectionEntity {
  method: 'ordinal' | 'name' | 'feature' | 'price'
  value: string | number
  propertyId?: number
}

export interface DateSelectionEntity {
  checkIn?: Date
  checkOut?: Date
  duration?: number
  relativeDate?: string
}

export interface TimeSelectionEntity {
  time?: string
  period?: 'morning' | 'afternoon' | 'evening'
  specific?: Date
}

export interface DestinationSelectionEntity {
  method: 'direct' | 'category' | 'attribute' | 'comparison' | 'exploration'
  destinationId?: string
  destinationIds?: string[]
  category?: string
  attribute?: { type: string; value: string }
  query?: string
}

export class VoiceInteractionHandler {
  private propertyMapping = {
    ordinal: {
      'first': 1, '1st': 1, 'one': 1, 'number 1': 1, 'number one': 1,
      'second': 2, '2nd': 2, 'two': 2, 'number 2': 2, 'number two': 2,
      'third': 3, '3rd': 3, 'three': 3, 'number 3': 3, 'number three': 3
    },
    features: {
      'cocoa beach': 1, 'oceanfront': 1, 'beach access': 1, 'surf': 1, 'ron jon': 1, 'surfing': 1,
      'crowne plaza': 2, 'melbourne': 2, 'spa': 2, 'premium': 2, 'upscale': 2, 'beachfront dining': 2,
      'cocoa': 3, 'kennedy': 3, 'space center': 3, 'budget': 3, 'value': 3, 'affordable': 3
    },
    price: {
      'cheapest': 3, 'most affordable': 3, 'best value': 3, 'value': 3, 'budget': 3,
      'most expensive': 2, 'premium': 2, 'luxury': 2, 'upscale': 2,
      'middle': 1, 'mid-range': 1, 'beach access': 1
    }
  }

  parseVoiceInput(text: string, currentStep: BookingStep, bookingState: BookingState): VoiceIntent {
    const lowerText = text.toLowerCase().trim()

    if (currentStep === 'verify-details') {
      return this.parseDetailsVerification(lowerText)
    } else if (currentStep === 'select-destination') {
      return this.parseDestinationSelection(lowerText, bookingState)
    } else if (currentStep === 'choose-dates') {
      // Two-phase date selection
      if (!bookingState.dateNarrowingComplete) {
        return this.parseDateNarrowing(lowerText)
      } else {
        return this.parseDateRangeSelection(lowerText, bookingState)
      }
    } else if (currentStep === 'choose-flexible-dates') {
      const flexibleOptions = getFlexibleDatesForDestination(bookingState.selectedDestination || 'orlando')
      return this.parseFlexibleDateSelection(lowerText, flexibleOptions)
    } else if (currentStep === 'property-matching') {
      return this.parsePropertyMatching(lowerText, bookingState)
    } else if (currentStep === 'schedule-tour') {
      return this.parseTimeSelection(lowerText)
    } else if (this.isConfirmation(lowerText)) {
      return {
        type: 'confirmation',
        confidence: 0.9,
        entities: { confirmed: this.isPositiveConfirmation(lowerText) },
        rawText: text
      }
    } else if (this.isQuestion(lowerText)) {
      return {
        type: 'question',
        confidence: 0.8,
        entities: { topic: this.extractQuestionTopic(lowerText) },
        rawText: text
      }
    } else if (this.isCorrection(lowerText)) {
      return {
        type: 'correction',
        confidence: 0.85,
        entities: { correction: this.extractCorrection(lowerText) },
        rawText: text
      }
    }

    return {
      type: 'unknown',
      confidence: 0.3,
      entities: {},
      rawText: text
    }
  }

  private parseDetailsVerification(text: string): VoiceIntent {
    const entities: any = {}
    let confidence = 0

    // Parse zip code (5 digits)
    const zipMatch = text.match(/\b(\d{5})\b/)
    if (zipMatch) {
      entities.zipCode = zipMatch[1]
      confidence += 0.5
    }

    // Parse guest count
    const guestPatterns = [
      /\b(\d+)\s*(?:people|persons?|guests?|travelers?)\b/i,
      /\b(?:party of|group of|family of)\s*(\d+)\b/i,
      /\bjust\s*(\d+)\s*of us\b/i,
      /\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:people|persons?|guests?)\b/i
    ]

    const numberWords: Record<string, number> = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    }

    for (const pattern of guestPatterns) {
      const match = text.match(pattern)
      if (match) {
        const value = match[1]
        if (numberWords[value.toLowerCase()]) {
          entities.guestCount = numberWords[value.toLowerCase()]
        } else {
          entities.guestCount = parseInt(value, 10)
        }
        confidence += 0.5
        break
      }
    }

    // Check if it's a confirmation (yes/continue)
    if (text.includes('yes') || text.includes('continue') || text.includes('correct') || text.includes('that\'s right')) {
      entities.confirmation = true
      confidence = 0.9
    }

    return {
      type: 'details_verification',
      confidence: Math.min(confidence, 1),
      entities,
      rawText: text
    }
  }

  private parseDestinationSelection(text: string, bookingState: BookingState): VoiceIntent {
    const entity: DestinationSelectionEntity = { method: 'direct' }
    let confidence = 0

    // Check for direct destination name mentions
    for (const dest of destinations) {
      const destName = dest.name.toLowerCase()
      const destState = dest.state.toLowerCase()

      if (text.includes(destName) || text.includes(`${destName} ${destState}`)) {
        entity.method = 'direct'
        entity.destinationId = dest.id
        confidence = 0.95
        break
      }

      // Check for partial matches (e.g., "vegas" for "Las Vegas")
      if (destName.includes(' ') && text.includes(destName.split(' ')[0])) {
        entity.method = 'direct'
        entity.destinationId = dest.id
        confidence = 0.9
        break
      }
    }

    // Check for category queries
    if (!entity.destinationId) {
      const categoryPatterns = {
        beaches: ['beach', 'ocean', 'coast', 'surf', 'seaside'],
        mountains: ['mountain', 'hiking', 'ski', 'alpine', 'outdoors'],
        cities: ['city', 'urban', 'downtown', 'nightlife'],
        themeparks: ['theme park', 'amusement', 'rides', 'disney', 'universal'],
        historic: ['historic', 'history', 'colonial', 'heritage'],
        family: ['family', 'kids', 'children', 'family-friendly'],
        entertainment: ['shows', 'entertainment', 'theater', 'performance'],
        golf: ['golf', 'golfing', 'golf course'],
        water: ['water activities', 'kayaking', 'boating', 'lake'],
        outdoor: ['outdoor', 'nature', 'adventure'],
        relaxation: ['spa', 'relax', 'massage', 'wellness']
      }

      for (const [category, keywords] of Object.entries(categoryPatterns)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          entity.method = 'category'
          entity.category = category
          const categoryDests = getDestinationsByCategory(category)
          entity.destinationIds = categoryDests.map(d => d.id)
          confidence = 0.85
          break
        }
      }
    }

    // Check for attribute queries
    if (!entity.destinationId && !entity.category) {
      // Weather attributes
      if (text.includes('warm') || text.includes('hot') || text.includes('sunny') || text.includes('sun')) {
        entity.method = 'attribute'
        entity.attribute = { type: 'weather', value: 'warm' }
        const attrDests = getDestinationsByAttribute('weather', 'warm')
        entity.destinationIds = attrDests.map(d => d.id)
        confidence = 0.8
      } else if (text.includes('year round') || text.includes('year-round') || text.includes('always sunny')) {
        entity.method = 'attribute'
        entity.attribute = { type: 'weather', value: 'yearRound' }
        const attrDests = getDestinationsByAttribute('weather', 'yearRound')
        entity.destinationIds = attrDests.map(d => d.id)
        confidence = 0.8
      } else if (text.includes('seasonal') || text.includes('four seasons')) {
        entity.method = 'attribute'
        entity.attribute = { type: 'weather', value: 'seasonal' }
        const attrDests = getDestinationsByAttribute('weather', 'seasonal')
        entity.destinationIds = attrDests.map(d => d.id)
        confidence = 0.8
      }
      // Activity attributes
      else if (text.includes('skiing') || text.includes('ski')) {
        entity.method = 'attribute'
        entity.attribute = { type: 'activities', value: 'skiing' }
        const attrDests = getDestinationsByAttribute('activities', 'skiing')
        entity.destinationIds = attrDests.map(d => d.id)
        confidence = 0.85
      } else if (text.includes('golf')) {
        entity.method = 'attribute'
        entity.attribute = { type: 'activities', value: 'golf' }
        const attrDests = getDestinationsByAttribute('activities', 'golf')
        entity.destinationIds = attrDests.map(d => d.id)
        confidence = 0.85
      } else if (text.includes('surf')) {
        entity.method = 'attribute'
        entity.attribute = { type: 'activities', value: 'surfing' }
        const attrDests = getDestinationsByAttribute('activities', 'surfing')
        entity.destinationIds = attrDests.map(d => d.id)
        confidence = 0.85
      }
    }

    // Check for comparison requests
    if (text.includes('difference between') || text.includes('compare') || text.includes('versus') || text.includes('vs')) {
      entity.method = 'comparison'
      // Extract destination names mentioned
      const mentionedDests = destinations.filter(d =>
        text.includes(d.name.toLowerCase())
      )
      if (mentionedDests.length >= 2) {
        entity.destinationIds = mentionedDests.slice(0, 2).map(d => d.id)
        confidence = 0.9
      }
    }

    // Check for exploration requests
    if ((text.includes('other') || text.includes('more') || text.includes('different') ||
         text.includes('explore') || text.includes('what else') || text.includes('alternatives')) &&
        !entity.destinationId) {
      entity.method = 'exploration'
      entity.query = text
      confidence = 0.75
    }

    // Check for accepting default destination
    const preferredDest = bookingState.selectedDestination || 'orlando'
    if ((text.includes('sounds good') || text.includes('perfect') || text.includes('great') ||
         text.includes('yes') || text.includes('continue') || text.includes('let\'s go')) &&
        !entity.destinationId && !entity.category) {
      entity.method = 'direct'
      entity.destinationId = preferredDest
      confidence = 0.95
    }

    if (confidence > 0) {
      return {
        type: 'destination_selection',
        confidence,
        entities: { destination: entity },
        rawText: text
      }
    }

    return {
      type: 'unknown',
      confidence: 0.3,
      entities: {},
      rawText: text
    }
  }

  private parseFlexibleDateSelection(text: string, flexibleOptions: FlexibleDateOption[]): VoiceIntent {
    let selectedOption: FlexibleDateOption | null = null
    let confidence = 0

    // Ordinal selection (first, second, third, etc.)
    const ordinals: Record<string, number> = {
      'first': 0, '1st': 0, 'one': 0, 'number 1': 0, 'number one': 0, 'option 1': 0,
      'second': 1, '2nd': 1, 'two': 1, 'number 2': 1, 'number two': 1, 'option 2': 1,
      'third': 2, '3rd': 2, 'three': 2, 'number 3': 2, 'number three': 2, 'option 3': 2,
      'fourth': 3, '4th': 3, 'four': 3, 'number 4': 3, 'number four': 3, 'option 4': 3,
      'fifth': 4, '5th': 4, 'five': 4, 'number 5': 4, 'number five': 4, 'option 5': 4,
      'sixth': 5, '6th': 5, 'six': 5, 'number 6': 6, 'number six': 6, 'option 6': 6
    }

    for (const [word, index] of Object.entries(ordinals)) {
      if (text.includes(word) && flexibleOptions[index]) {
        selectedOption = flexibleOptions[index]
        confidence = 0.95
        break
      }
    }

    // Month-based selection
    if (!selectedOption) {
      const months = ['january', 'february', 'march', 'april', 'may', 'june',
                      'july', 'august', 'september', 'october', 'november', 'december']
      for (const month of months) {
        if (text.includes(month)) {
          selectedOption = flexibleOptions.find(opt =>
            opt.label.toLowerCase().includes(month)
          ) || null
          if (selectedOption) {
            confidence = 0.9
            break
          }
        }
      }
    }

    // Label keyword matching (e.g., "weekend", "Christmas", "thanksgiving")
    if (!selectedOption) {
      for (const option of flexibleOptions) {
        const labelWords = option.label.toLowerCase().split(' ')
        // Look for meaningful keywords (> 3 chars)
        const keywords = labelWords.filter(word => word.length > 3)
        if (keywords.some(kw => text.includes(kw))) {
          selectedOption = option
          confidence = 0.85
          break
        }
      }
    }

    // Price indicator selection ("cheapest", "best value", etc.)
    if (!selectedOption) {
      if (text.includes('value') || text.includes('cheapest') || text.includes('budget')) {
        selectedOption = flexibleOptions.find(opt => opt.priceIndicator === 'value') || null
        if (selectedOption) confidence = 0.8
      } else if (text.includes('peak') || text.includes('holiday')) {
        selectedOption = flexibleOptions.find(opt => opt.priceIndicator === 'peak') || null
        if (selectedOption) confidence = 0.8
      }
    }

    if (selectedOption) {
      return {
        type: 'flexible_date_selection',
        confidence,
        entities: { flexibleOption: selectedOption },
        rawText: text
      }
    }

    return {
      type: 'unknown',
      confidence: 0.3,
      entities: {},
      rawText: text
    }
  }

  private parseDateSelection(text: string, bookingState: BookingState): VoiceIntent {
    const entity: DateSelectionEntity = {}
    let confidence = 0

    // Parse relative dates
    const relativePatterns = [
      { pattern: /next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, type: 'next_weekday' },
      { pattern: /this (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, type: 'this_weekday' },
      { pattern: /next week(?:end)?/i, type: 'next_weekend' },
      { pattern: /this week(?:end)?/i, type: 'this_weekend' },
      { pattern: /tomorrow/i, type: 'tomorrow' },
      { pattern: /day after tomorrow/i, type: 'day_after_tomorrow' },
      { pattern: /in (\d+) days?/i, type: 'days_from_now' },
      { pattern: /in (\d+) weeks?/i, type: 'weeks_from_now' },
      { pattern: /next month/i, type: 'next_month' },
      { pattern: /(?:the )?(\d{1,2})(?:st|nd|rd|th)?/i, type: 'specific_day' }
    ]

    for (const { pattern, type } of relativePatterns) {
      const match = text.match(pattern)
      if (match) {
        entity.relativeDate = type
        confidence = 0.85

        // Calculate actual dates based on pattern
        const today = new Date()
        if (type === 'tomorrow') {
          entity.checkIn = new Date(today.setDate(today.getDate() + 1))
        } else if (type === 'next_weekend') {
          const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7
          entity.checkIn = new Date(today.setDate(today.getDate() + daysUntilFriday))
        }
        // Add 5 nights for package
        if (entity.checkIn) {
          entity.checkOut = new Date(entity.checkIn)
          entity.checkOut.setDate(entity.checkIn.getDate() + 5)
          entity.duration = 5
        }
        break
      }
    }

    // Parse duration
    const durationMatch = text.match(/(\d+)\s*nights?/i)
    if (durationMatch) {
      entity.duration = parseInt(durationMatch[1])
      confidence = Math.max(confidence, 0.8)
    }

    // Parse specific months
    const months = ['january', 'february', 'march', 'april', 'may', 'june',
                   'july', 'august', 'september', 'october', 'november', 'december']
    for (let i = 0; i < months.length; i++) {
      if (text.includes(months[i])) {
        const year = new Date().getFullYear()
        const month = i
        const dayMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?/)
        if (dayMatch) {
          entity.checkIn = new Date(year, month, parseInt(dayMatch[1]))
          entity.checkOut = new Date(entity.checkIn)
          entity.checkOut.setDate(entity.checkIn.getDate() + (entity.duration || 5))
          confidence = 0.9
        }
        break
      }
    }

    if (confidence > 0) {
      return {
        type: 'date_selection',
        confidence,
        entities: { dates: entity },
        rawText: text
      }
    }

    return {
      type: 'unknown',
      confidence: 0.3,
      entities: {},
      rawText: text
    }
  }

  private parseDateNarrowing(text: string): VoiceIntent {
    const entities: any = {}
    let confidence = 0

    // Parse month selection
    const months = ['january', 'february', 'march', 'april', 'may', 'june',
                   'july', 'august', 'september', 'october', 'november', 'december']
    const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

    for (let i = 0; i < months.length; i++) {
      if (text.includes(months[i]) || text.includes(monthAbbr[i])) {
        entities.preferredMonth = months[i]
        entities.datePreference = 'month'
        confidence = 0.9
        break
      }
    }

    // Parse flexibility preferences
    if (text.includes('flexible') || text.includes('open') || text.includes('not sure')) {
      entities.datePreference = 'flexible'
      confidence = 0.85
    }

    if (text.includes('weekend') && !text.includes('next weekend')) {
      entities.preferWeekends = true
      confidence = Math.max(confidence, 0.85)
    }

    if (text.includes('weekday') || text.includes('week day')) {
      entities.preferWeekdays = true
      confidence = Math.max(confidence, 0.85)
    }

    // Parse exact dates
    const dateMatch = text.match(/(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?/)
    if (dateMatch && months.includes(dateMatch[1].toLowerCase())) {
      entities.datePreference = 'exact'
      entities.exactDate = `${dateMatch[1]} ${dateMatch[2]}`
      confidence = 0.9
    }

    if (confidence > 0) {
      return {
        type: 'date_narrowing',
        confidence,
        entities,
        rawText: text
      }
    }

    return {
      type: 'unknown',
      confidence: 0.3,
      entities: {},
      rawText: text
    }
  }

  private parseDateRangeSelection(text: string, bookingState: BookingState): VoiceIntent {
    const entities: any = {}
    let confidence = 0

    // Parse ordinal selection (first, second, etc.)
    const ordinals: Record<string, number> = {
      'first': 0, '1st': 0, 'one': 0,
      'second': 1, '2nd': 1, 'two': 1,
      'third': 2, '3rd': 2, 'three': 2,
      'fourth': 3, '4th': 3, 'four': 3,
    }

    for (const [word, index] of Object.entries(ordinals)) {
      if (text.includes(word) && bookingState.dateRangeOptions[index]) {
        entities.selectedRangeIndex = index
        entities.selectedRange = bookingState.dateRangeOptions[index]
        confidence = 0.95
        break
      }
    }

    // Parse refinement requests
    if (text.includes('show more') || text.includes('more options') || text.includes('other dates')) {
      return {
        type: 'date_refinement',
        confidence: 0.9,
        entities: { action: 'show_more' },
        rawText: text
      }
    }

    if (text.includes('earlier') || text.includes('sooner') || text.includes('beginning of month')) {
      return {
        type: 'date_refinement',
        confidence: 0.9,
        entities: { action: 'earlier', timeOfMonth: 'early' },
        rawText: text
      }
    }

    if (text.includes('later') || text.includes('end of month')) {
      return {
        type: 'date_refinement',
        confidence: 0.9,
        entities: { action: 'later', timeOfMonth: 'late' },
        rawText: text
      }
    }

    if (text.includes('change month') || text.includes('different month')) {
      return {
        type: 'date_refinement',
        confidence: 0.9,
        entities: { action: 'change_month' },
        rawText: text
      }
    }

    if (confidence > 0) {
      return {
        type: 'date_selection',
        confidence,
        entities,
        rawText: text
      }
    }

    return {
      type: 'unknown',
      confidence: 0.3,
      entities: {},
      rawText: text
    }
  }

  private parsePropertyMatching(text: string, bookingState: BookingState): VoiceIntent {
    const entities: any = {}
    let confidence = 0

    // Simple confirmation parsing for property matching
    if (text.includes('yes') || text.includes('confirm') || text.includes('sounds good') ||
        text.includes('perfect') || text.includes('great') || text.includes('looks good')) {
      entities.confirmed = true
      confidence = 0.9
    } else if (text.includes('no') || text.includes('different') || text.includes('other')) {
      entities.confirmed = false
      confidence = 0.9
    } else {
      // Generic response to questions
      entities.response = text
      confidence = 0.7
    }

    return {
      type: 'property_matching',
      confidence,
      entities,
      rawText: text
    }
  }

  private parseTimeSelection(text: string): VoiceIntent {
    const entity: TimeSelectionEntity = {}
    let confidence = 0

    // Parse specific times
    const timePatterns = [
      /(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)/i,
      /(\d{1,2})(?::(\d{2}))?\s*o'?clock/i,
      /half past (\d{1,2})/i,
      /quarter (?:past|after) (\d{1,2})/i,
      /quarter (?:to|before) (\d{1,2})/i
    ]

    for (const pattern of timePatterns) {
      const match = text.match(pattern)
      if (match) {
        entity.time = match[0]
        confidence = 0.9
        break
      }
    }

    // Parse time periods
    if (text.includes('morning')) {
      entity.period = 'morning'
      confidence = Math.max(confidence, 0.85)
    } else if (text.includes('afternoon')) {
      entity.period = 'afternoon'
      confidence = Math.max(confidence, 0.85)
    } else if (text.includes('evening')) {
      entity.period = 'evening'
      confidence = Math.max(confidence, 0.85)
    }

    // Parse relative times
    if (text.includes('earliest') || text.includes('first available')) {
      entity.time = 'earliest'
      confidence = 0.85
    } else if (text.includes('latest') || text.includes('last available')) {
      entity.time = 'latest'
      confidence = 0.85
    }

    if (confidence > 0) {
      return {
        type: 'time_selection',
        confidence,
        entities: { time: entity },
        rawText: text
      }
    }

    return {
      type: 'unknown',
      confidence: 0.3,
      entities: {},
      rawText: text
    }
  }

  private isConfirmation(text: string): boolean {
    const confirmPatterns = [
      'yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'confirm', 'correct', 'that\'s right',
      'sounds good', 'perfect', 'great', 'excellent', 'book it', 'go ahead', 'proceed',
      'no', 'nope', 'not', 'cancel', 'stop', 'wait', 'hold on', 'actually'
    ]
    return confirmPatterns.some(pattern => text.includes(pattern))
  }

  private isPositiveConfirmation(text: string): boolean {
    const positivePatterns = [
      'yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'confirm', 'correct', 'that\'s right',
      'sounds good', 'perfect', 'great', 'excellent', 'book it', 'go ahead', 'proceed'
    ]
    return positivePatterns.some(pattern => text.includes(pattern))
  }

  private isQuestion(text: string): boolean {
    return text.includes('?') ||
           text.includes('what') ||
           text.includes('how') ||
           text.includes('when') ||
           text.includes('where') ||
           text.includes('why') ||
           text.includes('which') ||
           text.includes('tell me') ||
           text.includes('can you') ||
           text.includes('is there')
  }

  private extractQuestionTopic(text: string): string {
    if (text.includes('price') || text.includes('cost') || text.includes('expensive')) return 'price'
    if (text.includes('amenities') || text.includes('features')) return 'amenities'
    if (text.includes('location') || text.includes('where')) return 'location'
    if (text.includes('cancel') || text.includes('refund')) return 'cancellation'
    if (text.includes('pool') || text.includes('spa') || text.includes('gym')) return 'facilities'
    return 'general'
  }

  private isCorrection(text: string): boolean {
    const correctionPatterns = [
      'no not', 'actually', 'wait', 'sorry', 'i meant', 'i mean', 'instead',
      'change', 'different', 'other', 'not that', 'wrong'
    ]
    return correctionPatterns.some(pattern => text.includes(pattern))
  }

  private extractCorrection(text: string): any {
    // Extract what needs to be corrected
    if (text.includes('not that') || text.includes('other')) {
      return { type: 'switch_selection' }
    }
    if (text.includes('change') || text.includes('different')) {
      return { type: 'change_selection' }
    }
    return { type: 'general_correction' }
  }

  private generateDestinationResponse(entity: DestinationSelectionEntity, bookingState: BookingState): string {
    switch (entity.method) {
      case 'direct':
        if (entity.destinationId) {
          const dest = getDestinationById(entity.destinationId)
          if (dest) {
            return `Excellent choice! ${dest.name}, ${dest.state} - ${dest.tagline.toLowerCase()}. ${dest.keyFacts[0]} Ready to see our properties there?`
          }
        }
        return "I didn't quite catch that destination. Could you repeat which destination you'd like to visit?"

      case 'category':
        if (entity.category && entity.destinationIds && entity.destinationIds.length > 0) {
          const dests = entity.destinationIds.slice(0, 3).map(id => getDestinationById(id)).filter(Boolean)
          if (dests.length === 1) {
            return `For ${entity.category}, I recommend ${dests[0]!.name}, ${dests[0]!.state}. ${dests[0]!.overview} Does this interest you?`
          } else if (dests.length === 2) {
            return `For ${entity.category}, I have ${dests[0]!.name}, ${dests[0]!.state} and ${dests[1]!.name}, ${dests[1]!.state}. Would you like to hear more about either of these?`
          } else {
            const names = dests.map(d => `${d!.name}, ${d!.state}`).join(', ')
            return `For ${entity.category}, I can offer ${names}. Which one sounds most appealing to you?`
          }
        }
        return "I have several destinations in that category. Could you be more specific about what you're looking for?"

      case 'attribute':
        if (entity.attribute && entity.destinationIds && entity.destinationIds.length > 0) {
          const dests = entity.destinationIds.slice(0, 3).map(id => getDestinationById(id)).filter(Boolean)
          const attrDesc = entity.attribute.value === 'warm' ? 'warm weather' :
                          entity.attribute.value === 'yearRound' ? 'year-round sunshine' :
                          entity.attribute.value === 'seasonal' ? 'seasonal variety' :
                          entity.attribute.value === 'skiing' ? 'skiing' :
                          entity.attribute.value === 'golf' ? 'golf' :
                          entity.attribute.value === 'surfing' ? 'surfing' :
                          entity.attribute.value

          if (dests.length === 1) {
            return `For ${attrDesc}, ${dests[0]!.name}, ${dests[0]!.state} is perfect! ${dests[0]!.overview} Interested?`
          } else {
            const names = dests.map(d => `${d!.name}`).join(', ')
            return `For ${attrDesc}, I recommend ${names}. Which would you like to explore?`
          }
        }
        return "I have a few options that match what you're looking for. Could you tell me more about your preferences?"

      case 'comparison':
        if (entity.destinationIds && entity.destinationIds.length >= 2) {
          const dest1 = getDestinationById(entity.destinationIds[0])
          const dest2 = getDestinationById(entity.destinationIds[1])
          if (dest1 && dest2) {
            return `${dest1.name} ${dest1.tagline.toLowerCase()} - ${dest1.keyFacts[0]} Meanwhile, ${dest2.name} ${dest2.tagline.toLowerCase()} - ${dest2.keyFacts[0]} Which appeals to you more?`
          }
        }
        return "I'd be happy to compare destinations! Which two would you like me to compare?"

      case 'exploration':
        const explored = bookingState.exploredDestinations || []
        const unexplored = destinations.filter(d => !explored.includes(d.id) && d.id !== bookingState.selectedDestination)

        if (unexplored.length === 0) {
          return "We've covered all our destinations! Which one interests you most? Or would you like me to recap the options?"
        }

        // Suggest top 3 popular non-Orlando destinations
        const suggestions = ['las-vegas', 'myrtle-beach', 'new-orleans'].filter(id => !explored.includes(id))
        const suggestedDests = suggestions.map(id => getDestinationById(id)).filter(Boolean)

        if (suggestedDests.length > 0) {
          const names = suggestedDests.map(d => `${d!.name}, ${d!.state}`).join(', ')
          return `I can also show you ${names}. Or if you prefer, I can search by what matters most - beach, mountains, entertainment, or budget. What interests you?`
        }

        return "I have destinations from coast to coast! Are you interested in beaches, mountains, cities, or something else?"

      default:
        return "I have 11 amazing destinations across the country. Would you like to explore by location type, activities, or see what's most popular?"
    }
  }

  generateResponse(intent: VoiceIntent, currentStep: BookingStep, bookingState: BookingState): string {
    switch (intent.type) {
      case 'destination_selection':
        return this.generateDestinationResponse(intent.entities.destination as DestinationSelectionEntity, bookingState)

      case 'details_verification':
        const zipCode = intent.entities.zipCode
        const guestCount = intent.entities.guestCount
        const confirmation = intent.entities.confirmation

        if (confirmation) {
          return "Perfect! Your details are confirmed. Now let's choose your destination."
        }

        if (zipCode && guestCount) {
          return `Great! I have your zip code as ${zipCode} and ${guestCount} ${guestCount === 1 ? 'guest' : 'guests'}. Is that correct?`
        } else if (zipCode) {
          return `I have your zip code as ${zipCode}. How many guests will be traveling?`
        } else if (guestCount) {
          return `Got it, ${guestCount} ${guestCount === 1 ? 'guest' : 'guests'}. What's your zip code?`
        }

        return "Please tell me your zip code and how many guests will be traveling. You can say something like 'zip code 32801 for 4 people'."

      case 'flexible_date_selection':
        const option = intent.entities.flexibleOption as FlexibleDateOption
        if (option) {
          return `Perfect! ${option.label} at ${option.propertyName} - that's ${option.nights} nights starting ${option.checkIn.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. This looks great! Shall we lock it in?`
        }
        return "Which date option interests you? You can say 'first option', 'the November one', or tell me what you're looking for."

      case 'property_matching':
        if (intent.entities.confirmed) {
          return "Excellent! Your property is confirmed. Let's schedule your resort tour."
        } else if (intent.entities.confirmed === false) {
          return "No problem. Let me find another option for you."
        } else {
          return "Thanks for sharing! Let me use that to find your perfect match."
        }

      case 'date_selection':
        const dates = intent.entities.dates as DateSelectionEntity
        if (dates.checkIn && dates.checkOut) {
          return `Perfect! I've set your check-in for ${dates.checkIn.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} and check-out for ${dates.checkOut.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. That's ${dates.duration || 5} nights total. Now let's schedule your property tour to secure your $100 cash back. Would morning, afternoon, or evening work best for you?`
        }
        return "Could you clarify your travel dates? You can say something like 'next Friday' or a specific date like 'March 15th'."

      case 'time_selection':
        const time = intent.entities.time as TimeSelectionEntity
        if (time.time || time.period) {
          const timeStr = time.time || `a ${time.period} slot`
          return `Great! I've reserved ${timeStr} for your property tour. You're all set! Your booking is complete. You'll receive a confirmation email shortly with all the details of your Orlando vacation package.`
        }
        return "What time works best for your tour? You can say a specific time like '2:30 PM' or just 'morning', 'afternoon', or 'evening'."

      case 'confirmation':
        if (intent.entities.confirmed) {
          return this.getPositiveConfirmationResponse(currentStep)
        } else {
          return "No problem. What would you like to change?"
        }

      case 'question':
        return this.handleQuestion(intent.entities.topic as string, currentStep, bookingState)

      case 'correction':
        return "Let me help you with that. What would you like to change?"

      default:
        return this.getContextualHelp(currentStep)
    }
  }

  private getPositiveConfirmationResponse(currentStep: BookingStep): string {
    switch (currentStep) {
      case 'verify-details':
        return "Perfect! Your details are confirmed. Now let's choose your destination."
      case 'select-destination':
        return "Excellent! Let me show you our properties in that destination."
      case 'choose-dates':
        return "Perfect! Those dates are confirmed. Let's schedule your property tour."
      case 'schedule-tour':
        return "Excellent! Your tour is scheduled. Your complete booking is confirmed!"
      default:
        return "Great! Let's continue with your booking."
    }
  }

  private handleQuestion(topic: string, currentStep: BookingStep, bookingState: BookingState): string {
    switch (topic) {
      case 'price':
        return "Our Cocoa Beach properties range from budget-friendly to premium. The Holiday Inn Express Cocoa offers great value, the Holiday Inn Express Cocoa Beach is mid-range with oceanfront access, and the Crowne Plaza Melbourne is our premium oceanfront option. All include the $100 cash back bonus after your property tour."
      case 'amenities':
        return "Each property has unique amenities. The Cocoa Beach location has direct beach access and is near Ron Jon Surf Shop, the Crowne Plaza has a full-service spa and beachfront dining, and the Cocoa location is budget-friendly and near Kennedy Space Center. Which interests you most?"
      case 'cancellation':
        return "You can cancel up to 48 hours before check-in for a full refund. The property tour is required to receive the $100 cash back bonus."
      default:
        return "I'd be happy to help! What would you like to know more about?"
    }
  }

  private getContextualHelp(currentStep: BookingStep): string {
    switch (currentStep) {
      case 'verify-details':
        return "I need to verify your details. Please confirm your zip code and how many guests will be traveling. You can say 'yes that's correct' or provide corrections."
      case 'select-destination':
        return "Where would you like to vacation? I have Orlando as your default, but you can explore other destinations. Try saying 'tell me about beach destinations' or 'I want to go to Las Vegas'."
      case 'choose-dates':
        return "When would you like to travel? You can say a date like 'next Friday' or 'March 15th'."
      case 'property-matching':
        return "I'm asking you a few questions to find the perfect property for you. Please answer with your preferences."
      case 'schedule-tour':
        return "What time works for your property tour? You can say 'morning', 'afternoon', or a specific time like '2 PM'."
      default:
        return "I'm here to help you book your vacation. What would you like to do next?"
    }
  }
}