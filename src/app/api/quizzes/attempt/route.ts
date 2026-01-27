/**
 * Quiz API Routes
 * 
 * Endpoints for managing quizzes and quiz attempts
 * POST /api/quizzes/attempt - Start/record quiz attempt
 * GET /api/quizzes/[id] - Get quiz details and questions
 * GET /api/quizzes/results - Get quiz results for student
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/quizzes/attempt
 * 
 * Submit quiz answers and calculate score
 * 
 * Request body:
 * - quizId: UUID of the quiz/lesson
 * - answers: Array of { questionId, selectedOption }
 * - courseId: UUID of the course
 * 
 * Response:
 * - score: Percentage (0-100)
 * - passedRequired: Boolean (if minimum score requirement exists)
 * - answers: User's submitted answers
 * - correctAnswers: Correct answer breakdown (if review is allowed)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { quizId, answers, courseId } = body

    if (!quizId || !answers || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Store quiz attempt
    const { data: attempt, error: attemptError } = await (supabase
      .from('quiz_attempts') as any)
      .insert({
        lesson_id: quizId,
        user_id: user.id,
        course_id: courseId,
        answers_submitted: answers,
        attempted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (attemptError) {
      return NextResponse.json(
        { error: 'Failed to save quiz attempt' },
        { status: 500 }
      )
    }

    // Calculate score (this would typically be done with stored quiz data)
    // For now, we'll just store the attempt and return success
    const score = Math.round((answers.filter((a: any) => a.isCorrect).length / answers.length) * 100)

    return NextResponse.json(
      {
        message: 'Quiz submitted successfully',
        attemptId: attempt.id,
        score,
        passedRequired: score >= 70,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Quiz submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/quizzes/results?courseId={id}&lessonId={id}
 * 
 * Get quiz results for current user
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
    const courseId = searchParams.get('courseId')
    const lessonId = searchParams.get('lessonId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'Missing courseId parameter' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)

    if (lessonId) {
      query = query.eq('lesson_id', lessonId)
    }

    const { data: attempts, error } = await (query as any)
      .order('attempted_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to retrieve quiz results' },
        { status: 500 }
      )
    }

    return NextResponse.json(attempts, { status: 200 })
  } catch (error) {
    console.error('Quiz results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
