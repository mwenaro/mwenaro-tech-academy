'use client'

import { Download, Share2, ExternalLink, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Certificate {
  id: string
  course_id: string
  certificate_url: string
  verification_code: string
  issued_at: string
  course?: {
    title: string
    description: string
  }
}

interface CertificateDisplayProps {
  certificates: Certificate[]
  loading?: boolean
}

/**
 * CertificateDisplay Component
 * 
 * Display earned certificates with:
 * - Certificate preview/download
 * - Shareable links
 * - Verification codes
 * - Issue dates
 * 
 * Props:
 * - certificates: Array of certificate objects
 * - loading: Loading state
 */
export function CertificateDisplay({
  certificates,
  loading = false,
}: CertificateDisplayProps) {
  /**
   * Handle certificate download
   */
  const handleDownload = async (certificate: Certificate) => {
    try {
      // In production, this would download the actual PDF
      const link = document.createElement('a')
      link.href = certificate.certificate_url
      link.download = `Certificate-${certificate.verification_code}.pdf`
      link.click()
      toast.success('Certificate downloading...')
    } catch (error) {
      toast.error('Failed to download certificate')
    }
  }

  /**
   * Copy verification code to clipboard
   */
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Verification code copied!')
  }

  /**
   * Open certificate in new tab
   */
  const handleView = (certificate: Certificate) => {
    window.open(certificate.certificate_url, '_blank')
  }

  /**
   * Share certificate
   */
  const handleShare = async (certificate: Certificate) => {
    const shareText = `I just completed ${certificate.course?.title}! Check my certificate: ${window.location.origin}/verify/${certificate.verification_code}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Certificate',
          text: shareText,
        })
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText)
        toast.success('Share link copied!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 h-48 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <CheckCircle className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600 mb-2">No certificates yet</p>
        <p className="text-gray-500 text-sm">
          Complete courses to earn certificates
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {certificates.map((certificate) => (
        <div
          key={certificate.id}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
        >
          {/* Certificate Preview */}
          <div className="bg-linear-to-br from-deep-blue to-bright-teal p-8 text-white min-h-48 flex items-center justify-center">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-3 opacity-50" size={40} />
              <p className="font-semibold mb-2">{certificate.course?.title}</p>
              <p className="text-sm text-white text-opacity-80">
                Completed on{' '}
                {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Certificate Info */}
          <div className="p-6 space-y-4">
            {/* Course Details */}
            <div>
              <p className="text-xs text-gray-600 mb-1">COURSE</p>
              <p className="font-semibold text-dark-charcoal">
                {certificate.course?.title}
              </p>
            </div>

            {/* Verification Code */}
            <div>
              <p className="text-xs text-gray-600 mb-1">VERIFICATION CODE</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-50 px-3 py-2 rounded text-sm font-mono text-dark-charcoal">
                  {certificate.verification_code}
                </code>
                <button
                  onClick={() => handleCopyCode(certificate.verification_code)}
                  className="p-2 hover:bg-gray-100 rounded transition text-gray-600"
                  title="Copy code"
                >
                  📋
                </button>
              </div>
            </div>

            {/* Issue Date */}
            <div>
              <p className="text-xs text-gray-600 mb-1">ISSUED DATE</p>
              <p className="text-sm text-dark-charcoal">
                {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleDownload(certificate)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-bright-teal text-white rounded-lg hover:bg-opacity-90 transition text-sm font-medium"
                title="Download certificate"
              >
                <Download size={16} />
                Download
              </button>

              <button
                onClick={() => handleView(certificate)}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-dark-charcoal"
                title="View certificate"
              >
                <ExternalLink size={16} />
              </button>

              <button
                onClick={() => handleShare(certificate)}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-dark-charcoal"
                title="Share certificate"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
