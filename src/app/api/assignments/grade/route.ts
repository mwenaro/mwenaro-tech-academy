import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/assignments/grade
 * 
 * Instructor grades a submission
 * 
 * Request body:
 * - submissionId: UUID of the submission
 * - score: Integer 0-100
 * - instructorFeedback: Text feedback for the student
 * 
 * Response:
 * - Updated submission with grade and feedback
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

    const body = await request.json()
    const { submissionId, score, instructorFeedback } = body

    if (!submissionId || score === undefined || !instructorFeedback) {
      return NextResponse.json(
        { error: 'Missing required fields: submissionId, score, instructorFeedback' },
        { status: 400 }
      )
    }

    // Validate score
    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Get submission with assignment and course info
    const { data: submission } = await (supabase.from('submissions') as any)
      .select(
        `
        *,
        assignment:assignments(
          *,
          course:courses(*)
        )
      `
      )
      .eq('id', submissionId)
      .single()

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Verify user is the course instructor
    const assignmentData = submission.assignment as any
    if (assignmentData.course.instructor_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the course instructor can grade submissions' },
        { status: 403 }
      )
    }

    // Update submission with grade
    const { data: gradedSubmission, error: gradeError } = await (supabase
      .from('submissions') as any)
      .update({
        score,
        instructor_feedback: instructorFeedback,
        status: 'graded',
        graded_by: user.id,
        graded_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select()
      .single()

    if (gradeError) {
      return NextResponse.json(
        { error: 'Failed to grade submission', details: gradeError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Submission graded successfully',
        submission: gradedSubmission,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Grading error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/assignments/grade?assignmentId={id}
 * 
 * Instructor retrieves all submissions for an assignment
 * 
 * Query params:
 * - assignmentId: UUID of the assignment
 * - status: (optional) Filter by status (pending, graded, revision_needed)
 * 
 * Response:
 * - Array of submissions with student information
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
    const status = searchParams.get('status')

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Missing required query param: assignmentId' },
        { status: 400 }
      )
    }

    // Verify user is course instructor
    const { data: assignment } = await (supabase.from('assignments') as any)
      .select('course:courses(*)')
      .eq('id', assignmentId)
      .single()

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    const assignmentData = assignment as any
    if (assignmentData.course.instructor_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the course instructor can view submissions' },
        { status: 403 }
      )
    }

    // Get submissions
    let query = supabase
      .from('submissions')
      .select(
        `
        *,
        user:profiles(full_name, email),
        assignment:assignments(*)
      `
      )
      .eq('assignment_id', assignmentId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: submissions, error } = await (query as any)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to retrieve submissions', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(submissions, { status: 200 })
  } catch (error) {
    console.error('Submissions retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
