import { useState, useEffect } from 'react'
import { Sparkles, Loader2, AlertCircle, CheckCircle2, Download, FileText, RefreshCw } from 'lucide-react'
import { aiApi } from '../services/aiService'

const GP_TITLES = {
  1: 'GP1 — Subject Content Knowledge',
  2: 'GP2 — Pedagogy & Teaching Strategies',
  3: 'GP3 — Student Assessment & Feedback',
  4: 'GP4 — Professional Development',
  5: 'GP5 — Community Engagement',
  6: 'GP6 — Technology Integration',
}

const GP_COLORS = {
  1: 'bg-blue-100 text-blue-800 border-blue-200',
  2: 'bg-green-100 text-green-800 border-green-200',
  3: 'bg-purple-100 text-purple-800 border-purple-200',
  4: 'bg-orange-100 text-orange-800 border-orange-200',
  5: 'bg-pink-100 text-pink-800 border-pink-200',
  6: 'bg-indigo-100 text-indigo-800 border-indigo-200',
}

function PortfolioBuilder({ allEvidence, onPortfolioBuilt }) {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [building, setBuilding] = useState(false)

  // Try to load latest portfolio on mount
  useState(() => {
    loadLatestPortfolio()
  }, [])

  const loadLatestPortfolio = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await aiApi.getLatestPortfolio()
      setPortfolio(data)
      if (onPortfolioBuilt) {
        onPortfolioBuilt(data)
      }
    } catch (err) {
      console.error('Error loading portfolio:', err)
      if (!err.message.includes('404')) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBuildPortfolio = async () => {
    if (!allEvidence || Object.keys(allEvidence).length === 0) {
      setError('Please provide evidence data to build the portfolio.')
      return
    }

    try {
      setBuilding(true)
      setError(null)
      const data = await aiApi.buildPortfolio(allEvidence)
      setPortfolio(data)
      if (onPortfolioBuilt) {
        onPortfolioBuilt(data)
      }
    } catch (err) {
      console.error('Error building portfolio:', err)
      setError(err.message || 'Failed to build portfolio. Please try again.')
    } finally {
      setBuilding(false)
    }
  }

  const handleExportPDF = () => {
    // This would integrate with the PDF export service
    alert('PDF export functionality will be implemented with the export service.')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading portfolio...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-sky-600" />
          <h3 className="text-xl font-bold text-gray-800">Portfolio Auto-Builder</h3>
        </div>
        <div className="flex gap-2">
          {portfolio && (
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          )}
          <button
            onClick={handleBuildPortfolio}
            disabled={building || !allEvidence}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {building ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Building...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                {portfolio ? 'Rebuild Portfolio' : 'Build Portfolio'}
              </>
            )}
          </button>
        </div>
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

      {portfolio && (
        <div className="space-y-6">
          {/* Overall Summary */}
          {portfolio.overall_summary && (
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">Overall Professional Reflection</h4>
              <p className="text-gray-700 leading-relaxed">{portfolio.overall_summary}</p>
            </div>
          )}

          {/* GP Sections */}
          {[1, 2, 3, 4, 5, 6].map((gpNum) => {
            const gpSection = portfolio[`gp${gpNum}`]
            if (!gpSection || (!gpSection.evidence?.length && !gpSection.summary)) return null

            return (
              <div key={gpNum} className="border rounded-xl p-6">
                <h4 className={`text-base font-bold mb-4 px-4 py-2 rounded-lg inline-block ${GP_COLORS[gpNum]}`}>
                  {GP_TITLES[gpNum]}
                </h4>
                
                {gpSection.summary && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 italic">{gpSection.summary}</p>
                  </div>
                )}

                {gpSection.evidence && gpSection.evidence.length > 0 && (
                  <ul className="space-y-3">
                    {gpSection.evidence.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}

          {!portfolio.overall_summary && 
           [1, 2, 3, 4, 5, 6].every(gp => {
             const section = portfolio[`gp${gp}`]
             return !section || (!section.evidence?.length && !section.summary)
           }) && (
            <div className="text-center py-8 text-gray-500">
              <p>Portfolio is empty. Click "Build Portfolio" to generate your portfolio.</p>
            </div>
          )}
        </div>
      )}

      {!portfolio && !error && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No portfolio built yet</p>
          <p className="text-sm mb-4">Click "Build Portfolio" to automatically organize all your evidence into a professional portfolio.</p>
          <div className="text-xs text-gray-400 mt-4">
            <p>This will analyze evidence from:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Lesson Plans</li>
              <li>Log Book Entries</li>
              <li>Assessments</li>
              <li>Attendance/Register</li>
              <li>External Uploads</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfolioBuilder

