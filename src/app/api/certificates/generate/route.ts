/**
 * Certificate Generation API
 * 
 * Handles automatic certificate generation upon course completion
 * POST /api/certificates/generate - Generate certificate for completed course
 * GET /api/certificates - Retrieve certificates for user
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/certificates/generate
 * 
 * Generate certificate for user upon course completion
 * 
 * Request body:
 * - courseId: UUID of completed course
 * - userId: UUID of student (current user)
 * 
 * Response:
 * - certificateId: UUID of generated certificate
 * - certificateUrl: URL to download/view certificate
 * - verificationCode: Unique code for verification
 * - issuedAt: ISO timestamp
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
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json(
        { error: 'Missing courseId' },
        { status: 400 }
      )
    }

    // Check if user completed the course
    const { data: enrollment } = await (supabase.from('enrollments') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (!enrollment || enrollment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Course not completed' },
        { status: 403 }
      )
    }

    // Check if certificate already exists
    const { data: existingCert } = await (supabase.from('certificates') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()
      .catch(() => ({ data: null }))

    if (existingCert) {
      return NextResponse.json(
        {
          message: 'Certificate already exists',
          certificateId: existingCert.id,
          certificateUrl: existingCert.certificate_url,
          verificationCode: existingCert.verification_code,
        },
        { status: 200 }
      )
    }

    // Generate unique verification code
    const verificationCode = `CERT-${courseId.slice(0, 8)}-${user.id?.slice(0, 8)}-${Date.now()}`.toUpperCase()

    // In a real app, you'd generate PDF here with a library like pdfkit
    // For now, we'll create a placeholder URL
    const certificateUrl = `/certificates/${verificationCode}.pdf`

    // Create certificate record
    const { data: certificate, error: certError } = await (supabase
      .from('certificates') as any)
      .insert({
        user_id: user.id,
        course_id: courseId,
        certificate_url: certificateUrl,
        verification_code: verificationCode,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (certError) {
      return NextResponse.json(
        { error: 'Failed to generate certificate', details: certError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Certificate generated successfully',
        certificateId: certificate.id,
        certificateUrl: certificate.certificate_url,
        verificationCode: certificate.verification_code,
        issuedAt: certificate.issued_at,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Certificate generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/certificates?courseId={id}
 * 
 * Retrieve certificates for user
 * 
 * Query params:
 * - courseId: (optional) Filter by specific course
 * 
 * Response:
 * - Array of certificate objects with details
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

    let query = supabase
      .from('certificates')
      .select(
        `
        *,
        course:courses(title, description)
      `
      )
      .eq('user_id', user.id)

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    const { data: certificates, error } = await (query as any)
      .order('issued_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to retrieve certificates' },
        { status: 500 }
      )
    }

    return NextResponse.json(certificates, { status: 200 })
  } catch (error) {
    console.error('Certificates retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/certificates/verify/{verificationCode}
 * 
 * Verify certificate authenticity
 */
export async function GET_VERIFY(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Missing verification code' },
        { status: 400 }
      )
    }

    const { data: certificate } = await (supabase.from('certificates') as any)
      .select(
        `
        *,
        user:profiles(full_name, email),
        course:courses(title)
      `
      )
      .eq('verification_code', code)
      .single()
      .catch(() => ({ data: null }))

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found or invalid code' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        valid: true,
        certificate: {
          studentName: certificate.user?.full_name,
          courseName: certificate.course?.title,
          issuedAt: certificate.issued_at,
          verificationCode: certificate.verification_code,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Certificate verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
