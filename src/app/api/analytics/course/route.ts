/**
 * Course-Specific Analytics
 * 
 * GET /api/analytics/course?courseId={id}
 * Get analytics for a specific course (instructor view)
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

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'Missing courseId parameter' },
        { status: 400 }
      )
    }

    // Verify user is instructor of this course
    const { data: course } = await (supabase
      .from('courses') as any)
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (!course || course.instructor_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view this course analytics' },
        { status: 403 }
      )
    }

    // Get enrollment count
    const { count: enrollmentCount } = await (supabase
      .from('enrollments') as any)
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)

    // Get completion count
    const { count: completionCount } = await (supabase
      .from('enrollments') as any)
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .eq('progress', 100)

    // Get average progress
    const { data: progressData } = await (supabase
      .from('enrollments') as any)
      .select('progress')
      .eq('course_id', courseId)

    const avgProgress =
      progressData && progressData.length > 0
        ? Math.round(
            progressData.reduce((sum: number, e: any) => sum + e.progress, 0) /
              progressData.length
          )
        : 0

    // Get enrolled learners details
    const { data: enrollments } = await (supabase
      .from('enrollments') as any)
      .select(
        `
        id,
        user_id,
        progress,
        enrolled_at,
        profiles:profiles(id, full_name, email)
      `
      )
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false })

    // Get certificate count
    const { count: certificateCount } = await (supabase
      .from('certificates') as any)
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)

    // Get quiz attempt count
    const { data: quizAttempts } = await (supabase
      .from('quiz_attempts') as any)
      .select('score')
      .eq('course_id', courseId)

    const avgScore =
      quizAttempts && quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((sum: number, q: any) => sum + q.score, 0) /
              quizAttempts.length
          )
        : 0

    const completionRate =
      enrollmentCount && enrollmentCount > 0
        ? Math.round((completionCount! / enrollmentCount) * 100)
        : 0

    return NextResponse.json(
      {
        courseId,
        enrollmentCount: enrollmentCount || 0,
        completionCount: completionCount || 0,
        completionRate,
        averageProgress: avgProgress,
        certificateCount: certificateCount || 0,
        averageQuizScore: avgScore,
        enrolledLearners: enrollments || [],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Course analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
