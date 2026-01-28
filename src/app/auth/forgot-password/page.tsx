"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const redirectTo = `${window.location.origin}/auth/login`
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('If an account exists, a password reset email has been sent.')
        setEmail('')
      }
    } catch (err) {
      console.error('Reset error', err)
      toast.error('An unexpected error occurred')
    }

    setLoading(false)
  }

  return (
    <div className="bg-card rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="text-gray-600">Enter your email and we&apos;ll send a password reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex justify-between items-center">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:underline">Back to login</Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-md"
          >
            {loading ? 'Sending…' : 'Send reset email'}
          </button>
        </div>
      </form>
    </div>
  )
}
