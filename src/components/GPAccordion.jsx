import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, FileText, X } from 'lucide-react'
import EvidenceCard from './EvidenceCard'
import EvidenceUploader from './EvidenceUploader'

function GPAccordion({ subsection, title, description, evidenceItems = [], schema, onEdit, onDelete, onEvidenceSaved }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showUploader, setShowUploader] = useState(false)

  const handleEvidenceSaved = (result) => {
    setShowUploader(false)
    // Call parent callback to trigger refetch
    if (onEvidenceSaved) {
      onEvidenceSaved(result)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200" style={{ overflow: 'visible', position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-all duration-300 ease-in-out text-left focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${subsection}`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-blue-600">{subsection}</span>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            {evidenceItems.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {evidenceItems.length}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      <div
        id={`accordion-content-${subsection}`}
        className={`border-t border-gray-200 bg-gray-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
        style={{ position: 'relative', zIndex: 1, overflow: isOpen ? 'visible' : 'hidden' }}
      >
        <div className="p-4" style={{ overflow: 'visible' }}>
          {evidenceItems.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <div className="mb-4">
                <FileText className="w-12 h-12 text-gray-300 mx-auto" />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                No evidence uploaded yet for this subsection
              </p>
              <button
                onClick={() => setShowUploader(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all duration-300 ease-in-out font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4" />
                Add Evidence
              </button>
            </div>
          ) : (
            // Evidence items - full width vertical stack for large previews
            <div className="space-y-6" style={{ position: 'relative', overflow: 'visible' }}>
              {evidenceItems.map((evidence, index) => (
                <div key={evidence.id || index} className="relative" style={{ zIndex: 1 }}>
                  <EvidenceCard 
                    evidence={evidence} 
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              ))}

              {/* Floating action button */}
              <div className="flex justify-end mt-4" style={{ position: 'relative', zIndex: 20 }}>
                <button
                  onClick={() => setShowUploader(true)}
                  className="w-12 h-12 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 transition-all duration-300 ease-in-out hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                  aria-label="Add evidence"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* Evidence Uploader Modal */}
          {showUploader && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowUploader(false)
                }
              }}
            >
              <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      Add Evidence - {subsection} {title}
                    </h3>
                    <button
                      onClick={() => setShowUploader(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                      aria-label="Close"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  {schema && (
                    <EvidenceUploader
                      schema={schema}
                      onSave={handleEvidenceSaved}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GPAccordion
