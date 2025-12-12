"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendTherapistMessage, getTherapistMessages } from "@/app/actions/therapist"
import { Loader2, Send } from "lucide-react"

interface ChatWithTherapistModalProps {
  therapist: { id: string; full_name: string }
  onClose: () => void
}

export default function ChatWithTherapistModal({ therapist, onClose }: ChatWithTherapistModalProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    loadMessages()
  }, [therapist.id])

  async function loadMessages() {
    const result = await getTherapistMessages(therapist.id)
    if (result.success) {
      setMessages(result.messages || [])
    }
    setLoading(false)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    const result = await sendTherapistMessage(therapist.id, newMessage)

    if (result.success) {
      setNewMessage("")
      loadMessages()
    } else {
      alert(result.error || "Failed to send message")
    }
    setSending(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chat with {therapist.full_name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="h-96 space-y-2 overflow-y-auto rounded-lg border p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg p-3 text-sm ${
                      msg.sender_type === "user" ? "bg-purple-500 text-white" : "bg-muted"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
