"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import type { BookingState } from "./holly-assistant"
import { getDestinationById } from "@/lib/destinations-data"
import { destinationAvailability, getAvailabilityDisplay } from "@/lib/availability-data"

interface DestinationChoiceStepProps {
  bookingState: BookingState
  onChoice: (choice: 'keep' | 'explore') => void
}

export function DestinationChoiceStep({ bookingState, onChoice }: DestinationChoiceStepProps) {
  const orlando = getDestinationById('orlando')
  const orlandoAvail = destinationAvailability['orlando']

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Destination</h2>
        <p className="text-sm text-muted-foreground">Keep your package destination or explore other options</p>
      </div>

      {/* Two Cards */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Card 1: Keep Orlando */}
        <button
          onClick={() => onChoice('keep')}
          className="relative overflow-hidden rounded-2xl border-2 border-border hover:border-primary transition-all bg-gradient-to-br from-[#F76B3C] to-[#FF9B75] text-white p-6 flex flex-col items-center justify-center"
        >
          <MapPin className="w-12 h-12 mb-3" />
          <h3 className="text-3xl font-bold mb-2">{orlando?.name}</h3>
          <p className="text-base mb-4 opacity-90">{orlando?.tagline}</p>

          {/* Availability Preview */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 border border-white/20 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium">Next 4 Months</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['sep', 'oct', 'nov', 'dec'] as const).map((month) => {
                const avail = getAvailabilityDisplay(orlandoAvail[month])
                return (
                  <div key={month} className="text-center">
                    <div className="text-[10px] font-medium mb-1.5 uppercase">{month}</div>
                    <Badge className={`text-[10px] ${avail.color === 'green' ? 'bg-green-500' : avail.color === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}>
                      {avail.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="px-6 py-3 bg-white text-primary rounded-full font-bold text-base">
            Keep Orlando
          </div>
        </button>

        {/* Card 2: Explore Other Destinations */}
        <button
          onClick={() => onChoice('explore')}
          className="relative overflow-hidden rounded-2xl border-2 border-border hover:border-primary transition-all bg-gradient-to-br from-[#5FA6A6] to-[#9BC5B7] text-white p-6 flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 mb-3 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-2xl">🌎</span>
          </div>
          <h3 className="text-3xl font-bold mb-2">Explore Destinations</h3>
          <p className="text-base mb-4 opacity-90">Browse 11 amazing vacation spots</p>

          {/* Preview thumbnails */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['Las Vegas', 'Cocoa Beach', 'New Orleans'].map((dest) => (
              <div key={dest} className="bg-white/10 backdrop-blur-md rounded-lg px-2 py-1.5 text-[10px]">
                {dest}
              </div>
            ))}
          </div>

          <div className="px-6 py-3 bg-white text-[#5FA6A6] rounded-full font-bold text-base">
            Explore Destinations
          </div>
        </button>
      </div>
    </div>
  )
}
