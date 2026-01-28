/**
 * Stripe Webhook Handler
 * 
 * POST /api/payments/webhook
 * Handles Stripe events (payment success, failure, refunds)
 * 
 * Uses crypto to verify webhook signature without external dependencies
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set')
    return false
  }

  try {
    // Stripe signature format: t=timestamp,v1=signature
    const parts = signature.split(',')
    const timestamp = parts[0].split('=')[1]
    const receivedSignature = parts[1].split('=')[1]

    const signedContent = `${timestamp}.${body}`
    const hash = createHmac('sha256', webhookSecret)
      .update(signedContent)
      .digest('hex')

    return hash === receivedSignature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    )
  }

  if (!verifyWebhookSignature(body, signature)) {
    console.error('Webhook signature verification failed')
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  let event: any

  try {
    event = JSON.parse(body)
  } catch (error) {
    console.error('Failed to parse webhook body:', error)
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      // Payment completed
      case 'checkout.session.completed': {
        const session = event.data.object

        const courseId = session.metadata?.courseId
        const userId = session.metadata?.userId

        if (!courseId || !userId) break

        // Check if enrollment exists
        const { data: existing } = await (supabase
          .from('enrollments') as any)
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .single()

        if (!existing) {
          // Create enrollment
          await (supabase.from('enrollments') as any).insert({
            user_id: userId,
            course_id: courseId,
            enrolled_at: new Date().toISOString(),
            progress: 0,
          })
        }

        // Update payment record
        await (supabase.from('payments') as any)
          .update({
            status: 'paid',
            stripe_payment_intent: session.payment_intent,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_session_id', session.id)

        break
      }

      // Payment failed
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object

        await (supabase.from('payments') as any)
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_session_id', session.id)

        break
      }

      // Refund processed
      case 'charge.refunded': {
        const charge = event.data.object

        if (charge.payment_intent) {
          // Find payment by payment intent
          const { data: payment } = await (supabase
            .from('payments') as any)
            .select('id, user_id, course_id')
            .eq('stripe_payment_intent', charge.payment_intent)
            .single()

          if (payment) {
            // Update payment status
            await (supabase.from('payments') as any)
              .update({
                status: 'refunded',
                refunded_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', payment.id)

            // Remove enrollment (refund means access revoked)
            await (supabase.from('enrollments') as any)
              .delete()
              .eq('user_id', payment.user_id)
              .eq('course_id', payment.course_id)
          }
        }

        break
      }

      // Dispute/Chargeback
      case 'charge.dispute.created': {
        const dispute = event.data.object

        if (dispute.payment_intent) {
          const { data: payment } = await (supabase
            .from('payments') as any)
            .select('id')
            .eq('stripe_payment_intent', dispute.payment_intent)
            .single()

          if (payment) {
            await (supabase.from('payments') as any)
              .update({
                status: 'disputed',
                updated_at: new Date().toISOString(),
              })
              .eq('id', payment.id)
          }
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
