"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function UserActions({ id, role }: { id: string; role: string }) {
  const [loading, setLoading] = useState(false)
  const [adminId, setAdminId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'promote' | 'demote' | 'remove' | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (mounted) setAdminId(data?.user?.id ?? null)
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  const performUpdate = async (payload: any, method: 'PATCH' | 'DELETE' = 'PATCH') => {
    setLoading(true)
    try {
      const body = method === 'DELETE' ? JSON.stringify({ performed_by: adminId }) : JSON.stringify({ ...payload, performed_by: adminId })
      const res = await fetch(`/api/admin/users/${id}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      if (!res.ok) throw new Error('Failed')
      window.location.reload()
    } catch (err) {
      alert('Action failed')
      setLoading(false)
    }
  }

  const openConfirm = (action: 'promote' | 'demote' | 'remove') => {
    setConfirmAction(action)
    setConfirmOpen(true)
  }

  const confirmNow = () => {
    if (!confirmAction) return
    if (confirmAction === 'remove') return performUpdate({}, 'DELETE')
    if (confirmAction === 'promote') return performUpdate({ role: 'instructor' }, 'PATCH')
    if (confirmAction === 'demote') return performUpdate({ role: 'learner' }, 'PATCH')
  }

  return (
    <div className="flex items-center gap-2">
      {role !== 'instructor' && (
        <button
          onClick={() => openConfirm('promote')}
          disabled={loading}
          className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md"
        >
          Promote
        </button>
      )}

      {role === 'instructor' && (
        <button
          onClick={() => openConfirm('demote')}
          disabled={loading}
          className="text-sm bg-yellow-50 text-yellow-800 px-2 py-1 rounded-md"
        >
          Demote
        </button>
      )}

      <button
        onClick={() => openConfirm('remove')}
        disabled={loading}
        className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded-md"
      >
        Remove
      </button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
          <div className="bg-card rounded-lg p-6 z-10 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirm action</h3>
            <p className="text-sm text-gray-600 mb-4">
              {confirmAction === 'promote' && 'Promote this user to Instructor?'}
              {confirmAction === 'demote' && 'Demote this instructor to Learner?'}
              {confirmAction === 'remove' && 'Permanently remove this user? This cannot be undone.'}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded-md">Cancel</button>
              <button
                onClick={() => { setConfirmOpen(false); confirmNow() }}
                className="px-4 py-2 rounded-md bg-red-600 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
