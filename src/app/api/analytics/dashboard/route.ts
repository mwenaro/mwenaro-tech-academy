/**
 * Analytics Data API
 * 
 * Provides analytics and metrics for instructors and admins
 * GET /api/analytics/dashboard - Overall platform analytics
 * GET /api/analytics/course - Per-course analytics
 * GET /api/analytics/learner - Learner progress and engagement
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/analytics/dashboard
 * 
 * Get overall platform analytics
 * Admin-only endpoint
 * 
 * Response:
 * - totalUsers: Total registered users
 * - totalCourses: Total courses
 * - totalEnrollments: Total course enrollments
 * - totalRevenue: Total revenue in cents
 * - completionRate: Percentage of learners who complete courses
 * - averageRating: Average course rating
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

    // Check if user is admin
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can access this endpoint' },
        { status: 403 }
      )
    }

    // Get total users
    const { count: totalUsers } = await (supabase
      .from('profiles') as any)
      .select('id', { count: 'exact', head: true })

    // Get total courses
    const { count: totalCourses } = await (supabase
      .from('courses') as any)
      .select('id', { count: 'exact', head: true })

    // Get total enrollments
    const { count: totalEnrollments } = await (supabase
      .from('enrollments') as any)
      .select('id', { count: 'exact', head: true })

    // Get completed enrollments for completion rate
    const { count: completedEnrollments } = await (supabase
      .from('enrollments') as any)
      .select('id', { count: 'exact', head: true })
      .eq('progress', 100)

    // Get total revenue (sum of paid payments)
    const { data: revenueData } = await (supabase
      .from('payments') as any)
      .select('amount_cents')
      .eq('status', 'paid')

    const totalRevenue = revenueData?.reduce(
      (sum: number, p: any) => sum + (p.amount_cents || 0),
      0
    ) || 0

    const completionRate =
      totalEnrollments && totalEnrollments > 0
        ? Math.round((completedEnrollments! / totalEnrollments) * 100)
        : 0

    return NextResponse.json(
      {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalEnrollments: totalEnrollments || 0,
        totalRevenueUsd: (totalRevenue / 100).toFixed(2),
        completionRate,
        averageRating: 4.5, // Placeholder - requires ratings implementation
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Dashboard analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
