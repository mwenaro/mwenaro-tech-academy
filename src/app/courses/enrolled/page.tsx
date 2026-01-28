import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Calendar, CheckCircle } from 'lucide-react'
import UnenrollButton from '@/components/courses/UnenrollButton'

export default async function EnrolledCoursesPage({ searchParams }: { searchParams?: { page?: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Middleware should redirect, but double-check
    return (
      <div className="p-8 text-center">Please sign in to view your courses.</div>
    )
  }

  const { data: enrollments } = await (supabase.from('enrollments') as any)
    .select(
      `id, course_id, progress, enrolled_at, courses:courses(id, title, description, instructor_id, slug)`
    )
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })

  // Pagination
  const pageNum = searchParams?.page ? parseInt(searchParams.page as string, 10) || 1 : 1
  const pageSize = 10

  // Fetch paginated enrollments with count
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize - 1

  const { data: enrollments, count } = await (supabase.from('enrollments') as any)
    .select(
      `id, course_id, progress, enrolled_at, courses:courses(id, title, description, instructor_id, slug)`,
      { count: 'exact' }
    )
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })
    .range(start, end)

  // For each enrollment, fetch lesson counts and per-user progress
  const enriched: any[] = []
  for (const en of enrollments || []) {
    const course = en.courses || en.course || null

    // Get modules and lessons for the course to compute totals
    const { data: modules } = await (supabase.from('course_modules') as any)
      .select('id, lessons(id)')
      .eq('course_id', course?.id)

    const lessonIds: string[] = []
    if (modules && Array.isArray(modules)) {
      for (const m of modules) {
        if (m.lessons && Array.isArray(m.lessons)) {
          for (const l of m.lessons) {
            lessonIds.push(l.id)
          }
        }
      }
    }

    const totalLessons = lessonIds.length
    let completedLessons = 0
    if (totalLessons > 0) {
      const { data: completed } = await (supabase.from('progress_tracking') as any)
        .select('lesson_id')
        .in('lesson_id', lessonIds)
        .eq('user_id', user.id)
        .eq('completed', true)

      completedLessons = Array.isArray(completed) ? completed.length : 0
    }

    const calculatedProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : (typeof en.progress === 'number' ? en.progress : 0)

    enriched.push({ ...en, course, totalLessons, completedLessons, calculatedProgress })
  }

  const total = (count as number) || (enriched.length)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Courses</h1>
        <p className="text-gray-600">Courses you are enrolled in and your progress</p>
      </div>

      {enriched && enriched.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enriched.map((en: any) => {
            const course = en.course || null
            const progress = en.calculatedProgress || 0
            return (
              <div key={en.id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <BookOpen className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {course ? (
                        <Link href={`/courses/${course.id}`} className="hover:underline">
                          {course.title}
                        </Link>
                      ) : (
                        'Untitled course'
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {course?.description || ''}
                    </p>

                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(en.enrolled_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{en.completedLessons}/{en.totalLessons} lessons</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Link
                            href={`/courses/${course?.id}/lessons`}
                            className="text-sm text-primary font-semibold hover:text-primary/90"
                          >
                            Continue
                          </Link>
                          <UnenrollButton courseId={course?.id} />
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3" aria-hidden>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                          <div className="h-3 bg-primary" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{progress}% complete</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href={`/courses/enrolled?page=${Math.max(1, pageNum - 1)}`}
            className="px-3 py-1 rounded-md border border-border"
            aria-label="Previous page"
          >
            Previous
          </Link>
          <span className="text-sm text-gray-600">Page {pageNum} — {total} total</span>
          <Link
            href={`/courses/enrolled?page=${pageNum + 1}`}
            className="px-3 py-1 rounded-md border border-border"
            aria-label="Next page"
          >
            Next
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No courses yet</h3>
          <p className="text-gray-600">You are not enrolled in any courses. Browse available courses to get started.</p>
        </div>
      )}
    </div>
  )
}
