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
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Load canonical quiz data from lesson.content (server-side source of truth)
    const { data: lesson } = await (
      supabase
        .from('lessons')
        .select('id, content, content_type')
        .eq('id', quizId)
        .single() as any
    )

    if (!lesson || lesson.content_type !== 'quiz') {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    let canonicalQuestions: any[] = []
    try {
      canonicalQuestions = typeof lesson.content === 'string' && lesson.content.trim()
        ? JSON.parse(lesson.content as string)
        : []
    } catch (e) {
      console.warn('Failed to parse quiz content for lesson', quizId, e)
      canonicalQuestions = []
    }

    if (!Array.isArray(canonicalQuestions) || canonicalQuestions.length === 0) {
      return NextResponse.json({ error: 'No quiz questions configured' }, { status: 500 })
    }

    // Compute score deterministically on server by comparing selectedOption to correctAnswer
    const normalizedAnswers = Array.isArray(answers) ? answers : []
    let correctCount = 0
    const reviewedAnswers = canonicalQuestions.map((q: any) => {
      const submitted = normalizedAnswers.find((a: any) => a.questionId === q.id)
      const selected = submitted ? submitted.selectedOption : null
      const isCorrect = selected === q.correctAnswer
      if (isCorrect) correctCount += 1
      return {
        questionId: q.id,
        selectedOption: selected,
        isCorrect,
      }
    })

    const score = Math.round((correctCount / canonicalQuestions.length) * 100)

    // Store quiz attempt with server-calculated results
    const { data: attempt, error: attemptError } = await (supabase.from('quiz_attempts') as any)
      .insert({
        lesson_id: quizId,
        user_id: user.id,
        course_id: courseId,
        answers_submitted: reviewedAnswers,
        score,
        attempted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (attemptError) {
      return NextResponse.json({ error: 'Failed to save quiz attempt' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Quiz submitted successfully',
      attemptId: attempt.id,
      score,
      passedRequired: score >= 70,
    }, { status: 201 })
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
