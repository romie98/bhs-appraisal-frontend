import { FileText, Calendar, ExternalLink, Download, Edit, Trash2, Image, File, FileCode, FileVideo, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

// Helper functions for file type detection
const isImage = (n) => /\.(jpg|jpeg|png|gif|webp)$/i.test(n)
const isVideo = (n) => /\.(mp4|mov|webm)$/i.test(n)
const isAudio = (n) => /\.(mp3|wav|ogg)$/i.test(n)

function EvidenceCard({ evidence, onEdit, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [open, setOpen] = useState(false)
  const cardRef = useState(null)

  // Handle Escape key to close modal and scroll card into view when opening
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    
    if (open) {
      document.addEventListener('keydown', handleEscape)
      // Scroll the card into view when modal opens
      const cardElement = document.querySelector(`[data-evidence-id="${evidence.id}"]`)
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, evidence.id])

  const formatDate = (dateString) => {
    if (!dateString) return 'No date'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const getFileIcon = (fileName) => {
    if (!fileName) return <FileText className="w-8 h-8" />
    
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <Image className="w-8 h-8" />
      case 'mp4':
      case 'mov':
      case 'avi':
        return <FileVideo className="w-8 h-8" />
      case 'html':
      case 'css':
      case 'js':
      case 'jsx':
        return <FileCode className="w-8 h-8" />
      default:
        return <File className="w-8 h-8" />
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(evidence.id)
    }
    setShowDeleteConfirm(false)
  }

  // Helper to clean Supabase URL (remove trailing '?')
  const cleanSupabaseUrl = (url) => {
    if (!url || typeof url !== 'string') return url
    return url.replace(/\?+$/, '')
  }

  // Render inline preview for accordion view
  const renderInlinePreview = () => {
    const fileName = evidence.fileName || ''
    const fileUrl = cleanSupabaseUrl(evidence.supabase_url)

    if (!fileUrl) return null

    // IMAGE inline preview
    if (isImage(fileName)) {
      return (
        <img
          src={fileUrl}
          alt="preview"
          className="w-full object-contain rounded-xl mx-auto shadow-lg"
          loading="lazy"
          style={{ 
            maxHeight: '80vh',
            minHeight: '500px',
            minWidth: '600px',
            width: 'auto',
            height: 'auto',
            display: 'block'
          }}
        />
      )
    }

    // PDF Files
    if (/\.(pdf)$/i.test(fileName)) {
      return (
        <iframe
          src={fileUrl}
          className="w-full rounded-xl border-0"
          style={{ height: '80vh', minHeight: '600px' }}
          title={`Preview of ${evidence.title || fileName}`}
        />
      )
    }

    return null
  }

  // Get preview element based on file type
  const getPreviewElement = () => {
    const fileName = evidence.fileName || ''
    const fileUrl = cleanSupabaseUrl(evidence.supabase_url)

    if (!fileUrl) {
      return (
        <div className="w-full h-[85vh] flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No preview available</p>
            <p className="text-sm text-gray-500 mt-2">File URL not available</p>
          </div>
        </div>
      )
    }

    // PDF preview
    if (/\.(pdf)$/i.test(fileName)) {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-[85vh] rounded-xl border-0"
          title={`Preview of ${evidence.title || fileName}`}
        />
      )
    }

    // IMAGE preview
    if (isImage(fileName)) {
      return (
        <img
          src={fileUrl}
          className="evidence-preview-image rounded-xl shadow-lg"
          alt={evidence.title || fileName || 'Preview'}
          loading="eager"
        />
      )
    }

    // VIDEO preview
    if (isVideo(fileName)) {
      return (
        <video
          src={fileUrl}
          controls
          className="w-full max-h-[85vh] rounded-xl"
        >
          Your browser does not support the video tag.
        </video>
      )
    }

    // AUDIO preview
    if (isAudio(fileName)) {
      return (
        <div className="w-full flex items-center justify-center py-8">
          <audio
            src={fileUrl}
            controls
            className="w-full max-w-md"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      )
    }

    // Default: No preview available
    return (
      <div className="w-full h-[85vh] flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No preview available</p>
          <p className="text-sm text-gray-500 mt-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:text-sky-700 underline"
            >
              Open file in new tab
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      data-evidence-id={evidence.id}
      className={`evidence-card-container bg-white rounded-2xl shadow-xl border border-gray-200 transition-all duration-300 ease-in-out p-4 ${
        open ? '' : 'hover:shadow-2xl hover:-translate-y-2'
      }`}
      style={open ? { pointerEvents: 'none' } : { 
        position: 'relative', 
        zIndex: 1,
        isolation: 'isolate'
      }}
    >
      {/* Thumbnail/Preview */}
      <div className="w-full h-40 bg-gray-50 rounded-xl mb-3 overflow-hidden relative">
        {evidence.supabase_url ? (
          <>
            <img
              src={cleanSupabaseUrl(evidence.supabase_url)}
              alt={evidence.fileName || evidence.title || 'Evidence preview'}
              className="w-full h-40 object-cover rounded"
              onError={(e) => {
                // Hide image and show icon fallback
                e.target.style.display = 'none'
                const fallback = e.target.nextElementSibling
                if (fallback) {
                  fallback.style.display = 'flex'
                }
              }}
            />
            <div className="hidden items-center justify-center w-full h-40 text-gray-400 absolute inset-0">
              {getFileIcon(evidence.fileName)}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-40 text-gray-400">
            {getFileIcon(evidence.fileName)}
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm">
          {evidence.title || 'Untitled Evidence'}
        </h3>
      </div>

      {/* GP + Subsection Badge */}
      <div className="mb-3">
        <span className="text-xs font-semibold rounded-full px-2 py-1 bg-gray-100 text-gray-700">
          {evidence.gp} — {evidence.subsection}
        </span>
      </div>

      {/* Selected Evidence Labels (Chips) */}
      {evidence.selectedEvidence && evidence.selectedEvidence.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {evidence.selectedEvidence.slice(0, 3).map((item, index) => (
              <span
                key={index}
                className="text-xs font-semibold rounded-full px-2 py-1 bg-gray-100 text-gray-700"
              >
                {item.length > 20 ? `${item.substring(0, 20)}...` : item}
              </span>
            ))}
            {evidence.selectedEvidence.length > 3 && (
              <span className="text-xs font-semibold rounded-full px-2 py-1 bg-gray-100 text-gray-700">
                +{evidence.selectedEvidence.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Date Added */}
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
        <Calendar className="w-3 h-3" />
        <span>
          {evidence.uploaded_at 
            ? new Date(evidence.uploaded_at).toLocaleDateString()
            : evidence.dateAdded 
            ? formatDate(evidence.dateAdded)
            : 'No date'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {evidence.supabase_url && (
          <>
            <button
              onClick={() => setOpen(true)}
              className="bg-sky-600 text-white px-3 py-1 rounded-md text-sm hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              Preview
            </button>
            <button
              onClick={() => window.open(cleanSupabaseUrl(evidence.supabase_url), "_blank")}
              className="text-blue-600 underline text-xs hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            >
              View
            </button>
          </>
        )}
        {evidence.supabase_url && (
          <a
            href={cleanSupabaseUrl(evidence.supabase_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-2 py-1"
          >
            <ExternalLink className="w-3 h-3" />
            Open
          </a>
        )}
        {evidence.supabase_url && (
          <a
            href={cleanSupabaseUrl(evidence.supabase_url)}
            download
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-2 py-1"
          >
            <Download className="w-3 h-3" />
            Download
          </a>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(evidence)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-2 py-1"
            aria-label="Edit evidence"
          >
            <Edit className="w-3 h-3" />
            Edit
          </button>
        )}
        {onDelete && (
          <div className="relative ml-auto">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-2 py-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                aria-label="Delete evidence"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notes Preview */}
      {evidence.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 line-clamp-2">{evidence.notes}</p>
        </div>
      )}

      {/* Preview Modal - Rendered via Portal to escape parent constraints */}
      {open && createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4 evidence-preview-modal backdrop-blur-sm overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="evidence-preview-modal bg-white rounded-2xl shadow-xl p-6 z-[10000] relative max-w-[900px] w-full max-h-[80vh] overflow-y-auto overflow-x-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 z-10 bg-white shadow-md"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-4 pr-8 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {evidence.title || 'Untitled Evidence'}
              </h3>
              <p className="text-sm text-gray-600">
                {evidence.fileName || 'File preview'}
              </p>
              {evidence.uploaded_at && (
                <p className="text-xs text-gray-500 mt-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Uploaded: {new Date(evidence.uploaded_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Preview Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-auto" style={{ minHeight: 0, pointerEvents: 'auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="flex items-center justify-center py-2" style={{ width: '100%', height: '100%' }}>
                {getPreviewElement()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-xs font-semibold rounded-full px-2 py-1 bg-gray-100 text-gray-700">
                  {evidence.gp} — {evidence.subsection}
                </span>
                {(evidence.uploaded_at || evidence.dateAdded) && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {evidence.uploaded_at 
                      ? new Date(evidence.uploaded_at).toLocaleDateString()
                      : formatDate(evidence.dateAdded)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {evidence.supabase_url && (
                  <a
                    href={cleanSupabaseUrl(evidence.supabase_url)}
                    download
                    className="flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-3 py-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  )
}

export default EvidenceCard
