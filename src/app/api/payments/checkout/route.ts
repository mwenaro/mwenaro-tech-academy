/**
 * Stripe Payment Integration API
 * 
 * Handles course enrollment payments with Stripe
 * POST /api/payments/checkout - Create checkout session
 * GET /api/payments/verify - Verify payment status
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!
const stripeApiVersion = '2023-10-16'

/**
 * POST /api/payments/checkout
 * 
 * Create a Stripe checkout session for course enrollment
 * 
 * Request body:
 * - courseId: UUID of course to purchase
 * - priceInCents: Price in cents (e.g., 9999 for $99.99)
 * - courseName: Name of the course
 * 
 * Response:
 * - sessionId: Stripe checkout session ID
 * - url: Checkout URL
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
    const { courseId, priceInCents, courseName } = body

    if (!courseId || !priceInCents || !courseName) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, priceInCents, courseName' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const { data: enrolled } = await (supabase
      .from('enrollments') as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (enrolled) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session via API
    const checkoutData = new URLSearchParams()
    checkoutData.append('payment_method_types[0]', 'card')
    checkoutData.append('line_items[0][price_data][currency]', 'usd')
    checkoutData.append('line_items[0][price_data][product_data][name]', courseName)
    checkoutData.append(
      'line_items[0][price_data][product_data][description]',
      `Enrollment in ${courseName}`
    )
    checkoutData.append(
      'line_items[0][price_data][unit_amount]',
      priceInCents.toString()
    )
    checkoutData.append('line_items[0][quantity]', '1')
    checkoutData.append('mode', 'payment')
    checkoutData.append(
      'success_url',
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&courseId=${courseId}`
    )
    checkoutData.append(
      'cancel_url',
      `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?payment=cancelled`
    )
    checkoutData.append('metadata[userId]', user.id)
    checkoutData.append('metadata[courseId]', courseId)
    checkoutData.append('metadata[userEmail]', user.email || '')
    checkoutData.append('customer_email', user.email || '')

    const sessionResponse = await fetch(
      'https://api.stripe.com/v1/checkout/sessions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: checkoutData.toString(),
      }
    )

    if (!sessionResponse.ok) {
      const error = await sessionResponse.json()
      console.error('Stripe API error:', error)
      throw new Error('Failed to create Stripe session')
    }

    const session = await sessionResponse.json()

    // Store pending payment record
    const { error: storeError } = await (supabase
      .from('payments') as any)
      .insert({
        user_id: user.id,
        course_id: courseId,
        stripe_session_id: session.id,
        amount_cents: priceInCents,
        status: 'pending',
        created_at: new Date().toISOString(),
      })

    if (storeError) {
      console.error('Failed to store payment record:', storeError)
    }

    return NextResponse.json(
      {
        message: 'Checkout session created',
        sessionId: session.id,
        url: session.url,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments/verify?sessionId={id}
 * 
 * Verify payment completion status
 * 
 * Query params:
 * - sessionId: Stripe session ID to verify
 * 
 * Response:
 * - status: 'paid', 'pending', 'cancelled'
 * - enrollmentId: If successful, enrollment record ID
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
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
        { status: 400 }
      )
    }

    // Get Stripe session via API
    const sessionResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      }
    )

    if (!sessionResponse.ok) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const session = await sessionResponse.json()

    if (session.payment_status === 'paid') {
      const courseId = session.metadata?.courseId

      // Check if enrollment already created
      let { data: enrollment } = await (supabase
        .from('enrollments') as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

      if (!enrollment) {
        // Create enrollment record
        const { data: newEnrollment, error: enrollError } = await (supabase
          .from('enrollments') as any)
          .insert({
            user_id: user.id,
            course_id: courseId,
            enrolled_at: new Date().toISOString(),
            progress: 0,
          })
          .select()
          .single()

        if (enrollError) {
          return NextResponse.json(
            { error: 'Failed to create enrollment' },
            { status: 500 }
          )
        }

        enrollment = newEnrollment
      }

      // Update payment record
      await (supabase.from('payments') as any)
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('stripe_session_id', sessionId)
        .catch(() => {})

      return NextResponse.json(
        {
          status: 'paid',
          enrollmentId: enrollment.id,
          message: 'Payment successful and enrollment created',
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        status: session.payment_status || 'pending',
        message: 'Payment not yet completed',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
