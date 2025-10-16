"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConversationWithHolly } from "./conversation-with-holly"
import { HorizontalStepper } from "./horizontal-stepper"
import { PackageOverview } from "./package-overview"
import { VerifyDetailsStep } from "./verify-details-step"
import { DestinationChoiceStep } from "./destination-choice-step"
import { DestinationSelectionStep } from "./destination-selection-step"
import { DateSelectionStep } from "./date-selection-step"
import { FlexibleDatesStep } from "./flexible-dates-step"
import { TourSchedulerStep } from "./tour-scheduler-step"
import type { ConversationMessage } from "@/types/conversation"
import { VoiceInteractionHandler } from "@/lib/voice-interaction-handler"
import { useIsMobile } from "@/components/ui/use-mobile"
import { getDestinationById } from "@/lib/destinations-data"
import { getFlexibleDateOptionById } from "@/lib/availability-data"

export type BookingStep = "active-package" | "verify-details" | "destination-choice" | "select-destination" | "choose-dates" | "choose-flexible-dates" | "schedule-tour" | "final-booking"

export interface BookingState {
  currentStep: BookingStep
  completedSteps: BookingStep[]
  packageConfirmed: boolean
  zipCode: string
  guestCount: number
  selectedDestination: string | null
  destinationConfirmed: boolean
  exploredDestinations: string[]
  destinationPreference: 'keep' | 'explore' | null
  dateFlexibility: 'fixed' | 'flexible' | null
  selectedFlexibleOption: string | null
  checkInDate: Date | null
  checkOutDate: Date | null
  tourTime: string | null
  // New fields for two-phase date selection
  dateNarrowingComplete: boolean
  datePreference: 'exact' | 'month' | 'flexible' | null
  preferredMonth: string | null
  dateRangeOptions: any[] // DateRangeOption[] from date-ranges-generator
  dateRangePageIndex: number
  highlightedDateRangeId: string | null
  // Property matching fields
  propertyMatchingStep: number
  propertyMatchingComplete: boolean
  matchedPropertyName: string | null
}

