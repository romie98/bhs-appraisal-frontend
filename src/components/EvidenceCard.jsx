import { FileText, Calendar, ExternalLink, Download, Edit, Trash2, Image, File, FileCode, FileVideo, X, Eye, Pencil } from 'lucide-react'
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

  // Handle Escape key to close modal and body scroll lock
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    
    if (open) {
      // Lock body scroll when modal is open
      document.body.style.overflow = "hidden"
      document.addEventListener('keydown', handleEscape)
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = "auto"
    }
    
    return () => {
      document.body.style.overflow = "auto"
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

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

  // Get preview element based on file type - using URL extension detection
  const getPreviewElement = () => {
    const fileUrl = cleanSupabaseUrl(evidence.supabase_url)

    if (!fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <FileText className="w-12 h-12 text-gray-400 mb-4" />
          <p className="mt-2 text-gray-600 font-medium">No preview available</p>
          <p className="text-sm text-gray-500 mt-2">File URL not available</p>
        </div>
      )
    }

    // Detect image by URL extension
    const isImageFile = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileUrl)

    if (isImageFile) {
      return (
        <img
          src={fileUrl}
          alt={evidence.title || "Evidence Preview"}
          className="w-full max-h-[70vh] object-contain rounded-xl"
        />
      )
    }

    // Non-image files - show "No preview available"
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <svg 
          className="w-12 h-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round"
            d="M9 13h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" 
          />
        </svg>
        <p className="mt-2 text-gray-600 font-medium">No preview available</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline mt-2 hover:text-blue-700"
        >
          Open file in new tab
        </a>
      </div>
    )
  }

  return (
    <div 
      data-evidence-id={evidence.id}
      className={`evidence-card-container bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 ease-in-out overflow-hidden cursor-pointer ${
        open ? '' : 'hover:shadow-xl hover:-translate-y-1'
      }`}
      style={open ? { pointerEvents: 'none' } : { 
        position: 'relative', 
        zIndex: 1,
        isolation: 'isolate'
      }}
      onClick={() => {
        if (evidence.supabase_url && !open) {
          setOpen(true)
        }
      }}
    >
      {/* Square Image Thumbnail */}
      <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-50 relative">
        {evidence.supabase_url ? (
          <>
            <img
              src={cleanSupabaseUrl(evidence.supabase_url)}
              alt={evidence.fileName || evidence.title || 'Evidence preview'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide image and show icon fallback
                e.target.style.display = 'none'
                const fallback = e.target.nextElementSibling
                if (fallback) {
                  fallback.style.display = 'flex'
                }
              }}
            />
            <div className="hidden items-center justify-center w-full h-full text-gray-400 absolute inset-0 bg-gray-50">
              {getFileIcon(evidence.fileName)}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-50">
            {getFileIcon(evidence.fileName)}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3">
        {/* Title */}
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1 text-sm">
          {evidence.title || 'Untitled Evidence'}
        </h3>

        {/* Upload Date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>
            {evidence.uploaded_at 
              ? new Date(evidence.uploaded_at).toLocaleDateString()
              : evidence.dateAdded 
              ? formatDate(evidence.dateAdded)
              : 'No date'}
          </span>
        </div>
      </div>

      {/* Preview Modal - Rendered via Portal to escape parent constraints */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
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

            {/* Preview Content */}
            <div className="flex items-center justify-center py-4">
              {getPreviewElement()}
            </div>

            {/* Modal Footer - Action Row */}
            <div className="flex justify-between items-center mt-6 border-t pt-4">
              <div className="flex items-center gap-3">
                {/* View Image */}
                {evidence.supabase_url && (
                  <a
                    href={cleanSupabaseUrl(evidence.supabase_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <Eye className="w-4 h-4" />
                    View Image
                  </a>
                )}

                {/* Download */}
                {evidence.supabase_url && (
                  <a
                    href={cleanSupabaseUrl(evidence.supabase_url)}
                    download
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Edit */}
                {onEdit && (
                  <button
                    onClick={() => {
                      setOpen(false)
                      onEdit(evidence)
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                )}

                {/* Delete */}
                {onDelete && (
                  <button
                    onClick={() => {
                      setOpen(false)
                      onDelete(evidence.id)
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
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
