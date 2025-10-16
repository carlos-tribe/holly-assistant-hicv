export type MessageRole = "holly" | "user" | "system"

export interface ConversationMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
}