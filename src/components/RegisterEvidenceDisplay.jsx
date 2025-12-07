import { useState, useEffect } from 'react'
import { Sparkles, Loader2, AlertCircle, CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react'
import { aiApi } from '../services/aiService'

const GP_TITLES = {
  3: 'GP3 — Student Assessment & Feedback',
  6: 'GP6 — Technology Integration',
}

const GP_COLORS = {
  3: 'bg-purple-100 text-purple-800 border-purple-200',
  6: 'bg-indigo-100 text-indigo-800 border-indigo-200',
}

function RegisterEvidenceDisplay({ registerData, registerPeriodId, onEvidenceExtracted }) {
  const [evidence, setEvidence] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [extracting, setExtracting] = useState(false)

  // Load existing evidence if registerPeriodId is provided
  useEffect(() => {
    if (registerPeriodId && !evidence && !loading) {
      loadExistingEvidence()
    }
  }, [registerPeriodId])

  const loadExistingEvidence = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await aiApi.getRegisterEvidence(registerPeriodId)
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
    if (!registerData) {
      setError('Please provide register data to extract evidence.')
      return
    }

    try {
      setExtracting(true)
      setError(null)
      const data = await aiApi.extractRegisterEvidence({
        ...registerData,
        register_period_id: registerPeriodId,
      })
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
          <h3 className="text-xl font-bold text-gray-800">AI-Generated Evidence & Trends</h3>
        </div>
        {!evidence && (
          <button
            onClick={handleExtractEvidence}
            disabled={extracting || !registerData}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {extracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Attendance
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
          {[3, 6].map((gpNum) => {
            const gpEvidence = evidence[`gp${gpNum}`] || []
            if (gpEvidence.length === 0) return null

            return (
              <div key={gpNum} className="border rounded-xl p-4">
                <h4 className={`text-sm font-semibold mb-3 px-3 py-1 rounded-lg inline-block ${GP_COLORS[gpNum]}`}>
                  {GP_TITLES[gpNum]}
                </h4>
                <ul className="space-y-2">
                  {gpEvidence.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          {/* Patterns Detected */}
          {evidence.patternsDetected && evidence.patternsDetected.length > 0 && (
            <div className="border border-yellow-200 rounded-xl p-4 bg-yellow-50">
              <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Patterns Detected
              </h4>
              <ul className="space-y-2">
                {evidence.patternsDetected.map((pattern, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-yellow-700">
                    <span className="text-yellow-600 font-semibold">•</span>
                    <span>{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Interventions */}
          {evidence.recommendedInterventions && evidence.recommendedInterventions.length > 0 && (
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
              <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Recommended Interventions
              </h4>
              <ul className="space-y-2">
                {evidence.recommendedInterventions.map((intervention, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span>{intervention}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!evidence.gp3?.length &&
            !evidence.gp6?.length &&
            !evidence.patternsDetected?.length &&
            !evidence.recommendedInterventions?.length && (
              <div className="text-center py-8 text-gray-500">
                <p>No evidence extracted yet. Click "Analyze Attendance" to analyze the register data.</p>
              </div>
            )}
        </div>
      )}

      {!evidence && !error && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No evidence extracted yet</p>
          <p className="text-sm">Click "Analyze Attendance" to analyze your register data using AI.</p>
        </div>
      )}
    </div>
  )
}

export default RegisterEvidenceDisplay







