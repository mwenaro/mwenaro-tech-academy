'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { CheckCircle, LogIn } from 'lucide-react'

interface EnrollButtonProps {
  courseId: string
  isEnrolled: boolean
}

export function EnrollButton({ courseId, isEnrolled }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleEnroll = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please log in to enroll')
        return
      }

      setLoading(true)

      // Create enrollment
      const { error } = await supabase.from('enrollments').insert({
        user_id: user.id,
        course_id: courseId,
        status: 'active',
        enrolled_at: new Date().toISOString(),
        progress_percentage: 0,
        payment_amount: 0,
        payment_status: 'paid',
      } as any)

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Successfully enrolled!')
      window.location.reload()
    } catch (error) {
      console.error('Enrollment error:', error)
      toast.error('Failed to enroll')
    } finally {
      setLoading(false)
    }
  }

  if (isEnrolled) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
        <CheckCircle size={20} />
        <span className="font-medium">Enrolled</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="w-full bg-warm-yellow text-dark-charcoal font-semibold py-3 px-6 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <LogIn size={20} />
      {loading ? 'Enrolling...' : 'Enroll Now'}
    </button>
  )
}
