import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Calendar,
  FileText,
  Sparkles,
  Loader2,
  Trash2
} from 'lucide-react'
import { lessonPlansApi } from '../services/markbookApi'
import LessonEvidenceDisplay from '../components/LessonEvidenceDisplay'
import { format } from 'date-fns'

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

function LessonPlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [extracting, setExtracting] = useState(false)

  // Fetch lesson plan
  const { data: lessonPlan, isLoading, error, refetch } = useQuery({
    queryKey: ['lesson-plan', id],
    queryFn: () => lessonPlansApi.getById(id),
  })

  // Extract evidence mutation
  const extractEvidenceMutation = useMutation({
    mutationFn: (id) => lessonPlansApi.extractEvidence(id),
    onSuccess: () => {
      refetch()
      queryClient.invalidateQueries({ queryKey: ['lesson-plan', id] })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => lessonPlansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] })
      navigate('/lesson-plans')
    },
  })

  const handleExtractEvidence = async () => {
    try {
      setExtracting(true)
      await extractEvidenceMutation.mutateAsync(id)
    } catch (error) {
      alert('Failed to extract evidence. Please try again.')
    } finally {
      setExtracting(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lesson plan? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error) {
        alert('Failed to delete lesson plan. Please try again.')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading lesson plan...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !lessonPlan) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center text-red-500">
            <p className="text-lg font-medium">Lesson plan not found</p>
            <button
              onClick={() => navigate('/lesson-plans')}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              Back to Lesson Plans
            </button>
          </div>
        </div>
      </div>
    )
  }

  const evidence = lessonPlan.evidence || {}

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/lesson-plans')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-3xl font-bold text-gray-800">{lessonPlan.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 ml-12">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(lessonPlan.created_at), 'MMMM dd, yyyy')}
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {lessonPlan.file_path ? 'File Upload' : 'Text Entry'}
              </div>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lesson Plan Content */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Lesson Plan Content</h2>
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm">
            {lessonPlan.content_text}
          </div>
        </div>
      </div>

      {/* Extract Evidence Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-sky-600" />
            <h2 className="text-xl font-bold text-gray-800">AI Evidence Extraction</h2>
          </div>
          {(!evidence || Object.keys(evidence).length === 0 || 
            (!evidence.gp1?.length && !evidence.gp2?.length && !evidence.gp3?.length && 
             !evidence.gp4?.length && !evidence.gp5?.length && !evidence.gp6?.length)) && (
            <button
              onClick={handleExtractEvidence}
              disabled={extracting || extractEvidenceMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {extracting || extractEvidenceMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Extract Evidence with AI
                </>
              )}
            </button>
          )}
        </div>

        {/* Display Evidence */}
        {evidence && Object.keys(evidence).length > 0 && (
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
                        <span className="text-sky-600 font-semibold mt-0.5">•</span>
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
                <h4 className="text-sm font-semibold text-green-800 mb-3">Strengths</h4>
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

            {/* Weaknesses */}
            {evidence.weaknesses && evidence.weaknesses.length > 0 && (
              <div className="border border-orange-200 rounded-xl p-4 bg-orange-50">
                <h4 className="text-sm font-semibold text-orange-800 mb-3">Areas for Improvement</h4>
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

            {/* Re-extract button if evidence exists */}
            {(evidence.gp1?.length || evidence.gp2?.length || evidence.gp3?.length || 
              evidence.gp4?.length || evidence.gp5?.length || evidence.gp6?.length) && (
              <div className="pt-4 border-t">
                <button
                  onClick={handleExtractEvidence}
                  disabled={extracting || extractEvidenceMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {extracting || extractEvidenceMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Re-extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Re-extract Evidence
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* No evidence message */}
        {(!evidence || Object.keys(evidence).length === 0 || 
          (!evidence.gp1?.length && !evidence.gp2?.length && !evidence.gp3?.length && 
           !evidence.gp4?.length && !evidence.gp5?.length && !evidence.gp6?.length)) && (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No evidence extracted yet</p>
            <p className="text-sm">Click "Extract Evidence with AI" to analyze your lesson plan.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonPlanDetail






