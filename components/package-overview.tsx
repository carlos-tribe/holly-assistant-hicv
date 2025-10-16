"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Gift,
  MapPin,
  Users,
  Calendar,
  Clock,
  Star,
  Wifi,
  Car,
  Utensils,
  Waves,
  TreePine,
  Dumbbell,
} from "lucide-react"

interface PackageOverviewProps {
  packageConfirmed: boolean
}

export function PackageOverview({ packageConfirmed }: PackageOverviewProps) {
  if (!packageConfirmed) return null

  return (
    <Card className="mb-0 py-0 overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-32 w-full">
        <img
          src="/luxury-oceanview-resort-with-palm-trees-and-beach.jpg"
          alt="Luxury beach resort with palm trees"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-[#46403F] mb-2">Orlando Hotel Vacation Package</h3>
        </div>

        {/* Gift Card Incentive */}
        <div className="bg-gradient-to-r from-[#F76B3C]/10 to-[#F76B3C]/5 rounded-xl p-4 mb-4 border-2 border-[#F76B3C]/20">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h4 className="text-md font-semibold text-[#46403F] mb-2">Exclusive Bonus Included</h4>
              <p className="text-base text-[#46403F] mb-2">
                <span className="font-bold text-[#F76B3C] text-xl">$100 cash back</span> after attending a timeshare presentation
              </p>
              <div className="flex items-center gap-2 text-sm text-[#46403F]/60">
                <Clock className="w-4 h-4" />
                <span>2-hour presentation required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Package Details */}
        <div className="space-y-3">
          <h4 className="text-xl font-semibold text-[#46403F] mb-4">Package Details</h4>

          <div className="grid grid-cols-2 gap-6 pb-4">
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-[#F76B3C] flex-shrink-0 mt-1" />
              <div>
                <p className="text-base font-semibold text-[#46403F]">4 days / 3 nights</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Users className="w-6 h-6 text-[#F76B3C] flex-shrink-0 mt-1" />
              <div>
                <p className="text-base font-semibold text-[#46403F]">Up to 4 guests</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
