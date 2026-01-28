import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default async function DashboardCoursesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, price, instructor_id, category, level')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Courses</h1>
        <p className="text-gray-600">Browse courses available to you</p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(courses as any[]).map((c) => (
            <div key={c.id} className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <p className="text-sm text-gray-600">{c.category} • {c.level}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link href={`/courses/${c.id}`} className="text-primary font-medium">
                  View Course
                </Link>
                <div className="text-sm text-gray-700 font-semibold">
                  {c.price ? `$${(c.price / 100).toFixed(2)}` : 'Free'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
          <p className="text-gray-600">There are currently no courses available.</p>
          <Link href="/courses" className="inline-block mt-6 bg-primary text-white px-6 py-3 rounded-lg font-semibold">
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  )
}
