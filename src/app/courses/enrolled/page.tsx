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

      <div className="text-center py-12">Simplified placeholder while debugging pagination JSX.</div>
    </div>
  )
}
