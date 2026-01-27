'use client'

/**
 * Real-time Chat Component
 * 
 * Provides real-time messaging interface with:
 * - Message sending and receiving
 * - Real-time updates using Supabase Realtime
 * - Conversation list
 * - User presence indicators
 * - Unread message badges
 */

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  created_at: string
  read: boolean
  sender?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  receiver?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface Conversation {
  userId: string
  userName: string
  lastMessage: string
  lastMessageTime: string
  unread: boolean
}

interface ChatProps {
  currentUserId: string
  currentUserName: string
  otherUserId?: string
  courseId?: string
}

export default function Chat({
  currentUserId,
  currentUserName,
  otherUserId,
  courseId,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    otherUserId || null
  )
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [currentUserId])

  // Subscribe to real-time messages
  useEffect(() => {
    if (!selectedUserId) return

    loadMessages()

    // Subscribe to new messages
    const subscription = (supabase
      .channel(`messages_${currentUserId}_${selectedUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${currentUserId}))`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()) as any

    return () => {
      subscription.unsubscribe()
    }
  }, [selectedUserId, currentUserId])

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true)
      const response = await fetch('/api/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const loadMessages = async () => {
    if (!selectedUserId) return

    try {
      const params = new URLSearchParams({
        userId: selectedUserId,
        ...(courseId && { courseId }),
      })
      const response = await fetch(`/api/messages?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserId || !messageInput.trim()) {
      toast.error('Select a conversation and enter a message')
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUserId,
          courseId: courseId || null,
          message: messageInput,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to send message')
        return
      }

      setMessageInput('')
      loadConversations() // Refresh conversation list
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {isLoadingConversations ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => setSelectedUserId(conv.userId)}
                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition ${
                  selectedUserId === conv.userId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{conv.userName}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread && (
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                      1
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(conv.lastMessageTime).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {conversations.find((c) => c.userId === selectedUserId)?.userName}
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                  Active
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === currentUserId
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender_id === currentUserId
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender_id === currentUserId
                            ? 'text-blue-100'
                            : 'text-gray-400'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={sendMessage}
              className="p-4 border-t border-gray-200 bg-white"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={5000}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !messageInput.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {messageInput.length}/5000 characters
              </p>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
