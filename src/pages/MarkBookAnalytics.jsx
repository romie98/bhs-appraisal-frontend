import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  TrendingUp, 
  BarChart3, 
  AlertTriangle, 
  Users,
  Download
} from 'lucide-react'
import { classesApi, assessmentsApi, scoresApi, exportApi, markbookApi } from '../services/markbookApi'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function MarkBookAnalytics() {
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [threshold, setThreshold] = useState(50)

  // Fetch all classes
  const { data: classes = [] } = useQuery({
    queryKey: ['markbook-classes'],
    queryFn: () => markbookApi.getClasses(),
  })

  // Fetch students for selected class
  const { data: students = [] } = useQuery({
    queryKey: ['class-students', selectedClassId],
    queryFn: () => classesApi.getStudents(selectedClassId),
    enabled: !!selectedClassId,
  })

  // Fetch assessments for selected class
  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments', selectedClassId],
    queryFn: () => assessmentsApi.getAll(null, selectedClassId),
    enabled: !!selectedClassId,
  })

  // Fetch all scores
  const { data: allScores = [] } = useQuery({
    queryKey: ['scores', selectedClassId],
    queryFn: async () => {
      const scoresPromises = assessments.map(assessment => 
        scoresApi.getByAssessment(assessment.id, selectedClassId)
      )
      const scoresArrays = await Promise.all(scoresPromises)
      return scoresArrays.flat()
    },
    enabled: assessments.length > 0 && !!selectedClassId,
  })

  // Calculate average score by assessment
  const averageByAssessment = useMemo(() => {
    return assessments.map(assessment => {
      const assessmentScores = allScores.filter(s => s.assessment_id === assessment.id)
      if (assessmentScores.length === 0) return null

      const totalScore = assessmentScores.reduce((sum, s) => sum + s.score, 0)
      const average = (totalScore / assessmentScores.length / assessment.total_marks) * 100

      return {
        name: assessment.title,
        average: average.toFixed(1),
        type: assessment.type,
      }
    }).filter(Boolean)
  }, [assessments, allScores])

  // Calculate student progress
  const studentProgress = useMemo(() => {
    return students.map(student => {
      const studentScores = allScores.filter(s => s.student_id === student.id)
      const progressData = assessments
        .map(assessment => {
          const score = studentScores.find(s => s.assessment_id === assessment.id)
          if (!score) return null
          return {
            date: assessment.date_assigned,
            score: (score.score / assessment.total_marks) * 100,
            assessment: assessment.title,
          }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.date) - new Date(b.date))

      const overallAverage = progressData.length > 0
        ? progressData.reduce((sum, p) => sum + p.score, 0) / progressData.length
        : 0

      return {
        studentId: student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        progress: progressData,
        average: overallAverage,
        belowThreshold: overallAverage < threshold,
      }
    })
  }, [students, assessments, allScores, threshold])

  // Students below threshold
  const studentsBelowThreshold = useMemo(() => {
    return studentProgress.filter(s => s.belowThreshold)
  }, [studentProgress])

  // Grade-wide performance comparison
  const gradePerformance = useMemo(() => {
    const typeGroups = {}
    assessments.forEach(assessment => {
      if (!typeGroups[assessment.type]) {
        typeGroups[assessment.type] = []
      }
      const scores = allScores.filter(s => s.assessment_id === assessment.id)
      if (scores.length > 0) {
        const avg = scores.reduce((sum, s) => sum + (s.score / assessment.total_marks) * 100, 0) / scores.length
        typeGroups[assessment.type].push(avg)
      }
    })

    return Object.entries(typeGroups).map(([type, averages]) => ({
      type,
      average: averages.length > 0 ? averages.reduce((a, b) => a + b, 0) / averages.length : 0,
    }))
  }, [assessments, allScores])

  // Sample student progress data for chart (first student)
  const sampleProgressData = studentProgress[0]?.progress || []

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-sky-600" />
              Mark Book Analytics
            </h1>
            <p className="text-gray-600">
              Performance insights and student progress tracking
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedClassId || ''}
              onChange={(e) => setSelectedClassId(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Select a class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.academic_year})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const selectedClass = classes.find(c => c.id === selectedClassId)
                const gradeName = selectedClass?.name || 'unknown'
                exportApi.exportMarkBookPDF(gradeName, {})
              }}
              disabled={!selectedClassId}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-800">{students.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-800">{assessments.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-gray-800">
                {studentProgress.length > 0
                  ? (studentProgress.reduce((sum, s) => sum + s.average, 0) / studentProgress.length).toFixed(1)
                  : '0'}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Below Threshold</p>
              <p className="text-2xl font-bold text-red-600">{studentsBelowThreshold.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Average Score by Assessment */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Score by Assessment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={averageByAssessment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grade-wide Performance Comparison */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance by Assessment Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradePerformance}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, average }) => `${type}: ${average.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="average"
              >
                {gradePerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Progress Chart */}
      {sampleProgressData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Student Progress Trend</h3>
            <select
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="40">Threshold: 40%</option>
              <option value="50">Threshold: 50%</option>
              <option value="60">Threshold: 60%</option>
              <option value="70">Threshold: 70%</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sampleProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="assessment" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Score %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Students Below Threshold */}
      {studentsBelowThreshold.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Students Below {threshold}% Threshold
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Average Score</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {studentsBelowThreshold.map(student => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{student.studentName}</td>
                    <td className="px-4 py-3 text-center font-semibold text-red-600">
                      {student.average.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Needs Attention
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarkBookAnalytics

