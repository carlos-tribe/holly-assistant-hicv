"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react"
import type { BookingState } from "./holly-assistant"
import { useIsMobile } from "@/components/ui/use-mobile"

interface TourSchedulerStepProps {
  bookingState: BookingState
  highlightedTimeSlot?: string | null
}

const alternativeTimes = [
  { date: "11/8", time: "9:00 AM", label: "Available" },
  { date: "11/8", time: "3:00 PM", label: "Available" },
  { date: "11/8", time: "6:00 PM", label: "Available" },
  { date: "11/9", time: "9:00 AM", label: "Available" },
  { date: "11/9", time: "3:00 PM", label: "Available" },
  { date: "11/9", time: "6:00 PM", label: "Available" }
]

export function TourSchedulerStep({ bookingState, highlightedTimeSlot }: TourSchedulerStepProps) {
  const isMobile = useIsMobile()

  // Calculate the first available tour day (skip arrival day)
  const getFirstAvailableTourDay = () => {
    if (!bookingState.checkInDate) return null

    const tourDate = new Date(bookingState.checkInDate)
    tourDate.setDate(tourDate.getDate() + 1) // Day 2 (skip arrival day)
    return tourDate
  }

  const tourDate = getFirstAvailableTourDay()

  // Extract selected time from tourTime string
  const getSelectedTime = () => {
    if (!bookingState.tourTime) return "12:00 PM"

    const match = bookingState.tourTime.match(/(\d{1,2}:\d{2} [AP]M)/)
    return match ? match[1] : "12:00 PM"
  }

  const selectedTime = getSelectedTime()
  const isHighlighted = (time: string) => highlightedTimeSlot === time

  return (
    <div className="h-full flex flex-col">
      <Card className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            5
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Schedule Your Tour</h3>
          </div>
        </div>

        {/* Important Notice */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-blue-900">
          <p className="text-blue-700 "><span className="font-bold">Presentation Location:</span><br></br>8701 Astronaut Blvd, Cape Canaveral, FL 32920</p>
            <p className="font-bold mt-1.5">2-hour tour required for $100 bonus</p>
            <p className="text-blue-700 italic text-xs mt-0.5">Tours can be easily rescheduled once you arrive</p>
          </div>
        </div>

        {/* Pre-selected Tour Card */}
        <div className="p-4 rounded-xl border-2 shadow-sm mb-4 transition-all border-green-500 bg-green-50/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500 text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-foreground mb-1">Your tour has been prescheduled</h4>
              <div className="flex flex-wrap items-center gap-2 text-sm text-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">11/8/25</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <span>•</span>
                <span>2 hours</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Saturday, November 8, 2025
              </p>
              {selectedTime === "12:00 PM" && (
                <p className="text-xs text-muted-foreground italic">
                  This is our most popular tour time - you'll have the morning to explore and plenty of time to enjoy the resort afterward
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Alternative Times */}
        <div className="flex-1">
          <h5 className="text-xs font-medium text-muted-foreground mb-2">Other available times</h5>
          <div className={isMobile ? 'space-y-1' : 'space-y-1.5'}>
            {alternativeTimes
              .filter(slot => !(slot.date === "11/8" && slot.time === selectedTime))
              .map((slot, index) => (
                <div
                  key={`${slot.date}-${slot.time}`}
                  className={`flex items-center justify-between ${isMobile ? 'p-1.5' : 'p-2'} rounded-lg transition-all ${
                    isHighlighted(slot.time) && slot.date === "11/8"
                      ? "bg-yellow-100 border border-yellow-300"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className={`${isMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-muted-foreground`} />
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{slot.date} - {slot.time}</span>
                  </div>
                  <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>{slot.label}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Tour Confirmation Status */}
        <div className="mt-4 p-3 bg-muted/20 rounded-lg border border-muted">
          <p className="text-xs text-muted-foreground text-center">
            Say "Can we do [time] instead?" to change your tour time
          </p>
        </div>
      </Card>
    </div>
  )
}
