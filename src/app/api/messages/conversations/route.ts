/**
 * Get Active Conversations
 * 
 * GET /api/messages/conversations
 * Retrieves list of unique conversations for current user with last message
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all messages for this user
    const { data: messages, error } = await (supabase
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

    // Group by unique users (conversation partners)
    const uniqueConversations = new Map()

    messages?.forEach((msg: any) => {
      const otherId =
        msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      const otherUser =
        msg.sender_id === user.id ? msg.receiver : msg.sender

      if (!uniqueConversations.has(otherId)) {
        uniqueConversations.set(otherId, {
          userId: otherId,
          userName: otherUser?.full_name || 'Unknown User',
          avatarUrl: otherUser?.avatar_url,
          lastMessage: msg.message,
          lastMessageTime: msg.created_at,
          unread: msg.sender_id !== user.id && !msg.read,
        })
      }
    })

    return NextResponse.json(
      Array.from(uniqueConversations.values()),
      { status: 200 }
    )
  } catch (error) {
    console.error('Conversations retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
