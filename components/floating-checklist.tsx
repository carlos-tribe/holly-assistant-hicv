"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Package, MapPin, Users, Calendar, Clock, CreditCard } from "lucide-react"
import type { BookingStep } from "./holly-assistant"

interface FloatingChecklistProps {
  currentStep: BookingStep
  completedSteps: BookingStep[]
  packageConfirmed: boolean
}

const checklistItems = [
  {
    id: "active-package" as BookingStep,
    label: "Active Package",
    description: "Package confirmed",
    icon: Package,
  },
  {
    id: "verify-details" as BookingStep,
    label: "Verify Details",
    description: "Zip code + guest count",
    icon: Users,
  },
  {
    id: "choose-dates" as BookingStep,
    label: "Choose Dates",
    description: "Pick travel dates",
    icon: Calendar,
  },
  {
    id: "schedule-tour" as BookingStep,
    label: "Schedule Tour",
    description: "Time slot picker",
    icon: Clock,
  },
  {
    id: "final-booking" as BookingStep,
    label: "Final Booking",
    description: "Confirmation & summary",
    icon: CreditCard,
  },
]

export function FloatingChecklist({ currentStep, completedSteps, packageConfirmed }: FloatingChecklistProps) {
  const getStepStatus = (stepId: BookingStep) => {
    if (stepId === "active-package" && packageConfirmed) return "completed"
    if (completedSteps.includes(stepId)) return "completed"
    if (stepId === currentStep) return "current"
    return "pending"
  }

  const getStepNumber = (index: number) => {
    const status = getStepStatus(checklistItems[index].id)
    if (status === "completed") return <Check className="w-3 h-3" />
    return index + 1
  }

  return (
    <div className="fixed top-6 right-6 z-50">
      <Card className="w-80 p-4 shadow-lg border-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Booking Progress</h3>
          <Badge variant="outline" className="text-xs">
            {completedSteps.length + (packageConfirmed ? 1 : 0)}/5 Complete
          </Badge>
        </div>

        <div className="space-y-3">
          {checklistItems.map((item, index) => {
            const status = getStepStatus(item.id)
            const Icon = item.icon

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  status === "current"
                    ? "bg-primary/10 border border-primary/20"
                    : status === "completed"
                      ? "bg-muted/30"
                      : "opacity-60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    status === "completed"
                      ? "bg-primary text-primary-foreground"
                      : status === "current"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getStepNumber(index)}
                </div>

                <Icon
                  className={`w-4 h-4 ${
                    status === "completed" || status === "current" ? "text-primary" : "text-muted-foreground"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      status === "completed" || status === "current" ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>

                {status === "completed" && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(((completedSteps.length + (packageConfirmed ? 1 : 0)) / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{
                width: `${((completedSteps.length + (packageConfirmed ? 1 : 0)) / 5) * 100}%`,
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
