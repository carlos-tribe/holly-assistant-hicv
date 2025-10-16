"use client"

import { TrendingUp, Calendar, Loader, MapPin, Wifi, Coffee, Waves, UtensilsCrossed, Clock } from "lucide-react"
import type { BookingState } from "./holly-assistant"
import { useIsMobile } from "@/components/ui/use-mobile"
import type { DateRangeOption } from "@/lib/date-ranges-generator"
import { getAvailableMonths } from "@/lib/date-ranges-generator"

interface DateSelectionStepProps {
  bookingState: BookingState
  highlightedDateRangeId?: string | null
}

export function DateSelectionStep({ bookingState, highlightedDateRangeId }: DateSelectionStepProps) {
  const isMobile = useIsMobile()
  const availableMonths = getAvailableMonths()

  const questions = [
    {
      id: 'activities',
      question: 'What activities are you interested in?',
    },
    {
      id: 'amenities',
      question: 'What amenities are most important to you?',
    },
    {
      id: 'vibe',
      question: 'What kind of vibe are you looking for?',
    }
  ]

  // Property matching phases (after date selection)
  const propertyMatchingStep = bookingState.propertyMatchingStep
  const showPropertyQuestions = propertyMatchingStep >= 0 && propertyMatchingStep <= 2
  const showPropertyThinking = propertyMatchingStep === 3
  const showPropertyResult = propertyMatchingStep === 4

  // Check if we should show property matching (dates are selected)
  const showPropertyMatching = bookingState.checkInDate && bookingState.checkOutDate && !bookingState.propertyMatchingComplete

  // Phase 1: Date Narrowing (show month selection or flexibility options)
  if (!bookingState.dateNarrowingComplete) {
    return (
      <div className="h-full bg-white p-6 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto space-y-6">

          {/* Trip duration info */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left tile - Number of nights */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="text-sm text-gray-500">Trip length</div>
              <div className="text-lg font-semibold text-gray-900">4 days, 3 nights</div>
              <div className="text-sm text-gray-600 mt-1">Package valid through 7/15/2026</div>
            </div>

            {/* Right tile - Room type */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-gray-500">Accomodation</div>
              <div className="text-md font-semibold text-gray-900">Best available of 1 or 2 bedrooms included</div>
            </div>
          </div>

          {/* Active question */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg">
            <div className="text-orange-100 text-sm mb-2">Currently asking</div>
            <div className="text-white text-lg font-medium mb-6">
              When would you like to travel?
            </div>

            <div className="text-white/80 text-sm mb-3">Select a month to see available dates</div>
            <div className="grid grid-cols-2 gap-2">
              {availableMonths.map((month) => (
                <button
                  key={month.id}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-xl p-4 text-left transition-all"
                >
                  <div className="font-semibold">{month.name}</div>
                  <div className="text-sm text-white/80">{month.year}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice hint */}
          <div className="text-center text-sm text-gray-500">
            Say a month or tap to select
          </div>
        </div>
      </div>
    )
  }

  // Phase 2: Date Range Selection (show available date range options)
  const dateRanges = bookingState.dateRangeOptions as DateRangeOption[]
  const hasMoreDates = bookingState.dateRangePageIndex > 0 || dateRanges.length >= 5

  // If showing property matching, render that instead
  if (showPropertyMatching) {
    const currentQuestion = questions[propertyMatchingStep]

    return (
      <div className="h-full bg-white p-6 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto space-y-6">

          {/* Confirmed dates - minified */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {bookingState.checkInDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -
                    {" "}{bookingState.checkOutDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <div className="text-xs text-gray-500">4 days, 3 nights</div>
                </div>
              </div>
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Questions phase */}
          {showPropertyQuestions && currentQuestion && (
            <div className="relative">
              <div className="absolute inset-0 bg-orange-400 rounded-2xl animate-pulse opacity-75"></div>
              <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 shadow-lg m-1">
                <div className="text-center mb-6">
                  <div className="text-orange-100 text-sm mb-2">Question {propertyMatchingStep + 1} of 3</div>
                  <div className="text-white text-xl font-medium">
                    {currentQuestion.question}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="text-white/80 text-sm">
                    Press Enter to answer
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thinking phase */}
          {showPropertyThinking && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader className="w-8 h-8 text-orange-600 animate-spin" />
                </div>
                <div className="text-gray-900 text-lg font-medium mb-2">
                  Finding your perfect match
                </div>
                <div className="text-gray-600 text-sm">
                  Looking through available properties...
                </div>
              </div>
            </div>
          )}

          {/* Result phase */}
          {showPropertyResult && (
            <div className="space-y-4">
              {/* Property card */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                {/* Property details */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {bookingState.matchedPropertyName || 'Holiday Inn Express® & Suites Cocoa Beach'}
                    </h3>
                    <div className="flex items-start gap-2 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>5600 N Atlantic Ave, Cocoa Beach, FL 32931</span>
                    </div>
                  </div>

                  {/* Check-in/out times */}
                  <div className="flex items-center gap-6 py-3 border-y border-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Check-in</div>
                        <div className="text-sm font-semibold text-gray-900">4:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Check-out</div>
                        <div className="text-sm font-semibold text-gray-900">11:00 AM</div>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div>
                      <div className="text-xs text-gray-500">Room type</div>
                      <div className="text-sm font-semibold text-gray-900">2 Bedroom Suite</div>
                    </div>
                  </div>

                  {/* Key amenities */}
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-3">Amenities</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Waves className="w-4 h-4 text-blue-600" />
                        </div>
                        <span>Pool & Beach</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                          <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                        </div>
                        <span>Free Breakfast</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Wifi className="w-4 h-4 text-purple-600" />
                        </div>
                        <span>Free Wi-Fi</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                          <Coffee className="w-4 h-4 text-green-600" />
                        </div>
                        <span>Kitchenette</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Voice hint */}
          <div className="text-center text-sm text-gray-500">
            {showPropertyQuestions && 'Listening for your response...'}
            {showPropertyResult && 'Say "confirm" or press Enter to continue'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white p-6 flex flex-col justify-center">
      <div className="w-full max-w-md mx-auto space-y-6">

        {/* Trip duration info */}
        <div className="grid grid-cols-2 gap-3">
          {/* Left tile - Number of nights */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Trip length</div>
            <div className="text-base font-semibold text-gray-900">4 days, 3 nights</div>
          </div>

          {/* Right tile - Room type */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Accomodation</div>
            <div className="text-md font-semibold text-gray-900">Best available of 1 or 2 bedrooms</div>
          </div>
        </div>

        {/* Active question */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 shadow-lg">
          <div className="text-orange-100 text-xs mb-1">Currently asking</div>
          <div className="text-white text-base font-medium mb-3">
            {bookingState.preferredMonth
              ? `Pick your travel dates in ${bookingState.preferredMonth}`
              : 'Pick your travel dates'
            }
          </div>
          <div className="text-white/80 text-sm">
            Showing {dateRanges.length} available options
          </div>
        </div>

        {/* Available date ranges */}
        {dateRanges.length > 0 ? (
          <div className="space-y-2">
            {dateRanges.slice(0, 4).map((range) => (
              <button
                key={range.id}
                className={`w-full bg-white rounded-xl p-3 shadow-sm border-2 transition-all text-left ${
                  highlightedDateRangeId === range.id
                    ? 'border-orange-500 shadow-md ring-2 ring-orange-200'
                    : bookingState.checkInDate?.getTime() === range.checkInDate.getTime()
                    ? 'border-orange-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Start date */}
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Check in</div>
                      <div className="font-semibold text-gray-900 text-sm">{range.checkInFormatted}</div>
                      <div className="text-xs text-gray-600">{range.checkInDay}</div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400">→</div>

                    {/* End date */}
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Check out</div>
                      <div className="font-semibold text-gray-900 text-sm">{range.checkOutFormatted}</div>
                      <div className="text-xs text-gray-600">{range.checkOutDay}</div>
                    </div>
                  </div>

                  {/* Peak indicator */}
                  {range.isPeak && (
                    <div className="flex items-center gap-1 text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded">
                      <TrendingUp className="w-3 h-3" />
                      Peak
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center text-gray-500">
            <p className="text-sm">No dates available for your selection.</p>
            <p className="text-xs mt-2">Try a different month or preference.</p>
          </div>
        )}

        {/* Show more options hint */}
        {hasMoreDates && (
          <div className="text-center">
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              Show more dates
            </button>
          </div>
        )}

        {/* Voice hint */}
        <div className="text-center text-sm text-gray-500">
          Say a date or tap to select
        </div>
      </div>
    </div>
  )
}
