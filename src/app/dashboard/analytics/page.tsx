'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'
import { BarChart3, AlertCircle } from 'lucide-react'

export default function AnalyticsPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCurrentUserRole()
  }, [])

  const getCurrentUserRole = async () => {
    try {
      setIsLoading(true)
      
      // Get current user profile to determine role
      const response = await fetch('/api/analytics/dashboard')
      
      if (response.status === 403) {
        setUserRole('learner')
      } else if (response.ok) {
        setUserRole('admin')
      } else {
        setUserRole('learner')
      }
    } catch (error) {
      console.error('Failed to determine user role:', error)
      setUserRole('learner')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!userRole) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Unable to determine user role</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-gray-600">
          {userRole === 'admin'
            ? 'Platform-wide performance metrics and insights'
            : userRole === 'instructor'
            ? 'Your course performance and learner engagement'
            : 'Your learning progress and performance'}
        </p>
      </div>

      <AnalyticsDashboard viewType={userRole as 'admin' | 'instructor' | 'learner'} />
    </div>
  )
}
