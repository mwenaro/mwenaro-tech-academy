/**
 * Learner Analytics
 * 
 * GET /api/analytics/learner?userId={id}
 * Get learner progress and engagement analytics
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
    const targetUserId = searchParams.get('userId') || user.id

    // Verify user can view this data (own data or admin)
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    if (targetUserId !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to view this learner analytics' },
        { status: 403 }
      )
    }

    // Get enrolled courses
    const { data: enrollments } = await (supabase
      .from('enrollments') as any)
      .select(
        `
        id,
        course_id,
        progress,
        enrolled_at,
        courses:courses(id, title, instructor_id)
      `
      )
      .eq('user_id', targetUserId)
      .order('enrolled_at', { ascending: false })

    // Get completed courses count
    const completedCourses = enrollments?.filter(
      (e: any) => e.progress === 100
    ).length || 0

    // Get quiz performance
    const { data: quizAttempts } = await (supabase
      .from('quiz_attempts') as any)
      .select('score, passed')
      .eq('user_id', targetUserId)

    const quizzesPassed = quizAttempts?.filter((q: any) => q.passed).length || 0
    const avgQuizScore =
      quizAttempts && quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((sum: number, q: any) => sum + q.score, 0) /
              quizAttempts.length
          )
        : 0

    // Get certificates earned
    const { data: certificates } = await (supabase
      .from('certificates') as any)
      .select('id, course_id, issued_at')
      .eq('user_id', targetUserId)
      .order('issued_at', { ascending: false })

    // Get assignment submissions
    const { data: submissions } = await (supabase
      .from('submissions') as any)
      .select('id, status, score')
      .eq('user_id', targetUserId)

    const submissionsGraded = submissions?.filter(
      (s: any) => s.status === 'graded'
    ).length || 0
    const avgSubmissionScore =
      submissions && submissions.length > 0
        ? Math.round(
            submissions
              .filter((s: any) => s.score !== null)
              .reduce((sum: number, s: any) => sum + (s.score || 0), 0) /
              submissions.filter((s: any) => s.score !== null).length
          )
        : 0

    // Calculate overall engagement (total actions)
    const totalActions =
      (enrollments?.length || 0) +
      (quizAttempts?.length || 0) +
      (submissions?.length || 0)

    return NextResponse.json(
      {
        userId: targetUserId,
        enrolledCoursesCount: enrollments?.length || 0,
        completedCoursesCount: completedCourses,
        completionRate:
          enrollments && enrollments.length > 0
            ? Math.round((completedCourses / enrollments.length) * 100)
            : 0,
        enrolledCourses: enrollments || [],
        certificatesEarned: certificates?.length || 0,
        certificates: certificates || [],
        quizzesAttempted: quizAttempts?.length || 0,
        quizzesPassed,
        averageQuizScore: avgQuizScore,
        assignmentsSubmitted: submissions?.length || 0,
        assignmentsGraded: submissionsGraded,
        averageAssignmentScore: avgSubmissionScore,
        engagementScore: Math.min(
          100,
          Math.round((totalActions / 50) * 100)
        ), // Normalized to 100
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Learner analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
