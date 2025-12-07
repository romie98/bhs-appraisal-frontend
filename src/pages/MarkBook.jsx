import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  BookOpen, 
  Filter, 
  Download, 
  Edit, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Search,
  Plus,
  FileSpreadsheet
} from 'lucide-react'
import { classesApi, assessmentsApi, scoresApi, exportApi, markbookApi } from '../services/markbookApi'
import AssessmentCreateModal from '../components/AssessmentCreateModal'
import BulkScoreImportModal from '../components/BulkScoreImportModal'
import ScoreTable from '../components/ScoreTable'

function MarkBook() {
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null)
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' })
  const [editingCell, setEditingCell] = useState(null) // Keep for backward compatibility but won't use modal
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)
  const [localScores, setLocalScores] = useState({}) // Local state for immediate UI updates

  const queryClient = useQueryClient()

  // Fetch all classes
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['markbook-classes'],
    queryFn: () => markbookApi.getClasses(),
  })

  // Fetch students for selected class
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: ['class-students', selectedClassId],
    queryFn: async () => {
      console.log('Fetching students for class:', selectedClassId)
      const result = await classesApi.getStudents(selectedClassId)
      console.log('Students fetched:', result)
      return result
    },
    enabled: !!selectedClassId,
  })

  // Log errors for debugging
  if (studentsError) {
    console.error('Error fetching students:', studentsError)
  }
  
  // Debug log
  console.log('Current state:', { selectedClassId, studentsCount: students.length, students })

  // Fetch assessments for selected class
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ['assessments', selectedClassId],
    queryFn: () => assessmentsApi.getAll(null, selectedClassId),
    enabled: !!selectedClassId,
  })

  // Fetch students with scores for selected assessment
  const { data: studentsWithScores = [] } = useQuery({
    queryKey: ['students-with-scores', selectedAssessmentId, selectedClassId],
    queryFn: () => assessmentsApi.getStudentsWithScores(selectedAssessmentId, selectedClassId),
    enabled: !!selectedAssessmentId && !!selectedClassId,
  })

  const selectedAssessment = assessments.find(a => a.id === selectedAssessmentId)

  // Fetch all scores for the selected class
  const { data: allScores = [] } = useQuery({
    queryKey: ['scores', selectedClassId],
    queryFn: async () => {
      const scoresPromises = (assessments || []).map(assessment => 
        scoresApi.getByAssessment(assessment.id, selectedClassId)
      )
      const scoresArrays = await Promise.all(scoresPromises)
      return scoresArrays.flat()
    },
    enabled: assessments.length > 0 && !!selectedClassId,
  })

  // Filter assessments by type and date
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      if (assessmentTypeFilter !== 'all' && assessment.type !== assessmentTypeFilter) {
        return false
      }
      if (dateRangeFilter.start && assessment.date_assigned < dateRangeFilter.start) {
        return false
      }
      if (dateRangeFilter.end && assessment.date_assigned > dateRangeFilter.end) {
        return false
      }
      return true
    })
  }, [assessments, assessmentTypeFilter, dateRangeFilter])

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students
    const term = searchTerm.toLowerCase()
    return students.filter(student => 
      student.first_name.toLowerCase().includes(term) ||
      student.last_name.toLowerCase().includes(term)
    )
  }, [students, searchTerm])

  // Calculate averages and status for each student
  const studentData = useMemo(() => {
    return (filteredStudents || []).map(student => {
      const studentScores = allScores.filter(score => score.student_id === student.id)
      const assessmentScores = (filteredAssessments || []).map(assessment => {
        const score = studentScores.find(s => s.assessment_id === assessment.id)
        return score ? {
          score: score.score,
          total: assessment.total_marks,
          percentage: (score.score / assessment.total_marks) * 100,
          assessmentId: assessment.id
        } : null
      })

      const validScores = assessmentScores.filter(s => s !== null)
      const average = validScores.length > 0
        ? validScores.reduce((sum, s) => sum + s.percentage, 0) / validScores.length
        : 0

      let status = 'good'
      if (average < 50) status = 'poor'
      else if (average < 70) status = 'warning'

      return {
        ...student,
        assessmentScores,
        average: average.toFixed(1),
        status,
      }
    })
  }, [filteredStudents, filteredAssessments, allScores])

  // Update score mutation
  const updateScoreMutation = useMutation({
    mutationFn: ({ scoreId, score, comment }) => 
      scoresApi.update(scoreId, { score, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', selectedClassId] })
      queryClient.invalidateQueries({ queryKey: ['assessments', selectedClassId] })
    },
  })

  // Create score mutation
  const createScoreMutation = useMutation({
    mutationFn: ({ assessmentId, studentId, score, comment }) =>
      scoresApi.createBulk({
        assessment_id: assessmentId,
        scores: [{ 
          assessment_id: assessmentId,
          student_id: studentId, 
          score: parseFloat(score), 
          comment: comment || null 
        }]
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', selectedClassId] })
      queryClient.invalidateQueries({ queryKey: ['assessments', selectedClassId] })
    },
  })

  // Initialize local scores from allScores
  useEffect(() => {
    const scores = {}
    allScores.forEach(score => {
      const key = `${score.student_id}_${score.assessment_id}`
      scores[key] = score.score
    })
    setLocalScores(scores)
  }, [allScores])

  const handleScoreChange = (studentId, assessmentId, value, saveImmediately = false) => {
    const assessment = filteredAssessments.find(a => a.id === assessmentId)
    const existingScore = allScores.find(
      s => s.student_id === studentId && s.assessment_id === assessmentId
    )

    const key = `${studentId}_${assessmentId}`
    
    // Update local state immediately for UI responsiveness
    if (value === '') {
      setLocalScores(prev => {
        const newScores = { ...prev }
        delete newScores[key]
        return newScores
      })
      return
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0 || (assessment && numValue > assessment.total_marks)) {
      return // Invalid input
    }

    // Update local state
    setLocalScores(prev => ({
      ...prev,
      [key]: numValue
    }))

    // Save to backend only on blur or if saveImmediately is true
    if (saveImmediately) {
      if (existingScore) {
        // Update existing
        updateScoreMutation.mutate({
          scoreId: existingScore.id,
          score: numValue,
          comment: existingScore.comment || null
        })
      } else {
        // Create new
        createScoreMutation.mutate({
          assessmentId,
          studentId,
          score: numValue,
          comment: null
        })
      }
    }
  }

  const handlePaste = (e, startStudentId, assessmentId) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    // Don't filter out empty lines - preserve them to handle empty cells
    const lines = pastedData.split('\n')
    
    if (lines.length === 0) return

    // Find the starting student index
    const startIndex = studentData.findIndex(s => s.id === startStudentId)
    if (startIndex === -1) return

    const assessment = filteredAssessments.find(a => a.id === assessmentId)
    if (!assessment) return

    // Parse and apply scores
    const scoresToSave = []
    const scoresToDelete = []
    lines.forEach((line, lineIndex) => {
      const studentIndex = startIndex + lineIndex
      if (studentIndex >= studentData.length) return

      const student = studentData[studentIndex]
      const value = line.trim().split('\t')[0].trim() // Handle tab-separated values
      
      // Handle empty cells - clear the score
      if (value === '' || value === '-') {
        const key = `${student.id}_${assessmentId}`
        // Clear from local state
        setLocalScores(prev => {
          const newScores = { ...prev }
          delete newScores[key]
          return newScores
        })
        
        // Check if score exists to delete
        const existingScore = allScores.find(
          s => s.student_id === student.id && s.assessment_id === assessmentId
        )
        if (existingScore) {
          scoresToDelete.push(existingScore.id)
        }
        return // Continue to next line
      }

      const numValue = parseFloat(value)
      if (isNaN(numValue) || numValue < 0 || numValue > assessment.total_marks) return

      // Update local state
      const key = `${student.id}_${assessmentId}`
      setLocalScores(prev => ({
        ...prev,
        [key]: numValue
      }))

      // Prepare for bulk save
      scoresToSave.push({
        studentId: student.id,
        score: numValue
      })
    })

    // Bulk save all scores
    if (scoresToSave.length > 0) {
      const existingScores = allScores.filter(
        s => s.assessment_id === assessmentId && 
        scoresToSave.some(ss => ss.studentId === s.student_id)
      )
      
      const toUpdate = []
      const toCreate = []

      scoresToSave.forEach(({ studentId, score }) => {
        const existing = existingScores.find(s => s.student_id === studentId)
        if (existing) {
          toUpdate.push({ scoreId: existing.id, studentId, score })
        } else {
          toCreate.push({ studentId, score })
        }
      })

      // Update existing scores
      toUpdate.forEach(({ scoreId, score }) => {
        updateScoreMutation.mutate({
          scoreId,
          score,
          comment: null
        })
      })

      // Create new scores in bulk
      if (toCreate.length > 0) {
        scoresApi.createBulk({
          assessment_id: assessmentId,
          scores: (toCreate || []).map(({ studentId, score }) => ({
            assessment_id: assessmentId,
            student_id: studentId,
            score,
            comment: null
          }))
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ['scores', selectedClassId] })
          queryClient.invalidateQueries({ queryKey: ['assessments', selectedClassId] })
        }).catch(err => {
          console.error('Error bulk creating scores:', err)
        })
      }

      // Delete scores for empty cells
      if (scoresToDelete.length > 0) {
        Promise.all(
          (scoresToDelete || []).map(scoreId => scoresApi.delete(scoreId))
        ).then(() => {
          queryClient.invalidateQueries({ queryKey: ['scores', selectedClassId] })
          queryClient.invalidateQueries({ queryKey: ['assessments', selectedClassId] })
        }).catch(err => {
          console.error('Error deleting scores:', err)
        })
      }
    }
  }

  const handleCommentChange = (studentId, assessmentId, value) => {
    const existingScore = allScores.find(
      s => s.student_id === studentId && s.assessment_id === assessmentId
    )

    if (!existingScore) {
      return // Can't add comment without a score
    }

    updateScoreMutation.mutate({
      scoreId: existingScore.id,
      score: existingScore.score,
      comment: value || null
    })
  }

  const handleExportPDF = () => {
    const selectedClass = classes.find(c => c.id === selectedClassId)
    const gradeName = selectedClass?.name || 'unknown'
    exportApi.exportMarkBookPDF(gradeName, {
      assessmentType: assessmentTypeFilter,
      dateRange: dateRangeFilter,
    })
  }

  const handleAssessmentCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['assessments', selectedClassId] })
  }

  const handleBulkImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['students-with-scores', selectedAssessmentId] })
    queryClient.invalidateQueries({ queryKey: ['scores', selectedClassId] })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'poor':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  if (classesLoading || studentsLoading || assessmentsLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  if (!selectedClassId) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-sky-600" />
                Mark Book
              </h1>
              <p className="text-gray-600">
                Manage and track student assessment scores
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClassId || ''}
              onChange={(e) => {
                const classId = e.target.value || null
                setSelectedClassId(classId)
                if (classId) {
                  queryClient.invalidateQueries({ queryKey: ['class-students', classId] })
                  queryClient.invalidateQueries({ queryKey: ['assessments', classId] })
                  queryClient.invalidateQueries({ queryKey: ['scores', classId] })
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Select a class --</option>
              {(classes || []).map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.academic_year})
                </option>
              ))}
            </select>
          </div>
          {classes.length === 0 && (
            <p className="mt-4 text-gray-500 text-center">
              No classes available. Please create a class first.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-sky-600" />
              Mark Book
            </h1>
            <p className="text-gray-600">
              Manage and track student assessment scores
            </p>
          </div>
          <div className="flex gap-3">
            {selectedClassId && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Assessment
              </button>
            )}
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Class Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class
            </label>
            <select
              value={selectedClassId || ''}
              onChange={(e) => {
                const classId = e.target.value || null
                setSelectedClassId(classId)
                // Invalidate queries when class changes
                if (classId) {
                  queryClient.invalidateQueries({ queryKey: ['class-students', classId] })
                  queryClient.invalidateQueries({ queryKey: ['assessments', classId] })
                  queryClient.invalidateQueries({ queryKey: ['scores', classId] })
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Select a class --</option>
              {(classes || []).map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.academic_year})
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assessment Type
            </label>
            <select
              value={assessmentTypeFilter}
              onChange={(e) => setAssessmentTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Types</option>
              <option value="Quiz">Quiz</option>
              <option value="Homework">Homework</option>
              <option value="Project">Project</option>
              <option value="Test">Test</option>
              <option value="Exam">Exam</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRangeFilter.start}
              onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, start: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Date Range End */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRangeFilter.end}
              onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, end: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Assessment Selector and Grade Entry */}
      {selectedClassId && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Assessments
            </label>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Assessment
            </button>
          </div>
          {assessments.length > 0 ? (
            <select
              value={selectedAssessmentId || ''}
              onChange={(e) => setSelectedAssessmentId(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Select an assessment --</option>
              {(filteredAssessments || []).map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.title} ({assessment.type}) - {new Date(assessment.date_assigned).toLocaleDateString()}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No assessments yet. Create your first assessment to start entering grades.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Create First Assessment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grade Entry Table */}
      {selectedAssessmentId && selectedClassId && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {selectedAssessment?.title} - Grade Entry
            </h2>
            <button
              onClick={() => setShowBulkImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Bulk Paste Grades from Excel
            </button>
          </div>
          <ScoreTable
            students={studentsWithScores}
            assessmentId={selectedAssessmentId}
            totalMarks={selectedAssessment?.total_marks}
            classId={selectedClassId}
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                  Student
                </th>
                {filteredAssessments.map(assessment => (
                  <th
                    key={assessment.id}
                    className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[120px]"
                  >
                    <div className="flex flex-col">
                      <span>{assessment.title}</span>
                      <span className="text-xs text-gray-500 font-normal">
                        {assessment.type} • {assessment.total_marks} marks
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Average
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(studentData || []).map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 sticky left-0 bg-white z-10 font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </td>
                  {(filteredAssessments || []).map(assessment => {
                    const scoreData = student.assessmentScores.find(
                      s => s && s.assessmentId === assessment.id
                    )
                    const score = scoreData ? scoreData.score : null
                    const percentage = scoreData ? scoreData.percentage.toFixed(1) : '-'
                    const existingScore = allScores.find(
                      s => s.student_id === student.id && s.assessment_id === assessment.id
                    )
                    
                    return (
                      <td
                        key={assessment.id}
                        className="px-4 py-3 text-center"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={localScores[`${student.id}_${assessment.id}`] !== undefined 
                              ? localScores[`${student.id}_${assessment.id}`] 
                              : (score !== null ? score : '')}
                            onChange={(e) => {
                              const newValue = e.target.value
                              handleScoreChange(student.id, assessment.id, newValue, false)
                            }}
                            onBlur={(e) => {
                              const value = e.target.value
                              if (value === '') {
                                // Clear score if empty
                                const key = `${student.id}_${assessment.id}`
                                setLocalScores(prev => {
                                  const newScores = { ...prev }
                                  delete newScores[key]
                                  return newScores
                                })
                                return
                              }
                              handleScoreChange(student.id, assessment.id, value, true)
                            }}
                            onPaste={(e) => handlePaste(e, student.id, assessment.id)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                            min="0"
                            max={assessment.total_marks}
                            step="0.1"
                            placeholder="-"
                          />
                          <span className="text-xs text-gray-500">/{assessment.total_marks}</span>
                        </div>
                        {score !== null && (
                          <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-center font-semibold">
                    {student.average}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusIcon(student.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {studentData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {studentsLoading ? 'Loading students...' : students.length === 0 ? 'No students in this class. Please add students to the class first.' : 'No students match your search'}
          </div>
        )}
      </div>

      {/* Modals */}
      <AssessmentCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        classId={selectedClassId}
        onSuccess={handleAssessmentCreated}
      />

      <BulkScoreImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        assessmentId={selectedAssessmentId}
        totalMarks={selectedAssessment?.total_marks}
        onSuccess={handleBulkImportSuccess}
      />

    </div>
  )
}

export default MarkBook

