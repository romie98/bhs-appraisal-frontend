import { FileText, Calendar, ExternalLink, Download, Edit, Trash2, Image, File, FileCode, FileVideo, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { buildApiUrl } from '../config/api'

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

  // Google Drive integration removed - files are stored in backend
  // Render inline preview for accordion view
  const renderInlinePreview = () => {
    const fileName = evidence.fileName || ''
    const downloadLink = evidence.file_url || evidence.localPath

    // IMAGE inline preview
    if (isImage(fileName)) {
      const imageSrc = downloadLink || evidence.localPath
      if (imageSrc) {
        return (
          <img
            src={imageSrc}
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
    }

    // PDF Files (stored in backend)
    if (evidence.localPath && /\.(pdf)$/i.test(evidence.localPath)) {
      let localUrl = evidence.localPath
      
      if (!localUrl.startsWith('http') && !localUrl.startsWith('file://')) {
        if (localUrl.startsWith('/mnt/data')) {
          localUrl = buildApiUrl(`/api/files${localUrl}`)
        } else if (localUrl.startsWith('/')) {
          localUrl = buildApiUrl(`/api/files${localUrl}`)
        }
      }
      
      return (
        <iframe
          src={localUrl}
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
    const downloadLink = evidence.file_url || evidence.localPath

    // If file is PDF or document (stored in backend)
    if (evidence.localPath && /\.(pdf)$/i.test(evidence.localPath)) {
      // Transform local path to URL
      let localUrl = evidence.localPath
      
      if (!localUrl.startsWith('http') && !localUrl.startsWith('file://')) {
        // Transform /mnt/data paths to server endpoint
        if (localUrl.startsWith('/mnt/data')) {
          localUrl = buildApiUrl(`/api/files${localUrl}`)
        } else if (localUrl.startsWith('/')) {
          // Absolute path - use as is or with API prefix
          localUrl = buildApiUrl(`/api/files${localUrl}`)
        }
      }
      
      return (
        <iframe
          src={localUrl}
          className="w-full h-[85vh] rounded-xl border-0"
          title={`Preview of ${evidence.title || fileName}`}
        />
      )
    }

    // IMAGE preview
    if (isImage(fileName)) {
      const imageSrc = downloadLink || evidence.localPath
      if (imageSrc) {
        return (
          <img
            src={imageSrc}
            className="rounded-xl shadow-lg"
            alt={evidence.title || fileName || 'Preview'}
            loading="eager"
            style={{
              width: 'auto',
              height: 'auto',
              maxWidth: '92vw',
              maxHeight: '88vh',
              display: 'block',
              pointerEvents: 'auto',
              userSelect: 'auto',
              cursor: 'default',
              objectFit: 'contain'
            }}
          />
        )
      }
    }

    // VIDEO preview
    if (isVideo(fileName) && downloadLink) {
      return (
        <video
          src={downloadLink}
          controls
          className="w-full max-h-[85vh] rounded-xl"
        >
          Your browser does not support the video tag.
        </video>
      )
    }

    // AUDIO preview
    if (isAudio(fileName) && downloadLink) {
      return (
        <div className="w-full flex items-center justify-center py-8">
          <audio
            src={downloadLink}
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
            {downloadLink && (
              <a
                href={downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:text-sky-700 underline"
              >
                Open file in new tab
              </a>
            )}
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
        zIndex: 100,
        isolation: 'isolate'
      }}
    >
      {/* Thumbnail/Icon - Small window */}
      <div className="flex items-center justify-center w-full h-32 bg-gray-50 rounded-xl mb-3">
        <div className="text-gray-400">
          {getFileIcon(evidence.fileName)}
        </div>
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
        <span>{formatDate(evidence.dateAdded)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {(evidence.file_url || evidence.localPath) && (
          <button
            onClick={() => setOpen(true)}
            className="bg-sky-600 text-white px-3 py-1 rounded-md text-sm hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            View
          </button>
        )}
        {(evidence.file_url || evidence.localPath) && (
          <a
            href={evidence.file_url || evidence.localPath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-2 py-1"
          >
            <ExternalLink className="w-3 h-3" />
            Open
          </a>
        )}
        {(evidence.file_url || evidence.localPath) && (
          <a
            href={evidence.file_url || evidence.localPath}
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
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm overflow-y-auto p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh] overflow-y-auto overflow-x-auto p-2 relative flex flex-col my-auto"
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
                {evidence.title || 'Evidence Preview'}
              </h3>
              <p className="text-sm text-gray-600">
                {evidence.fileName || 'File preview'}
              </p>
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
                {evidence.dateAdded && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(evidence.dateAdded)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(evidence.file_url || evidence.localPath) && (
                  <a
                    href={evidence.file_url || evidence.localPath}
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
