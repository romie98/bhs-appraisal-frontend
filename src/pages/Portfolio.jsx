import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  BookOpen, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Download,
  RefreshCw,
  FileText
} from 'lucide-react'
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

function Portfolio() {
  const queryClient = useQueryClient()
  const [building, setBuilding] = useState(false)
  const [error, setError] = useState(null)
  const [portfolioId, setPortfolioId] = useState(null)

  // Fetch latest portfolio
  const { data: portfolio, isLoading, refetch } = useQuery({
    queryKey: ['portfolio', portfolioId],
    queryFn: () => portfolioId 
      ? aiApi.getPortfolio(portfolioId)
      : aiApi.getLatestPortfolio(),
    enabled: false, // Don't auto-fetch, wait for build
  })

  // Build portfolio mutation
  const buildMutation = useMutation({
    mutationFn: (options) => aiApi.buildPortfolio(options),
    onSuccess: (data) => {
      setPortfolioId(data.portfolio_id)
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      refetch()
      setBuilding(false)
    },
    onError: (err) => {
      setError(err.message)
      setBuilding(false)
    },
  })

  const handleBuildPortfolio = async () => {
    setBuilding(true)
    setError(null)
    // Send empty arrays - backend will auto-fetch all evidence from database
    // Backend determines user from JWT token
    buildMutation.mutate({
      lesson_evidence: [],
      log_evidence: [],
      assessment_evidence: [],
      register_evidence: [],
      external_uploads: [],
      auto_fetch_all: true,
    })
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export feature coming soon!')
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-sky-600" />
              Teacher Portfolio
            </h1>
            <p className="text-gray-600">
              AI-generated comprehensive portfolio from all your evidence
            </p>
          </div>
          <div className="flex gap-3">
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
              disabled={building}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {building ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {portfolio ? 'Rebuild Portfolio' : 'Build Portfolio'}
                </>
              )}
            </button>
          </div>
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

      {isLoading || building ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-sky-600 animate-spin" />
            <p className="text-gray-600">
              {building ? 'Building your portfolio...' : 'Loading portfolio...'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a minute while AI analyzes all your evidence
            </p>
          </div>
        </div>
      ) : portfolio ? (
        <div className="space-y-6">
          {/* Overall Summary */}
          {portfolio.overall_summary && (
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-sky-600" />
                Overall Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{portfolio.overall_summary}</p>
            </div>
          )}

          {/* GP Sections */}
          {[1, 2, 3, 4, 5, 6].map((gpNum) => {
            const gpKey = `gp${gpNum}`
            const gpSection = portfolio[gpKey]
            
            if (!gpSection || (!gpSection.evidence?.length && !gpSection.summary)) {
              return null
            }

            return (
              <div key={gpKey} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className={`text-xl font-bold mb-4 px-4 py-2 rounded-lg inline-block ${GP_COLORS[gpKey]}`}>
                  {GP_TITLES[gpKey]}
                </h3>

                {/* Summary */}
                {gpSection.summary && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Summary:</p>
                    <p className="text-gray-600 leading-relaxed">{gpSection.summary}</p>
                  </div>
                )}

                {/* Evidence Items */}
                {gpSection.evidence && gpSection.evidence.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Evidence Items ({gpSection.evidence.length}):
                    </p>
                    <ul className="space-y-3">
                      {gpSection.evidence.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="flex-shrink-0 w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 leading-relaxed flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}

          {!portfolio.overall_summary && 
           [1, 2, 3, 4, 5, 6].every(gpNum => {
             const gpKey = `gp${gpNum}`
             const gpSection = portfolio[gpKey]
             return !gpSection || (!gpSection.evidence?.length && !gpSection.summary)
           }) && (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
              <p className="text-gray-500">No portfolio content available. Click "Build Portfolio" to generate.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg mb-4">No portfolio built yet</p>
            <p className="text-sm text-gray-400 mb-6">
              Build your comprehensive portfolio from all your evidence sources
            </p>
            <button
              onClick={handleBuildPortfolio}
              disabled={building}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              Build Portfolio
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio

