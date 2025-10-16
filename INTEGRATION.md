# Holly Assistant - Integration Guide

**Version**: Integration-Ready Branch
**Purpose**: Clean UI/UX foundation for WebRTC + Realtime API implementation

---

## What This Branch Contains

This is a **stripped-down version** of the Holly Assistant demo app. All simulation code has been removed, leaving only:

✅ **8 fully-styled booking step components** (responsive, mobile-first)
✅ **Complete BookingState interface** (all data structures needed for booking flow)
✅ **Visual feedback system** (highlights for destinations, dates, times)
✅ **Message display patterns** (conversation UI with proper scrolling)
✅ **Mobile & desktop responsive layouts** (Sheet drawer, compact bar)
✅ **Clear integration points** (TODO comments where WebRTC connects)

❌ **No demo mode code** (removed ~600 lines)
❌ **No fake NLU engine** (deleted `voice-interaction-handler.ts`)
❌ **No Web Speech API simulation** (removed ~100 lines)

---

## Quick Start for Your Engineer

### 1. Clone and Switch Branch
```bash
git clone <repo-url>
git checkout integration-ready
npm install
npm run dev
```

### 2. Key Files to Integrate

| File | What It Does | What to Add |
|------|-------------|-------------|
| `components/holly-assistant.tsx` | Main orchestrator | WebRTC event handlers (line 129, 200) |
| `components/conversation-with-holly.tsx` | Voice UI component | WebRTC connection setup (line 44) |
| All `components/*-step.tsx` | Booking steps | **No changes needed** - these are pure UI |
| `lib/destinations-data.ts` | 11 destinations | **No changes needed** - ready to use |

### 3. Integration Checklist

- [ ] Replace Web Speech API stub with WebRTC connection (`conversation-with-holly.tsx:44`)
- [ ] Connect audio input stream (getUserMedia)
- [ ] Set up WebSocket to realtime API
- [ ] Handle incoming server intents (`holly-assistant.tsx:200`)
- [ ] Stream audio responses from server
- [ ] Update `processIntent()` to handle real server data (`holly-assistant.tsx:225`)
- [ ] Test visual feedback with real voice (highlights should sync with audio)

---

## BookingState Interface

Your engineer will work with this centralized state object:

```typescript
interface BookingState {
  currentStep: BookingStep  // "active-package" | "verify-details" | ... | "final-booking"
  completedSteps: BookingStep[]

  // User Details
  zipCode: string
  guestCount: number

  // Destination Selection
  selectedDestination: string | null       // e.g., "orlando", "cocoa-beach"
  destinationConfirmed: boolean
  exploredDestinations: string[]           // Tracking for visual highlights
  destinationPreference: 'keep' | 'explore' | null

  // Date Selection (Two-Phase Flow)
  dateFlexibility: 'fixed' | 'flexible' | null
  dateNarrowingComplete: boolean           // Phase 1: narrow to month
  datePreference: 'exact' | 'month' | 'flexible' | null
  preferredMonth: string | null            // "November"
  dateRangeOptions: DateRangeOption[]      // Generated options
  dateRangePageIndex: number               // Pagination state
  highlightedDateRangeId: string | null    // Visual highlight
  checkInDate: Date | null
  checkOutDate: Date | null
  selectedFlexibleOption: string | null

  // Property Matching (Multi-Step Quiz)
  propertyMatchingStep: number             // 0-4: Questions → Thinking → Result
  propertyMatchingComplete: boolean
  matchedPropertyName: string | null

  // Tour Scheduling
  tourTime: string | null                  // "Nov 8, 2025 at 3:00 PM EST"
}
```

**State updates trigger**:
- Visual component re-renders (step-specific UI)
- Message additions (conversation history)
- Visual feedback (highlights, animations)

---

## Visual Feedback System

These state variables control real-time visual feedback as Holly speaks:

```typescript
// Destination Highlights (TikTok-style swipe UI)
const [currentlyDiscussedDestination, setCurrentlyDiscussedDestination] = useState<string | null>(null)
const [suggestedDestinations, setSuggestedDestinations] = useState<string[]>([])

// Date Highlights (Calendar UI)
const [highlightedDates, setHighlightedDates] = useState<{ checkIn?: Date; checkOut?: Date }>()
const [suggestedDate, setSuggestedDate] = useState<Date | null>(null)

// Time Slot Highlights (Tour Scheduler)
const [highlightedTimeSlot, setHighlightedTimeSlot] = useState<string | null>(null)
```

**Usage Pattern**:
```typescript
// When Holly discusses Cocoa Beach, highlight it visually
setCurrentlyDiscussedDestination('cocoa-beach')

// After 4 seconds, clear the highlight
setTimeout(() => {
  setCurrentlyDiscussedDestination(null)
}, 4000)
```

**Your engineer should**: Sync these highlights with audio playback timing from the server.

---

## Integration Points (Where to Add WebRTC)

### Point 1: Voice Connection Setup

