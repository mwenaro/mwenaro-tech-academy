'use client'

import { useEffect, useState } from 'react'
import Chat from '@/components/courses/Chat'
import { MessageCircle } from 'lucide-react'

interface Conversation {
  userId: string
  userName: string
  lastMessage: string
  lastMessageTime: string
  unread: boolean
}

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserAndConversations()
  }, [])

  const loadUserAndConversations = async () => {
    try {
      setIsLoading(true)

      // Get conversations
      const response = await fetch('/api/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
        
        // Set a mock current user - actual data comes from the API
        setCurrentUser({
          id: 'current-user',
          full_name: 'You',
        })
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading conversations...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view messages</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
        <p className="text-gray-600">
          Chat with your instructors and course mates
        </p>
      </div>

      {conversations && conversations.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Chat
            currentUserId={currentUser.id}
            currentUserName={currentUser.full_name || 'User'}
          />
        </div>
      ) : (
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No conversations yet
          </h3>
          <p className="text-gray-600">
            Start a course to connect with instructors and other learners
          </p>
        </div>
      )}
    </div>
  )
}
