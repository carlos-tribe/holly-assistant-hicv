"use client"

import { MapPin, Users } from "lucide-react"
import type { BookingState } from "./holly-assistant"

interface VerifyDetailsStepProps {
  bookingState: BookingState
}

export function VerifyDetailsStep({ bookingState }: VerifyDetailsStepProps) {

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pt-8">

        {/* Confirmed info - Zip Code with subdued styling (display-only) */}
        <div className="bg-white border border-[#D0B7A1]/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-[#F2F1E9] rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#46403F]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-medium text-[#46403F]">
                Is the zip code on file correct?
              </div>
            </div>
          </div>
          
          <div className="text-center pt-4 border-t border-[#D0B7A1]/20">
            <div className="text-2xl font-semibold text-[#46403F]">{bookingState.zipCode}</div>
          </div>
        </div>

        {/* Active question - Guest Count with highlighted styling (display-only) */}
        <div className="bg-white border border-[#D0B7A1]/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-[#F2F1E9] rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-[#46403F]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-medium text-[#46403F]">
                How many guests will be traveling?
              </div>
            </div>
          </div>
          
          <div className="text-center pt-4 border-t border-[#D0B7A1]/20">
            <div className="text-2xl font-semibold text-[#46403F]">
              {bookingState.guestCount} {bookingState.guestCount === 1 ? 'guest' : 'guests'}
            </div>
          </div>
        </div>

        {/* Phone number note for 5+ guests */}
        <div className="text-center text-sm text-[#46403F]/60 mt-4">
          Need more than 4 guests? Call <a href="tel:8882626504" className="font-semibold text-[#46403F] hover:underline">(888) 262-6504</a>
        </div>

        {/* Voice hint */}
        <div className="text-center text-sm text-[#46403F]/50 mt-2">
          Speak in natural language to confirm zip code and number of guests
        </div>

    </div>
  )
}