import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Clock, Users, Award, LayoutDashboard, MessageSquare, FileText, LogOut, User } from 'lucide-react'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userProfile = profile as Profile | null

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-primary">Mwero Tech Academy</span>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {userProfile?.full_name || user.email}
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                {userProfile?.role || 'learner'}
              </span>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="text-gray-600 hover:text-foreground transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-card border-r border-border p-6">
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>

            {userProfile?.role === 'learner' && (
              <>
                <Link
                  href="/dashboard/my-courses"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">My Courses</span>
                </Link>
                <Link
                  href="/dashboard/assignments"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Assignments</span>
                </Link>
                <Link
                  href="/dashboard/certificates"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                >
                  <Award className="w-5 h-5" />
                  <span className="font-medium">Certificates</span>
                </Link>
              </>
            )}

            {userProfile?.role === 'instructor' && (
              <>
                <Link
                  href="/dashboard/my-courses"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">My Courses</span>
                </Link>
                <Link
                  href="/dashboard/learners"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Learners</span>
                </Link>
                <Link
                  href="/dashboard/submissions"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Submissions</span>
                </Link>
                <Link
                  href="/dashboard/payments"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Payments</span>
                </Link>
              </>
            )}

            {userProfile?.role === 'admin' && (
              <>
                <Link
                  href="/dashboard/courses"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Manage Courses</span>
                </Link>
                <Link
                  href="/dashboard/users?role=learner"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Learners</span>
                </Link>
                <Link
                  href="/dashboard/users?role=instructor"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Instructors</span>
                </Link>
                <Link
                  href="/dashboard/users"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Manage Users</span>
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Analytics</span>
                </Link>
              </>
            )}

            <Link
              href="/dashboard/messages"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </Link>

            <Link
              href="/dashboard/profile"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
