import { createClient } from '@/lib/supabase/server'
import { BookOpen, Award, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Enrollment = Database['public']['Tables']['enrollments']['Row'] & {
  courses: Database['public']['Tables']['courses']['Row'] | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userProfile = profile as Profile | null

  // Get enrollments count for learners
  const { data: enrollments, count: enrollmentsCount } = await supabase
    .from('enrollments')
    .select('*, courses(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('status', 'active')

  const userEnrollments = enrollments as Enrollment[] | null

  // Get certificates count
  const { count: certificatesCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  // Calculate average progress
  const avgProgress =
    userEnrollments && userEnrollments.length > 0
      ? Math.round(
          userEnrollments.reduce((acc, e) => acc + e.progress_percentage, 0) /
            userEnrollments.length
        )
      : 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {userProfile?.full_name || 'Learner'}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s an overview of your learning progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat 1: Active Courses */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              {enrollmentsCount || 0}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Active Courses</h3>
        </div>

        {/* Stat 2: Certificates */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              {certificatesCount || 0}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Certificates Earned</h3>
        </div>

        {/* Stat 3: Average Progress */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <span className="text-2xl font-bold text-foreground">{avgProgress}%</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Average Progress</h3>
        </div>

        {/* Stat 4: Learning Time */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">24h</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Learning Time</h3>
        </div>
      </div>

      {/* Active Courses */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Your Active Courses</h2>
          <Link
            href="/courses"
            className="text-primary hover:text-primary/80 font-medium text-sm"
          >
            Browse All Courses
          </Link>
        </div>

        {userEnrollments && userEnrollments.length > 0 ? (
          <div className="space-y-4">
            {userEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {enrollment.courses?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {enrollment.courses?.category} • {enrollment.courses?.level}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-foreground mb-2">
                    {enrollment.progress_percentage}% Complete
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${enrollment.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>

                <Link
                  href={`/courses/${enrollment.course_id}`}
                  className="ml-4 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Continue
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No active courses yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start your learning journey by enrolling in a course
            </p>
            <Link
              href="/courses"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/assignments"
          className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors"
        >
          <h3 className="font-semibold text-foreground mb-2">View Assignments</h3>
          <p className="text-sm text-gray-600">Check pending and completed assignments</p>
        </Link>

        <Link
          href="/dashboard/messages"
          className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors"
        >
          <h3 className="font-semibold text-foreground mb-2">Messages</h3>
          <p className="text-sm text-gray-600">Chat with your instructors</p>
        </Link>

        <Link
          href="/dashboard/certificates"
          className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors"
        >
          <h3 className="font-semibold text-foreground mb-2">Certificates</h3>
          <p className="text-sm text-gray-600">View and download your certificates</p>
        </Link>
      </div>
    </div>
  )
}
