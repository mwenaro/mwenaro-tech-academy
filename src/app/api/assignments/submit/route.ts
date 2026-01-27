import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/assignments/submit
 * 
 * Handles assignment submission from students
 * 
 * Request body:
 * - assignmentId: UUID of the assignment
 * - userId: UUID of the student
 * - submissionUrl: URL of the submission (GitHub, Google Docs, etc.)
 * - submissionText: Optional text content for text submissions
 * 
 * Response:
 * - submissionId: UUID of created submission
 * - status: submission_status (pending, graded, etc.)
 * - submittedAt: ISO timestamp
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { assignmentId, submissionUrl, submissionText } = body

    // Validate required fields
    if (!assignmentId || !submissionUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: assignmentId, submissionUrl' },
        { status: 400 }
      )
    }

    // Check if assignment exists
    const { data: assignment } = await (supabase.from('assignments') as any)
      .select('*')
      .eq('id', assignmentId)
      .single()

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Check if student is enrolled in the course
    const { data: enrollment } = await (supabase.from('enrollments') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', assignment.course_id)
      .single()

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

    // Check if already submitted
    const { data: existingSubmission } = await (supabase
      .from('submissions') as any)
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('user_id', user.id)
      .single()
      .catch(() => ({ data: null }))

    // Update or insert submission
    if (existingSubmission) {
      // Update existing submission
      const { data: updatedSubmission, error: updateError } = await (supabase
        .from('submissions') as any)
        .update({
          submission_url: submissionUrl,
          submission_text: submissionText || null,
          submitted_at: new Date().toISOString(),
          status: 'pending',
        })
        .eq('id', existingSubmission.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update submission', details: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          message: 'Submission updated successfully',
          submissionId: updatedSubmission.id,
          status: updatedSubmission.status,
          submittedAt: updatedSubmission.submitted_at,
        },
        { status: 200 }
      )
    } else {
      // Create new submission
      const { data: newSubmission, error: insertError } = await (supabase
        .from('submissions') as any)
        .insert({
          assignment_id: assignmentId,
          user_id: user.id,
          submission_url: submissionUrl,
          submission_text: submissionText || null,
          submitted_at: new Date().toISOString(),
          status: 'pending',
        })
        .select()
        .single()

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to create submission', details: insertError.message },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          message: 'Assignment submitted successfully',
          submissionId: newSubmission.id,
          status: newSubmission.status,
          submittedAt: newSubmission.submitted_at,
        },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('Assignment submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/assignments/submit?assignmentId={id}&userId={id}
 * 
 * Retrieve submission details for an assignment
 * 
 * Query params:
 * - assignmentId: UUID of the assignment
 * - userId: (optional) UUID of the student, defaults to current user
 * 
 * Response:
 * - submission object with all details
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')
    const userId = searchParams.get('userId') || user.id

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Missing required query param: assignmentId' },
        { status: 400 }
      )
    }

    const { data: submission } = await (supabase.from('submissions') as any)
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId)
      .single()
      .catch(() => ({ data: null }))

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(submission, { status: 200 })
  } catch (error) {
    console.error('Submission retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
