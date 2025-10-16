# Implementation Plan: Remove Preferences & Add TikTok-Style Destination UI

## Project Status: 60% Complete

---

## ✅ COMPLETED TASKS

### 1. Holly Assistant Component (`components/holly-assistant.tsx`)
**Changes Made:**
- ✅ Updated `BookingStep` type: removed `"preferences"`, added `"destination-choice"`
- ✅ Set default state values: `destinationPreference: 'explore'`, `dateFlexibility: 'fixed'`
- ✅ Removed `PreferencesStep` import
- ✅ Removed `case "preferences"` from `renderCurrentStepComponent()` (replaced with placeholder for `"destination-choice"`)
- ✅ Removed entire `case 'preference_selection'` from `processIntent()`
- ✅ Updated `case 'details_verification'` to route to `"destination-choice"` instead of `"preferences"`
- ✅ Updated demo mode logic:
  - Changed verify-details demo to mention destination choice
  - Replaced preferences demo case with destination-choice demo case
  - destination-choice demo simulates choosing "explore"

**Current State:**
- Flow now goes: Package → Details → **Destination Choice** → Select Destination → Dates
- Placeholder `<div>` is rendering for destination-choice step (needs real component)

---

## 🚧 REMAINING TASKS

### 2. Voice Interaction Handler (`lib/voice-interaction-handler.ts`)

**What to Remove:**
1. Remove `'preference_selection'` from `VoiceIntent` type union (line 6)
2. Remove `else if (currentStep === 'preferences')` block and `parsePreferenceSelection()` call (lines 64-65)
3. Remove entire `parsePreferenceSelection()` method (lines 158-197)
4. Remove `case 'preference_selection'` from `generateResponse()` method (lines 709-748)

**Example Code to Remove:**
```typescript
// Line 6 - Remove from union type
type: 'preference_selection' | ... // DELETE THIS

// Lines 64-65 - Remove from parseVoiceInput
} else if (currentStep === 'preferences') {
  return this.parsePreferenceSelection(lowerText, bookingState)

// Lines 158-197 - Delete entire method
private parsePreferenceSelection(text: string, bookingState: BookingState): VoiceIntent { ... }

// Lines 709-748 - Remove from generateResponse switch
case 'preference_selection': ... break
```

---

### 3. Horizontal Stepper (`components/horizontal-stepper.tsx`)

**What to Change:**
1. Remove preferences step object from `stepsList` array (lines 26-30)
2. Add destination-choice step object:
```typescript
{
  id: "destination-choice" as BookingStep,
  title: "Destination",
  icon: MapPin, // or create new icon
}
```
3. Update `useMemo` dependency array to remove `destinationPreference` and `dateFlexibility` (line 69)

**Current Structure (lines 15-69):**
```typescript
const stepsList: Array<{ id: BookingStep; title: string; icon: any }> = [
  { id: "active-package", title: "Package", icon: Package },
  { id: "verify-details", title: "Details", icon: UserCheck },
  { id: "preferences", title: "Preferences", icon: Settings }, // REMOVE THIS
  { id: "select-destination", title: "Destination", icon: Plane },
  // ... dates, tour, confirm
]
```

**Should Become:**
```typescript
const stepsList: Array<{ id: BookingStep; title: string; icon: any }> = [
  { id: "active-package", title: "Package", icon: Package },
  { id: "verify-details", title: "Details", icon: UserCheck },
  { id: "destination-choice", title: "Destination", icon: MapPin }, // NEW - represents the choice
  { id: "select-destination", title: "Explore", icon: Plane }, // RENAME title to "Explore"
  // ... dates, tour, confirm
]
```

**Note:** The stepper will show both "Destination" (choice step) and "Explore" (TikTok swipe step) but only one will be active depending on user choice.

---

### 4. Create Destination Choice Component (`components/destination-choice-step.tsx`)

**Purpose:**
Two-card interface: "Keep Orlando" vs "Explore Other Destinations"

**Interface:**
```typescript
interface DestinationChoiceStepProps {
  bookingState: BookingState
  onChoice: (choice: 'keep' | 'explore') => void
}
```

**Design Specs:**
- Two large, full-width cards (mobile) or side-by-side (desktop)
- **Card 1: "Keep Orlando"**
  - Shows Orlando destination with gradient background
  - Displays 4-month availability calendar
  - Large "Keep Orlando" button
  - On click: Updates `destinationPreference: 'keep'`, routes to `choose-dates`

- **Card 2: "Explore Other Destinations"**
  - Teaser showing multiple destination thumbnails
  - "Explore 11 Destinations" text
  - Large "Explore Destinations" button
  - On click: Updates `destinationPreference: 'explore'`, routes to `select-destination` with `explorationMode: true`

**Implementation:**
```typescript
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
    <div className="h-full flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Destination</h2>
        <p className="text-muted-foreground">Keep your package destination or explore other options</p>
      </div>

      {/* Two Cards */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Card 1: Keep Orlando */}
        <button
          onClick={() => onChoice('keep')}
          className="relative overflow-hidden rounded-2xl border-2 border-border hover:border-primary transition-all bg-gradient-to-br from-[#F76B3C] to-[#FF9B75] text-white p-8 flex flex-col items-center justify-center"
        >
          <MapPin className="w-16 h-16 mb-4" />
          <h3 className="text-4xl font-bold mb-2">{orlando?.name}</h3>
          <p className="text-xl mb-6 opacity-90">{orlando?.tagline}</p>

          {/* Availability Preview */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-6 py-4 border border-white/20 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">Next 4 Months</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {(['sep', 'oct', 'nov', 'dec'] as const).map((month) => {
                const avail = getAvailabilityDisplay(orlandoAvail[month])
                return (
                  <div key={month} className="text-center">
                    <div className="text-xs font-medium mb-2 uppercase">{month}</div>
                    <Badge className={`text-xs ${avail.color === 'green' ? 'bg-green-500' : avail.color === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}>
                      {avail.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="px-8 py-4 bg-white text-primary rounded-full font-bold text-lg">
            Keep Orlando
          </div>
        </button>

        {/* Card 2: Explore Other Destinations */}
        <button
          onClick={() => onChoice('explore')}
          className="relative overflow-hidden rounded-2xl border-2 border-border hover:border-primary transition-all bg-gradient-to-br from-[#5FA6A6] to-[#9BC5B7] text-white p-8 flex flex-col items-center justify-center"
        >
          <div className="w-16 h-16 mb-4 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-3xl">🌎</span>
          </div>
          <h3 className="text-4xl font-bold mb-2">Explore Destinations</h3>
          <p className="text-xl mb-6 opacity-90">Browse 11 amazing vacation spots</p>

          {/* Preview thumbnails */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {['Las Vegas', 'Cocoa Beach', 'New Orleans'].map((dest) => (
              <div key={dest} className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 text-xs">
                {dest}
              </div>
            ))}
          </div>

          <div className="px-8 py-4 bg-white text-[#5FA6A6] rounded-full font-bold text-lg">
            Explore Destinations
          </div>
        </button>
      </div>
    </div>
  )
}
```

---

### 5. Update Holly Assistant to Use Destination Choice Component

**File:** `components/holly-assistant.tsx`

**Changes Needed:**

1. **Import the new component:**
```typescript
import { DestinationChoiceStep } from "./destination-choice-step"
```

2. **Create handler function** (add after `presentDestinationDefault` function):
```typescript
const handleDestinationChoice = (choice: 'keep' | 'explore') => {
  if (choice === 'keep') {
    // Keep Orlando, go straight to dates
    setBookingState(prev => ({
      ...prev,
      destinationPreference: 'keep',
      destinationConfirmed: true,
      completedSteps: [...prev.completedSteps, 'destination-choice'],
      currentStep: 'choose-dates'
    }))

    addMessage('user', 'Keep Orlando')
    setTimeout(() => {
      addMessage('holly', "Perfect! Sticking with Orlando. Now, when would you like to travel?")
    }, 1000)

  } else {
    // Explore destinations, go to TikTok swipe UI
    setBookingState(prev => ({
      ...prev,
      destinationPreference: 'explore',
      completedSteps: [...prev.completedSteps, 'destination-choice'],
      currentStep: 'select-destination'
    }))

    addMessage('user', 'I want to explore other destinations')
    setTimeout(() => {
      addMessage('holly', "Great! Let's explore destinations. Swipe through to see what's available.")
      setExplorationMode(true)
    }, 1000)
  }
}
```

3. **Update `renderCurrentStepComponent()`** to replace placeholder:
```typescript
case "destination-choice":
  return (
    <DestinationChoiceStep
      bookingState={bookingState}
      onChoice={handleDestinationChoice}
    />
  )
```

---

### 6. Redesign Destination Selection with TikTok-Style Vertical Swipe

**File:** `components/destination-selection-step.tsx`

**Key Changes:**
1. Remove horizontal carousel (ChevronLeft/Right buttons, dot indicators)
2. Add vertical scroll container with snap behavior
3. Implement touch gestures (swipe up/down)
4. Add vertical progress indicator (dots on right side)

**CSS Approach:**
```css
.destination-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}

.destination-card {
  scroll-snap-align: start;
  height: 100vh;
}
```

**Implementation Pattern:**
```typescript
export function DestinationSelectionStep({ ... }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer to track visible card
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            setCurrentIndex(index)
          }
        })
      },
      { threshold: 0.5 }
    )

    const cards = containerRef.current?.querySelectorAll('.destination-card')
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  // Touch/wheel handlers
  const handleWheel = (e: WheelEvent) => {
    // Scroll to next/prev card
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
      onWheel={handleWheel}
    >
      {destinations.map((dest, index) => (
        <div
          key={dest.id}
          data-index={index}
          className="destination-card h-screen snap-start relative"
          style={{
            background: `linear-gradient(to-br, ${getDestinationGradient(dest.id)})`
          }}
        >
          {/* Destination content */}
          <div className="absolute inset-0 flex items-center justify-center text-white p-8">
            <div className="text-center max-w-3xl">
              <h1 className="text-6xl font-bold mb-4">{dest.name}</h1>
              <p className="text-2xl mb-3">{dest.state}</p>
              <p className="text-3xl italic mb-6">{dest.tagline}</p>

              {/* 4-Month Availability */}
              <div className="inline-block bg-white/10 backdrop-blur-md rounded-lg px-6 py-4">
                {/* Availability grid... */}
              </div>

              {/* Select Button */}
              <button
                onClick={() => handleSelectDestination(dest.id)}
                className="mt-8 px-12 py-4 bg-white text-primary rounded-full font-bold text-xl"
              >
                Choose {dest.name}
              </button>
            </div>
          </div>

          {/* Vertical Progress Indicator (right side) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            {destinations.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 rounded-full transition-all ${
                  idx === index ? 'h-8 bg-white' : 'h-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Key Features:**
- ✅ Full-screen vertical cards
- ✅ Swipe/scroll to navigate
- ✅ Snap-to-card behavior
- ✅ 4-month availability on each card
- ✅ "Choose [Destination]" button on each card
- ✅ Vertical progress dots on right side
- ✅ Auto-scroll when Holly mentions a destination (keep existing logic)

---

### 7. Update Demo Mode Reset State

**File:** `components/holly-assistant.tsx`

**Location:** `case 'final-booking'` demo reset (around line 359)

**Change:**
```typescript
destinationPreference: null, // Change to: 'explore'
dateFlexibility: null, // Change to: 'fixed'
```

---

## 🎯 NEW FLOW SUMMARY

### User Journey:
1. **Package** → Enable voice/verify phone
2. **Details** → Confirm zip code & guest count
3. **Destination Choice** (NEW) → Two cards:
   - **Keep Orlando** → Skip to Dates
   - **Explore** → TikTok-style vertical swipe
4. **Select Destination** (TikTok UI, only if exploring)
5. **Dates** → Calendar or flexible options
6. **Tour** → Schedule tour time
7. **Confirm** → Final booking screen

### Stepper Display:
```
Package → Details → Destination → Explore → Dates → Tour → Confirm
                     ↑             ↑
                     (choice)      (only if exploring)
```

---

## 📝 TESTING CHECKLIST

After implementation:
- [ ] Voice activation works
- [ ] Details verification proceeds to destination-choice
- [ ] "Keep Orlando" button routes to dates directly
- [ ] "Explore" button routes to TikTok UI
- [ ] Vertical swipe works (touch and mouse wheel)
- [ ] Cards snap correctly
- [ ] Progress indicator updates
- [ ] Select button on each destination works
- [ ] 4-month availability displays correctly
- [ ] Demo mode (Enter key) works through new flow
- [ ] Mobile layout responsive
- [ ] Stepper shows correct steps

---

## 🔑 KEY PATTERNS TO MAINTAIN

1. **State Updates:** Always use `setBookingState(prev => ({ ...prev, ... }))`
2. **Message Timing:** Use `setTimeout` with 1000-2000ms delays for natural conversation
3. **Completed Steps:** Always update `completedSteps` array when progressing
4. **Gradient Colors:** Use existing HICV brand colors from destination-selection-step.tsx
5. **Availability Display:** Use `getAvailabilityDisplay()` helper function
6. **Mobile Responsive:** Check `useIsMobile()` hook for conditional rendering

---

## 📦 FILES TO MODIFY/CREATE

**Modify:**
1. ✅ `components/holly-assistant.tsx` (60% done)
2. ⏳ `lib/voice-interaction-handler.ts`
3. ⏳ `components/horizontal-stepper.tsx`
4. ⏳ `components/destination-selection-step.tsx`

**Create:**
5. ⏳ `components/destination-choice-step.tsx`

**Optional (can delete):**
6. `components/preferences-step.tsx` (no longer used)

---

## 🚀 RESUME INSTRUCTIONS

To resume coding:
1. Start with voice-interaction-handler.ts cleanup (simple deletions)
2. Update horizontal-stepper.tsx (simple modifications)
3. Create destination-choice-step.tsx component (new file, straightforward)
4. Update holly-assistant.tsx to integrate destination-choice component
5. Redesign destination-selection-step.tsx with vertical swipe (most complex)
6. Test full flow

Estimated remaining time: 2-3 hours
