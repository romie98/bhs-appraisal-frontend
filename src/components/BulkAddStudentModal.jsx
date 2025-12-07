import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { classesApi } from '../services/markbookApi'

function BulkAddStudentModal({ classId, defaultGrade, onClose, onSuccess }) {
  const [studentText, setStudentText] = useState('')
  const [defaultGradeValue, setDefaultGradeValue] = useState(defaultGrade || '')
  const [defaultGender, setDefaultGender] = useState('')

  const bulkAddMutation = useMutation({
    mutationFn: (data) => classesApi.bulkAddStudents(classId, data),
    onSuccess: () => {
      onSuccess()
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!studentText.trim()) {
      alert('Please enter student names')
      return
    }

    // Split by newlines and filter empty lines
    const lines = studentText.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      alert('Please enter at least one student name')
      return
    }

    bulkAddMutation.mutate({
      students: lines,
      default_grade: defaultGradeValue || undefined,
      default_gender: defaultGender || undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Bulk Add Students</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Student Names (one per line)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Format: "John Brown" or "John Brown, M, 10-9" or "John Brown, Female, 10-9"
            </p>
            <textarea
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              placeholder="John Brown, M, 10-9&#10;Kayla Smith, F, 10-9&#10;Tyrone Peters, M, 10-9"
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Default Grade (if not specified)
              </label>
              <input
                type="text"
                value={defaultGradeValue}
                onChange={(e) => setDefaultGradeValue(e.target.value)}
                placeholder="e.g., 10-9"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Default Gender (if not specified)
              </label>
              <select
                value={defaultGender}
                onChange={(e) => setDefaultGender(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">None</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> You can paste directly from Excel. Each row will be treated as a separate student.
              If a student already exists (same name and grade), they will be added to the class without creating a duplicate.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bulkAddMutation.isPending}
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkAddMutation.isPending ? 'Adding Students...' : 'Add Students'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BulkAddStudentModal







