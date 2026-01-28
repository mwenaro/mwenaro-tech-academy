import { createClient } from '@/lib/supabase/server'
import { BookOpen, Clock, CheckCircle, ChevronLeft, ChevronRight, Lock, Play } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/database.types'
import { Quiz } from '@/components/courses/Quiz'

type Lesson = Database['public']['Tables']['lessons']['Row']
type Module = Database['public']['Tables']['course_modules']['Row']
type Course = Database['public']['Tables']['courses']['Row']

interface ModuleWithCourse extends Module {
  course: Course & {
    course_modules: Array<Module & { lessons: Lesson[] }>
  }
}

type LessonWithModule = Lesson & {
  module: ModuleWithCourse
}

export default async function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get lesson with module and course details
  const { data: lessonData } = await supabase
    .from('lessons')
    .select(
      `
      *,
      module:course_modules(
        *,
        course:courses(
          *,
          course_modules(
            *,
            lessons(*)
          )
        )
      )
    `
    )
    .eq('id', params.lessonId)
    .single()

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-light-gray to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-dark-charcoal mb-4">Lesson Not Found</h1>
          <Link href={`/courses/${params.id}`} className="text-bright-teal hover:underline">
            Back to Course
          </Link>
        </div>
      </div>
    )
  }

  const lesson = lessonData as unknown as LessonWithModule
  const module = lesson.module
  const course = module.course
  const allModules = course.course_modules

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
  const isInstructor = user?.id === course.instructor_id

  // Check if lesson is completed
  const { data: progressData } = user
    ? await supabase
        .from('progress_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', params.lessonId)
        .single()
    : { data: null }

  const isCompleted = !!progressData

  // Mark lesson as completed
  if (user && !isCompleted && (isEnrolled || isInstructor)) {
    try {
      await (supabase.from('progress_tracking') as any).insert({
        user_id: user.id,
        lesson_id: params.lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      })
    } catch {
      // Ignore error if already exists
    }
  }

  // Get navigation - find previous and next lessons
  let previousLesson: Lesson | null = null
  let nextLesson: Lesson | null = null

  let foundLesson = false
  for (let modIdx = 0; modIdx < allModules.length; modIdx++) {
    const mod = allModules[modIdx]
    const lessons = mod.lessons || []
    for (let lesIdx = 0; lesIdx < lessons.length; lesIdx++) {
      if (lessons[lesIdx].id === params.lessonId) {
        foundLesson = true

        // Previous lesson
        if (lesIdx > 0) {
          previousLesson = lessons[lesIdx - 1]
        } else if (modIdx > 0) {
          const prevModule = allModules[modIdx - 1]
          const prevLessons = prevModule.lessons || []
          if (prevLessons.length > 0) {
            previousLesson = prevLessons[prevLessons.length - 1]
          }
        }

        // Next lesson
        if (lesIdx < lessons.length - 1) {
          nextLesson = lessons[lesIdx + 1]
        } else if (modIdx < allModules.length - 1) {
          const nextModule = allModules[modIdx + 1]
          const nextLessons = nextModule.lessons || []
          if (nextLessons.length > 0) {
            nextLesson = nextLessons[0]
          }
        }
      }
      if (foundLesson) break
    }
    if (foundLesson) break
  }

  // Check access - must be enrolled or instructor
  if (!isEnrolled && !isInstructor) {
    return (
      <div className="min-h-screen bg-linear-to-br from-light-gray to-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
            <Lock className="mx-auto mb-4 text-blue-600" size={48} />
            <h1 className="text-2xl font-bold text-dark-charcoal mb-2">Enrollment Required</h1>
            <p className="text-gray-600 mb-6">You need to enroll in this course to view lessons.</p>
            <Link
              href={`/courses/${params.id}`}
              className="inline-block bg-bright-teal text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
            >
              Go Back to Course
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-light-gray to-white">
      {/* Header */}
      <div className="bg-deep-blue text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            href={`/courses/${params.id}`}
            className="inline-flex items-center gap-2 text-white text-opacity-80 hover:text-opacity-100 mb-4 transition"
          >
            <ChevronLeft size={20} />
            Back to Course
          </Link>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <p className="text-white text-opacity-70 mt-2">{course.title}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Video/Content Player */}
            {lesson.content_type === 'video' && lesson.video_url ? (
              <div className="bg-black rounded-lg overflow-hidden shadow-lg mb-8">
                <div className="aspect-video bg-black flex items-center justify-center">
                  <iframe
                    width="100%"
                    height="100%"
                    src={lesson.video_url}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-linear-to-br from-deep-blue to-bright-teal rounded-lg p-12 text-white mb-8 flex items-center justify-center min-h-96">
                <div className="text-center">
                  <Play size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-white text-opacity-70">Content will be displayed here</p>
                </div>
              </div>
            )}

            {/* Lesson Content */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-dark-charcoal mb-2">{lesson.title}</h2>
                  <div className="flex items-center gap-4 text-gray-600 text-sm">
                    <span className="flex items-center gap-1">
                      <BookOpen size={16} />
                      {module.title}
                    </span>
                    {lesson.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {lesson.duration_minutes} minutes
                      </span>
                    )}
                  </div>
                </div>
                {isCompleted && (
                  <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                    <CheckCircle size={20} />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
              </div>

              {/* Lesson Description/Content */}
              <div className="prose prose-sm max-w-none">
                {lesson.content_type === 'text' && lesson.content ? (
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {lesson.content}
                  </div>
                ) : lesson.content_type === 'quiz' ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-dark-charcoal mb-2">Quiz Available</h3>
                    <p className="text-gray-600 mb-4">Test your knowledge with the quiz for this lesson.</p>
                    {(() => {
                      // Parse questions from lesson.content (expected JSON array)
                      let questions: any[] = []
                      try {
                        questions = typeof lesson.content === 'string' && lesson.content.trim()
                          ? JSON.parse(lesson.content as string)
                          : []
                      } catch (e) {
                        questions = []
                      }

                      if (!Array.isArray(questions) || questions.length === 0) {
                        return (
                          <div className="text-sm text-gray-600">No quiz configured for this lesson.</div>
                        )
                      }

                      return (
                        <div className="space-y-4">
                          <Quiz lessonId={lesson.id} courseId={params.id} questions={questions} />
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-gray-600 italic">
                    No content available for this lesson yet.
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Navigation */}
            <div className="flex gap-4">
              {previousLesson ? (
                <Link
                  href={`/courses/${params.id}/lessons/${previousLesson.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-dark-charcoal px-6 py-3 rounded-lg border-2 border-gray-200 hover:border-bright-teal hover:text-bright-teal transition font-medium"
                >
                  <ChevronLeft size={20} />
                  Previous Lesson
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              {nextLesson ? (
                <Link
                  href={`/courses/${params.id}/lessons/${nextLesson.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-bright-teal text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition font-medium"
                >
                  Next Lesson
                  <ChevronRight size={20} />
                </Link>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-medium">
                  <CheckCircle size={20} />
                  Course Completed
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Course Progress */}
          <div className="lg:col-span-1">
            {/* Progress Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="font-semibold text-dark-charcoal mb-4">Course Progress</h3>

              {/* Module Progress */}
              <div className="space-y-3 mb-6">
                {allModules.map((mod) => {
                  const lessons = mod.lessons || []
                  return (
                    <div key={mod.id}>
                      <p className="text-sm font-medium text-gray-700 mb-2">{mod.title}</p>
                      <div className="space-y-1">
                        {lessons.map((les) => (
                          <Link
                            key={les.id}
                            href={`/courses/${params.id}/lessons/${les.id}`}
                            className={`flex items-center gap-2 text-sm p-2 rounded transition ${
                              les.id === params.lessonId
                                ? 'bg-bright-teal bg-opacity-10 text-bright-teal font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {les.id === params.lessonId ? (
                              <div className="w-2 h-2 bg-bright-teal rounded-full" />
                            ) : (
                              <div className="w-2 h-2 bg-gray-300 rounded-full" />
                            )}
                            <span className="truncate">{les.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Current Module</p>
                  <p className="font-medium text-dark-charcoal text-sm">{module.title}</p>
                </div>
                {lesson.duration_minutes && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Duration</p>
                    <p className="font-medium text-dark-charcoal text-sm flex items-center gap-1">
                      <Clock size={14} />
                      {lesson.duration_minutes} minutes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

