import { useState, useEffect } from 'react'
import { FileText, Loader2, AlertCircle, Download, ExternalLink, TrendingUp, Award, AlertTriangle, Target } from 'lucide-react'
import { aiApi } from '../services/aiService'

const GP_TITLES = {
  gp1: 'GP1 — Subject Content Knowledge',
  gp2: 'GP2 — Pedagogy & Teaching Strategies',
  gp3: 'GP3 — Student Assessment & Feedback',
  gp4: 'GP4 — Professional Development',
  gp5: 'GP5 — Community Engagement',
  gp6: 'GP6 — Technology Integration',
}

const CATEGORY_COLORS = {
  'Exemplary': 'bg-green-100 text-green-800 border-green-300',
  'Area of Strength': 'bg-blue-100 text-blue-800 border-blue-300',
  'Area for Improvement': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Unsatisfactory': 'bg-red-100 text-red-800 border-red-300',
}

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
}

function AppraisalReportDisplay({ appraisalData, reportId, onReportGenerated }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)

  // Load existing report if reportId is provided
  useEffect(() => {
    if (reportId && !report && !loading) {
      loadExistingReport()
    }
  }, [reportId])

  const loadExistingReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await aiApi.getAppraisalReport(reportId)
      setReport(data)
      if (onReportGenerated) {
        onReportGenerated(data)
      }
    } catch (err) {
      console.error('Error loading report:', err)
      if (err.message.includes('404')) {
        setReport(null)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!appraisalData) {
      setError('Please provide appraisal data to generate the report.')
      return
    }

    try {
      setGenerating(true)
      setError(null)
      const data = await aiApi.generateAppraisalReport(appraisalData)
      setReport(data)
      if (onReportGenerated) {
        onReportGenerated(data)
      }
    } catch (err) {
      console.error('Error generating report:', err)
      setError(err.message || 'Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleExportPDF = () => {
    if (report?.report_id) {
      window.open(aiApi.getAppraisalReportPdfUrl(report.report_id), '_blank')
    }
  }

  const handleViewHTML = () => {
    if (report?.report_id) {
      window.open(aiApi.getAppraisalReportHtmlUrl(report.report_id), '_blank')
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const calculateAverage = () => {
    if (!report?.scores) return 0
    const scores = Object.values(report.scores)
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading report...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-sky-600" />
          <h3 className="text-xl font-bold text-gray-800">Final Appraisal Report</h3>
        </div>
        <div className="flex gap-2">
          {report && (
            <>
              <button
                onClick={handleViewHTML}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                View HTML
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </>
          )}
          {!report && (
            <button
              onClick={handleGenerateReport}
              disabled={generating || !appraisalData}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          )}
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

      {report && (
        <div className="space-y-6">
          {/* Category Badge and Average Score */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 rounded-xl p-6 text-center">
            <div className={`inline-block px-6 py-3 rounded-full text-lg font-bold mb-4 ${CATEGORY_COLORS[report.category] || CATEGORY_COLORS['Area for Improvement']}`}>
              {report.category}
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-4">
              Overall Average Score: <span className="text-sky-600">{calculateAverage().toFixed(1)}/100</span>
            </div>
          </div>

          {/* GP Scores Grid */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              GP Scores
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(report.scores || {}).map(([gpKey, score]) => (
                <div key={gpKey} className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-xl p-4 text-center">
                  <div className="text-sm opacity-90 mb-2">{GP_TITLES[gpKey] || gpKey.toUpperCase()}</div>
                  <div className={`text-4xl font-bold ${getScoreColor(score)}`} style={{ color: 'white' }}>
                    {score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {report.strengths && report.strengths.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Strengths
              </h4>
              <div className="space-y-2">
                {report.strengths.map((strength, index) => (
                  <div key={index} className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                    <p className="text-gray-700">{strength}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {report.weaknesses && report.weaknesses.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Areas for Improvement
              </h4>
              <div className="space-y-2">
                {report.weaknesses.map((weakness, index) => (
                  <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                    <p className="text-gray-700">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-4">Recommendations</h4>
              <div className="space-y-2">
                {report.recommendations.map((rec, index) => (
                  <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          {report.actionPlan && report.actionPlan.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Future Action Plan
              </h4>
              <div className="space-y-3">
                {report.actionPlan.map((action, index) => (
                  <div key={index} className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.medium}`}>
                        {action.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                    </div>
                    <p className="font-medium text-gray-800 mb-1">{action.action}</p>
                    <p className="text-sm text-gray-600">Timeline: {action.timeline || 'Not specified'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!report && !error && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No appraisal report generated yet</p>
          <p className="text-sm mb-6">Click "Generate Report" to create a comprehensive appraisal report with AI-powered scoring and analysis.</p>
          <div className="text-xs text-gray-400">
            <p>The report will include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>GP scores (0-100 scale)</li>
              <li>Overall category assessment</li>
              <li>Strengths and areas for improvement</li>
              <li>Actionable recommendations</li>
              <li>Future action plan</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppraisalReportDisplay







