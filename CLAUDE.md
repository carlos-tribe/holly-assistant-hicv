# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ IMPORTANT: This is a Demo Application

**READ THIS FIRST:**
- This is a **DEMO APPLICATION** for visual demonstration purposes only
- **Voice recognition is NOT functional** - it's simulated for UI demonstration
- The primary interaction method is **keyboard-driven demo mode** (pressing Enter key)
- When making changes, **keep them simple** - avoid complex voice-related functionality
- Focus on visual flow and user experience, not actual voice processing
- The VoiceInteractionHandler and NLU code exist for reference but are not actively used

## Project Overview

Holly Assistant is a Next.js 14 application featuring a visual demo of a booking assistant for Holiday Inn Club Vacations packages. The system demonstrates a multi-step booking flow through 11 vacation destinations across the United States, with keyboard-driven progression for presentations and demos.

## Development Commands

```bash
# Start development server (default port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Application Structure

This is a Next.js 14 App Router application with the following key directories:

- `app/` - Next.js App Router pages and layouts
- `components/` - React components (main application logic + shadcn/ui components)
- `lib/` - Utility libraries and core business logic
- `types/` - TypeScript type definitions

### Core Booking Flow

The application implements a multi-step booking process managed by a centralized state machine in `components/holly-assistant.tsx`. The flow progresses through these steps:

1. **active-package** - Display package overview and initiate booking
2. **verify-details** - Verify zip code and guest count (with correction capability)
3. **destination-choice** - Choose to keep current destination (Orlando) or explore alternatives
4. **select-destination** - Browse through 11 destinations with TikTok-style swipe UI
5. **choose-dates** - Select check-in/check-out dates with visual calendar highlighting
6. **choose-flexible-dates** - (Alternative to step 5) Select from pre-packaged flexible date options
7. **schedule-tour** - Schedule property tour time
8. **final-booking** - **Two-state screen:**
   - **State 1:** Qualification requirements (age, income, attendance, ID/payment verification)
   - **State 2:** Animated confirmation screen with booking details and $100 cash back savings

**Important:** The `BookingState` interface defines all state for the booking flow. When modifying the flow, update both the state interface and the step rendering logic in `renderCurrentStepComponent()`.

**Qualification at End:** The qualification requirements are now shown as the FIRST screen at the final-booking step. If user accepts, they see the confirmation screen. If they decline, the booking is canceled. This ensures users complete the entire booking flow before being asked to qualify.

### Voice Interaction System

**⚠️ VOICE IS NON-FUNCTIONAL:** This code exists for structural reference only. Voice recognition is not implemented in this demo.

Voice interactions are nominally handled by `VoiceInteractionHandler` in `lib/voice-interaction-handler.ts`. This is a custom NLU engine structure that exists in the codebase but is not actively used:

- Parses natural language input into structured intents (theoretical)
- Extracts entities (dates, times, destination selections, etc.)
- Generates contextually appropriate responses
- Maintains confidence scores for intent classification

**Intent Types (for reference):**
- `destination_selection` - User selects a destination by name, category, or attributes
- `date_selection` - User specifies travel dates (absolute or relative)
- `flexible_date_selection` - User selects from pre-packaged date options
- `time_selection` - User chooses tour time slot
- `details_verification` - User confirms or updates booking details
- `confirmation` - Yes/no responses
- `question` - User asks for more information
- `correction` - User corrects previous input

**Key Pattern:** Each step in the booking flow has a corresponding parser method in `VoiceInteractionHandler` (e.g., `parseDestinationSelection()`, `parseDateSelection()`, `parseFlexibleDateSelection()`). However, in practice, the demo mode uses keyboard progression (Enter key) rather than voice parsing.

### State Management Pattern

The application uses React `useState` for state management with a centralized `BookingState` object. State updates trigger:

1. Visual component re-renders (step-specific UI)
2. Voice response generation
3. Step progression (via `completedSteps` array)

**Demo Mode:** The application includes a keyboard-driven demo mode (Enter key progression) alongside voice interaction. Both modes manipulate the same `BookingState`, ensuring consistency.

### Visual Feedback System

The app provides real-time visual feedback during voice interactions:

- **Property highlights** - `currentlyDiscussedProperty` state highlights the property being discussed
- **Date highlights** - `highlightedDates` creates a yellow glow effect on discussed dates
- **Time slot highlights** - `highlightedTimeSlot` emphasizes tour times under discussion
- **Suggested values** - `suggestedDate` pre-fills values that Holly recommends

This feedback system is critical for the "eyes-free" interaction model - users can speak while watching visual confirmation of their choices.

### State Management Details

**BookingState Interface** (`holly-assistant.tsx` lines 22-38):
```typescript
{
  currentStep: BookingStep
  completedSteps: BookingStep[]
  packageConfirmed: boolean
  zipCode: string
  guestCount: number
  selectedDestination: string | null          // e.g., "orlando", "cocoa-beach", "las-vegas"
  destinationConfirmed: boolean
  exploredDestinations: string[]              // Tracks which destinations user has viewed
  destinationPreference: 'keep' | 'explore' | null
  dateFlexibility: 'fixed' | 'flexible' | null
  selectedFlexibleOption: string | null       // ID of flexible date package
  checkInDate: Date | null
  checkOutDate: Date | null
  tourTime: string | null
}
```

**Additional UI State Variables:**
- `isVoiceActive` - Controls simulated voice UI state (Enter key demo mode)
- `messages` - Array of ConversationMessage for chat display
- `isProcessing` - Shows loading state during demo transitions
- `currentTranscript` - Simulated speech recognition transcript
- `qualificationsAccepted` - Tracks if user accepted qualification requirements (final step)
- `currentlyDiscussedDestination` - Visual highlight for destination cards
- `suggestedDestinations` - Array of destination IDs to highlight
- `explorationMode` - Enables TikTok-style destination browsing
- `showDestinationDetails` - Controls card flip to show destination details
- `highlightedDates` - Visual highlight for calendar dates
- `highlightedTimeSlot` - Visual highlight for tour time slots
- `suggestedDate` - Pre-populated date suggestion from Holly
- `destinationDemoStep` - Tracks multi-turn destination selection demo (0-2)

**Message Deduplication:** The app prevents duplicate messages using `lastMessageRef` and `lastMessageTimeRef` with a 500ms threshold.

## Key Technical Considerations

### TypeScript Configuration

- Strict mode enabled
- Module resolution: `bundler`
- Path alias: `@/*` maps to project root
- Target: ES6

### Build Configuration

The `next.config.mjs` includes these settings:
- `eslint.ignoreDuringBuilds: true` - Disables ESLint errors during builds
- `typescript.ignoreBuildErrors: true` - Disables TypeScript errors during builds
- `images.unoptimized: true` - Disables Next.js image optimization

This configuration is intentional for rapid prototyping but should be addressed before production deployment.

### Voice Recognition

**⚠️ VOICE RECOGNITION IS NON-FUNCTIONAL IN THIS DEMO**

The codebase contains references to Web Speech API (`webkitSpeechRecognition`) in the `ConversationWithHolly` component, but this functionality is not actively used. The demo relies on **keyboard-driven progression** (Enter key) to simulate a booking conversation.

**Why the voice code exists:**
- Structural reference for potential future implementation
- UI elements (microphone button, transcript display) exist for visual completeness
- Code is organized as if voice worked, but actual interaction is keyboard-based

**Demo Mode is Primary:** The application's main interaction is pressing the **Enter key** to progress through pre-scripted booking steps with realistic conversation timing and visual feedback.

**Destination Presentation Pattern:** When presenting destinations in demo mode, Holly uses a timed sequence with `setCurrentlyDiscussedDestination()` to highlight each destination as she describes it:
- Destination 1 at 0s
- Destination 2 at 5s
- Destination 3 at 10s
- Clear highlight and await selection

### Mobile Layout Architecture

The application features a responsive mobile layout with distinct UI patterns:

**Mobile-First Design (`holly-assistant.tsx` lines 688-734):**
- Uses `h-screen` with `overflow-hidden` for proper viewport height handling
- Content area uses `flex-1 min-h-0` for correct flex shrinking and overflow behavior
- Conditional rendering based on verification state and voice activation

**Mobile Conversation Flow:**
1. **Pre-verification:** Verification UI renders in main content area (full screen)
2. **Post-verification, pre-voice:** Microphone enable screen renders in main content area
3. **Post-voice activation:** Compact conversation bar appears at bottom with Sheet drawer for message history

**Key Pattern:** Mobile uses `isMobile={false}` when rendering ConversationWithHolly in main content area during setup flows to force full UI mode. After voice activation, switches to `isMobile={true}` for compact bar mode.

**Mobile Conversation Sheet (`conversation-with-holly.tsx` lines 358-422):**
- Compact bar shows last message with tap-to-expand functionality
- Sheet opens from bottom with `h-[85vh]` for conversation history
- Uses native scrolling (`overflow-y-auto`) instead of ScrollArea for reliable mobile performance
- Fixed bottom positioning with proper z-index layering

### Component Organization

UI components follow shadcn/ui conventions:
- `components/ui/` - Reusable UI primitives (buttons, cards, etc.)
- `components/` - Application-specific components (booking steps, Holly interface)

**Step Components Pattern:** Each booking step has a dedicated component (e.g., `PropertySelectionStep`, `DateSelectionStep`) that receives `bookingState` and optional highlight props. These components are stateless and controlled by the parent `HollyAssistant` component.

**Responsive Detection:** The application uses `useIsMobile()` hook from `components/ui/use-mobile.tsx` to detect mobile viewports and conditionally render appropriate layouts.

### Current Destinations & Properties

The application features **11 vacation destinations** across the United States, defined in `lib/destinations-data.ts`:

**Example Destinations:**
1. **Orlando, FL** - Theme park capital with family-friendly resorts
2. **Cocoa Beach, FL** - Beachfront properties near Kennedy Space Center
3. **Las Vegas, NV** - Entertainment and nightlife destination
4. **Myrtle Beach, SC** - Family beach vacation
5. **New Orleans, LA** - Historic French Quarter destination
6. **Williamsburg, VA** - Colonial history and attractions
7. **Gatlinburg, TN** - Smoky Mountains gateway
8. **Galveston, TX** - Gulf Coast beach destination
9. **Lake of the Ozarks, MO** - Lake recreation destination
10. **Branson, MO** - Family entertainment destination
11. **Park City, UT** - Mountain resort destination

**Properties by Destination:**
Each destination has 1-3 assigned properties. For example, Cocoa Beach includes:
- **Holiday Inn Express® & Suites Cocoa Beach** - Beachfront 2-bedroom suites
- **Crowne Plaza® Melbourne – Oceanfront** - Premium oceanfront suites
- **Holiday Inn Express® & Suites Cocoa** - Value option near Space Center

Properties are dynamically assigned based on guest count and destination selection.

### Adding New Destinations

To add a new vacation destination:

1. Add destination details to the `destinations` array in `lib/destinations-data.ts`
   - Include: id, name, state, tagline, overview, image path, keyFacts array, weather, activities
2. Add destination to `categoryMappings` and `attributeMappings` for searchability
3. Update property assignments in destination data
4. Add destination images to `/public/destinations/` directory
5. Update flexible date options in `lib/availability-data.ts` if needed

### Adding New Booking Steps

To add a new step to the booking flow:

1. Add step ID to `BookingStep` type in `holly-assistant.tsx`
2. Add step state fields to `BookingState` interface
3. Implement parser method in `VoiceInteractionHandler`
4. Add step to `steps` array in `HorizontalStepper` component
5. Add case to `renderCurrentStepComponent()` switch statement
6. Add intent handling in `processIntent()` method
7. Update demo mode keyboard handler if applicable

## Styling

The application uses Tailwind CSS v4 with:
- Custom color scheme (primary: #FF6B35, backgrounds: #F5F1ED)
- Geist Sans and Geist Mono fonts
- Custom animations (pulse, bounce, fadeIn)
- shadcn/ui component styling

**Color Philosophy:** The warm color palette (#FF6B35 for Holly, soft beiges/browns for backgrounds) creates a friendly, approachable interface for voice interaction.

## Key Files Reference

### Core Application Files

- `app/layout.tsx` - Root layout with Geist fonts and Vercel Analytics
- `app/page.tsx` - Main page component that renders HollyAssistant
- `app/globals.css` - Global Tailwind CSS styles and custom animations

### Main Components

- `components/holly-assistant.tsx` - Main orchestrator component (~735 lines)
  - Manages BookingState and booking flow logic
  - Handles Enter key demo mode progression
  - Contains `processIntent()` method for NLU response handling
  - Implements phone verification with `handlePhoneVerify()`
  - Desktop layout: 2-column grid with left panel for step content, right panel for conversation
  - Mobile layout: Full-screen with conditional rendering for verification/voice setup vs. booking steps
  - Mobile conversation bar only appears after voice activation

- `components/conversation-with-holly.tsx` - Voice interface component (~582 lines)
  - Manages Web Speech API integration
  - Handles microphone mute/unmute functionality
  - Shows verification UI and microphone permission prompt on desktop (Card-based)
  - On mobile: Verification in compact form, then Sheet-based conversation drawer
  - Displays conversation messages with native scrolling on mobile, ScrollArea on desktop

### Step Components

- `components/package-overview.tsx` - Initial package display (desktop only, hidden on mobile)
- `components/verify-details-step.tsx` - User details verification form with animated field updates
- `components/destination-choice-step.tsx` - Binary choice: keep Orlando or explore destinations
- `components/destination-selection-step.tsx` - TikTok-style destination browser with card flip
- `components/date-selection-step.tsx` - Calendar date picker for fixed dates
- `components/flexible-dates-step.tsx` - Pre-packaged flexible date options
- `components/tour-scheduler-step.tsx` - Tour time slot selection with visual highlights
- `components/horizontal-stepper.tsx` - Progress indicator at top (responsive for mobile/desktop)

**Note:** The final-booking step (qualification + confirmation) is rendered inline in `holly-assistant.tsx` rather than as a separate component.

### Business Logic

- `lib/voice-interaction-handler.ts` - NLU engine (549 lines)
  - `parseVoiceInput()` - Routes to appropriate parser based on current step
  - `parsePropertySelection()` - Handles ordinal, feature, and price-based selection
  - `parseDateSelection()` - Parses relative and absolute dates
  - `parseTimeSelection()` - Parses time expressions
  - `generateResponse()` - Creates contextual Holly responses

### Type Definitions

- `types/conversation.ts` - Message types (MessageRole, ConversationMessage)
- Types are also defined inline in `holly-assistant.tsx` (BookingStep, BookingState)

## Demo Mode

The application's primary interaction is a fully scripted keyboard demo mode for presentations:

**How Demo Mode Works:**
- Press **Enter key** to progress through each step with realistic conversation timing
- Simulated Holly messages appear with natural delays (500ms-2000ms)
- Visual feedback (highlights, animations) accompanies each interaction
- All demo interactions use the same state management as the UI components

**Demo Flow Highlights:**
1. **Verify Details** - User corrects guest count from 4 to 3
2. **Destination Choice** - User chooses to explore other destinations
3. **Destination Selection** - 3-turn conversation:
   - User asks about Disney + beach → Holly suggests Cocoa Beach
   - User asks for more details → Card flips to show destination info
   - User confirms Cocoa Beach selection
4. **Date Selection** - User selects first weekend of November with visual calendar highlight
5. **Tour Scheduling** - User changes time from 12 PM to 3 PM with visual slot highlight
6. **Final Booking** - Two Enter presses:
   - First Enter: Accept qualification requirements
   - Second Enter: View confirmation screen, then reset demo

All demo interactions create a realistic booking conversation with proper visual feedback and timing.

## Analytics

Vercel Analytics is integrated via `@vercel/analytics/next` in the root layout for tracking user interactions.

## Important Patterns & Gotchas

### Voice Intent Processing Flow

**⚠️ This flow is theoretical - voice is non-functional in this demo**

If voice were functional, the flow would work as follows:
1. User speaks → `webkitSpeechRecognition` captures speech
2. Final transcript sent to `handleVoiceInput()` in `holly-assistant.tsx`
3. `VoiceInteractionHandler.parseVoiceInput()` analyzes text based on current step
4. Returns `VoiceIntent` with type, confidence, entities, and rawText
5. `generateResponse()` creates Holly's contextual reply
6. `processIntent()` updates BookingState based on intent entities
7. State update triggers visual re-render and step progression

In practice, demo mode uses keyboard progression (Enter key) with pre-scripted interactions instead of voice parsing.

### NLU Entity Extraction

The NLU engine uses regex patterns and keyword matching to extract structured data:

- **Email:** `\b[\w.-]+@[\w.-]+\.\w+\b`
- **Zip code:** `\b(\d{5})\b`
- **Guest count:** Multiple patterns including word numbers and phrases like "party of 4"
- **Properties:** Ordinal ("first"), features ("disney shuttle"), price ("cheapest")
- **Dates:** Relative ("next Friday") and absolute ("March 15th")
- **Times:** Various formats including "2:30 PM", "half past 2", "morning"

### Component Communication Pattern

- **Parent → Child:** BookingState and highlight props flow down
- **Child → Parent:** Callbacks (`onToggleVoice`, `onPhoneVerify`, `onVoiceInput`)
- **No prop drilling:** All state lives in `HollyAssistant` component
- **Refs for stateless data:** `voiceHandlerRef`, `lastMessageRef`, `recognitionRef`

### Timing and Animation Considerations

- Message addition includes 500ms deduplication window
- Property presentation uses 5-second intervals
- State updates often wrapped in `setTimeout` for natural conversation pacing
- Demo mode uses 500ms-2000ms delays between actions
- Visual highlights clear when selection is confirmed

### Known Limitations

1. **Voice Recognition is Non-Functional:** This is a visual demo only - voice does not work
2. **Demo Mode Only:** Primary interaction is keyboard-driven (Enter key progression)
3. **No Backend:** All data is client-side - no actual booking system integration
4. **Fixed Destination Set:** 11 destinations are hardcoded in `destinations-data.ts`
5. **No Persistence:** Booking state is lost on page refresh
6. **English Only:** All content and NLU patterns designed for English language
7. **Build Warnings:** TypeScript and ESLint errors ignored during builds (intentional for rapid prototyping)
8. **Simulated Data:** Property availability, pricing, and tour times are all mock data

### Mobile-Specific Implementation Notes

**Critical Height Management:**
- Mobile container uses `h-screen overflow-hidden` to establish viewport boundary
- Content area uses `flex-1 min-h-0` to enable proper flex shrinking and scrolling
- Without `min-h-0`, flex children with `h-full` won't properly constrain to parent height

**Conversation Sheet Scrolling:**
- Sheet content uses `flex flex-col min-h-0` to establish flex context
- Message area uses native `overflow-y-auto` instead of ScrollArea component
- ScrollArea had issues with nested portals in Sheet components on mobile

**Verification Flow:**
- Verification and microphone enable screens render in main content area (not fixed bar)
- After voice activation, UI transitions to compact bar + Sheet drawer pattern
- This prevents awkward half-screen layout issues with undefined parent heights

**Performance Considerations:**
- Native scrolling performs better than custom scroll components on mobile
- Conditional rendering reduces DOM size during verification flows
- Fixed positioning for conversation bar ensures proper z-layering

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
