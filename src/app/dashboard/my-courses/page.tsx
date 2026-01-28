import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Calendar, CheckCircle } from 'lucide-react'

export default async function DashboardMyCoursesPage({ searchParams }: { searchParams?: { page?: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-8 text-center">Please sign in to view your courses.</div>
    )
  }

  const pageNum = searchParams?.page ? parseInt(searchParams.page as string, 10) || 1 : 1
  const pageSize = 10
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize - 1

  const { data: enrollments, count } = await (supabase.from('enrollments') as any)
    .select(
      `id, course_id, progress, enrolled_at, courses:courses(id, title, slug, instructor_id)`,
      { count: 'exact' }
    )
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })
    .range(start, end)

  // Enrich with lesson progress
  const enriched: any[] = []
  for (const en of enrollments || []) {
    const course = en.courses || null
    const { data: modules } = await (supabase.from('course_modules') as any)
      .select('id, lessons(id)')
      .eq('course_id', course?.id)

    const lessonIds: string[] = []
    if (modules && Array.isArray(modules)) {
      for (const m of modules) {
        if (m.lessons && Array.isArray(m.lessons)) {
          for (const l of m.lessons) lessonIds.push(l.id)
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

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-gray-600">Overview of your enrolled courses and progress</p>
        </div>
      </div>

      {enriched && enriched.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {enriched.map((en) => {
            const course = en.course || null
            const progress = en.calculatedProgress || 0

            return (
              <div key={en.id} className="bg-card rounded-md border border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-md">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {course ? (
                        <Link href={`/courses/${course.id}`} className="hover:underline">
                          {course.title}
                        </Link>
                      ) : (
                        'Untitled course'
                      )}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(en.enrolled_at).toLocaleDateString()}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{en.completedLessons}/{en.totalLessons} lessons</span>
                      </span>
                    </div>
                    <div className="mt-2 w-44" aria-hidden>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                        <div className="h-2 bg-primary" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Link href={`/courses/${course?.id}/lessons`} className="text-sm text-primary font-semibold">
                    Continue
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No enrolled courses</h3>
          <p className="text-gray-600">You haven't enrolled in any courses yet. Browse courses to get started.</p>
        </div>
      )}
    </div>
  )
}
