"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bot, Mic, MicOff, Volume2, User, Loader2, Lock, CheckCircle, AlertCircle, MessageCircle, ChevronUp } from "lucide-react"
import type { ConversationMessage } from "@/types/conversation"
import { useEffect, useRef, useState } from "react"

interface ConversationWithHollyProps {
  messages: ConversationMessage[]
  isVoiceActive: boolean
  onToggleVoice: () => void
  onVoiceInput?: (text: string) => void
  isProcessing?: boolean
  currentTranscript?: string
  isMobile?: boolean
}

export function ConversationWithHolly({
  messages,
  isVoiceActive,
  onToggleVoice,
  onVoiceInput,
  isProcessing = false,
  currentTranscript = "",
  isMobile = false
}: ConversationWithHollyProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showInteractionOptions, setShowInteractionOptions] = useState(false)
  const [textInput, setTextInput] = useState("")
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript && onVoiceInput) {
          onVoiceInput(finalTranscript.trim())
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onVoiceInput])

  // Handle voice activation and mute state
  useEffect(() => {
    if (isVoiceActive && !isMuted && recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        console.error('Failed to start speech recognition:', e)
      }
    } else if ((isMuted || !isVoiceActive) && recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isVoiceActive, isMuted, isListening])

  const renderMessage = (message: ConversationMessage) => {
    const isHolly = message.role === "holly"
    const isUser = message.role === "user"
    const Icon = isHolly ? Bot : isUser ? User : null
    const iconBg = isHolly ? "bg-[#F76B3C]/10" : "bg-primary/5"
    const iconColor = isHolly ? "text-[#F76B3C]" : "text-primary"
    const messageBg = isHolly ? "bg-[#F2F1E9]" : "bg-muted/30"
    const displayRole = isHolly ? "Holli" : isUser ? "You" : message.role

    return (
      <div key={message.id} className="flex gap-2 animate-fadeIn">
        {Icon && (
          <div className={`w-6 h-6 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 mt-1`}>
            <Icon className={`w-3 h-3 ${iconColor}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#46403F]/60 mb-1">
            {displayRole}
          </p>
          <div className={`${messageBg} rounded-lg p-2.5`}>
            <p className="text-sm text-[#46403F] leading-relaxed break-words">{message.content}</p>
          </div>
        </div>
      </div>
    )
  }

  // Show microphone enable screen if not active (for both mobile and desktop)
  if (!isVoiceActive && !isMobile) {
    return (
      <Card className="flex flex-col overflow-hidden">
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <div className="w-full space-y-4">
            {/* Audio Waveform Placeholder */}
            <div className="flex justify-center">
              <div className="flex items-center gap-1 h-12">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-2 bg-[#F76B3C] rounded-full animate-waveform"
                    style={{
                      height: i === 2 ? '48px' : i === 1 || i === 3 ? '36px' : '24px',
                      animationDelay: `${i * 100}ms`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Chat With Holli Heading */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#F76B3C]">Book Your Vacation With Holli</h3>
              <p className="text-sm text-[#46403F] mt-2 mb-4">
                Let our AI assistant help you book your vacation today.
              </p>
            </div>

            {/* Features - Hide when interaction options are shown or voice is active */}
            {!showInteractionOptions && !isVoiceActive && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#F76B3C] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-[#46403F]">AI-Powered Matching</p>
                    <p className="text-xs text-[#46403F]/70">Personalized recommendations based on your preferences</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#F76B3C] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-[#46403F]">Flexible Destinations</p>
                    <p className="text-xs text-[#46403F]/70">Explore options or stick to your dream location</p>
                  </div>
                </div>
              </div>
            )}

            {/* Show either CTA or interaction options */}
            {!showInteractionOptions ? (
              <>
                {/* Book Vacation CTA Button */}
                <Button
                  onClick={() => setShowInteractionOptions(true)}
                  className="w-full h-12 text-base font-semibold bg-[#F76B3C] hover:bg-[#F76B3C]/90 border-2 border-[#F76B3C]"
                >
                  Book Now
                </Button>

              </>
            ) : (
              <>
                {/* Interaction Method Options */}
                <div className="space-y-3">
                  <Button
                    onClick={onToggleVoice}
                    className="w-full h-12 text-base font-semibold bg-[#F76B3C] hover:bg-[#F76B3C]/90"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Enable Microphone
                  </Button>

                  <Button
                    disabled
                    className="w-full h-12 text-base font-semibold bg-muted/50 text-muted-foreground cursor-not-allowed"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Texting with Holli
                  </Button>
                </div>

              </>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // MOBILE COMPACT VIEW WITH SHEET
  if (isMobile) {
    const lastMessage = messages[messages.length - 1]

    // Mobile: Compact bar with mute button
    return (
      <Sheet>
        {/* Compact Bar - Always Visible */}
        <div className="flex items-center gap-3 p-3">
          <Button
            onClick={() => setIsMuted(!isMuted)}
            disabled={!isVoiceActive}
            size="lg"
            className={`rounded-full w-12 h-12 flex-shrink-0 transition-all ${
              isVoiceActive && !isMuted
                ? "bg-[#F76B3C] hover:bg-[#F76B3C]/90 text-white shadow-lg"
                : isVoiceActive && isMuted
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                : "bg-[#F2F1E9] hover:bg-[#F2F1E9]/80 text-[#46403F]/60"
            }`}
          >
            {!isVoiceActive ? (
              <MicOff className="w-5 h-5" />
            ) : isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5 animate-pulse" />
            )}
          </Button>

          <SheetTrigger asChild>
            <button className="flex-1 flex items-center gap-2 text-left min-w-0">
              <MessageCircle className="w-4 h-4 text-[#F76B3C] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {lastMessage ? (
                  <p className="text-sm text-[#46403F] truncate">
                    {lastMessage.content}
                  </p>
                ) : (
                  <p className="text-sm text-[#46403F]/60">Tap to view conversation</p>
                )}
              </div>
              <ChevronUp className="w-4 h-4 text-[#46403F]/60 flex-shrink-0" />
            </button>
          </SheetTrigger>
        </div>

        {/* Full Conversation Sheet */}
        <SheetContent side="bottom" className="h-[85vh] flex flex-col min-h-0 p-0">
          <div className="flex flex-col min-h-0 flex-1">
            {/* Header */}
            <div className="p-4 border-b border-[#D0B7A1] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#F76B3C]" />
                <h3 className="font-semibold text-[#46403F]">Holli Assistant</h3>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4 space-y-3">
                {messages.map(renderMessage)}
                <div ref={scrollRef} />
              </div>
            </div>

            {/* Input Section */}
            <div className="flex-shrink-0 p-3 border-t border-[#D0B7A1] bg-white">
              <div className="flex items-center gap-2">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && textInput.trim() && onVoiceInput) {
                      onVoiceInput(textInput.trim())
                      setTextInput("")
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={!isVoiceActive}
                />
                <Button
                  onClick={() => setIsMuted(!isMuted)}
                  disabled={!isVoiceActive}
                  size="lg"
                  className={`rounded-full w-12 h-12 flex-shrink-0 transition-all ${
                    isVoiceActive && !isMuted
                      ? "bg-[#F76B3C] hover:bg-[#F76B3C]/90 text-white shadow-lg"
                      : isVoiceActive && isMuted
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                      : "bg-[#F2F1E9] hover:bg-[#F2F1E9]/80 text-[#46403F]/60"
                  }`}
                >
                  {!isVoiceActive ? (
                    <MicOff className="w-5 h-5" />
                  ) : isMuted ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // DESKTOP VIEW (unchanged)
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Voice Control Header */}
      <div className="p-4 border-b border-[#D0B7A1] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={onToggleVoice}
              size="lg"
              className={`rounded-full w-12 h-12 transition-all ${
                isVoiceActive
                  ? "bg-[#F76B3C] hover:bg-[#F76B3C]/90 text-white shadow-lg scale-110"
                  : "bg-[#F2F1E9] hover:bg-[#F2F1E9]/80 text-[#46403F]/60"
              }`}
            >
              {isVoiceActive ? (
                isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mic className="w-5 h-5 animate-pulse" />
                )
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-[#46403F] text-sm">
                  {isProcessing ? "Holli is speaking..." : isVoiceActive ? "Holli is listening..." : "Click to talk"}
                </p>
                {isProcessing && (
                  <div className="flex items-center gap-1 h-6">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#F76B3C] rounded-full animate-waveform"
                        style={{
                          height: i === 2 ? '24px' : i === 1 || i === 3 ? '18px' : '12px',
                          animationDelay: `${i * 100}ms`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#46403F]/60">
                <div className={`w-2 h-2 rounded-full ${
                  isVoiceActive && !isMuted
                    ? "bg-[#1C4B34] animate-pulse"
                    : isVoiceActive && isMuted
                    ? "bg-red-500"
                    : "bg-[#D0B7A1]"
                }`} />
                {isVoiceActive && isMuted
                  ? "Voice active (muted)"
                  : isVoiceActive
                  ? "Voice active"
                  : "Voice inactive"}
                {currentTranscript && !isMuted && (
                  <span className="ml-2 text-primary italic">Hearing: "{currentTranscript}"</span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            disabled={!isVoiceActive}
            className={`transition-all ${
              isMuted
                ? "text-red-600 hover:bg-red-50"
                : "text-[#46403F]/60 hover:bg-[#F2F1E9]"
            } ${!isVoiceActive ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isMuted ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {/* Show title only when no messages */}
            {messages.length === 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-4 h-4 text-[#F76B3C]" />
                <h3 className="font-semibold text-sm text-[#46403F]">Conversation with Holli</h3>
              </div>
            )}

            <div className="space-y-3">
              {messages.length === 0 && !isVoiceActive && (
                <div className="text-center py-8">
                  <Bot className="w-10 h-10 text-[#46403F]/40 mx-auto mb-3" />
                  <p className="text-sm text-[#46403F]/70">Click the microphone to start talking with Holli</p>
                  <p className="text-xs text-[#46403F]/50 mt-1">Just say what you need - no clicking required!</p>
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg mx-4">
                    <p className="text-xs text-primary font-medium mb-2">Try saying:</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>• "I want the hotel with free breakfast"</p>
                      <p>• "Next weekend for 3 nights"</p>
                      <p>• "Morning tour on Saturday"</p>
                    </div>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#F76B3C]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-[#F76B3C]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#46403F]/60 mb-1">Holli</p>
                    <div className="bg-[#F2F1E9] rounded-lg p-2.5">
                      <div className="flex gap-1 items-center">
                        <div className="w-2 h-2 bg-[#F76B3C] rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-[#F76B3C] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-2 h-2 bg-[#F76B3C] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <span className="text-xs text-[#46403F]/60 ml-2">Processing your request...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {messages.map(renderMessage)}

              {currentTranscript && isVoiceActive && (
                <div className="flex gap-2 opacity-60">
                  <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#46403F]/60 mb-1">You (listening...)</p>
                    <div className="bg-muted/30 rounded-lg p-2.5">
                      <p className="text-sm text-[#46403F] italic">{currentTranscript}</p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
}