'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Upload, CheckCircle, Loader } from 'lucide-react'
import type { Database } from '@/lib/supabase/database.types'

type Submission = Database['public']['Tables']['submissions']['Row']

interface AssignmentSubmissionProps {
  lessonId: string
  courseId: string
  hasSubmitted: boolean
  submission: Submission | null
}

export function AssignmentSubmission({
  lessonId,
  courseId,
  hasSubmitted,
  submission,
}: AssignmentSubmissionProps) {
  const [submissionLink, setSubmissionLink] = useState(submission?.submission_url || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!submissionLink.trim()) {
      toast.error('Please provide a submission link')
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please log in to submit')
        return
      }

      setLoading(true)

      if (submission) {
        // Update existing submission
        const { error } = await (supabase as any)
          .from('submissions')
          .update({
            submission_url: submissionLink,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', submission.id)

        if (error) {
          toast.error(error.message)
          return
        }
      } else {
        // Create new submission - note: you need an assignment_id, this is a placeholder
        const { error } = await (supabase as any).from('submissions').insert({
          assignment_id: lessonId,
          user_id: user.id,
          submission_url: submissionLink,
          submitted_at: new Date().toISOString(),
          status: 'pending',
        })

        if (error) {
          toast.error(error.message)
          return
        }
      }

      toast.success('Assignment submitted successfully!')
      window.location.reload()
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Failed to submit assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="submission" className="block text-sm font-medium text-dark-charcoal mb-2">
          {hasSubmitted ? 'Update Submission Link' : 'Your Submission Link'}
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Submit links to your work on Google Docs, GitHub, or other platforms
        </p>
        <input
          id="submission"
          type="url"
          placeholder="https://docs.google.com/document/d/... or https://github.com/..."
          value={submissionLink}
          onChange={(e) => setSubmissionLink(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bright-teal focus:border-transparent disabled:opacity-50"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-bright-teal text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader size={18} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Upload size={18} />
            {hasSubmitted ? 'Update Submission' : 'Submit Assignment'}
          </>
        )}
      </button>

      {hasSubmitted && submission && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-green-900">Submitted</p>
            <p className="text-green-700">
              {new Date(submission.submitted_at).toLocaleDateString()}
            </p>
            {submission.status === 'graded' && (
              <div className="mt-2">
                <p className="font-medium text-green-900">Grade: {submission.score}/100</p>
                {submission.instructor_feedback && (
                  <p className="text-green-700 mt-1">{submission.instructor_feedback}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  )
}
