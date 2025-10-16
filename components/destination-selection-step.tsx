"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Info } from "lucide-react"
import type { BookingState } from "./holly-assistant"
import { destinations, getDestinationById } from "@/lib/destinations-data"
import { destinationAvailability, getAvailabilityDisplay } from "@/lib/availability-data"

interface DestinationSelectionStepProps {
  bookingState: BookingState
  currentlyDiscussedDestination?: string | null
  suggestedDestinations?: string[]
  explorationMode?: boolean
  onExplorationModeChange?: (enabled: boolean) => void
  showDestinationDetails?: boolean
}

export function DestinationSelectionStep({
  bookingState,
  currentlyDiscussedDestination,
  suggestedDestinations = [],
  explorationMode = false,
  onExplorationModeChange,
  showDestinationDetails = false
}: DestinationSelectionStepProps) {
  const preferredDestinationId = bookingState.selectedDestination || 'orlando'
  const preferredDestination = getDestinationById(preferredDestinationId)

  // Exploration mode state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDetailOverlay, setShowDetailOverlay] = useState(false)
  const [detailDestinationId, setDetailDestinationId] = useState<string | null>(null)
  const [flippedCardIndex, setFlippedCardIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync currentIndex when Holly discusses a destination
  useEffect(() => {
    if (currentlyDiscussedDestination && explorationMode) {
      const index = destinations.findIndex(d => d.id === currentlyDiscussedDestination)
      if (index !== -1) {
        setCurrentIndex(index)
        // Scroll to that destination
        const element = containerRef.current?.querySelector(`[data-destination-index="${index}"]`)
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [currentlyDiscussedDestination, explorationMode])

  // Intersection Observer to track visible card
  useEffect(() => {
    if (!explorationMode || !containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-destination-index'))
            if (!isNaN(index)) {
              setCurrentIndex(index)
            }
          }
        })
      },
      { threshold: 0.5, root: null }
    )

    const cards = containerRef.current.querySelectorAll('[data-destination-index]')
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [explorationMode])

  // Keyboard navigation (ArrowUp/Down for vertical scrolling)
  useEffect(() => {
    if (!explorationMode) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault()
        const prevElement = containerRef.current?.querySelector(`[data-destination-index="${currentIndex - 1}"]`)
        prevElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (e.key === 'ArrowDown' && currentIndex < destinations.length - 1) {
        e.preventDefault()
        const nextElement = containerRef.current?.querySelector(`[data-destination-index="${currentIndex + 1}"]`)
        nextElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [explorationMode, currentIndex])

  const getDestinationGradient = (destinationId?: string) => {
    // Use HICV brand colors with unique gradient for each destination
    const gradients: Record<string, string> = {
      'orlando': 'from-[#F76B3C] to-[#FF9B75]',        // Citrus Sunrise to Coral Reef (theme parks)
      'cocoa-beach': 'from-[#FF9B75] to-[#F3B54A]',   // Coral Reef to Golden Sunset (beach vibes)
      'las-vegas': 'from-[#F76B3C] to-[#D8734F]',     // Citrus Sunrise to Rustic Sunset (excitement)
      'myrtle-beach': 'from-[#F3B54A] to-[#FF9B75]',  // Golden Sunset to Coral Reef (coastal)
      'new-orleans': 'from-[#D8734F] to-[#F3B54A]',   // Rustic Sunset to Golden Sunset (culture)
      'galveston': 'from-[#FF9B75] to-[#F76B3C]',     // Coral Reef to Citrus Sunrise (gulf coast)
      'gatlinburg': 'from-[#D8734F] to-[#F76B3C]',    // Rustic Sunset to Citrus Sunrise (mountains)
      'lake-tahoe': 'from-[#F76B3C] to-[#FF9B75]',    // Citrus Sunrise to Coral Reef (alpine)
      'branson': 'from-[#FF9B75] to-[#D8734F]',       // Coral Reef to Rustic Sunset (shows & outdoors)
      'scottsdale': 'from-[#F3B54A] to-[#D8734F]',    // Golden Sunset to Rustic Sunset (spa & relaxation)
      'williamsburg': 'from-[#D8734F] to-[#FF9B75]'   // Rustic Sunset to Coral Reef (historic)
    }

    return gradients[destinationId || 'orlando'] || 'from-[#F76B3C] to-[#FF9B75]'
  }

  if (!preferredDestination) return null

  // SIMPLE VIEW: Just preferred destination
  if (!explorationMode) {
    const destAvail = destinationAvailability[preferredDestination.id]

    return (
      <div className="relative w-full h-[calc(100vh-200px)] min-h-[600px] rounded-xl overflow-hidden">
        {/* Fullscreen background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getDestinationGradient(preferredDestination.id)}`} />

        {/* Centered content */}
        <div className="relative z-10 flex items-center justify-center h-full text-white px-8">
          <div className="text-center max-w-3xl">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
              {preferredDestination.name}
            </h1>
            <p className="text-2xl md:text-3xl mb-3 opacity-90 drop-shadow-lg">
              {preferredDestination.state}
            </p>
            <p className="text-3xl md:text-4xl italic opacity-80 drop-shadow-lg mb-6">
              {preferredDestination.tagline}
            </p>

            {/* 4-Month Availability Display */}
            {destAvail && (
              <div className="inline-block bg-white/10 backdrop-blur-md rounded-lg px-6 py-4 border border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-medium">Next 4 Months Availability</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {(['sep', 'oct', 'nov', 'dec'] as const).map((month) => {
                    const avail = getAvailabilityDisplay(destAvail[month])
                    return (
                      <div key={month} className="text-center">
                        <div className="text-xs font-medium opacity-80 mb-2 uppercase">{month}</div>
                        <Badge
                          className={`text-xs px-2 py-1 ${
                            avail.color === 'green'
                              ? 'bg-green-500/90 text-white border-white/20'
                              : avail.color === 'amber'
                              ? 'bg-amber-500/90 text-white border-white/20'
                              : avail.color === 'red'
                              ? 'bg-red-500/90 text-white border-white/20'
                              : 'bg-gray-500/90 text-white border-white/20'
                          }`}
                        >
                          {avail.label}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Badge */}
        <div className="absolute top-8 right-8">
          <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-sm px-4 py-2">
            From Your Package
          </Badge>
        </div>

      </div>
    )
  }

  // EXPLORATION MODE: TikTok-style vertical scroll
  return (
    <>
      {/* Vertical Scroll Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[calc(100vh-200px)] min-h-[600px] overflow-y-scroll snap-y snap-mandatory scroll-smooth rounded-xl"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Destination Cards */}
        {destinations.map((destination, index) => {
          const isPreferred = destination.id === preferredDestinationId
          const isSuggested = suggestedDestinations.includes(destination.id)
          const destAvail = destinationAvailability[destination.id]

          return (
            <div
              key={destination.id}
              data-destination-index={index}
              className="relative w-full h-[calc(100vh-200px)] min-h-[600px] snap-start flex-shrink-0"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getDestinationGradient(destination.id)}`} />

              {/* Centered content with flip animation */}
              <div className="relative z-10 flex items-center justify-center h-full text-white px-8">
                <div className="w-full max-w-4xl h-[500px]" style={{ perspective: '1000px' }}>
                  <div
                    className={`relative w-full h-full transition-transform duration-700 ${
                      (showDestinationDetails && index === currentIndex) || flippedCardIndex === index ? '[transform:rotateY(180deg)]' : ''
                    }`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front of card */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="text-center max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
                          {destination.name}
                        </h1>
                        <p className="text-xl md:text-2xl mb-3 opacity-90 drop-shadow-lg">
                          {destination.state}
                        </p>
                        <p className="text-2xl md:text-3xl italic opacity-80 drop-shadow-lg mb-6">
                          {destination.tagline}
                        </p>

                        {/* 4-Month Availability Display */}
                        {destAvail && (
                          <div className="inline-block bg-white/10 backdrop-blur-md rounded-lg px-6 py-4 border border-white/20">
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span className="text-sm font-medium">Next 4 Months Availability</span>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                              {(['sep', 'oct', 'nov', 'dec'] as const).map((month) => {
                                const avail = getAvailabilityDisplay(destAvail[month])
                                return (
                                  <div key={month} className="text-center">
                                    <div className="text-xs font-medium opacity-80 mb-2 uppercase">{month}</div>
                                    <Badge
                                      className={`text-xs px-2 py-1 ${
                                        avail.color === 'green'
                                          ? 'bg-green-500/90 text-white border-white/20'
                                          : avail.color === 'amber'
                                          ? 'bg-amber-500/90 text-white border-white/20'
                                          : avail.color === 'red'
                                          ? 'bg-red-500/90 text-white border-white/20'
                                          : 'bg-gray-500/90 text-white border-white/20'
                                      }`}
                                    >
                                      {avail.label}
                                    </Badge>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Flip Button - Top Right Corner */}
                      <button
                        onClick={() => setFlippedCardIndex(flippedCardIndex === index ? null : index)}
                        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all border border-white/30 hover:scale-110"
                        aria-label="Flip to see more details"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Back of card */}
                    <div
                      className="absolute inset-0 flex items-center justify-center [transform:rotateY(180deg)]"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-3xl max-h-full overflow-y-auto border border-white/20">
                        <h2 className="text-3xl font-bold mb-4">{destination.name}, {destination.state}</h2>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">Overview</h3>
                            <p className="text-lg opacity-90">{destination.overview}</p>
                          </div>

                          <div>
                            <h3 className="text-xl font-semibold mb-2">Key Facts</h3>
                            <ul className="space-y-1">
                              {destination.keyFacts.slice(0, 3).map((fact, idx) => (
                                <li key={idx} className="text-base opacity-90 flex items-start gap-2">
                                  <span className="text-white/60">•</span>
                                  <span>{fact}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h3 className="text-xl font-semibold mb-2">Nearby Attractions</h3>
                            <ul className="space-y-1">
                              {destination.nearbyAttractions.slice(0, 3).map((attraction, idx) => (
                                <li key={idx} className="text-base opacity-90 flex items-start gap-2">
                                  <span className="text-white/60">•</span>
                                  <span>{attraction.name} - {attraction.distance}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Flip Back Button - Top Right Corner */}
                      <button
                        onClick={() => setFlippedCardIndex(null)}
                        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all border border-white/30 hover:scale-110"
                        aria-label="Flip back"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-8 right-20 flex flex-col gap-2 items-end">
                {isPreferred && (
                  <Badge className="bg-primary/90 backdrop-blur-md text-white border-white/30 text-sm px-4 py-2">
                    Current Selection
                  </Badge>
                )}
                {isSuggested && !isPreferred && (
                  <Badge className="bg-blue-500/90 backdrop-blur-md text-white border-white/30 text-sm px-4 py-2">
                    Suggested
                  </Badge>
                )}
              </div>

              {/* Counter */}
              <div className="absolute top-8 left-8">
                <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                  <p className="text-white font-semibold text-sm">
                    {index + 1} / {destinations.length}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vertical Progress Indicator (right side) */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        {destinations.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              const element = containerRef.current?.querySelector(`[data-destination-index="${idx}"]`)
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={`rounded-full transition-all ${
              idx === currentIndex
                ? 'h-8 w-2 bg-white'
                : 'h-2 w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to destination ${idx + 1}`}
          />
        ))}
      </div>

      {/* Detail Overlay */}
      {showDetailOverlay && detailDestinationId && (
        <DetailOverlay
          destination={getDestinationById(detailDestinationId)!}
          onClose={() => setShowDetailOverlay(false)}
        />
      )}
    </>
  )
}

// Detail Overlay Component
function DetailOverlay({
  destination,
  onClose
}: {
  destination: NonNullable<ReturnType<typeof getDestinationById>>
  onClose: () => void
}) {
  // Auto-close after 10 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 10000)
    return () => clearTimeout(timer)
  }, [onClose])

  const getGradient = () => {
    // Use HICV brand colors with unique gradient for each destination
    const gradients: Record<string, string> = {
      'orlando': 'from-[#F76B3C] to-[#FF9B75]',
      'cocoa-beach': 'from-[#FF9B75] to-[#F3B54A]',
      'las-vegas': 'from-[#F76B3C] to-[#D8734F]',
      'myrtle-beach': 'from-[#F3B54A] to-[#FF9B75]',
      'new-orleans': 'from-[#D8734F] to-[#F3B54A]',
      'galveston': 'from-[#FF9B75] to-[#F76B3C]',
      'gatlinburg': 'from-[#D8734F] to-[#F76B3C]',
      'lake-tahoe': 'from-[#F76B3C] to-[#FF9B75]',
      'branson': 'from-[#FF9B75] to-[#D8734F]',
      'scottsdale': 'from-[#F3B54A] to-[#D8734F]',
      'williamsburg': 'from-[#D8734F] to-[#FF9B75]'
    }

    return gradients[destination.id] || 'from-[#F76B3C] to-[#FF9B75]'
  }

  return (
    <div className="fixed inset-0 z-50 animate-fadeIn">
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()}`} />
      <div className="absolute inset-0 backdrop-blur-xl bg-black/40" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors border border-white/20 z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto mt-32 px-4 space-y-6">
        {/* Climate & Best Time */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white p-6">
          <h3 className="text-xl font-bold mb-3">Climate & Best Time to Visit</h3>
          <p className="opacity-90">
            {destination.attributes.weather === 'year-round'
              ? 'Enjoy beautiful year-round weather, perfect for visiting any time of year.'
              : destination.attributes.weather === 'warm'
              ? 'Warm, sunny weather awaits you. Best visited during spring and fall for ideal temperatures.'
              : 'Experience all four seasons with distinct weather patterns. Summer and winter offer unique seasonal activities.'}
          </p>
        </Card>

        {/* Vibe */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white p-6">
          <h3 className="text-xl font-bold mb-3">Vibe & Atmosphere</h3>
          <p className="opacity-90 mb-3">{destination.overview}</p>
          <div className="flex flex-wrap gap-2">
            {destination.attributes.vibe.map((v) => (
              <Badge key={v} className="bg-white/20 text-white border-white/30">
                {v}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Top Experiences */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white p-6">
          <h3 className="text-xl font-bold mb-3">Top Experiences</h3>
          <ul className="space-y-2">
            {destination.nearbyAttractions.slice(0, 4).map((attraction, idx) => (
              <li key={idx} className="flex items-start gap-2 opacity-90">
                <span className="text-white/60">•</span>
                <span>{attraction.name}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
