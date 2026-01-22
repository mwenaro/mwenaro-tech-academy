import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Shield, Calendar, Edit2 } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function ProfilePage() {
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

  // Get enrollment stats
  const { count: enrolledCount } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('status', 'active')

  // Get certificate count
  const { count: certificateCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  const roleLabel = {
    learner: 'Student',
    instructor: 'Instructor',
    admin: 'Administrator',
  }[userProfile?.role as string] || 'User'

  return (
    <div className="min-h-screen bg-linear-to-br from-light-gray to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-charcoal mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header with gradient */}
              <div className="h-24 bg-linear-to-r from-deep-blue to-bright-teal"></div>

              {/* Profile Info */}
              <div className="px-6 pb-6 -mt-12 relative z-10">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-linear-to-br from-bright-teal to-deep-blue rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <User className="text-white" size={40} />
                  </div>

                  <h2 className="text-2xl font-bold text-dark-charcoal mt-4 text-center">
                    {userProfile?.full_name || 'User'}
                  </h2>

                  <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {roleLabel}
                  </span>

                  <p className="text-gray-600 text-sm mt-3 text-center">{user.email}</p>

                  <div className="w-full mt-6 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>Joined {new Date(userProfile?.created_at || '').toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/profile/edit"
                    className="w-full mt-6 flex items-center justify-center gap-2 bg-bright-teal text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition font-medium"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-dark-charcoal mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Courses Enrolled</p>
                  <p className="text-3xl font-bold text-bright-teal">{enrolledCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Certificates</p>
                  <p className="text-3xl font-bold text-bright-teal">{certificateCount || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-dark-charcoal mb-6 flex items-center gap-2">
                <Shield size={24} className="text-bright-teal" />
                Account Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-dark-charcoal">
                    {userProfile?.full_name || 'Not set'}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-dark-charcoal">
                    {user.email}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Email address cannot be changed. Contact support for assistance.
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Shield size={16} />
                    Account Role
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-dark-charcoal">
                    {roleLabel}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Member Since
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-dark-charcoal">
                    {new Date(userProfile?.created_at || '').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-dark-charcoal mb-6">Account Actions</h2>

              <div className="space-y-3">
                <Link
                  href="/dashboard/profile/edit"
                  className="block w-full px-6 py-3 bg-bright-teal text-white rounded-lg hover:bg-opacity-90 transition text-center font-medium"
                >
                  Edit Profile
                </Link>

                <Link
                  href="/dashboard/profile/security"
                  className="block w-full px-6 py-3 bg-gray-200 text-dark-charcoal rounded-lg hover:bg-gray-300 transition text-center font-medium"
                >
                  Change Password
                </Link>

                <Link
                  href="/dashboard/profile/preferences"
                  className="block w-full px-6 py-3 bg-gray-200 text-dark-charcoal rounded-lg hover:bg-gray-300 transition text-center font-medium"
                >
                  Notification Preferences
                </Link>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <h3 className="text-lg font-semibold text-dark-charcoal mb-3">Need Help?</h3>
              <p className="text-gray-700 mb-4">
                If you need assistance with your account or have any questions, please don't hesitate to contact our support team.
              </p>
              <Link
                href="/contact"
                className="inline-block px-6 py-2 bg-bright-teal text-white rounded-lg hover:bg-opacity-90 transition font-medium"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
