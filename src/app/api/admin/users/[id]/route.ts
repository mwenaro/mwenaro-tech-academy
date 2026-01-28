import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/client'

export async function PATCH(request: NextRequest, context: any) {
  try {
    const params = context?.params
    const resolvedParams = params instanceof Promise ? await params : params
    const { id } = resolvedParams || {}
    const body = await request.json()
    const { role } = body || {}

    if (!role || !['learner', 'instructor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await (supabaseAdmin as any)
      .from('profiles')
      .update({ role })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Audit log (best-effort)
    try {
      const performed_by = body?.performed_by ?? null
      await (supabaseAdmin as any)
        .from('admin_audit_logs')
        .insert({
          action: 'role_change',
          performed_by,
          target_user_id: id,
          details: JSON.stringify({ role }),
          created_at: new Date().toISOString(),
        })
    } catch (e) {
      console.warn('Failed to insert audit log (role_change)', e)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin user role update error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const params = context?.params
    const resolvedParams = params instanceof Promise ? await params : params
    const { id } = resolvedParams || {}
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json().catch(() => ({}))

    // Delete user from auth
    try {
      // supabase admin SDK provides auth.admin.deleteUser
      // @ts-ignore
      await supabaseAdmin.auth.admin.deleteUser(id)
    } catch (e) {
      // ignore if not available; continue to remove profile
      console.warn('Could not delete auth user via admin API', e)
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Audit log for deletion (best-effort)
    try {
      const performed_by = (body as any)?.performed_by ?? null
      await (supabaseAdmin as any)
        .from('admin_audit_logs')
        .insert({
          action: 'delete_user',
          performed_by,
          target_user_id: id,
          details: JSON.stringify({ deleted: true }),
          created_at: new Date().toISOString(),
        })
    } catch (e) {
      console.warn('Failed to insert audit log (delete_user)', e)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin delete user error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

