import React from "react"
import { X, Download, Copy, ExternalLink } from "lucide-react"

/**
 * Modal component for previewing files (images and PDFs)
 * @param {string} url - The signed URL or file URL to preview
 * @param {function} onClose - Callback when modal is closed
 * @param {string} filename - Optional filename for display
 */
export default function FilePreviewModal({ url, onClose, filename }) {
  if (!url) return null

  // Determine file type from URL or filename
  const isImage = 
    url.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i) || 
    url.includes('image/') ||
    filename?.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i)
  
  const isPDF = 
    url.match(/\.pdf$/i) || 
    url.includes('pdf') ||
    filename?.match(/\.pdf$/i)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename || 'download'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      // You could show a toast notification here
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy link:', err)
      alert('Failed to copy link. Please try again.')
    }
  }

  const handleOpenInNewTab = () => {
    window.open(url, '_blank')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {filename || "File Preview"}
          </h3>
          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleCopyLink}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy Link"
            >
              <Copy className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Open in New Tab"
            >
              <ExternalLink className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
          {isImage ? (
            <img
              src={url}
              alt="Preview"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
          ) : isPDF ? (
            <iframe
              src={url}
              className="w-full h-[70vh] border-0 rounded-lg"
              title="PDF Preview"
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-600 mb-4">
                Cannot preview this file type. You can download it instead.
              </p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            </div>
          )}
          {/* Fallback for broken images */}
          {isImage && (
            <div style={{ display: 'none' }} className="text-center p-8">
              <p className="text-gray-600 mb-4">
                Image failed to load. The signed URL may have expired.
              </p>
              <button
                onClick={handleOpenInNewTab}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