**File**: `conversation-with-holly.tsx`
**Line**: 44

```typescript
// TODO: Initialize WebRTC connection here
// Your engineer should:
// 1. Create WebRTC peer connection
// 2. Set up audio input stream (getUserMedia)
// 3. Connect to realtime API WebSocket
// 4. Handle incoming audio responses
// 5. Manage connection lifecycle (cleanup on unmount)
```

**Example Implementation**:
```typescript
useEffect(() => {
  const peerConnection = new RTCPeerConnection(config)

  // Get user microphone
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
      })
    })

  // Connect to realtime API
  const ws = new WebSocket('wss://your-realtime-api.com')

  ws.onmessage = (event) => {
    const serverIntent = JSON.parse(event.data)
    // Call handleVoiceInput or processIntent with server data
  }

  return () => {
    peerConnection.close()
    ws.close()
  }
}, [])
```

### Point 2: Voice Input Handler

**File**: `holly-assistant.tsx`
**Line**: 200

```typescript
// TODO: Replace with real WebRTC event handler
const handleVoiceInput = useCallback((text: string) => {
  // TODO: Your engineer should replace this with real server intent processing
  // Example flow:
  // 1. Receive server response with intent data
  // 2. Parse intent (destination, dates, times, etc.)
  // 3. Update booking state via processIntent()
  // 4. Play audio response from server
}, [bookingState, isProcessing])
```

**Your engineer should**:
- Receive intent data from server (not local NLU)
- Parse entities (destination ID, dates, times, guest count)
- Call `processIntent(serverIntent)` to update state
- Play streamed audio response

### Point 3: Intent Processing Pattern

**File**: `holly-assistant.tsx`
**Line**: 225

The `processIntent()` function demonstrates the **pattern** for updating booking state. Your engineer should adapt this to handle real server response data.

**Example Server Intent**:
```json
{
  "type": "destination_selection",
  "entities": {
    "destination": {
      "method": "direct",
      "destinationId": "cocoa-beach"
    }
  }
}
```

**Update State**:
```typescript
case 'destination_selection':
  const destination = intent.entities.destination
  if (destination?.destinationId) {
    setBookingState(prev => ({
      ...prev,
      selectedDestination: destination.destinationId,
      destinationConfirmed: true,
      currentStep: 'choose-dates'
    }))
  }
  break
```

---

## Component Communication Pattern

**Parent → Child** (Props flow down):
```typescript
<DestinationSelectionStep
  bookingState={bookingState}
  currentlyDiscussedDestination={currentlyDiscussedDestination}
  suggestedDestinations={suggestedDestinations}
  explorationMode={explorationMode}
  onExplorationModeChange={setExplorationMode}
/>
```

**Child → Parent** (Callbacks flow up):
```typescript
interface ConversationWithHollyProps {
  messages: ConversationMessage[]
  isVoiceActive: boolean
  onToggleVoice: () => void              // Callback
  onVoiceInput?: (text: string) => void  // Callback
  isProcessing?: boolean
  currentTranscript?: string
  isMobile?: boolean
}
```

**No prop drilling**: All state lives in `HollyAssistant` component. Step components are stateless and controlled by parent.

---

## Mobile Layout Considerations

The application uses responsive layouts with distinct mobile/desktop patterns:

### Desktop Layout
```
┌─────────────────────────────────────┐
│ HorizontalStepper (progress bar)    │
├────────────────────┬────────────────┤
│                    │                │
│ Step Content       │ Conversation   │
│ (2/3 width)        │ (1/3 width)    │
│ Scrollable         │ Card UI        │
│                    │                │
└────────────────────┴────────────────┘
```

### Mobile Layout
```
┌──────────────────────────┐
│ HorizontalStepper        │
├──────────────────────────┤
│                          │
│ Step Content             │
│ (Full width, scrollable) │
│                          │
├──────────────────────────┤
│ Conversation Bar         │ ← Fixed bottom
│ (Tap to open Sheet)      │
└──────────────────────────┘
```

**Critical Height Management**:
- Mobile uses `h-screen overflow-hidden` for viewport boundary
- Content area uses `flex-1 min-h-0` for proper flex shrinking
- Without `min-h-0`, flexbox won't shrink children properly

**Mobile Sheet Scrolling**:
- Uses native `overflow-y-auto` instead of ScrollArea component
- ScrollArea had issues with nested portals in Sheet on mobile

---

## Message Handling

Messages use a **deduplication pattern** to prevent race conditions:

```typescript
const addMessage = (role: "holly" | "user", content: string) => {
  // Prevent duplicate messages within 500ms
  const now = Date.now()
  const messageKey = `${role}:${content}`
  if (messageKey === lastMessageRef.current && now - lastMessageTimeRef.current < 500) {
    return
  }
  lastMessageRef.current = messageKey
  lastMessageTimeRef.current = now

  const newMessage: ConversationMessage = {
    id: `msg-${Date.now()}-${Math.random()}`,
    role,
    content,
    timestamp: new Date(),
  }
  setMessages((prev) => [...prev, newMessage])
}
```

