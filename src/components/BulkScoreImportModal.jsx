import { useState } from 'react'
import { X, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function BulkScoreImportModal({ isOpen, onClose, assessmentId, totalMarks, onSuccess }) {
  const [pasteData, setPasteData] = useState('')
  const [preview, setPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  if (!isOpen) return null

  const parsePasteData = (text) => {
    const lines = text.trim().split('\n').filter(line => line.trim())
    const rows = []

    for (const line of lines) {
      // Try splitting by tab first, then comma, then 2+ spaces
      let parts = line.split('\t')
      if (parts.length < 2) {
        parts = line.split(',')
      }
      if (parts.length < 2) {
        parts = line.split(/\s{2,}/)
      }
      if (parts.length < 2) {
        // Try single space as last resort
        const spaceIndex = line.lastIndexOf(' ')
        if (spaceIndex > 0) {
          parts = [line.substring(0, spaceIndex), line.substring(spaceIndex + 1)]
        }
      }

      if (parts.length >= 2) {
        const studentName = parts[0].trim()
        const scoreText = parts[parts.length - 1].trim()
        const score = parseFloat(scoreText)

        if (studentName && !isNaN(score)) {
          rows.push({
            student_name: studentName,
            score: score
          })
        }
      }
    }

    return rows
  }

  const handlePreview = () => {
    try {
      const parsed = parsePasteData(pasteData)
      setPreview(parsed)
      setError(null)
    } catch (err) {
      setError('Failed to parse data. Please check the format.')
      setPreview(null)
    }
  }

  const handleSubmit = async () => {
    if (!preview || preview.length === 0) {
      setError('Please preview the data first')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { scoresApi } = await import('../services/markbookApi')
      const response = await scoresApi.bulkImport({
        assessment_id: assessmentId,
        rows: preview
      })

      setResult(response)
      if (response.conflicts && response.conflicts.length > 0) {
        setError(`${response.conflicts.length} conflicts found. Check details below.`)
      } else {
        setTimeout(() => {
          onSuccess?.()
          onClose()
          setPasteData('')
          setPreview(null)
          setResult(null)
        }, 2000)
      }
    } catch (err) {
      setError(err.message || 'Failed to import scores')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setPasteData('')
    setPreview(null)
    setResult(null)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative my-8">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Bulk Import Scores</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Paste data from Excel (Student Name and Score)
            </label>
            <textarea
              value={pasteData}
              onChange={(e) => {
                setPasteData(e.target.value)
                setPreview(null)
                setResult(null)
              }}
              className="w-full h-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-sm"
              placeholder="John Brown    18&#10;Kayla Smith   20&#10;Tyrone Peters  15"
            />
            <p className="mt-2 text-xs text-gray-500">
              Format: Student name followed by score, separated by tab, comma, or spaces. One student per line.
            </p>
          </div>

          <button
            onClick={handlePreview}
            disabled={!pasteData.trim()}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview Data
          </button>

          {preview && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-700 mb-3">Preview ({preview.length} rows)</h3>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Student Name</th>
                      <th className="px-3 py-2 text-right">Score</th>
                      {totalMarks && (
                        <th className="px-3 py-2 text-right">Status</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.map((row, idx) => {
                      const isValid = !totalMarks || row.score <= totalMarks
                      return (
                        <tr key={idx} className={isValid ? '' : 'bg-red-50'}>
                          <td className="px-3 py-2">{row.student_name}</td>
                          <td className="px-3 py-2 text-right">{row.score}</td>
                          {totalMarks && (
                            <td className="px-3 py-2 text-right">
                              {isValid ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-red-600">Exceeds {totalMarks}</span>
                              )}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-lg border ${
              result.conflicts && result.conflicts.length > 0
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.conflicts && result.conflicts.length > 0 ? (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
                <span className={`font-semibold ${
                  result.conflicts && result.conflicts.length > 0 ? 'text-yellow-800' : 'text-green-800'
                }`}>
                  Import Complete
                </span>
              </div>
              <div className="text-sm space-y-1">
                <p>Created: {result.created}</p>
                <p>Updated: {result.updated}</p>
                {result.conflicts && result.conflicts.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold text-yellow-800">Conflicts:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.conflicts.map((conflict, idx) => (
                        <li key={idx} className="text-yellow-700">
                          {conflict.student_name}: {conflict.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              {result && !result.conflicts ? 'Close' : 'Cancel'}
            </button>
            {preview && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (result && !result.conflicts)}
                className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Importing...' : 'Import Scores'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}







