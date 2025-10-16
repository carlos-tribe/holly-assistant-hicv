"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Check, Calendar as CalendarIcon } from "lucide-react"
import type { BookingState } from "./holly-assistant"
import { getDestinationById } from "@/lib/destinations-data"
import { destinationAvailability, getAvailabilityDisplay } from "@/lib/availability-data"
import { useIsMobile } from "@/components/ui/use-mobile"

interface PreferencesStepProps {
  bookingState: BookingState
  onPreferenceSelect?: (message: string) => void
}

export function PreferencesStep({ bookingState, onPreferenceSelect }: PreferencesStepProps) {
  const isMobile = useIsMobile()
  const currentDestination = bookingState.selectedDestination
    ? getDestinationById(bookingState.selectedDestination)
    : null

  const destinationAvail = bookingState.selectedDestination
    ? destinationAvailability[bookingState.selectedDestination]
    : null

  const hasDestinationChoice = bookingState.destinationPreference !== null
  const hasDateFlexibilityChoice = bookingState.dateFlexibility !== null

  return (
    <div className="h-full flex flex-col">
      <Card className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            2
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Tell Holly Your Preferences</h3>
            <p className="text-sm text-muted-foreground">
              This helps us find the perfect vacation for you
            </p>
          </div>
        </div>

        {/* Two-section layout */}
        <div className={`flex-1 flex ${isMobile ? 'flex-col' : 'flex-col lg:grid lg:grid-cols-2'} gap-6`}>

          {/* Section 1: Destination Preference */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h4 className="text-base font-semibold text-foreground">Destination</h4>
            </div>

            <div className="flex-1 grid gap-3">
              {/* Keep Current Destination */}
              <button
                onClick={() => onPreferenceSelect?.(`Keep ${currentDestination?.name || 'current destination'}`)}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  bookingState.destinationPreference === 'keep'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 bg-white'
                }`}
              >
                {bookingState.destinationPreference === 'keep' && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">
                      Keep {currentDestination?.name || 'Current Destination'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {currentDestination?.tagline}
                    </p>

                    {/* Availability Preview */}
                    {destinationAvail && (
                      <div className="grid grid-cols-4 gap-1">
                        {(['sep', 'oct', 'nov', 'dec'] as const).map((month) => {
                          const avail = getAvailabilityDisplay(destinationAvail[month])
                          return (
                            <div key={month} className="text-center">
                              <div className="text-[10px] font-medium text-muted-foreground mb-1 uppercase">
                                {month}
                              </div>
                              <Badge
                                className={`text-[10px] px-1 py-0.5 ${
                                  avail.color === 'green'
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : avail.color === 'amber'
                                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                                    : avail.color === 'red'
                                    ? 'bg-red-100 text-red-700 border-red-200'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}
                              >
                                {avail.label}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Explore Other Destinations */}
              <button
                onClick={() => onPreferenceSelect?.('Explore other destinations')}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  bookingState.destinationPreference === 'explore'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 bg-white'
                }`}
              >
                {bookingState.destinationPreference === 'explore' && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Explore Other Destinations
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Browse 11 amazing destinations across the country
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Date Flexibility */}
          <div className={`flex flex-col ${!hasDestinationChoice && 'opacity-50 pointer-events-none'}`}>
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h4 className="text-base font-semibold text-foreground">Travel Dates</h4>
              {!hasDestinationChoice && (
                <Badge variant="secondary" className="text-xs">Choose destination first</Badge>
              )}
            </div>

            <div className="flex-1 grid gap-3">
              {/* Fixed Dates */}
              <button
                onClick={() => onPreferenceSelect?.('I have fixed dates')}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  bookingState.dateFlexibility === 'fixed'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 bg-white'
                }`}
                disabled={!hasDestinationChoice}
              >
                {bookingState.dateFlexibility === 'fixed' && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    I Have Fixed Dates
                  </p>
                  <p className="text-sm text-muted-foreground">
                    I know exactly when I want to travel
                  </p>
                </div>
              </button>

              {/* Flexible Dates */}
              <button
                onClick={() => onPreferenceSelect?.("I'm flexible")}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  bookingState.dateFlexibility === 'flexible'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 bg-white'
                }`}
                disabled={!hasDestinationChoice}
              >
                {bookingState.dateFlexibility === 'flexible' && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    I'm Flexible With Dates
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Show me available options that work best
                  </p>
                  <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                    Often better availability
                  </Badge>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {hasDestinationChoice && hasDateFlexibilityChoice && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <p className="text-sm font-medium text-green-900">
                Preferences set! Holly will guide you to the next step.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