**Your engineer should**: Keep this pattern when adding messages from server responses.

---

## Booking Flow Steps

The application implements an 8-step booking process:

1. **active-package** - Package overview (desktop only, hidden on mobile)
2. **verify-details** - Verify zip code and guest count
3. **destination-choice** - Keep current destination or explore alternatives
4. **select-destination** - TikTok-style destination browser (11 destinations)
5. **choose-dates** - Two-phase date selection (narrow to month → select range → property matching quiz)
6. **choose-flexible-dates** - Alternative to step 5 (pre-packaged flexible date options)
7. **schedule-tour** - Tour time slot selection with visual highlights
8. **final-booking** - Two-state screen (qualification requirements → animated confirmation)

**Step Progression**:
- User completes interaction → Server confirms → Update `currentStep` and `completedSteps`
- Visual progress indicator (`HorizontalStepper`) updates automatically

---

## Key Files Reference

| File | Lines | Purpose |
|------|-------|---------|
| `components/holly-assistant.tsx` | ~450 | Main orchestrator (stripped from 1144) |
| `components/conversation-with-holly.tsx` | ~350 | Voice UI (stripped from 492) |
| `components/destination-selection-step.tsx` | 492 | TikTok-style destination browser |
| `components/date-selection-step.tsx` | 345 | Two-phase date + property matching |
| `components/tour-scheduler-step.tsx` | ~200 | Time slot selection |
| `components/verify-details-step.tsx` | ~150 | User details verification |
| `components/destination-choice-step.tsx` | ~100 | Binary choice UI |
| `components/flexible-dates-step.tsx` | ~150 | Flexible date options |
| `components/horizontal-stepper.tsx` | ~150 | Progress indicator |
| `lib/destinations-data.ts` | ~650 | 11 destinations with metadata |
| `lib/availability-data.ts` | ~400 | Sample booking data |
| `types/conversation.ts` | 8 | Message types |

---

## Styling & Design System

The app uses **Tailwind CSS v4** with custom color scheme:

**Brand Colors**:
- Primary Orange: `#F76B3C` (Holly's color)
- Legacy Green: `#1C4B34` (CTA buttons, success states)
- Soft Beige: `#F2F1E9` (backgrounds)
- Warm Brown: `#46403F` (text)
- Accent Teal: `#5FA6A6` (highlights)
- Golden Sunset: `#F3B54A` (savings highlight)

**Fonts**:
- Geist Sans (primary)
- Geist Mono (code)

**Custom Animations**:
- `animate-pulse` - Microphone listening state
- `animate-bounce` - Success icon
- `animate-fadeIn` - Message appearance
- `animate-waveform` - Audio visualization

---

## Testing Your Integration

### 1. Verify Build
```bash
npm run build
```
Should complete with no errors (TypeScript and ESLint errors are currently ignored for rapid prototyping).

### 2. Test Voice Flow
- Connect WebRTC
- Speak user input
- Verify server intent updates `bookingState`
- Check visual highlights sync with audio playback
- Confirm step progression works

### 3. Test Visual Feedback
- When Holly discusses "Cocoa Beach", the destination card should highlight
- When Holly discusses dates, calendar should show yellow glow
- When Holly discusses tour time, time slot should pulse

### 4. Test Mobile Responsiveness
- Open on mobile device
- Verify conversation Sheet drawer opens/closes
- Check scrolling works properly
- Test microphone mute button

---

## Common Pitfalls

### 1. Missing `min-h-0` on Mobile
**Problem**: Content overflows viewport on mobile
**Solution**: Ensure parent container has `flex-1 min-h-0`

### 2. Duplicate Messages
**Problem**: Race conditions cause duplicate Holly messages
**Solution**: Use `lastMessageRef` deduplication pattern (already implemented)

### 3. Visual Highlights Not Clearing
**Problem**: Highlights persist after conversation moves on
**Solution**: Set timeout to clear highlight state after 3-4 seconds

### 4. Step Components Break
**Problem**: Step components expect specific props
**Solution**: Always pass `bookingState` as first prop to all step components

---

## Next Steps

1. **Week 1**: Implement WebRTC connection in `conversation-with-holly.tsx`
2. **Week 2**: Connect server intent parsing in `handleVoiceInput()`
3. **Week 3**: Test all 8 booking steps with real voice
4. **Week 4**: Optimize visual feedback timing with audio playback

---

## Support

- Demo branch: `master` (full keyboard demo for presentations)
- Integration branch: `integration-ready` (this branch, clean for development)
- Compare branches: `git diff master integration-ready` to see what was removed

**Questions?** Check the TODO comments in:
- `components/holly-assistant.tsx:129, 200, 225`
- `components/conversation-with-holly.tsx:44`

These comments explain exactly where to integrate WebRTC and how data should flow.

---

**Good luck with the integration! The UI/UX foundation is solid and ready for real voice functionality.**