export function HollyAssistant() {
  const isMobile = useIsMobile()
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [bookingState, setBookingState] = useState<BookingState>({
    currentStep: "active-package",
    completedSteps: [],
    packageConfirmed: true,
    zipCode: "32801",
    guestCount: 4,
    selectedDestination: "orlando",
    destinationConfirmed: false,
    exploredDestinations: [],
    destinationPreference: 'explore',
    dateFlexibility: 'fixed',
    selectedFlexibleOption: null,
    checkInDate: null,
    checkOutDate: null,
    tourTime: null,
    dateNarrowingComplete: false,
    datePreference: null,
    preferredMonth: null,
    dateRangeOptions: [],
    dateRangePageIndex: 0,
    highlightedDateRangeId: null,
    propertyMatchingStep: 0,
    propertyMatchingComplete: false,
    matchedPropertyName: null,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [currentlyDiscussedDestination, setCurrentlyDiscussedDestination] = useState<string | null>(null)
  const [suggestedDestinations, setSuggestedDestinations] = useState<string[]>([])
  const [explorationMode, setExplorationMode] = useState(false)
  const [showDestinationDetails, setShowDestinationDetails] = useState(false)
  const [currentlyDiscussedProperty, setCurrentlyDiscussedProperty] = useState<number | null>(null)
  const [highlightedDates, setHighlightedDates] = useState<{ checkIn?: Date; checkOut?: Date } | undefined>()
  const [highlightedTimeSlot, setHighlightedTimeSlot] = useState<string | null>(null)
  const [suggestedDate, setSuggestedDate] = useState<Date | null>(null)
  const [destinationDemoStep, setDestinationDemoStep] = useState(0)
  const [qualificationsAccepted, setQualificationsAccepted] = useState(false)

  const voiceHandlerRef = useRef(new VoiceInteractionHandler())
  const lastMessageRef = useRef<string>("")
  const lastMessageTimeRef = useRef<number>(0)

  // Handle voice activation
  const toggleVoice = () => {
    const wasInactive = !isVoiceActive
    setIsVoiceActive(!isVoiceActive)

    // If activating voice for first time, proceed with welcome
    if (wasInactive && bookingState.currentStep === 'active-package') {
      setTimeout(() => {
        addMessage("holly", "Hi! I'm Holli, your AI booking assistant. I can help you book your vacation just like a normal phone call.")

        setTimeout(() => {
          addMessage("holly", "Let me confirm your details to get started.")

          setTimeout(() => {
            addMessage("holly", `I have your zip code as ${bookingState.zipCode} and ${bookingState.guestCount} guests. Is this correct?`)

            setBookingState((prev) => ({
              ...prev,
              completedSteps: ["active-package"],
              currentStep: "verify-details"
            }))
          }, 1200)
        }, 1200)
      }, 1000)
    }

    if (!wasInactive) {
      // Clean up when voice is deactivated
      setCurrentTranscript("")
      setIsProcessing(false)
    }
  }

  // Demo mode: Handle Enter key for progression
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()

        switch (bookingState.currentStep) {
          case 'active-package':
            // Auto-activate voice in demo mode
            if (!isVoiceActive) {
              toggleVoice()
            }
            break

          case 'verify-details':
            // Simulate user correction in demo mode
            if (!bookingState.completedSteps.includes('verify-details')) {
              // User corrects the guest count
              addMessage('user', "Yep! Everything looks good but we have 3 guests, not 4.")

              // Update the guest count with animation
              setBookingState(prev => ({
                ...prev,
                guestCount: 3
              }))

              setTimeout(() => {
                addMessage('holly', "Got it! I've updated to 3 guests. Your details are now confirmed. Now, would you like to keep Orlando or explore other destinations?")

                // Move to destination-choice after a delay
                setTimeout(() => {
                  setBookingState(prev => ({
                    ...prev,
                    currentStep: 'destination-choice',
                    completedSteps: [...prev.completedSteps, 'verify-details']
                  }))
                }, 2000)
              }, 1500)
            }
            break

          case 'destination-choice':
            // Demo: User chooses to explore other destinations
            addMessage('user', "I want to explore other destinations")

            setTimeout(() => {
              addMessage('holly', "Great! Let's explore destinations. I'll show you what's available.")

              setTimeout(() => {
                setBookingState(prev => ({
                  ...prev,
                  destinationPreference: 'explore',
                  completedSteps: [...prev.completedSteps, 'destination-choice'],
                  currentStep: 'select-destination'
                }))

                setExplorationMode(true)
                setTimeout(() => presentDestinationDefault(), 500)
              }, 1000)
            }, 1000)
            break

          case 'select-destination':
            // Demo mode conversation tracking using destinationDemoStep
            if (destinationDemoStep === 0) {
              // First interaction: User asks about beaches with Disney context
              addMessage('user', "I want to go to Disney, but I want to be close to the beach. What do you recommend?")

              // Move to next step IMMEDIATELY to prevent race condition
              setDestinationDemoStep(1)

              setTimeout(() => {
                // Enable exploration mode
                setExplorationMode(true)

                // Highlight beach destinations and jump to Cocoa Beach
                setSuggestedDestinations(['cocoa-beach', 'galveston', 'myrtle-beach'])
                setCurrentlyDiscussedDestination('cocoa-beach')

                addMessage('holly', "Perfect! For beach plus Disney access, Cocoa Beach is your best option. It's only 70 miles from Disney World, about an hour and a half drive. I'm showing you Cocoa Beach now, but you can browse all 11 destinations with the arrows. Feel free to ask me about any destinations!")

                setTimeout(() => {
                  setCurrentlyDiscussedDestination(null)
                }, 4000)
              }, 1000)
            } else if (destinationDemoStep === 1) {
              // Second interaction: User asks for more details
              addMessage('user', "Tell me more about Cocoa Beach")

              // Move to next step IMMEDIATELY to prevent race condition
              setDestinationDemoStep(2)

              setTimeout(() => {
                // Flip the card to show details
                setShowDestinationDetails(true)

                // Holly provides narration
                addMessage('holly', "Cocoa Beach offers year-round warm weather and miles of surf. It's home to the largest surf shop in the world—Ron Jon Surf Shop®. You can learn to surf or go on a paddleboard bioluminescent tour. Plus, the Kennedy Space Center is just 16 miles away!")
              }, 1000)
            } else if (destinationDemoStep === 2) {
              // Third interaction: User confirms selection
              addMessage('user', "Great, let's do Cocoa Beach then")

              setTimeout(() => {
                // Update to Cocoa Beach and proceed directly to dates
                addMessage('holly', "Excellent! Cocoa Beach it is. Now, when would you like to travel?")

                setTimeout(() => {
                  setBookingState(prev => ({
                    ...prev,
                    selectedDestination: 'cocoa-beach',
                    destinationConfirmed: true,
                    exploredDestinations: ['orlando', 'cocoa-beach'],
                    currentStep: 'choose-dates',
                    completedSteps: [...prev.completedSteps, 'select-destination']
                  }))
                  setSuggestedDestinations([])
                  setExplorationMode(false)
                  setShowDestinationDetails(false)
                  setDestinationDemoStep(0) // Reset for next demo run
                }, 1500)
              }, 1000)
            }
            break

          case 'choose-dates':
            // Multi-cycle date selection flow
            // Need to track demo step using bookingState.dateRangePageIndex
            const { generateDateRangeOptions } = require('@/lib/date-ranges-generator')

            if (!bookingState.dateNarrowingComplete) {
              // Phase 1: User narrows down to November
              addMessage('user', "I'm thinking November")

              setTimeout(() => {
                addMessage('holly', "Great choice! November is perfect for beach weather. Let me show you available dates in November...")

                // Generate November date ranges
                setTimeout(() => {
                  const dateRanges = generateDateRangeOptions({ month: 'november' }, 5)

                  setBookingState(prev => ({
                    ...prev,
                    dateNarrowingComplete: true,
                    datePreference: 'month',
                    preferredMonth: 'November',
                    dateRangeOptions: dateRanges,
                    dateRangePageIndex: 0
                  }))

                  setTimeout(() => {
                    addMessage('holly', `I found ${dateRanges.length} great options for November. Take a look at these date ranges for your 4-day, 3-night stay.`)
                  }, 800)
                }, 1000)
              }, 1000)
            } else if (bookingState.dateRangePageIndex === 0) {
              // Phase 2 - Cycle 1: User asks for weekend options
              addMessage('user', "Do you have any weekend options?")

              setTimeout(() => {
                // Refine to show weekend-focused options
                const dateRanges = generateDateRangeOptions({
                  month: 'november',
                  preferWeekends: true
                }, 5)

                setBookingState(prev => ({
                  ...prev,
                  dateRangeOptions: dateRanges,
                  dateRangePageIndex: 1
                }))

                setTimeout(() => {
                  addMessage('holly', "Absolutely! Here are weekend options in November. These check-ins start on Friday or Saturday.")
                }, 1000)
              }, 1000)
            } else if (bookingState.propertyMatchingStep >= 1) {
              // Property matching steps 1-4 (checked before date selection to prevent loop)
              if (bookingState.propertyMatchingStep === 1) {
                // Property matching - Question 2
                addMessage('user', "Free breakfast and Wi-Fi are essential")

                setTimeout(() => {
                  setBookingState(prev => ({
                    ...prev,
                    propertyMatchingStep: 2
                  }))

                  addMessage('holly', "Great! And what kind of vibe are you looking for?")
                }, 1000)
              } else if (bookingState.propertyMatchingStep === 2) {
                // Property matching - Question 3
                addMessage('user', "Something relaxed and family-friendly")

                setTimeout(() => {
                  setBookingState(prev => ({
                    ...prev,
                    propertyMatchingStep: 3
                  }))

                  addMessage('holly', "Let me find your perfect match...")

                  // Auto-transition to result after 2.5 seconds
                  setTimeout(() => {
                    setBookingState(prev => ({
                      ...prev,
                      propertyMatchingStep: 4,
                      matchedPropertyName: 'Holiday Inn Express® & Suites Cocoa Beach'
                    }))

                    addMessage('holly', "Perfect! I found the ideal property for you - Holiday Inn Express® & Suites Cocoa Beach. It has everything you're looking for!")
                  }, 2500)
                }, 1000)
              } else if (bookingState.propertyMatchingStep === 3) {
                // Auto-transition step - no user action needed
                // User pressing Enter during this step should have no effect
              } else if (bookingState.propertyMatchingStep === 4) {
                // Property matching complete - Continue to tour scheduling
                addMessage('user', "That looks great!")

                setTimeout(() => {
                  // Calculate tour date for Saturday (day after Friday check-in)
                  const checkInDate = bookingState.checkInDate || new Date(2025, 10, 7)
                  const tourDateSaturday = new Date(checkInDate)
                  tourDateSaturday.setDate(tourDateSaturday.getDate() + 1)

                  setBookingState(prev => ({
                    ...prev,
                    currentStep: 'schedule-tour',
                    completedSteps: [...prev.completedSteps, 'choose-dates'],
                    propertyMatchingComplete: true,
                    tourTime: `${tourDateSaturday.toDateString()} at 12:00 PM EST`
                  }))

                  addMessage('holly', "Excellent! Now let's schedule your resort tour.")

                  // Holly introduces the pre-selected tour
                  setTimeout(() => {
                    const formattedDate = tourDateSaturday.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
                    addMessage('holly', `I've scheduled your tour for ${formattedDate} at 12:00 PM - our most popular time. You'll have the morning to explore and plenty of time to relax afterward. Does that work for you?`)
                  }, 1500)
                }, 1000)
              }
            } else if (bookingState.propertyMatchingStep === 0 && bookingState.checkInDate) {
              // Property matching - Question 1 (only if date is already selected)
              addMessage('user', "I love water sports and beach activities")

              setTimeout(() => {
                setBookingState(prev => ({
                  ...prev,
                  propertyMatchingStep: 1
                }))

                addMessage('holly', "Perfect! What amenities are most important to you?")
              }, 1000)
            } else if (!bookingState.checkInDate) {
              // Phase 2 - Cycle 2: User selects specific date range
              addMessage('user', "The first one looks good")

              const selectedRange = bookingState.dateRangeOptions[0]

              setTimeout(() => {
                // Highlight the selected range
                setBookingState(prev => ({
                  ...prev,
                  highlightedDateRangeId: selectedRange.id,
                  checkInDate: selectedRange.checkInDate,
                  checkOutDate: selectedRange.checkOutDate
                }))

                addMessage('holly', "Great! Those dates are available.")

                // Start property matching flow
                setTimeout(() => {
                  setBookingState(prev => ({
                    ...prev,
                    highlightedDateRangeId: null
                  }))

                  addMessage('holly', "Perfect! Now let me find the ideal property for you. I just need to ask a few quick questions.")
                }, 1500)

                // Start first property matching question
                setTimeout(() => {
                  setBookingState(prev => ({
                    ...prev,
                    propertyMatchingStep: 0
                  }))

                  setTimeout(() => {
                    addMessage('holly', "What activities are you interested in?")
                  }, 500)
                }, 3000)
              }, 1000)
            }

            break


          case 'schedule-tour':
            // Tour is already pre-selected to 12 PM
            // First Enter: User requests different time
            if (bookingState.tourTime?.includes('12:00 PM')) {
              addMessage('user', "Actually, can we do 3 PM instead?")

              // Use Saturday Nov 8, 2025 for tour
              const tourDateSaturday = new Date(2025, 10, 8)

              // Step 1: Highlight the 3 PM slot visually
              setTimeout(() => {
                setHighlightedTimeSlot('3:00 PM')

                // Step 2: After visual highlight, update the selection
                setTimeout(() => {
                  setBookingState(prev => ({
                    ...prev,
                    tourTime: `${tourDateSaturday.toDateString()} at 3:00 PM EST`
                  }))

                  // Clear the highlight effect
                  setHighlightedTimeSlot(null)

                  // Step 3: Holli confirms the change
                  addMessage('holly', "Of course! I've updated your tour to 3:00 PM on 11/8/25.")
                }, 1000)
              }, 500)
            } else if (bookingState.tourTime?.includes('3:00 PM')) {
              // Second Enter: User confirms
              addMessage('user', "Perfect, that works")

              setTimeout(() => {
                addMessage('holly', `Excellent! Your booking is complete. We sent the confirmation email. Thank you for choosing Holiday Inn Club Vacations for your family travels!`)

                // Move to final booking after a delay
                setTimeout(() => {
                  setBookingState(prev => ({
                    ...prev,
                    currentStep: 'final-booking',
                    completedSteps: [...prev.completedSteps, 'schedule-tour']
                  }))
                }, 1500)
              }, 1000)
            }
            break

          case 'final-booking':
            // First Enter: Accept qualifications (if not yet accepted)
            if (!qualificationsAccepted) {
              addMessage('user', "I accept")
              setQualificationsAccepted(true)
              setTimeout(() => {
                addMessage('holly', "Perfect! Your reservation is confirmed!")
              }, 1000)
            } else {
              // Second Enter: Reset to start
              setBookingState({
                currentStep: 'active-package',
                completedSteps: [],
                packageConfirmed: true,
                zipCode: '32801',
                guestCount: 4,
                selectedDestination: 'orlando',
                destinationConfirmed: false,
                exploredDestinations: [],
                destinationPreference: 'explore',
                dateFlexibility: 'fixed',
                selectedFlexibleOption: null,
                checkInDate: null,
                checkOutDate: null,
                tourTime: null,
                dateNarrowingComplete: false,
                datePreference: null,
                preferredMonth: null,
                dateRangeOptions: [],
                dateRangePageIndex: 0,
                highlightedDateRangeId: null,
                propertyMatchingStep: 0,
                propertyMatchingComplete: false,
                matchedPropertyName: null,
              })
              setMessages([])
              setIsVoiceActive(false)
              setDestinationDemoStep(0)
              setExplorationMode(false)
              setShowDestinationDetails(false)
              setSuggestedDestinations([])
              setCurrentlyDiscussedDestination(null)
              setQualificationsAccepted(false)
              addMessage('holly', "Ready to start a new booking! Press Enter to begin.")
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [bookingState.currentStep, bookingState.tourTime, bookingState.destinationPreference, bookingState.dateFlexibility, bookingState.completedSteps, bookingState.dateNarrowingComplete, bookingState.dateRangePageIndex, bookingState.propertyMatchingStep, bookingState.checkInDate, destinationDemoStep, isVoiceActive, qualificationsAccepted])

  const addMessage = (role: "holly" | "user", content: string) => {
    // Prevent duplicate messages within 500ms
    const now = Date.now()
    const messageKey = `${role}:${content}`
    if (messageKey === lastMessageRef.current && now - lastMessageTimeRef.current < 500) {
      return
    }
    lastMessageRef.current = messageKey
    lastMessageTimeRef.current = now

    const newMessage: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  // toggleVoice is now defined earlier in the file (line 78)

  const presentDestinationDefault = () => {
    const preferredDestId = bookingState.selectedDestination || 'orlando'
    const preferredDest = getDestinationById(preferredDestId)
    if (preferredDest) {
      addMessage("holly", `Perfect! Your vacation package includes ${preferredDest.name}, ${preferredDest.state} - ${preferredDest.tagline.toLowerCase()}.`)

      setTimeout(() => {
        addMessage("holly", `Would you like to continue with ${preferredDest.name}, or would you like to explore other destinations?`)
      }, 2500)
    }
  }

  const handleDestinationChoice = (choice: 'keep' | 'explore') => {
    if (choice === 'keep') {
      // Keep Orlando, go straight to dates
      // Mark BOTH destination-choice AND select-destination as completed
      setBookingState(prev => ({
        ...prev,
        destinationPreference: 'keep',
        destinationConfirmed: true,
        completedSteps: [...prev.completedSteps, 'destination-choice', 'select-destination'],
        currentStep: 'choose-dates'
      }))

      addMessage('user', 'Keep Orlando')
      setTimeout(() => {
        addMessage('holly', "Perfect! Sticking with Orlando. Now, when would you like to travel?")
      }, 1000)

    } else {
      // Explore destinations, go to TikTok swipe UI
      setBookingState(prev => ({
        ...prev,
        destinationPreference: 'explore',
        completedSteps: [...prev.completedSteps, 'destination-choice'],
        currentStep: 'select-destination'
      }))

      addMessage('user', 'I want to explore other destinations')
      setTimeout(() => {
        addMessage('holly', "Great! Let's explore destinations. Swipe through to see what's available.")
        setExplorationMode(true)
      }, 1000)
    }
  }


  const handleVoiceInput = useCallback((text: string) => {
    if (!text || isProcessing) return

    setCurrentTranscript("")
    setIsProcessing(true)

    // Add user message
    addMessage("user", text)

    // Process voice input with NLU
    const intent = voiceHandlerRef.current.parseVoiceInput(text, bookingState.currentStep, bookingState)

    // Generate response
    setTimeout(() => {
      const response = voiceHandlerRef.current.generateResponse(intent, bookingState.currentStep, bookingState)
      addMessage("holly", response)

      // Update booking state based on intent
      processIntent(intent)

      setIsProcessing(false)
    }, 1000)
  }, [bookingState, isProcessing])

  const processIntent = (intent: any) => {
    switch (intent.type) {
      case 'details_verification':
        const { zipCode, guestCount, confirmation } = intent.entities

        if (confirmation && bookingState.zipCode && bookingState.guestCount) {
          // Move to destination choice
          setBookingState((prev) => ({
            ...prev,
            completedSteps: [...prev.completedSteps, "verify-details"],
            currentStep: "destination-choice"
          }))
        } else {
          // Update details as provided
          if (zipCode || guestCount) {
            setBookingState((prev) => ({
              ...prev,
              ...(zipCode && { zipCode }),
              ...(guestCount && { guestCount })
            }))
          }
        }
        break

      case 'destination_selection':
        const destination = intent.entities.destination
        if (destination) {
          // Handle different destination selection methods
          if (destination.method === 'direct' && destination.destinationId) {
            // Direct selection - route based on date flexibility
            const nextStep = bookingState.dateFlexibility === 'fixed' ? 'choose-dates' : 'choose-flexible-dates'

            setBookingState((prev) => ({
              ...prev,
              selectedDestination: destination.destinationId,
              destinationConfirmed: true,
              exploredDestinations: [...new Set([...prev.exploredDestinations, destination.destinationId])],
              completedSteps: [...prev.completedSteps, "select-destination"],
              currentStep: nextStep
            }))
            setCurrentlyDiscussedDestination(null)
            setSuggestedDestinations([])
          } else if (destination.method === 'category' || destination.method === 'attribute') {
            // Category or attribute query - highlight suggested destinations
            if (destination.destinationIds && destination.destinationIds.length > 0) {
              setSuggestedDestinations(destination.destinationIds)
              setBookingState((prev) => ({
                ...prev,
                exploredDestinations: [...new Set([...prev.exploredDestinations, ...destination.destinationIds])]
              }))

              // Present destinations with timed highlights
              setTimeout(() => {
                destination.destinationIds.slice(0, 3).forEach((destId: string, index: number) => {
                  setTimeout(() => {
                    setCurrentlyDiscussedDestination(destId)
                  }, index * 4000)
                })

                // Clear highlight after presentations
                setTimeout(() => {
                  setCurrentlyDiscussedDestination(null)
                }, destination.destinationIds.length * 4000)
              }, 500)
            }
          } else if (destination.method === 'comparison') {
            // Comparison - highlight both destinations
            if (destination.destinationIds && destination.destinationIds.length >= 2) {
              setSuggestedDestinations(destination.destinationIds.slice(0, 2))
              setBookingState((prev) => ({
                ...prev,
                exploredDestinations: [...new Set([...prev.exploredDestinations, ...destination.destinationIds.slice(0, 2)])]
              }))
            }
          } else if (destination.method === 'exploration') {
            // Exploration - suggest popular destinations
            const suggestions = ['las-vegas', 'myrtle-beach', 'new-orleans']
            setSuggestedDestinations(suggestions)
          }
        }
        break

      case 'date_selection':
        const dates = intent.entities.dates
        if (dates?.checkIn && dates?.checkOut) {
          // Mock property assignment based on guest count (in real app, would query availability)
          const assignedPropertyId = bookingState.guestCount <= 2 ? 1 : bookingState.guestCount <= 4 ? 2 : 3

          setBookingState((prev) => ({
            ...prev,
            checkInDate: dates.checkIn,
            checkOutDate: dates.checkOut,
            completedSteps: [...prev.completedSteps, "choose-dates"],
            currentStep: "schedule-tour"
          }))
          setHighlightedDates(undefined)

          // Holly announces property assignment
          setTimeout(() => {
            const propertyNames: Record<number, string> = {
              1: 'Holiday Inn Express® & Suites Cocoa Beach',
              2: 'Crowne Plaza® Melbourne – Oceanfront',
              3: 'Holiday Inn Express® & Suites Cocoa'
            }
            const roomTypes: Record<number, string> = {
              1: 'beachfront 2-bedroom suite',
              2: 'oceanfront premium suite',
              3: 'spacious 3-bedroom family suite'
            }
            addMessage('holly', `Perfect! I've got you staying at the ${propertyNames[assignedPropertyId]} - a ${roomTypes[assignedPropertyId]} perfect for ${bookingState.guestCount} guests. Now let's schedule your resort tour.`)
          }, 1000)
        } else if (dates?.checkIn || dates?.checkOut) {
          // Show highlighted dates while user is discussing them
          setHighlightedDates({
            checkIn: dates.checkIn,
            checkOut: dates.checkOut
          })
        }
        break

      case 'flexible_date_selection':
        const optionId = intent.entities.flexibleOption?.id
        if (optionId) {
          const option = getFlexibleDateOptionById(optionId)
          if (option) {
            setBookingState((prev) => ({
              ...prev,
              selectedFlexibleOption: option.id,
              checkInDate: option.checkIn,
              checkOutDate: option.checkOut,
              completedSteps: [...prev.completedSteps, 'choose-flexible-dates'],
              currentStep: 'schedule-tour'
            }))

            // Holly announces the locked-in dates and property
            setTimeout(() => {
              addMessage('holly', `Excellent choice! I've locked in ${option.label} at the ${option.propertyName}. Now let's schedule your resort tour.`)
            }, 1000)
          }
        }
        break

      case 'time_selection':
        const time = intent.entities.time
        if (time?.time || time?.period) {
          const tourTimeStr = time.time || `${time.period} slot`
          setBookingState((prev) => ({
            ...prev,
            tourTime: `${new Date().toDateString()} at ${tourTimeStr} EST`,
            completedSteps: [...prev.completedSteps, "schedule-tour"],
            currentStep: "final-booking"
          }))
          setHighlightedTimeSlot(null)
        } else {
          // Highlight discussed time slot
          setHighlightedTimeSlot(time?.time || null)
        }
        break

      case 'question':
        // Handle general questions
        break
    }
  }

  // Automatically progress through steps based on voice conversation
  const autoProgressStep = useCallback(() => {
    const steps: BookingStep[] = ["active-package", "verify-details", "select-destination", "choose-dates", "schedule-tour", "final-booking"]
    const currentIndex = steps.indexOf(bookingState.currentStep)
    const nextStep = steps[currentIndex + 1] || "final-booking"

    setBookingState((prev) => ({
      ...prev,
      completedSteps: [...prev.completedSteps, bookingState.currentStep],
      currentStep: nextStep,
    }))
  }, [bookingState.currentStep])

  // Render the current step component
  const renderCurrentStepComponent = () => {
    switch (bookingState.currentStep) {
      case "active-package":
        return <PackageOverview packageConfirmed={bookingState.packageConfirmed} />

      case "verify-details":
        return (
          <VerifyDetailsStep
            bookingState={bookingState}
          />
        )

      case "destination-choice":
        return (
          <DestinationChoiceStep
            bookingState={bookingState}
            onChoice={handleDestinationChoice}
          />
        )

      case "select-destination":
        return (
          <DestinationSelectionStep
            bookingState={bookingState}
            currentlyDiscussedDestination={currentlyDiscussedDestination}
            suggestedDestinations={suggestedDestinations}
            explorationMode={explorationMode}
            onExplorationModeChange={setExplorationMode}
            showDestinationDetails={showDestinationDetails}
          />
        )

      case "choose-dates":
        return (
          <DateSelectionStep
            bookingState={bookingState}
            highlightedDateRangeId={bookingState.highlightedDateRangeId}
          />
        )

      case "choose-flexible-dates":
        return (
          <FlexibleDatesStep
            bookingState={bookingState}
            highlightedOptionId={null}
          />
        )

      case "schedule-tour":
        return (
          <TourSchedulerStep
            bookingState={bookingState}
            highlightedTimeSlot={highlightedTimeSlot}
          />
        )

      case "final-booking":
        // Two-state component: Show qualifications first, then confirmation
        if (!qualificationsAccepted) {
          // STATE 1: Qualification Screen
          return (
            <div className="h-full flex items-center justify-center p-4">
              <Card className="max-w-2xl w-full p-4 bg-white border-2 border-[#D0B7A1]">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-[#46403F] mb-3">
                      Almost Done!
                    </h2>
                    <p className="text-base text-[#46403F]/80">
                      Please confirm that you meet all of these requirements:
                    </p>
                  </div>

                  {/* Requirements List */}
                  <div className="bg-[#F2F1E9] rounded-xl p-6 space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-[#1C4B34] text-lg">✓</span>
                        <span className="text-[#46403F]">
                          You are at least <strong>25 years old</strong>.
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-[#1C4B34] text-lg">✓</span>
                        <span className="text-[#46403F]">
                          Your gross annual income is <strong>$50,000 or greater</strong>.
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-[#1C4B34] text-lg">✓</span>
                        <span className="text-[#46403F]">
                          If traveling as a couple, <strong>both will attend the tour</strong>.
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-[#1C4B34] text-lg">✓</span>
                        <span className="text-[#46403F]">
                          You will bring a valid <strong>US driver's license, state ID, or passport</strong>.
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-[#1C4B34] text-lg">✓</span>
                        <span className="text-[#46403F]">
                          You will bring a <strong>major credit or debit card</strong>.
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-[#1C4B34] text-lg">✓</span>
                        <span className="text-[#46403F]">
                          You are <strong>not traveling with someone who has a separate Holiday Inn Club Vacations package</strong>.
                        </span>
                      </div>
                    </div>

                    {/* Important Disclaimers */}
                    <div className="border-t border-[#D0B7A1] pt-4 mt-4 space-y-2">
                      <p className="text-xs text-[#46403F]/70 italic">
                        <strong>Important:</strong> If you do not meet these qualifications, you will be charged the difference between the retail rate and your package price.
                      </p>
                      <p className="text-xs text-[#46403F]/70 italic">
                        You consent to being contacted via auto-dialed call, text, or email. Transactional messages will still be sent.
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 justify-center pt-2">
                    <Button
                      size="lg"
                      onClick={() => {
                        addMessage('user', "I accept")
                        setQualificationsAccepted(true)
                        setTimeout(() => {
                          addMessage('holly', "Perfect! Your reservation is confirmed!")
                        }, 1000)
                      }}
                      className="px-10 py-6 text-lg font-semibold bg-[#1C4B34] hover:bg-[#1C4B34]/90 text-white rounded-xl"
                    >
                      Accept
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        addMessage('user', "I decline")
                        setTimeout(() => {
                          addMessage('holly', "I understand. Your reservation has been canceled. Thank you for your interest in Holiday Inn Club Vacations!")
                        }, 1000)
                      }}
                      className="px-10 py-6 text-lg font-semibold border-2 border-[#D0B7A1] text-[#46403F] hover:bg-[#F2F1E9] rounded-xl"
                    >
                      Decline
                    </Button>
                  </div>

                  {/* Voice Hint */}
                  <div className="text-center">
                    <p className="text-xs text-[#46403F]/60">
                      Say "I accept" or "I decline" or tap to select
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )
        } else {
          // STATE 2: Confirmation Screen
          return (
            <div className="h-full flex flex-col">
              <Card className="h-full flex flex-col justify-center bg-gradient-to-br from-[#9BC5B7]/10 via-white to-[#F2F1E9] border-2 border-[#9BC5B7]/30 relative overflow-hidden">
                {/* Animated Background Elements - Brand Colors */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#F3B54A]/20 rounded-full opacity-20 animate-pulse" />
                  <div className="absolute top-20 -right-10 w-32 h-32 bg-[#5FA6A6]/20 rounded-full opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
                  <div className="absolute bottom-10 left-20 w-24 h-24 bg-[#1C4B34]/20 rounded-full opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
                  <div className="absolute -bottom-10 right-20 w-36 h-36 bg-[#FF9B75]/20 rounded-full opacity-20 animate-pulse" style={{ animationDelay: "1.5s" }} />
                </div>

                <div className="relative z-10 text-center p-8">
                  {/* Success Icon with Animation - Legacy Green */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-[#1C4B34] flex items-center justify-center mx-auto animate-bounce shadow-lg">
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {/* Sparkle Effects */}
                    <div className="absolute top-0 right-0 text-2xl animate-ping">✨</div>
                    <div className="absolute bottom-0 left-0 text-2xl animate-ping" style={{ animationDelay: "0.5s" }}>🌟</div>
                    <div className="absolute top-2 left-2 text-xl animate-ping" style={{ animationDelay: "1s" }}>⭐</div>
                  </div>

                  <h2 className="text-4xl font-bold bg-gradient-to-r from-[#1C4B34] to-[#5FA6A6] bg-clip-text text-transparent mb-3">
                    Woohoo! You're All Set! 🎉
                  </h2>
                  <p className="text-lg text-[#46403F]/70 mb-8">Your dream vacation is booked!</p>

                  {/* Savings Highlight - Golden Sunset to Citrus Sunrise */}
                  <div className="bg-gradient-to-r from-[#F3B54A] to-[#F76B3C] text-white rounded-2xl p-4 mb-6 shadow-lg transform rotate-1 hover:rotate-0 transition-transform">
                    <p className="text-sm font-medium mb-1">YOU'RE SAVING</p>
                    <p className="text-3xl font-bold">$100</p>
                    <p className="text-xs">Cash back after tour!</p>
                  </div>

                  {/* Booking Details */}
                  <div className="bg-white/80 backdrop-blur rounded-xl p-6 space-y-4 mb-6 shadow-md">
                    <div className="flex items-center justify-between border-b pb-3">
                      <span className="text-sm text-[#46403F]/60">📅 Dates</span>
                      <span className="font-semibold text-[#46403F]">
                        {bookingState.checkInDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -
                        {" "}{bookingState.checkOutDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <span className="text-sm text-[#46403F]/60">🕐 Tour</span>
                      <span className="font-semibold text-[#46403F]">{bookingState.tourTime?.split(" at ")[1]?.split(" ")[0]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#46403F]/60">👥 Guests</span>
                      <span className="font-semibold text-[#46403F]">{bookingState.guestCount} people</span>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="space-y-3">
                    <p className="text-sm text-[#46403F]/70">
                      📧 Check your email for confirmation details!
                    </p>
                    {!isMobile && (
                      <div className="text-center">
                        <button className="px-6 py-3 bg-white text-[#46403F] rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border border-[#D0B7A1]">
                          Share With Friends
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )
        }

      default:
        return null
    }
  }

  // DESKTOP LAYOUT (unchanged)
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <HorizontalStepper bookingState={bookingState} />

        {/* Demo Mode Hint */}
        {!isVoiceActive && (
          <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
            Press <kbd className="px-2 py-0.5 bg-white/20 rounded mx-1">Enter</kbd> to progress through demo
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 pt-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Dynamic Visual Display (2/3 width) */}
              <div className="lg:col-span-2 h-[calc(100vh-160px)] overflow-hidden">
                <div className="h-full overflow-y-auto">
                  {renderCurrentStepComponent()}
                </div>
              </div>

              {/* Right Panel - Conversation (1/3 width) */}
              <div className="lg:col-span-1 h-[calc(100vh-160px)]">
                <ConversationWithHolly
                  messages={messages}
                  isVoiceActive={isVoiceActive}
                  onToggleVoice={toggleVoice}
                  onVoiceInput={handleVoiceInput}
                  isProcessing={isProcessing}
                  currentTranscript={currentTranscript}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // MOBILE LAYOUT (new)
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <HorizontalStepper bookingState={bookingState} isMobile={isMobile} />

      {/* Mobile Content - Full Width */}
      <div className="flex-1 min-h-0 flex flex-col">
        {!isVoiceActive && bookingState.currentStep === 'active-package' ? (
          // Show both package overview and microphone UI stacked vertically without scroll
          <div className="flex-1 flex flex-col p-3 gap-3">
            <div className="flex-shrink-0">
              {renderCurrentStepComponent()}
            </div>
            <div className="flex-shrink-0">
              <ConversationWithHolly
                messages={messages}
                isVoiceActive={isVoiceActive}
                onToggleVoice={toggleVoice}
                onVoiceInput={handleVoiceInput}
                isProcessing={isProcessing}
                currentTranscript={currentTranscript}
                isMobile={false} // Force full UI mode for card display
              />
            </div>
          </div>
        ) : (
          // Show regular step content with padding
          <div className="px-4 py-4 pb-24 overflow-y-auto">
            {renderCurrentStepComponent()}
          </div>
        )}
      </div>

      {/* Mobile Conversation - Only show after voice activation */}
      {isVoiceActive || bookingState.currentStep !== 'active-package' ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
          <ConversationWithHolly
            messages={messages}
            isVoiceActive={isVoiceActive}
            onToggleVoice={toggleVoice}
            onVoiceInput={handleVoiceInput}
            isProcessing={isProcessing}
            currentTranscript={currentTranscript}
            isMobile={isMobile}
          />
        </div>
      ) : null}
    </div>
  )
}