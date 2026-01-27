/**
 * Real-time Messaging API
 * 
 * Handles learner-instructor messaging
 * POST /api/messages/send - Send a message
 * GET /api/messages - Retrieve message thread
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/messages/send
 * 
 * Send message between users
 * 
 * Request body:
 * - receiverId: UUID of message recipient
 * - courseId: UUID of related course
 * - message: Message text content
 * 
 * Response:
 * - messageId: UUID of created message
 * - createdAt: ISO timestamp
 * - status: 'sent'
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId, courseId, message } = body

    if (!receiverId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: receiverId, message' },
        { status: 400 }
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message cannot exceed 5000 characters' },
        { status: 400 }
      )
    }

    // Create message record
    const { data: newMessage, error: msgError } = await (supabase
      .from('messages') as any)
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        course_id: courseId || null,
        message: message.trim(),
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (msgError) {
      return NextResponse.json(
        { error: 'Failed to send message', details: msgError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        messageId: newMessage.id,
        createdAt: newMessage.created_at,
        status: 'sent',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Message send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/messages?userId={id}&courseId={id}
 * 
 * Retrieve messages between current user and another user
 * 
 * Query params:
 * - userId: UUID of other participant (required)
 * - courseId: UUID of course (optional filter)
 * - limit: Number of messages to return (default 50)
 * 
 * Response:
 * - Array of message objects sorted by date
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const otherUserId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Get messages between two users
    let query = supabase
      .from('messages')
      .select(
        `
        *,
        sender:profiles(id, full_name, avatar_url),
        receiver:profiles(id, full_name, avatar_url)
      `
      )
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      )

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    const { data: messages, error } = await (query as any)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to retrieve messages' },
        { status: 500 }
      )
    }

    // Mark messages as read
    await (supabase.from('messages') as any)
      .update({ read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', otherUserId)
      .catch(() => {})

    return NextResponse.json(messages.reverse(), { status: 200 })
  } catch (error) {
    console.error('Messages retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/messages/conversations
 * 
 * Get list of active conversations for user
 * 
 * Response:
 * - Array of conversation summaries with last message
 */
export async function GET_CONVERSATIONS(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get unique users in conversations
    const { data: conversations, error } = await (supabase
      .from('messages') as any)
      .select(
        `
        sender_id,
        receiver_id,
        message,
        created_at,
        read,
        sender:profiles!sender_id(id, full_name, avatar_url),
        receiver:profiles!receiver_id(id, full_name, avatar_url)
      `
      )
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to retrieve conversations' },
        { status: 500 }
      )
    }

    // Group by unique users
    const uniqueConversations = new Map()
    conversations.forEach((msg: any) => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      if (!uniqueConversations.has(otherId)) {
        uniqueConversations.set(otherId, {
          userId: otherId,
          userName:
            msg.sender_id === user.id ? msg.receiver?.full_name : msg.sender?.full_name,
          lastMessage: msg.message,
          lastMessageTime: msg.created_at,
          unread: msg.sender_id !== user.id && !msg.read,
        })
      }
    })

    return NextResponse.json(Array.from(uniqueConversations.values()), { status: 200 })
  } catch (error) {
    console.error('Conversations retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
