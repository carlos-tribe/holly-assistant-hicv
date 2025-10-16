"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Check, Mic } from "lucide-react"
import type { BookingState } from "./holly-assistant"
import { getFlexibleDatesForDestination, type FlexibleDateOption } from "@/lib/availability-data"
import { useIsMobile } from "@/components/ui/use-mobile"

interface FlexibleDatesStepProps {
  bookingState: BookingState
  highlightedOptionId?: string | null
}

export function FlexibleDatesStep({ bookingState, highlightedOptionId }: FlexibleDatesStepProps) {
  const isMobile = useIsMobile()
  const destinationId = bookingState.selectedDestination || 'orlando'
  const flexibleOptions = getFlexibleDatesForDestination(destinationId)

  const selectedOptionId = bookingState.selectedFlexibleOption

  if (flexibleOptions.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <Card className="p-6 h-full flex items-center justify-center">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium text-muted-foreground">
              No flexible date options available for this destination yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please try the fixed dates option instead.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {bookingState.destinationPreference === 'explore' ? '4' : '3'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Choose Your Dates</h3>
            <p className="text-sm text-muted-foreground">
              {flexibleOptions.length} available options for your vacation
            </p>
          </div>
        </div>

        {/* Date Options List */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
          {flexibleOptions.map((option, index) => {
            const isSelected = selectedOptionId === option.id
            const isHighlighted = highlightedOptionId === option.id

            return (
              <div
                key={option.id}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : isHighlighted
                    ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-400/30'
                    : 'border-border bg-white hover:border-primary/30'
                }`}
              >
                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}

                {/* Option Number */}
                <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="mt-8">
                  {/* Label */}
                  <h4 className="text-base font-bold text-foreground mb-3">
                    {option.label}
                  </h4>

                  {/* Dates */}
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {option.checkIn.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-sm text-muted-foreground">→</span>
                      <span className="text-sm font-medium text-foreground">
                        {option.checkOut.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Nights */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {option.nights} {option.nights === 1 ? 'night' : 'nights'}
                    </Badge>
                  </div>

                  {/* Property */}
                  <div className="flex items-start gap-2 mb-3 p-2 bg-muted/30 rounded-lg">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Accommodation</p>
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {option.propertyName}
                      </p>
                    </div>
                  </div>

                  {/* Price Indicator */}
                  <div className="flex items-center justify-between">
                    <Badge
                      className={`${
                        option.priceIndicator === 'value'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : option.priceIndicator === 'peak'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                    >
                      {option.priceIndicator === 'value' && '💰 Great Value'}
                      {option.priceIndicator === 'peak' && '⭐ Peak Season'}
                      {option.priceIndicator === 'standard' && '📅 Standard Pricing'}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Voice Guidance */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Mic className="w-4 h-4 text-primary mt-0.5" />
            <div className="flex-1">
              {selectedOptionId ? (
                <>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Your dates are locked in!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Holly will guide you to schedule your tour
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Tell Holly which option you'd like
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try saying "first option", "the November one", or ask Holly about any option
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
