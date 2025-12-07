import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { 
  Upload, 
  FileText, 
  X,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { lessonPlansApi } from '../services/markbookApi'

function LessonPlanUpload() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [uploadMethod, setUploadMethod] = useState('file') // 'file' or 'text'
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [textContent, setTextContent] = useState('')
  const [error, setError] = useState('')

  // File upload mutation - backend gets user from JWT token
  const fileUploadMutation = useMutation({
    mutationFn: ({ file, title }) => lessonPlansApi.upload(file, title),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] })
      navigate(`/lesson-plans/${data.id}`)
    },
    onError: (error) => {
      setError(error.message || 'Failed to upload lesson plan')
    },
  })

  // Text creation mutation - backend gets user from JWT token
  const textCreateMutation = useMutation({
    mutationFn: ({ title, content_text }) => 
      lessonPlansApi.createFromText({ title, content_text }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] })
      navigate(`/lesson-plans/${data.id}`)
    },
    onError: (error) => {
      setError(error.message || 'Failed to create lesson plan')
    },
  })

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const ext = selectedFile.name.toLowerCase().split('.').pop()
      if (!['pdf', 'docx', 'txt'].includes(ext)) {
        setError('Please select a PDF, DOCX, or TXT file')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    if (uploadMethod === 'file') {
      if (!file) {
        setError('Please select a file')
        return
      }
      fileUploadMutation.mutate({ file, title })
    } else {
      if (!textContent.trim()) {
        setError('Please enter lesson plan content')
        return
      }
      textCreateMutation.mutate({ 
        title, 
        content_text: textContent
      })
    }
  }

  const isLoading = fileUploadMutation.isPending || textCreateMutation.isPending

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/lesson-plans')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Upload className="w-8 h-8 text-sky-600" />
              Upload Lesson Plan
            </h1>
            <p className="text-gray-600 mt-2">Upload a file or paste your lesson plan text</p>
          </div>
        </div>
      </div>

      {/* Upload Method Toggle */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setUploadMethod('file')
              setError('')
            }}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              uploadMethod === 'file'
                ? 'bg-sky-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Upload className="w-5 h-5 inline-block mr-2" />
            Upload File
          </button>
          <button
            onClick={() => {
              setUploadMethod('text')
              setError('')
            }}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              uploadMethod === 'text'
                ? 'bg-sky-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-5 h-5 inline-block mr-2" />
            Paste Text
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Plan Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="e.g., Mathematics - Fractions Lesson"
              required
            />
          </div>

          {/* File Upload */}
          {uploadMethod === 'file' && (
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                Upload File (PDF, DOCX, or TXT) *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-sky-400 transition-colors">
                <div className="space-y-1 text-center">
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-sky-600">
                      <FileText className="w-8 h-8" />
                      <span className="font-medium">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="ml-2 p-1 hover:bg-sky-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file"
                            name="file"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOCX, TXT up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Text Input */}
          {uploadMethod === 'text' && (
            <div>
              <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Plan Content *
              </label>
              <textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono text-sm"
                placeholder="Paste your lesson plan text here..."
                required
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/lesson-plans')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploadMethod === 'file' ? 'Uploading...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  {uploadMethod === 'file' ? 'Upload Lesson Plan' : 'Create Lesson Plan'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LessonPlanUpload






