import { createClient } from '@/lib/supabase/server'
import { BookOpen, Clock, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { AssignmentSubmission } from '@/components/courses/AssignmentSubmission'
import type { Database } from '@/lib/supabase/database.types'

type Lesson = Database['public']['Tables']['lessons']['Row']
type Module = Database['public']['Tables']['modules']['Row']

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', params.lessonId)
    .single()

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-gray to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-dark-charcoal mb-4">Lesson Not Found</h1>
          <Link href={`/courses/${params.courseId}`} className="text-bright-teal hover:underline">
            Back to Course
          </Link>
        </div>
      </div>
    )
  }

  // Get module
  const { data: module } = await supabase
    .from('modules')
    .select('*')
    .eq('id', lesson.module_id)
    .single()

  // Get course for navigation
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.courseId)
    .single()

  // Get all lessons in module for navigation
  const { data: lessonsInModule } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', lesson.module_id)
    .order('order', { ascending: true })

  // Get navigation (previous/next lesson)
  const currentIndex = lessonsInModule?.findIndex((l) => l.id === params.lessonId) ?? -1
  const prevLesson = currentIndex > 0 ? lessonsInModule?.[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < (lessonsInModule?.length ?? 1) - 1 ? lessonsInModule?.[currentIndex + 1] : null

  // Check if user has submitted assignment
  const { data: submission } = user
    ? await supabase
        .from('submissions')
        .select('*')
        .eq('lesson_id', params.lessonId)
        .eq('user_id', user.id)
        .single()
    : { data: null }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-gray to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-bright-teal text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            href={`/courses/${params.courseId}`}
            className="flex items-center gap-2 text-white text-opacity-80 hover:text-opacity-100 mb-4"
          >
            <ArrowLeft size={18} />
            Back to {course?.title}
          </Link>
          <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-white text-opacity-90">{module?.title}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Lesson Content */}
          <div className="lg:col-span-2">
            {/* Video/Content Area */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="bg-gray-900 aspect-video flex items-center justify-center">
                {lesson.video_url ? (
                  <iframe
                    src={lesson.video_url}
                    className="w-full h-full"
                    allowFullScreen
                    title={lesson.title}
                  />
                ) : (
                  <div className="text-white text-center">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No video content available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Content */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-dark-charcoal mb-4">Lesson Content</h2>
              <div className="prose prose-sm max-w-none">
                <p>{lesson.description}</p>
                {lesson.content && (
                  <div
                    className="mt-6 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                )}
              </div>
            </div>

            {/* Assignment */}
            {lesson.assignment && (
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold text-dark-charcoal mb-4">Assignment</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <p className="text-gray-700">{lesson.assignment}</p>
                </div>
                <AssignmentSubmission
                  lessonId={params.lessonId}
                  courseId={params.courseId}
                  hasSubmitted={!!submission}
                  submission={submission}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4">
              {prevLesson && (
                <Link
                  href={`/courses/${params.courseId}/lessons/${prevLesson.id}`}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-dark-charcoal rounded-lg hover:bg-gray-300 transition"
                >
                  <ArrowLeft size={18} />
                  Previous
                </Link>
              )}
              <div className="flex-1" />
              {nextLesson && (
                <Link
                  href={`/courses/${params.courseId}/lessons/${nextLesson.id}`}
                  className="flex items-center gap-2 px-6 py-3 bg-bright-teal text-white rounded-lg hover:bg-opacity-90 transition"
                >
                  Next
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* Lesson Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="font-semibold text-dark-charcoal mb-4">Lesson Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-bright-teal" />
                  <span>{lesson.duration || '30'} minutes</span>
                </div>
                {submission && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={18} />
                    <span>Assignment submitted</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Resources */}
            {lesson.resources && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-dark-charcoal mb-4">Resources</h3>
                <div className="space-y-2">
                  {JSON.parse(lesson.resources).map((resource: any, idx: number) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bright-teal hover:underline text-sm block truncate"
                      title={resource.name}
                    >
                      📎 {resource.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
