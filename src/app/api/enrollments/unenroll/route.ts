import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { courseId } = body || {}
    if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 })

    // Delete enrollment for this user and course
    const { data: existing } = await (supabase.from('enrollments') as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    const { error } = await (supabase.from('enrollments') as any)
      .delete()
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Insert audit log (best-effort)
    try {
      await (supabase.from('admin_audit_logs') as any).insert({
        action: 'unenroll',
        performed_by: user.id,
        target_user_id: user.id,
        details: JSON.stringify({ courseId }),
        created_at: new Date().toISOString(),
      })
    } catch (e) {
      console.warn('Failed to insert unenroll audit log', e)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unenroll error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
