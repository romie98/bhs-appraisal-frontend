import { useState, useEffect } from 'react'
import { Sparkles, Loader2, AlertCircle, CheckCircle2, TrendingUp, Users, Target } from 'lucide-react'
import { aiApi } from '../services/aiService'

const GP_TITLES = {
  2: 'GP2 — Pedagogy & Teaching Strategies',
  3: 'GP3 — Student Assessment & Feedback',
}

const GP_COLORS = {
  2: 'bg-green-100 text-green-800 border-green-200',
  3: 'bg-purple-100 text-purple-800 border-purple-200',
}

function AssessmentEvidenceDisplay({ assessmentData, assessmentId, onEvidenceExtracted }) {
  const [evidence, setEvidence] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [extracting, setExtracting] = useState(false)

  // Load existing evidence if assessmentId is provided
  useEffect(() => {
    if (assessmentId && !evidence && !loading) {
      loadExistingEvidence()
    }
  }, [assessmentId])

  const loadExistingEvidence = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await aiApi.getAssessmentEvidence(assessmentId)
      setEvidence(data)
      if (onEvidenceExtracted) {
        onEvidenceExtracted(data)
      }
    } catch (err) {
      console.error('Error loading evidence:', err)
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
    if (!assessmentData || !assessmentData.description) {
      setError('Please provide assessment description to extract evidence.')
      return
    }

    try {
      setExtracting(true)
      setError(null)
      const data = await aiApi.extractAssessmentEvidence({
        ...assessmentData,
        assessment_id: assessmentId,
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
          <h3 className="text-xl font-bold text-gray-800">AI-Generated Evidence & Analysis</h3>
        </div>
        {!evidence && (
          <button
            onClick={handleExtractEvidence}
            disabled={extracting || !assessmentData}
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
          {[2, 3].map((gpNum) => {
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

          {/* Performance Breakdown */}
          {evidence.performanceBreakdown && Object.keys(evidence.performanceBreakdown).length > 0 && (
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
              <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Breakdown
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evidence.performanceBreakdown.excellent?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-blue-700 mb-1">Excellent Performance</p>
                    <ul className="text-sm text-blue-600 space-y-1">
                      {evidence.performanceBreakdown.excellent.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {evidence.performanceBreakdown.proficient?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-blue-700 mb-1">Proficient</p>
                    <ul className="text-sm text-blue-600 space-y-1">
                      {evidence.performanceBreakdown.proficient.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {evidence.performanceBreakdown.developing?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-orange-700 mb-1">Developing</p>
                    <ul className="text-sm text-orange-600 space-y-1">
                      {evidence.performanceBreakdown.developing.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {evidence.performanceBreakdown.needsSupport?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-1">Needs Support</p>
                    <ul className="text-sm text-red-600 space-y-1">
                      {evidence.performanceBreakdown.needsSupport.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {evidence.performanceBreakdown.commonGaps?.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">Common Learning Gaps</p>
                    <ul className="text-sm text-yellow-600 space-y-1">
                      {evidence.performanceBreakdown.commonGaps.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {evidence.recommendedActions && evidence.recommendedActions.length > 0 && (
            <div className="border border-green-200 rounded-xl p-4 bg-green-50">
              <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recommended Actions
              </h4>
              <div className="space-y-3">
                {evidence.recommendedActions.map((action, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-800">{action.action}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        action.priority === 'high' ? 'bg-red-100 text-red-800' :
                        action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      <Users className="w-3 h-3 inline mr-1" />
                      {action.targetGroup}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!evidence.gp2?.length && !evidence.gp3?.length && (
            <div className="text-center py-8 text-gray-500">
              <p>No evidence extracted yet. Click "Extract Evidence" to analyze the assessment.</p>
            </div>
          )}
        </div>
      )}

      {!evidence && !error && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No evidence extracted yet</p>
          <p className="text-sm">Click "Extract Evidence" to analyze your assessment using AI.</p>
        </div>
      )}
    </div>
  )
}

export default AssessmentEvidenceDisplay
