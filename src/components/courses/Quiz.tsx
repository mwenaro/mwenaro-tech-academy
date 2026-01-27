'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, RotateCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface QuizProps {
  lessonId: string
  courseId: string
  questions: QuizQuestion[]
  passingScore?: number
  allowReview?: boolean
  maxAttempts?: number
}

/**
 * Quiz Component
 * 
 * Interactive quiz with:
 * - Multiple choice questions
 * - Instant feedback option
 * - Score calculation
 * - Answer review
 * - Passing score tracking
 * 
 * Props:
 * - questions: Array of quiz questions with options and correct answers
 * - passingScore: Minimum required score (default 70)
 * - allowReview: Show correct answers after submission
 * - maxAttempts: Limit quiz retakes
 */
export function Quiz({
  lessonId,
  courseId,
  questions,
  passingScore = 70,
  allowReview = true,
  maxAttempts = 3,
}: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate total score
  const calculateScore = (): number => {
    const correct = questions.reduce((acc, q, idx) => {
      return acc + (selectedAnswers[q.id] === q.correctAnswer ? 1 : 0)
    }, 0)
    return Math.round((correct / questions.length) * 100)
  }

  /**
   * Handle answer selection
   */
  const handleAnswerSelect = (optionIndex: number) => {
    if (submitted) return

    setSelectedAnswers({
      ...selectedAnswers,
      [questions[currentQuestion].id]: optionIndex,
    })
  }

  /**
   * Submit quiz answers
   */
  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length !== questions.length) {
      toast.error('Please answer all questions before submitting')
      return
    }

    setIsLoading(true)

    try {
      const answers = questions.map((q) => ({
        questionId: q.id,
        selectedOption: selectedAnswers[q.id],
        isCorrect: selectedAnswers[q.id] === q.correctAnswer,
      }))

      const response = await fetch('/api/quizzes/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: lessonId,
          courseId,
          answers,
        }),
      })

      if (!response.ok) {
        toast.error('Failed to submit quiz')
        return
      }

      const data = await response.json()
      const calculatedScore = calculateScore()

      setScore(calculatedScore)
      setSubmitted(true)

      if (calculatedScore >= passingScore) {
        toast.success(`Congratulations! You passed with ${calculatedScore}%`)
      } else {
        toast((t) => (
          <div>
            <p>You scored {calculatedScore}%. You need {passingScore}% to pass.</p>
            {maxAttempts > 1 && (
              <p className="text-sm text-gray-600 mt-2">You can retake the quiz.</p>
            )}
          </div>
        ))
      }
    } catch (error) {
      toast.error('Error submitting quiz')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Reset quiz for retake
   */
  const handleReset = () => {
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setSubmitted(false)
    setScore(null)
  }

  const question = questions[currentQuestion]
  const isAnswered = question.id in selectedAnswers
  const isCorrect = isAnswered && selectedAnswers[question.id] === question.correctAnswer
  const allAnswered = Object.keys(selectedAnswers).length === questions.length

  // Show results screen
  if (submitted && score !== null) {
    const passed = score >= passingScore

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className={`inline-block p-4 rounded-full mb-4 ${
            passed ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {passed ? (
              <CheckCircle className="text-green-600" size={48} />
            ) : (
              <AlertCircle className="text-yellow-600" size={48} />
            )}
          </div>

          <h2 className={`text-3xl font-bold mb-2 ${
            passed ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {passed ? 'Quiz Passed!' : 'Quiz Completed'}
          </h2>

          <p className="text-5xl font-bold text-dark-charcoal mb-2">{score}%</p>
          <p className="text-gray-600 mb-6">
            {passed
              ? `Great job! You scored above the required ${passingScore}%`
              : `You need ${passingScore}% to pass. You scored ${score}%.`}
          </p>
        </div>

        {/* Answer Review */}
        {allowReview && (
          <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-dark-charcoal mb-4">Answer Review</h3>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userAnswer = selectedAnswers[q.id]
                const correct = userAnswer === q.correctAnswer
                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded border-l-4 ${
                      correct
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                    }`}
                  >
                    <p className="text-sm font-medium text-dark-charcoal mb-1">
                      {idx + 1}. {q.question}
                    </p>
                    <p className="text-sm text-gray-700">
                      Your answer: <strong>{q.options[userAnswer]}</strong>
                    </p>
                    {!correct && (
                      <p className="text-sm text-green-700">
                        Correct: <strong>{q.options[q.correctAnswer]}</strong>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-xs text-gray-600 mt-2 italic">{q.explanation}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Retake Button */}
        <button
          onClick={handleReset}
          className="w-full bg-bright-teal text-white py-3 rounded-lg hover:bg-opacity-90 transition font-medium flex items-center justify-center gap-2"
        >
          <RotateCw size={20} />
          Retake Quiz
        </button>
      </div>
    )
  }

  // Show quiz questions
  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-bright-teal h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-dark-charcoal mb-4">
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, idx) => {
            const selected = selectedAnswers[question.id] === idx
            const showCorrect = submitted && idx === question.correctAnswer
            const showIncorrect = submitted && selected && !isCorrect

            return (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                disabled={submitted}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  selected && !submitted
                    ? 'border-bright-teal bg-blue-50'
                    : showCorrect
                      ? 'border-green-500 bg-green-50'
                      : showIncorrect
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-dark-charcoal">{option}</span>
                  {showCorrect && <CheckCircle className="text-green-500" size={20} />}
                  {showIncorrect && <AlertCircle className="text-red-500" size={20} />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Explanation (if submitted and allowing review) */}
        {submitted && allowReview && question.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0 || submitted}
          className="px-6 py-3 bg-gray-200 text-dark-charcoal rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Previous
        </button>

        <div className="flex-1" />

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={submitted}
            className="px-6 py-3 bg-gray-200 text-dark-charcoal rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isLoading || submitted}
            className="px-6 py-3 bg-bright-teal text-white rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>

      {/* Answered Questions Indicator */}
      <div className="text-sm text-gray-600">
        Answered: {Object.keys(selectedAnswers).length} / {questions.length}
      </div>
    </div>
  )
}
