import { useState } from "react"
import { uploadFile } from "../services/uploadService"
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

/**
 * Reusable file upload component
 * @param {string} type - Upload type: "evidence", "lesson-plan", "photo", "logbook", or "general"
 * @param {function} onUploaded - Callback when upload succeeds: (result) => void
 * @param {string} accept - File input accept attribute (e.g., "image/*", ".pdf,.docx")
 * @param {string} label - Label text for the upload area
 * @param {boolean} showPreview - Whether to show file preview before upload
 */
export default function FileUpload({ 
  type = "general", 
  onUploaded,
  accept,
  label = "Choose a file",
  showPreview = false
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [preview, setPreview] = useState(null)

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    setError("")
    setSuccess(false)

    // Create preview if enabled
    if (showPreview && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
    } else {
      setPreview(null)
    }

    // Auto-upload if preview is disabled
    if (!showPreview) {
      await handleUpload(file)
    }
  }

  async function handleUpload(file = null) {
    const fileToUpload = file || (document.querySelector(`input[type="file"][data-upload-type="${type}"]`)?.files?.[0])
    
    if (!fileToUpload) {
      setError("Please select a file first")
      return
    }

    setUploading(true)
    setError("")
    setSuccess(false)

    try {
      const result = await uploadFile(fileToUpload, type)

      if (!result.success) {
        setError(result.error || "Upload failed.")
      } else {
        setSuccess(true)
        onUploaded && onUploaded(result)
        // Clear preview after successful upload
        if (preview) {
          URL.revokeObjectURL(preview)
          setPreview(null)
        }
        // Reset file input
        const input = document.querySelector(`input[type="file"][data-upload-type="${type}"]`)
        if (input) input.value = ""
      }
    } catch (err) {
      setError(err.message || "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  // Determine default accept based on type
  const defaultAccept = accept || (
    type === "photo" || type === "evidence" 
      ? "image/*" 
      : type === "lesson-plan"
      ? ".pdf,.docx,.txt"
      : type === "logbook"
      ? "image/*"
      : "*/*"
  )

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-sky-400 transition-colors">
        {preview && showPreview ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-64 rounded-lg object-contain"
              />
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleUpload()}
                disabled={uploading}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  URL.revokeObjectURL(preview)
                  setPreview(null)
                  const input = document.querySelector(`input[type="file"][data-upload-type="${type}"]`)
                  if (input) input.value = ""
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <label className="cursor-pointer">
              <span className="text-sky-600 hover:text-sky-700 font-medium">
                {label}
              </span>
              <input
                type="file"
                accept={defaultAccept}
                className="hidden"
                data-upload-type={type}
                onChange={handleFileChange}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              {type === "photo" || type === "evidence" 
                ? "JPG, PNG, HEIC" 
                : type === "lesson-plan"
                ? "PDF, DOCX, TXT"
                : "Any file"}
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          <span>File uploaded successfully!</span>
        </div>
      )}
    </div>
  )
}


