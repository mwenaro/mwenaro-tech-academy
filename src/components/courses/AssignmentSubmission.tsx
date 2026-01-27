'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Upload, CheckCircle, Link as LinkIcon, AlertCircle } from 'lucide-react'
import type { Database } from '@/lib/supabase/database.types'

type Submission = Database['public']['Tables']['submissions']['Row']
type Assignment = Database['public']['Tables']['assignments']['Row']

interface AssignmentSubmissionProps {
  assignment: Assignment
  courseId: string
  hasSubmitted: boolean
  submission: Submission | null
}

export function AssignmentSubmission({
  assignment,
  courseId,
  hasSubmitted,
  submission,
}: AssignmentSubmissionProps) {
  const [submissionUrl, setSubmissionUrl] = useState(submission?.submission_url || '')
  const [submissionText, setSubmissionText] = useState(submission?.submission_text || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(!hasSubmitted)

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Handle assignment submission
   * Validates input based on submission type
   * Submits via API endpoint
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate based on submission type
    if (assignment.submission_type !== 'text') {
      if (!submissionUrl.trim()) {
        toast.error('Please provide a submission link')
        return
      }

      if (!isValidUrl(submissionUrl)) {
        toast.error('Please enter a valid URL')
        return
      }
    } else {
      if (!submissionText.trim()) {
        toast.error('Please enter your submission text')
        return
      }

      if (submissionText.length > 5000) {
        toast.error('Submission text cannot exceed 5000 characters')
        return
      }
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: assignment.id,
          submissionUrl: assignment.submission_type === 'text' ? '' : submissionUrl,
          submissionText: assignment.submission_type === 'text' ? submissionText : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit assignment')
        return
      }

      toast.success('Assignment submitted successfully!')
      setIsEditing(false)
      // Reload page to show updated submission
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Failed to submit assignment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Assignment Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-dark-charcoal mb-3">{assignment.title}</h3>
        <p className="text-gray-700 text-sm mb-4">{assignment.description}</p>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Submission Type:</strong>{' '}
            {assignment.submission_type === 'github' && 'GitHub Repository/Commit'}
            {assignment.submission_type === 'google_docs' && 'Google Docs Link'}
            {assignment.submission_type === 'text' && 'Text Submission'}
          </p>
          <p>
            <strong>Max Score:</strong> {assignment.max_score} points
          </p>
        </div>
      </div>

      {/* Previous Submission (if exists) */}
      {hasSubmitted && submission && !isEditing && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="text-green-600 shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-dark-charcoal">Submitted</h4>
              <p className="text-sm text-gray-600">
                Submitted on {new Date(submission.submitted_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Submission Details */}
          <div className="bg-white rounded p-4 mb-4 space-y-2">
            {submission.submission_url && (
              <p className="text-sm">
                <strong>Link:</strong>{' '}
                <a
                  href={submission.submission_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bright-teal hover:underline break-all"
                >
                  {submission.submission_url}
                </a>
              </p>
            )}
            {submission.submission_text && (
              <div>
                <p className="text-sm font-medium mb-1">Submission Text:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto bg-gray-50 p-3 rounded">
                  {submission.submission_text}
                </p>
              </div>
            )}
          </div>

          {/* Grade (if available) */}
          {submission.status === 'graded' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p className="text-sm mb-2">
                <strong>Grade: {submission.score}</strong> / {assignment.max_score} points
              </p>
              {submission.instructor_feedback && (
                <div>
                  <p className="text-sm font-medium mb-1">Feedback:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {submission.instructor_feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {submission.status === 'pending' && (
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <AlertCircle size={16} />
              Waiting for instructor feedback...
            </p>
          )}

          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-bright-teal hover:underline font-medium"
          >
            Resubmit Assignment
          </button>
        </div>
      )}

      {/* Submission Form */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {assignment.submission_type === 'text' ? (
            // Text submission
            <div>
              <label className="block text-sm font-medium text-dark-charcoal mb-2">
                Submission Text
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Enter your submission here..."
                maxLength={5000}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-teal resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {submissionText.length} / 5000 characters
              </p>
            </div>
          ) : (
            // Link submission
            <div>
              <label className="block text-sm font-medium text-dark-charcoal mb-2">
                {assignment.submission_type === 'github' ? 'GitHub Link' : 'Google Docs Link'}
              </label>
              <div className="flex gap-2">
                <LinkIcon className="text-gray-400 mt-3 shrink-0" size={20} />
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder={
                    assignment.submission_type === 'github'
                      ? 'https://github.com/username/repo'
                      : 'https://docs.google.com/document/d/...'
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bright-teal"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {assignment.submission_type === 'github'
                  ? 'Provide a link to your GitHub repository or commit'
                  : 'Provide a link to your shared Google Doc'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-bright-teal text-white py-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload size={20} />
                {hasSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
