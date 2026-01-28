import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

function generateTempPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let out = ''
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, fullName, role, performed_by } = body || {}

    if (!email || !fullName || !role || !['learner', 'instructor'].includes(role)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Best-effort admin check: ensure `performed_by` is an admin
    if (!performed_by) {
      return NextResponse.json({ error: 'Missing performed_by' }, { status: 401 })
    }

    const { data: callerProfile } = await (supabaseAdmin as any)
      .from('profiles')
      .select('role')
      .eq('id', performed_by)
      .single()

    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const tempPassword = generateTempPassword()

    // Create auth user via admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    const userId = userData.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Upsert profile
    try {
      await (supabaseAdmin as any)
        .from('profiles')
        .upsert({ id: userId, email, full_name: fullName, role }, { onConflict: 'id' })
    } catch (e) {
      console.warn('Profile upsert failed', e)
    }

    // Build invite email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'
    const loginUrl = `${siteUrl.replace(/\/$/, '')}/auth/login`
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || `noreply@${new URL(siteUrl).hostname}`

    const subject = `You're invited to Mwero Tech Academy`
    const html = `
      <p>Hi ${fullName},</p>
      <p>You have been invited to join Mwero Tech Academy as a <strong>${role}</strong>.</p>
      <p>Your username: <strong>${email}</strong></p>
      <p>Temporary password: <strong>${tempPassword}</strong></p>
      <p>Please sign in at <a href="${loginUrl}">${loginUrl}</a> using the temporary password, then update your password and complete your profile.</p>
      <p>If you did not expect this invite, please ignore this email.</p>
      <p>— Mwero Tech Academy</p>
    `

    // Send email via SendGrid if configured
    const sendgridKey = process.env.SENDGRID_API_KEY
    let emailSent = false
    if (sendgridKey) {
      try {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sendgridKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }], subject }],
            from: { email: fromEmail, name: 'Mwero Tech Academy' },
            content: [{ type: 'text/html', value: html }],
          }),
        })
        emailSent = true
      } catch (e) {
        console.warn('SendGrid error', e)
      }
    }

    // Audit
    try {
      await (supabaseAdmin as any)
        .from('admin_audit_logs')
        .insert({
          action: 'invite_user',
          performed_by,
          target_user_id: userId,
          details: JSON.stringify({ email, role }),
          created_at: new Date().toISOString(),
        })
    } catch (e) {
      console.warn('Audit log insert failed', e)
    }

    // If SendGrid not configured, return temp password in non-production for admin convenience
    if (!sendgridKey && process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ success: true, tempPassword })
    }

    return NextResponse.json({ success: true, emailSent })
  } catch (err) {
    console.error('Admin invite error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
