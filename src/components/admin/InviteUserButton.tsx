"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function InviteUserButton() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('learner')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be signed in to invite users')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, role, performed_by: user.id }),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json?.error || 'Invite failed')
      } else {
        if (json.tempPassword) {
          toast.success(`Invite sent (temp password: ${json.tempPassword})`)
        } else if (json.emailSent) {
          toast.success('Invite email sent')
        } else {
          toast.success('Invite created')
        }
        setOpen(false)
        setEmail('')
        setFullName('')
        setRole('learner')
      }
    } catch (err) {
      console.error(err)
      toast.error('Server error')
    }

    setLoading(false)
  }

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Invite user
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 z-10">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Invite user</h3>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full name</label>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
                  >
                    <option value="learner">Learner</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>

                <div className="flex justify-end items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-md border border-gray-200"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Sending…' : 'Send invite'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
