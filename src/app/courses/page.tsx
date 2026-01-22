import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Clock, Users, Star, GraduationCap } from 'lucide-react'
import type { Database } from '@/lib/supabase/database.types'

type Course = Database['public']['Tables']['courses']['Row'] & {
  profiles: {
    full_name: string | null
  } | null
}

export default async function CoursesPage() {
  const supabase = await createClient()

  // Fetch all active courses
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      profiles:instructor_id (
        full_name
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Get unique categories
  const categories = courses && courses.length > 0
    ? Array.from(new Set((courses as Course[]).map((c) => c.category)))
    : []

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-primary">Mwero Tech Academy</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Explore Our Courses
            </h1>
            <p className="text-xl text-gray-600">
              Choose from our wide selection of tech courses designed by industry experts
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium">
            All Courses
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-card border border-border text-foreground rounded-lg font-medium hover:border-primary transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Courses Grid */}
      <section className="container mx-auto px-4 pb-20">
        {courses && courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(courses as Course[]).map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all hover:shadow-lg group"
              >
                {/* Course Image */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-primary/40" />
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6">
                  {/* Category & Level */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {course.category}
                    </span>
                    <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-full capitalize">
                      {course.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration_weeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.course_type === 'instructor-led' ? 'Live' : 'Self-paced'}</span>
                    </div>
                  </div>

                  {/* Instructor */}
                  {course.profiles && (
                    <p className="text-sm text-gray-600 mb-4">
                      By {course.profiles.full_name || 'Expert Instructor'}
                    </p>
                  )}

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-2xl font-bold text-primary">
                      ${course.price}
                    </div>
                    <span className="text-primary font-semibold group-hover:underline">
                      Learn More →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              No courses available yet
            </h3>
            <p className="text-gray-600">
              Check back soon for exciting new courses!
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Mwero Tech Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
