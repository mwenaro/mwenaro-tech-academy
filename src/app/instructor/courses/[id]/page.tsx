import { createClient } from '@/lib/supabase/server'
import { BookOpen, Users, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/supabase/database.types'

type Course = Database['public']['Tables']['courses']['Row']
type Enrollment = Database['public']['Tables']['enrollments']['Row'] & {
  user: Database['public']['Tables']['profiles']['Row'] | null
}
type Submission = Database['public']['Tables']['submissions']['Row'] & {
  user: Database['public']['Tables']['profiles']['Row'] | null
  lesson: Database['public']['Tables']['lessons']['Row'] | null
}

export default async function InstructorCoursePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get course
  const { data: courseData } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single()

  const course = courseData as unknown as Course | null

  if (!course || (course as any).instructor_id !== user.id) {
    return (
      <div className="min-h-screen bg-linear-to-br from-light-gray to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-dark-charcoal mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to manage this course.</p>
          <Link href="/dashboard" className="text-bright-teal hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Get enrollments with user info
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, user:profiles(*)')
    .eq('course_id', params.id)
    .eq('status', 'active')

  // Get submissions with user and lesson info
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, user:profiles(*), lesson:lessons(*)')
    .eq('course_id', params.id)
    .order('submitted_at', { ascending: false })

  const enrollmentsData = enrollments as Enrollment[] | null
  const submissionsData = submissions as Submission[] | null

  const pendingSubmissions =
    submissionsData?.filter((s) => s.status === 'pending') || []
  const gradedSubmissions =
    submissionsData?.filter((s) => s.status === 'graded') || []

  return (
    <div className="min-h-screen bg-linear-to-br from-light-gray to-white">
      {/* Header */}
      <div className="bg-linear-to-r from-deep-blue to-bright-teal text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Link
            href="/dashboard"
            className="text-white text-opacity-80 hover:text-opacity-100 mb-4 inline-block"
          >
            ← Back
          </Link>
          <h1 className="text-4xl font-bold mb-2">{(course as Course).title}</h1>
          <p className="text-white text-opacity-90">Course Management</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Enrolled Students</p>
                <p className="text-3xl font-bold text-dark-charcoal">
                  {enrollmentsData?.length || 0}
                </p>
              </div>
              <Users size={32} className="text-bright-teal opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Submissions</p>
                <p className="text-3xl font-bold text-dark-charcoal">
                  {submissionsData?.length || 0}
                </p>
              </div>
              <FileText size={32} className="text-bright-teal opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Pending Grading</p>
                <p className="text-3xl font-bold text-warm-yellow">
                  {pendingSubmissions.length}
                </p>
              </div>
              <AlertCircle size={32} className="text-warm-yellow opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Graded</p>
                <p className="text-3xl font-bold text-green-600">
                  {gradedSubmissions.length}
                </p>
              </div>
              <CheckCircle size={32} className="text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Submissions */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-dark-charcoal mb-6">
                Pending Submissions
              </h2>

              {pendingSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {pendingSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-dark-charcoal">
                            {submission.user?.full_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {submission.lesson?.title}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-warm-yellow bg-opacity-20 text-warm-yellow text-sm font-medium rounded">
                          Pending
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <span>Submitted {new Date(submission.submitted_at).toLocaleDateString()}</span>
                      </div>
                      <a
                        href={submission.submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-bright-teal hover:underline text-sm"
                      >
                        View Submission →
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p>All submissions are graded!</p>
                </div>
              )}
            </div>

            {/* Recent Submissions */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-dark-charcoal mb-6">
                Recent Submissions
              </h2>

              {submissionsData && submissionsData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-dark-charcoal">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-dark-charcoal">
                          Lesson
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-dark-charcoal">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-dark-charcoal">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-dark-charcoal">
                          Grade
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {submissionsData.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{submission.user?.full_name}</td>
                          <td className="px-4 py-3">{submission.lesson?.title}</td>
                          <td className="px-4 py-3">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                submission.status === 'pending'
                                  ? 'bg-warm-yellow bg-opacity-20 text-warm-yellow'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {submission.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {submission.score ? `${submission.score}/100` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No submissions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Enrolled Students */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-dark-charcoal mb-4">
                Enrolled Students
              </h3>

              {enrollmentsData && enrollmentsData.length > 0 ? (
                <div className="space-y-3">
                  {enrollmentsData.slice(0, 10).map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-linear-to-br from-bright-teal to-deep-blue rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-charcoal truncate">
                          {enrollment.user?.full_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {Math.round(enrollment.progress_percentage)}% complete
                        </p>
                      </div>
                    </div>
                  ))}
                  {(enrollmentsData?.length || 0) > 10 && (
                    <p className="text-sm text-gray-600 text-center">
                      +{enrollmentsData.length - 10} more
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No students enrolled yet</p>
                </div>
              )}
            </div>

            {/* Course Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-bold text-dark-charcoal mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-deep-blue text-white rounded-lg hover:bg-opacity-90 transition text-sm">
                  Add Lesson
                </button>
                <button className="w-full px-4 py-2 bg-gray-200 text-dark-charcoal rounded-lg hover:bg-gray-300 transition text-sm">
                  Edit Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
