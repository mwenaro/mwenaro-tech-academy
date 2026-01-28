'use client'

/**
 * Analytics Dashboard Component
 * 
 * Displays comprehensive analytics and metrics with:
 * - Platform-wide metrics (admin view)
 * - Course-specific metrics (instructor view)
 * - Learner progress tracking (learner view)
 * - Data visualization with charts
 * - Performance indicators
 */

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface DashboardMetrics {
  totalUsers?: number
  totalCourses?: number
  totalEnrollments?: number
  totalRevenueUsd?: string
  completionRate: number
  averageRating?: number
}

interface CourseMetrics {
  courseId: string
  enrollmentCount: number
  completionCount: number
  completionRate: number
  averageProgress: number
  certificateCount: number
  averageQuizScore: number
  enrolledLearners: Array<{
    id: string
    user_id: string
    progress: number
    enrolled_at: string
    profiles: { full_name: string; email: string }
  }>
}

interface LearnerMetrics {
  userId: string
  enrolledCoursesCount: number
  completedCoursesCount: number
  completionRate: number
  certificatesEarned: number
  quizzesAttempted: number
  quizzesPassed: number
  averageQuizScore: number
  assignmentsSubmitted: number
  assignmentsGraded: number
  averageAssignmentScore: number
  engagementScore: number
}

interface AnalyticsDashboardProps {
  viewType: 'admin' | 'instructor' | 'learner'
  courseId?: string
  userId?: string
}

function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; isPositive: boolean }
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-1 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className="text-blue-600 text-3xl">{icon}</div>
      </div>
    </div>
  )
}

function ProgressBar({
  label,
  value,
  max = 100,
  color = 'blue',
}: {
  label: string
  value: number
  max?: number
  color?: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const percentage = Math.round((value / max) * 100)
  const colorClass = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  }[color]

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${colorClass} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

export default function AnalyticsDashboard({
  viewType,
  courseId,
  userId,
}: AnalyticsDashboardProps) {
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(
    null
  )
  const [courseMetrics, setCourseMetrics] = useState<CourseMetrics | null>(null)
  const [learnerMetrics, setLearnerMetrics] = useState<LearnerMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [viewType, courseId, userId])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)

      if (viewType === 'admin') {
        const response = await fetch('/api/analytics/dashboard')
        if (response.ok) {
          const data = await response.json()
          setDashboardMetrics(data)
        }
      } else if (viewType === 'instructor' && courseId) {
        const response = await fetch(`/api/analytics/course?courseId=${courseId}`)
        if (response.ok) {
          const data = await response.json()
          setCourseMetrics(data)
        }
      } else if (viewType === 'learner') {
        const params = userId ? `?userId=${userId}` : ''
        const response = await fetch(`/api/analytics/learner${params}`)
        if (response.ok) {
          const data = await response.json()
          setLearnerMetrics(data)
        }
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Admin Dashboard */}
      {viewType === 'admin' && dashboardMetrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Users"
              value={dashboardMetrics.totalUsers || 0}
              icon="👥"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              label="Total Courses"
              value={dashboardMetrics.totalCourses || 0}
              icon="📚"
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              label="Total Enrollments"
              value={dashboardMetrics.totalEnrollments || 0}
              icon="✓"
              trend={{ value: 23, isPositive: true }}
            />
            <StatCard
              label="Revenue"
              value={`$${dashboardMetrics.totalRevenueUsd || '0.00'}`}
              icon="💰"
              trend={{ value: 18, isPositive: true }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Completion Rate
              </h3>
              <ProgressBar
                label="Course Completion"
                value={dashboardMetrics.completionRate}
                color="green"
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Average Rating
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-yellow-500">
                  {dashboardMetrics.averageRating}
                </span>
                <span className="text-yellow-500">★★★★☆</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Instructor Dashboard */}
      {viewType === 'instructor' && courseMetrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Enrolled Learners"
              value={courseMetrics.enrollmentCount}
              icon="👨‍🎓"
            />
            <StatCard
              label="Course Completion"
              value={`${courseMetrics.completionRate}%`}
              icon="✓"
            />
            <StatCard
              label="Certificates Issued"
              value={courseMetrics.certificateCount}
              icon="🏆"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Learner Progress
              </h3>
              <ProgressBar
                label="Average Progress"
                value={courseMetrics.averageProgress}
                color="blue"
              />
              <p className="text-sm text-gray-600 mt-2">
                {courseMetrics.completionCount} learners completed the course
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quiz Performance
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {courseMetrics.averageQuizScore}%
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Average quiz score across learners
              </p>
            </div>
          </div>

          {/* Enrolled Learners Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Enrolled Learners ({courseMetrics.enrollmentCount})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Enrolled Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courseMetrics.enrolledLearners.map((learner) => (
                    <tr
                      key={learner.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {learner.profiles?.full_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {learner.profiles?.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${learner.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {learner.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(learner.enrolled_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Learner Dashboard */}
      {viewType === 'learner' && learnerMetrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Courses Enrolled"
              value={learnerMetrics.enrolledCoursesCount}
              icon="📚"
            />
            <StatCard
              label="Completed"
              value={learnerMetrics.completedCoursesCount}
              icon="✓"
            />
            <StatCard
              label="Certificates Earned"
              value={learnerMetrics.certificatesEarned}
              icon="🏆"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Overall Progress
              </h3>
              <ProgressBar
                label="Completion Rate"
                value={learnerMetrics.completionRate}
                color="green"
              />
              <p className="text-sm text-gray-600 mt-2">
                {learnerMetrics.completedCoursesCount} of{' '}
                {learnerMetrics.enrolledCoursesCount} courses completed
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Engagement Score
              </h3>
              <ProgressBar
                label="Engagement"
                value={learnerMetrics.engagementScore}
                color="purple"
              />
              <p className="text-sm text-gray-600 mt-2">
                Based on activity and course completion
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quiz Performance
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {learnerMetrics.averageQuizScore}%
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {learnerMetrics.quizzesPassed} of {learnerMetrics.quizzesAttempted}{' '}
                quizzes passed
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Assignment Performance
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {learnerMetrics.averageAssignmentScore}%
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {learnerMetrics.assignmentsGraded} of{' '}
                {learnerMetrics.assignmentsSubmitted} assignments graded
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
