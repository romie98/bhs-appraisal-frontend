import { useState, useEffect } from 'react'
import { Sparkles, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { aiApi } from '../services/aiService'

const GP_TITLES = {
  gp1: 'GP1 — Subject Content Knowledge',
  gp2: 'GP2 — Pedagogy & Teaching Strategies',
  gp3: 'GP3 — Student Assessment & Feedback',
  gp4: 'GP4 — Professional Development',
  gp5: 'GP5 — Community Engagement',
  gp6: 'GP6 — Technology Integration',
}

const GP_COLORS = {
  gp1: 'bg-blue-100 text-blue-800 border-blue-200',
  gp2: 'bg-green-100 text-green-800 border-green-200',
  gp3: 'bg-purple-100 text-purple-800 border-purple-200',
  gp4: 'bg-orange-100 text-orange-800 border-orange-200',
  gp5: 'bg-pink-100 text-pink-800 border-pink-200',
  gp6: 'bg-indigo-100 text-indigo-800 border-indigo-200',
}

function LessonEvidenceDisplay({ lessonText, lessonId, onEvidenceExtracted }) {
  const [evidence, setEvidence] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [extracting, setExtracting] = useState(false)

  // Load existing evidence if lessonId is provided
  useEffect(() => {
    if (lessonId && !evidence && !loading) {
      loadExistingEvidence()
    }
  }, [lessonId])

  const loadExistingEvidence = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await aiApi.getLessonEvidence(lessonId)
      setEvidence(data)
      if (onEvidenceExtracted) {
        onEvidenceExtracted(data)
      }
    } catch (err) {
      console.error('Error loading evidence:', err)
      // Don't show error if evidence doesn't exist yet
      if (err.message.includes('404')) {
        setEvidence(null)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleExtractEvidence = async () => {
    if (!lessonText || lessonText.trim().length === 0) {
      setError('Please provide lesson plan text to extract evidence.')
      return
    }

    try {
      setExtracting(true)
      setError(null)
      const data = await aiApi.extractLessonEvidence(lessonText, lessonId)
      setEvidence(data)
      if (onEvidenceExtracted) {
        onEvidenceExtracted(data)
      }
    } catch (err) {
      console.error('Error extracting evidence:', err)
      setError(err.message || 'Failed to extract evidence. Please try again.')
    } finally {
      setExtracting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading evidence...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-sky-600" />
          <h3 className="text-xl font-bold text-gray-800">AI-Generated Evidence</h3>
        </div>
        {!evidence && (
          <button
            onClick={handleExtractEvidence}
            disabled={extracting || !lessonText}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {extracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extract Evidence
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {evidence && (
        <div className="space-y-6">
          {/* GP Evidence Sections */}
          {[1, 2, 3, 4, 5, 6].map((gpNum) => {
            const gpKey = `gp${gpNum}`
            const items = evidence[gpKey] || []
            if (items.length === 0) return null

            return (
              <div key={gpKey} className="border rounded-xl p-4">
                <h4 className={`text-sm font-semibold mb-3 px-3 py-1 rounded-lg inline-block ${GP_COLORS[gpKey]}`}>
                  {GP_TITLES[gpKey]}
                </h4>
                <ul className="space-y-2">
                  {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          {/* Strengths */}
          {evidence.strengths && evidence.strengths.length > 0 && (
            <div className="border border-green-200 rounded-xl p-4 bg-green-50">
              <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Strengths
              </h4>
              <ul className="space-y-2">
                {evidence.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                    <span className="text-green-600 font-semibold">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses / Areas for Improvement */}
          {evidence.weaknesses && evidence.weaknesses.length > 0 && (
            <div className="border border-orange-200 rounded-xl p-4 bg-orange-50">
              <h4 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Areas for Improvement
              </h4>
              <ul className="space-y-2">
                {evidence.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-orange-700">
                    <span className="text-orange-600 font-semibold">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!evidence.gp1?.length &&
            !evidence.gp2?.length &&
            !evidence.gp3?.length &&
            !evidence.gp4?.length &&
            !evidence.gp5?.length &&
            !evidence.gp6?.length &&
            !evidence.strengths?.length &&
            !evidence.weaknesses?.length && (
              <div className="text-center py-8 text-gray-500">
                <p>No evidence extracted yet. Click "Extract Evidence" to analyze the lesson plan.</p>
              </div>
            )}
        </div>
      )}

      {!evidence && !error && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No evidence extracted yet</p>
          <p className="text-sm">Click "Extract Evidence" to analyze your lesson plan using AI.</p>
        </div>
      )}
    </div>
  )
}

export default LessonEvidenceDisplay







