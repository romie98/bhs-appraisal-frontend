import { useState } from 'react'
import { FileText, Calendar, Upload, CheckCircle, X, Loader } from 'lucide-react'
import EvidenceCheckboxList from './EvidenceCheckboxList'
import { evidenceApi } from '../services/markbookApi'

function EvidenceUploader({ schema, onSave }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [gp, setGp] = useState(schema.gp || 'GP 1')
  const [subsection, setSubsection] = useState(schema.subsection || '')
  const [selectedEvidence, setSelectedEvidence] = useState([])
  const [files, setFiles] = useState(null)
  const [notes, setNotes] = useState('')
  // Removed: localPath and useLocalPath - now using backend API only
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Inline validation errors
  const [errors, setErrors] = useState({
    title: '',
    date: '',
    gp: '',
    subsection: '',
    evidence: '',
    file: ''
  })

  const gpOptions = ['GP 1', 'GP 2', 'GP 3', 'GP 4', 'GP 5', 'GP 6']

  const handleFileChange = (e) => {
    setFiles(e.target.files)
    setUploadError(null)
  }

  const validateForm = () => {
    const newErrors = {
      title: '',
      date: '',
      gp: '',
      subsection: '',
      evidence: '',
      file: ''
    }

    let isValid = true

    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Evidence title is required'
      isValid = false
    }

    // Date validation
    if (!date) {
      newErrors.date = 'Date is required'
      isValid = false
    }

    // GP validation
    if (!gp) {
      newErrors.gp = 'GP is required'
      isValid = false
    }

    // Subsection validation
    if (!subsection.trim()) {
      newErrors.subsection = 'Subsection is required'
      isValid = false
    }

    // Evidence validation
    if (selectedEvidence.length === 0) {
      newErrors.evidence = 'Please select at least one evidence type or provide Other description'
      isValid = false
    }

    // File validation
    if (!files || files.length === 0) {
      newErrors.file = 'Please select a file to upload'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploadError(null)

    // Validate form
    if (!validateForm()) {
      return
    }

    if (!files || files.length === 0) {
      setErrors({ ...errors, file: 'Please select a file to upload.' })
      return
    }

    setIsUploading(true)

    try {

      const file = files[0]
      
      // Construct gp_section in format "GP 1.1" (combining GP and subsection)
      const gpSection = `${gp} ${subsection}`.trim()
      
      // Upload to backend API
      const metadata = {
        gp: gp,
        subsection: subsection,
        gp_section: gpSection, // Format: "GP 1.1"
        title: title,
        description: notes, // Use notes as description
        selectedEvidence: selectedEvidence,
        notes: notes,
      }

      const result = await evidenceApi.upload(file, metadata)

      // Show success
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      // Call onSave callback with backend response AFTER showing success
      // This allows parent to refetch evidence list
      if (onSave) {
        onSave(result)
      }

      // Reset form
      setTitle('')
      setDate(new Date().toISOString().split('T')[0])
      setSelectedEvidence([])
      setFiles(null)
      setNotes('')
      
      // Reset file input
      const fileInput = document.getElementById(`file-input-${schema.id}`)
      if (fileInput) fileInput.value = ''

    } catch (error) {
      console.error('Error uploading evidence:', error)
      setUploadError(error.message || 'Failed to upload evidence. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor={`title-${schema.id}`} className="block text-sm font-medium text-gray-700 mb-2">
            Evidence Title <span className="text-red-500">*</span>
          </label>
          <input
            id={`title-${schema.id}`}
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors({ ...errors, title: '' })
            }}
            required
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ease-in-out ${
              errors.title 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-sky-500'
            }`}
            placeholder="Enter evidence title"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? `title-error-${schema.id}` : undefined}
          />
          {errors.title && (
            <p id={`title-error-${schema.id}`} className="mt-1 text-sm text-red-600" role="alert">
              {errors.title}
            </p>
          )}
        </div>

        {/* Date and GP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`date-${schema.id}`} className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id={`date-${schema.id}`}
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                if (errors.date) setErrors({ ...errors, date: '' })
              }}
              required
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ease-in-out ${
                errors.date 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-sky-500'
              }`}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? `date-error-${schema.id}` : undefined}
            />
            {errors.date && (
              <p id={`date-error-${schema.id}`} className="mt-1 text-sm text-red-600" role="alert">
                {errors.date}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`gp-${schema.id}`} className="block text-sm font-medium text-gray-700 mb-2">
              GP <span className="text-red-500">*</span>
            </label>
            <select
              id={`gp-${schema.id}`}
              value={gp}
              onChange={(e) => {
                setGp(e.target.value)
                if (errors.gp) setErrors({ ...errors, gp: '' })
              }}
              required
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ease-in-out ${
                errors.gp 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-sky-500'
              }`}
              aria-invalid={!!errors.gp}
              aria-describedby={errors.gp ? `gp-error-${schema.id}` : undefined}
            >
              {gpOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.gp && (
              <p id={`gp-error-${schema.id}`} className="mt-1 text-sm text-red-600" role="alert">
                {errors.gp}
              </p>
            )}
          </div>
        </div>

        {/* Subsection */}
        <div>
          <label htmlFor={`subsection-${schema.id}`} className="block text-sm font-medium text-gray-700 mb-2">
            Subsection <span className="text-red-500">*</span>
          </label>
          <input
            id={`subsection-${schema.id}`}
            type="text"
            value={subsection}
            onChange={(e) => {
              setSubsection(e.target.value)
              if (errors.subsection) setErrors({ ...errors, subsection: '' })
            }}
            required
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ease-in-out ${
              errors.subsection 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-sky-500'
            }`}
            placeholder="e.g., 2.1"
            aria-invalid={!!errors.subsection}
            aria-describedby={errors.subsection ? `subsection-error-${schema.id}` : undefined}
          />
          {errors.subsection && (
            <p id={`subsection-error-${schema.id}`} className="mt-1 text-sm text-red-600" role="alert">
              {errors.subsection}
            </p>
          )}
        </div>

        {/* Evidence Checklist */}
        <div>
          <EvidenceCheckboxList
            recommendedEvidence={schema.recommendedEvidence || []}
            selectedEvidence={selectedEvidence}
            onSelectionChange={(newSelection) => {
              setSelectedEvidence(newSelection)
              if (errors.evidence && newSelection.length > 0) {
                setErrors({ ...errors, evidence: '' })
              }
            }}
          />
          {errors.evidence && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.evidence}
            </p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            File Upload <span className="text-red-500">*</span>
          </label>
          
          <div className="space-y-3">
            <div>
              <label
                htmlFor={`file-input-${schema.id}`}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out cursor-pointer font-medium text-sm w-fit ${
                  errors.file
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-sky-600 text-white hover:bg-sky-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                {files ? `Selected: ${files[0]?.name}` : 'Choose File'}
              </label>
              <input
                id={`file-input-${schema.id}`}
                type="file"
                onChange={(e) => {
                  handleFileChange(e)
                  if (errors.file) setErrors({ ...errors, file: '' })
                }}
                multiple={schema.allowMultipleFiles}
                className="hidden"
                aria-invalid={!!errors.file}
                aria-describedby={errors.file ? `file-error-${schema.id}` : undefined}
              />
              {errors.file && (
                <p id={`file-error-${schema.id}`} className="mt-1 text-sm text-red-600" role="alert">
                  {errors.file}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Add any additional notes or reflections..."
          />
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <X className="w-5 h-5" />
            <span className="text-sm">{uploadError}</span>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Evidence saved successfully!</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading}
          className="w-full px-6 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          {isUploading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Save Evidence
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default EvidenceUploader

