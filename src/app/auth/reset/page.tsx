"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  useEffect(() => {
    // Parse recovery token placed in the URL by Supabase when user clicks reset link
    try {
      const params = new URLSearchParams(window.location.search)
      const type = params.get('type')
      const token = params.get('access_token') || params.get('token') || params.get('oobCode')
      const refresh = params.get('refresh_token')

      if (type === 'recovery' && token) {
        setAccessToken(token)
        // Try to set session so updateUser works
        supabase.auth.setSession({ access_token: token, refresh_token: refresh || undefined }).catch((err) => {
          console.warn('setSession failed', err)
        }).finally(() => setReady(true))
      } else {
        setReady(true)
      }
    } catch (e) {
      console.error(e)
      setReady(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      if (accessToken) {
        // Ensure session is set with the recovery token
        await supabase.auth.setSession({ access_token: accessToken })
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Password updated — please sign in')
        router.push('/auth/login')
      }
    } catch (err) {
      console.error('Reset error', err)
      toast.error('Unable to reset password')
    }

    setLoading(false)
  }

  if (!ready) {
    return <div className="p-8 text-center">Loading…</div>
  }

  return (
    <div className="max-w-md mx-auto bg-card rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-2">Set a new password</h2>
      <p className="text-sm text-gray-600 mb-6">Enter a new password to finish resetting your account password.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2 border border-border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2 border border-border rounded-md"
          />
        </div>

        <div className="flex items-center justify-between">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:underline">Back to login</Link>
          <button className="bg-primary text-white px-4 py-2 rounded-md" disabled={loading} type="submit">
            {loading ? 'Saving…' : 'Save new password'}
          </button>
        </div>
      </form>
    </div>
  )
}
