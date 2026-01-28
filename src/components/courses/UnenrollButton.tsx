"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function UnenrollButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUnenroll = async () => {
    if (!confirm('Are you sure you want to unenroll from this course?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/enrollments/unenroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json?.error || 'Unable to unenroll')
      } else {
        toast.success('You have been unenrolled')
        router.refresh()
      }
    } catch (e) {
      console.error(e)
      toast.error('Server error')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleUnenroll}
      disabled={loading}
      className="text-sm text-red-600 hover:underline"
    >
      {loading ? 'Unenrolling…' : 'Unenroll'}
    </button>
  )
}
