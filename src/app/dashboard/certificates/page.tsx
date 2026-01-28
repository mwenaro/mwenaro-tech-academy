import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Award, Download, Share2 } from 'lucide-react'

export default async function CertificatesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get all certificates for this user
  const { data: certificates } = await supabase
    .from('certificates')
    .select(
      `
      *,
      courses(title, description)
    `
    )
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Certificates</h1>
        <p className="text-gray-600">
          View and manage your earned certificates
        </p>
      </div>

      {certificates && certificates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(certificates as any[]).map((cert) => (
            <div
              key={cert.id}
              className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors"
            >
              {/* Certificate Preview */}
              <div className="mb-4 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200 text-center">
                <Award className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-semibold text-foreground text-sm">
                  Certificate of Completion
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {cert.courses?.title}
                </p>
              </div>

              {/* Certificate Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {cert.courses?.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Issued on{' '}
                    {new Date(cert.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {cert.verification_code && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Verification Code
                    </p>
                    <p className="text-sm font-mono text-foreground">
                      {cert.verification_code}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    // Download certificate
                    const element = document.createElement('a')
                    element.href = `/api/certificates/download?certId=${cert.id}`
                    element.download = `${cert.courses?.title}-certificate.pdf`
                    document.body.appendChild(element)
                    element.click()
                    document.body.removeChild(element)
                  }}
                  className="flex items-center justify-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    // Share certificate
                    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/certificates/verify?code=${cert.verification_code}`
                    navigator.clipboard.writeText(shareUrl)
                    alert('Share link copied to clipboard!')
                  }}
                  className="flex items-center justify-center gap-2 bg-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No certificates yet
          </h3>
          <p className="text-gray-600 mb-6">
            Complete a course to earn your first certificate
          </p>
          <Link
            href="/courses"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  )
}
