'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader } from 'lucide-react'
import Link from 'next/link'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    avatarUrl: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setFormData({
            fullName: profile.full_name || '',
            avatarUrl: profile.avatar_url || '',
          })
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Not authenticated')
        return
      }

      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: formData.fullName,
          avatar_url: formData.avatarUrl,
        })
        .eq('id', user.id)

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Profile updated successfully!')
      setTimeout(() => {
        router.push('/dashboard/profile')
      }, 1500)
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-light-gray to-white flex items-center justify-center">
        <Loader className="animate-spin" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-light-gray to-white py-12 px-4">
      <Toaster position="top-right" />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 text-bright-teal hover:underline mb-8"
        >
          <ArrowLeft size={20} />
          Back to Profile
        </Link>

        <h1 className="text-4xl font-bold text-dark-charcoal mb-2">Edit Profile</h1>
        <p className="text-gray-600 mb-8">Update your profile information</p>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-dark-charcoal mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bright-teal focus:border-transparent disabled:opacity-50"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-dark-charcoal mb-2">
                Avatar URL (Optional)
              </label>
              <input
                id="avatarUrl"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bright-teal focus:border-transparent disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-2">Link to your profile picture (JPG, PNG, etc.)</p>
            </div>

            {/* Avatar Preview */}
            {formData.avatarUrl && (
              <div>
                <label className="block text-sm font-medium text-dark-charcoal mb-2">Preview</label>
                <div className="relative w-32 h-32">
                  <img
                    src={formData.avatarUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => {
                      toast.error('Invalid image URL')
                    }}
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-bright-teal text-white font-semibold py-3 px-6 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="flex-1 bg-gray-200 text-dark-charcoal font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
