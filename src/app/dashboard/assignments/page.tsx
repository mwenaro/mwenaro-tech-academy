import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default async function AssignmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get all submissions for this user
  const { data: submissions } = await supabase
    .from('submissions')
    .select(
      `
      *,
      assignments(title, description, due_date, course_id),
      courses(title)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'submitted':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Assignments</h1>
        <p className="text-gray-600">
          Track your assignment submissions and grades
        </p>
      </div>

      {submissions && submissions.length > 0 ? (
        <div className="space-y-4">
          {(submissions as any[]).map((submission) => (
            <div
              key={submission.id}
              className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {submission.assignments?.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {submission.assignments?.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Course: {submission.courses?.title}
                    </span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(submission.status)}
                      <span className="text-gray-700">
                        {getStatusLabel(submission.status)}
                      </span>
                    </div>
                    {submission.score && (
                      <span className="font-semibold text-foreground">
                        Score: {submission.score}/100
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/courses/${submission.assignments?.course_id}`}
                  className="ml-4 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No assignments yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start a course to begin completing assignments
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
  )
}
