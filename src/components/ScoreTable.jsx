import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scoresApi } from '../services/markbookApi'

export default function ScoreTable({ students, assessmentId, totalMarks, classId }) {
  const [localScores, setLocalScores] = useState({})
  const queryClient = useQueryClient()

  // Initialize local scores from students data
  // Only update if students actually changed (prevent infinite loops)
  useEffect(() => {
    if (!students || students.length === 0) {
      setLocalScores({})
      return
    }
    
    const scores = {}
    students.forEach(student => {
      if (student && student.student_id) {
        scores[student.student_id] = {
          score: student.score || '',
          comment: student.comment || '',
          scoreId: student.score_id
        }
      }
    })
    
    // Only update if scores actually changed
    setLocalScores(prev => {
      const prevKeys = Object.keys(prev).sort().join(',')
      const newKeys = Object.keys(scores).sort().join(',')
      if (prevKeys === newKeys) {
        // Check if values changed
        let valuesChanged = false
        for (const key in scores) {
          if (prev[key]?.score !== scores[key]?.score || prev[key]?.comment !== scores[key]?.comment) {
            valuesChanged = true
            break
          }
        }
        if (!valuesChanged) return prev
      }
      return scores
    })
  }, [students])

  const updateScoreMutation = useMutation({
    mutationFn: ({ scoreId, data }) => scoresApi.update(scoreId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', classId] })
      queryClient.invalidateQueries({ queryKey: ['assessments', classId] })
      queryClient.invalidateQueries({ queryKey: ['students-with-scores', assessmentId] })
    },
  })

  const createScoreMutation = useMutation({
    mutationFn: (data) => scoresApi.createBulk({
      assessment_id: assessmentId,
      scores: [data]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', classId] })
      queryClient.invalidateQueries({ queryKey: ['assessments', classId] })
      queryClient.invalidateQueries({ queryKey: ['students-with-scores', assessmentId] })
    },
  })

  const handleScoreChange = (studentId, value) => {
    const numValue = value === '' ? '' : parseFloat(value)
    if (value !== '' && (isNaN(numValue) || numValue < 0 || (totalMarks && numValue > totalMarks))) {
      return // Invalid input
    }

    setLocalScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: value
      }
    }))
  }

  const handleScoreBlur = (studentId) => {
    const scoreData = localScores[studentId]
    if (!scoreData) return

    const scoreValue = scoreData.score === '' ? null : parseFloat(scoreData.score)
    
    if (scoreValue === null || isNaN(scoreValue)) {
      return // Don't save empty or invalid scores
    }

    if (totalMarks && scoreValue > totalMarks) {
      alert(`Score cannot exceed ${totalMarks}`)
      return
    }

    const scoreId = scoreData.scoreId
    const data = {
      score: scoreValue,
      comment: scoreData.comment || null
    }

    if (scoreId) {
      // Update existing
      updateScoreMutation.mutate({ scoreId, data })
    } else {
      // Create new
      const student = students.find(s => s.student_id === studentId)
      if (student) {
        createScoreMutation.mutate({
          assessment_id: assessmentId,
          student_id: studentId,
          ...data
        })
      }
    }
  }

  const handleCommentChange = (studentId, value) => {
    setLocalScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment: value
      }
    }))
  }

  const handleCommentBlur = (studentId) => {
    const scoreData = localScores[studentId]
    if (!scoreData) return

    const scoreId = scoreData.scoreId
    if (!scoreId) return // Can't save comment without a score

    const scoreValue = scoreData.score === '' ? null : parseFloat(scoreData.score)
    if (scoreValue === null || isNaN(scoreValue)) {
      return
    }

    updateScoreMutation.mutate({
      scoreId,
      data: {
        score: scoreValue,
        comment: scoreData.comment || null
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Score</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => {
              const scoreData = localScores[student.student_id] || { score: '', comment: '' }
              const scoreValue = scoreData.score
              const percentage = totalMarks && scoreValue ? ((scoreValue / totalMarks) * 100).toFixed(1) : null
              
              return (
                <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {student.student_name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-center">
                      <input
                        type="number"
                        value={scoreValue}
                        onChange={(e) => handleScoreChange(student.student_id, e.target.value)}
                        onBlur={() => handleScoreBlur(student.student_id)}
                        className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-center"
                        min="0"
                        max={totalMarks || undefined}
                        placeholder="0"
                      />
                      {totalMarks && (
                        <span className="text-xs text-gray-500">
                          / {totalMarks}
                        </span>
                      )}
                      {percentage && (
                        <span className="text-xs text-gray-500">
                          ({percentage}%)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={scoreData.comment || ''}
                      onChange={(e) => handleCommentChange(student.student_id, e.target.value)}
                      onBlur={() => handleCommentBlur(student.student_id)}
                      placeholder="Add comment..."
                      className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No students found
        </div>
      )}
    </div>
  )
}







