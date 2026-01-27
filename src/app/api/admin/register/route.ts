import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

export async function POST(request: Request) {
  try {
    const { email, password, fullName, adminKey } = await request.json()

    if (!email || !password || !fullName || !adminKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const expectedKey = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'mwerotech-admin-2026'
    if (adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Invalid admin key' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Create user with email confirmed to avoid email verification block
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    const userId = userData.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Ensure profile has admin role and name
    const profilePayload: ProfileInsert = {
      id: userId,
      email,
      full_name: fullName,
      role: 'admin',
    }

    const { error: profileError } = await (supabaseAdmin as any)
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin register error:', error)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
