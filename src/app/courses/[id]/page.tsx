import { createClient } from '@/lib/supabase/server'
import { BookOpen, Clock, Users, Star, Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { EnrollButton } from '@/components/courses/EnrollButton'
import { ModulesList } from '@/components/courses/ModulesList'
import type { Database } from '@/lib/supabase/database.types'

type Course = Database['public']['Tables']['courses']['Row']
type Module = Database['public']['Tables']['course_modules']['Row']
type Lesson = Database['public']['Tables']['lessons']['Row']
type Enrollment = Database['public']['Tables']['enrollments']['Row']

interface CourseWithDetails extends Course {
  instructor: { full_name: string } | null
  course_modules: (Module & { lessons: Lesson[] })[]
}

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get course with instructor and modules/lessons
  const { data: course } = await supabase
    .from('courses')
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(full_name),
      course_modules(
        *,
        lessons(*)
      )
    `
    )
    .eq('id', params.id)
    .single()

  if (!course) {
    return (
      <div className="min-h-screen bg-linear-to-br from-light-gray to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-dark-charcoal mb-4">Course Not Found</h1>
          <Link href="/courses" className="text-bright-teal hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  // Check if user is enrolled
  const { data: enrollment } = user
    ? await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', params.id)
        .single()
    : { data: null }

  const isEnrolled = !!enrollment
  const isInstructor = user?.id === (course as Course).instructor_id

  // Get total lessons count
  const totalLessons = (course as CourseWithDetails).course_modules?.reduce(
    (acc: number, m: Module & { lessons: Lesson[] }) => acc + (m.lessons?.length || 0),
    0
  ) || 0

  return (
    <div className="min-h-screen bg-linear-to-br from-light-gray to-white">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-deep-blue to-bright-teal text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                  {(course as Course).level || 'Beginner'}
                </span>
                {isEnrolled && (
                  <span className="px-3 py-1 bg-green-500 rounded-full text-sm font-medium flex items-center gap-1">
                    <CheckCircle size={16} /> Enrolled
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4">{(course as Course).title}</h1>
              <p className="text-lg text-white text-opacity-90 mb-6">{(course as Course).description}</p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>{(course as any).students_count || 0} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={18} />
                  <span>{totalLessons} lessons</span>
                </div>
                {(course as any).duration_weeks && (
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>{(course as any).duration_weeks} weeks</span>
                  </div>
                )}
                {(course as any).rating && (
                  <div className="flex items-center gap-2">
                    <Star size={18} className="fill-current" />
                    <span>{(course as any).rating.toFixed(1)} rating</span>
                  </div>
                )}
              </div>
            </div>

            {!isInstructor && (
              <div className="ml-8">
                <EnrollButton courseId={params.id} isEnrolled={isEnrolled} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2">
            {/* Course Overview */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-dark-charcoal mb-4">About This Course</h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>{(course as Course).description}</p>
                {(course as any).objectives && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-dark-charcoal mb-3">What you'll learn:</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {(course as any).objectives.split('\n').map((obj: string, idx: number) => (
                        <li key={idx}>{obj.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Course Curriculum */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-dark-charcoal mb-6">Course Curriculum</h2>

              {isEnrolled || isInstructor ? (
                <ModulesList modules={(course as CourseWithDetails).course_modules || []} courseId={params.id} />
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center gap-4">
                  <Lock className="text-blue-600 shrink-0" size={24} />
                  <div>
                    <p className="font-semibold text-dark-charcoal">Enroll to view curriculum</p>
                    <p className="text-gray-600 text-sm">Sign up for this course to see the lessons and start learning.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* Instructor Card */}
            {(course as CourseWithDetails).instructor && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="font-semibold text-dark-charcoal mb-3">Instructor</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-bright-teal to-deep-blue rounded-full" />
                  <div>
                    <p className="font-medium text-dark-charcoal">{(course as CourseWithDetails).instructor?.full_name}</p>
                    <p className="text-sm text-gray-600">Course Instructor</p>
                  </div>
                </div>
              </div>
            )}

            {/* Course Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-dark-charcoal mb-4">Course Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Level</p>
                  <p className="font-medium text-dark-charcoal">{(course as Course).level || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-medium text-dark-charcoal">{(course as any).duration_weeks ? `${(course as any).duration_weeks} weeks` : 'Self-paced'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Students</p>
                  <p className="font-medium text-dark-charcoal">{(course as any).students_count || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Price</p>
                  <p className="font-medium text-dark-charcoal">
                    {(course as Course).price ? `$${((course as Course).price / 100).toFixed(2)}` : 'Free'}
                  </p>
                </div>
              </div>
            </div>

            {isInstructor && (
              <Link
                href={`/instructor/courses/${params.id}`}
                className="mt-6 w-full inline-block bg-deep-blue text-white py-2 px-4 rounded-lg text-center hover:bg-opacity-90 transition"
              >
                Manage Course
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
