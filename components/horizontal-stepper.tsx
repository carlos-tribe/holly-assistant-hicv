"use client"

import type { BookingStep, BookingState } from "./holly-assistant"
import { Package, UserCheck, MapPin, Calendar, Clock, CheckCircle, Check, Plane, ClipboardCheck } from "lucide-react"
import { useMemo } from "react"

interface HorizontalStepperProps {
  bookingState: BookingState
  isMobile?: boolean
}

export function HorizontalStepper({ bookingState, isMobile = false }: HorizontalStepperProps) {
  // Generate steps - always show all steps
  const steps = useMemo(() => {
    const stepsList: Array<{ id: BookingStep; title: string; icon: any }> = [
      {
        id: "active-package" as BookingStep,
        title: "Package",
        icon: Package,
      },
      {
        id: "verify-details" as BookingStep,
        title: "Details",
        icon: UserCheck,
      },
      {
        id: "destination-choice" as BookingStep,
        title: "Destination",
        icon: MapPin,
      },
      {
        id: "select-destination" as BookingStep,
        title: "Explore",
        icon: Plane,
      },
    ]

    // Determine which date step to show based on preference
    if (bookingState.dateFlexibility === 'flexible') {
      stepsList.push({
        id: "choose-flexible-dates" as BookingStep,
        title: "Dates",
        icon: Calendar,
      })
    } else {
      // Default to fixed dates step
      stepsList.push({
        id: "choose-dates" as BookingStep,
        title: "Dates",
        icon: Calendar,
      })
    }

    // Always add tour and confirmation steps
    stepsList.push(
      {
        id: "schedule-tour" as BookingStep,
        title: "Tour",
        icon: Clock,
      },
      {
        id: "final-booking" as BookingStep,
        title: "Confirm",
        icon: CheckCircle,
      }
    )

    return stepsList
  }, [bookingState.dateFlexibility])

  const getStepStatus = (stepId: BookingStep) => {
    if (bookingState.completedSteps.includes(stepId)) return "completed"
    if (bookingState.currentStep === stepId) return "active"
    return "inactive"
  }

  const currentStepIndex = steps.findIndex(s => s.id === bookingState.currentStep)
  const progressPercentage = currentStepIndex === -1 ? 0 : ((currentStepIndex + 1) / steps.length) * 100

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className={`container mx-auto ${isMobile ? 'px-2 py-1.5' : 'px-4 py-3'}`}>
        {/* Minimal Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-border/50">
            <div
              className="h-full bg-[#F76B3C] transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Step Items */}
          <div className="flex justify-between relative">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id)
              const Icon = step.icon
              const isCompleted = status === "completed"
              const isActive = status === "active"

              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={`
                      ${isMobile ? 'w-7 h-7' : 'w-8 h-8'} rounded-full flex items-center justify-center transition-all duration-300 z-10 relative
                      ${
                        isCompleted
                          ? "bg-[#1C4B34] text-white"
                          : isActive
                            ? "bg-[#F76B3C] text-white ring-4 ring-[#F76B3C]/20"
                            : "bg-white border-2 border-border text-muted-foreground"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className={isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                    ) : (
                      <Icon className={isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                    )}
                  </div>

                  {/* Step Label - Keep visible on mobile as requested */}
                  <span
                    className={`
                      ${isMobile ? 'text-[10px]' : 'text-xs'} font-medium ${isMobile ? 'mt-1' : 'mt-1.5'} transition-all
                      ${
                        isActive
                          ? "text-[#F76B3C]"
                          : isCompleted
                            ? "text-[#1C4B34]"
                            : "text-muted-foreground/70"
                      }
                    `}
                  >
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}