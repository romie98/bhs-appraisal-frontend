import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { classesApi } from '../services/markbookApi'

function ClassCreateModal({ onClose, onSuccess, classData = null }) {
  const [name, setName] = useState(classData?.name || '')
  const [academicYear, setAcademicYear] = useState(classData?.academic_year || '2024-2025')
  const [isHomeroom, setIsHomeroom] = useState(classData?.is_homeroom || false)

  const createClassMutation = useMutation({
    mutationFn: (data) => classesApi.create(data),
    onSuccess: (newClass) => {
      onSuccess(newClass)
    },
  })

  const updateClassMutation = useMutation({
    mutationFn: (data) => classesApi.update(classData.id, data),
    onSuccess: (updatedClass) => {
      onSuccess(updatedClass)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter a class name')
      return
    }
    
<<<<<<< HEAD
    // Ensure is_homeroom is a proper boolean (not string)
    const data = {
      name: name.trim(),
      academic_year: academicYear,
      is_homeroom: Boolean(isHomeroom), // Explicitly convert to boolean
    }

    if (classData) {
      updateClassMutation.mutate(data)
    } else {
      createClassMutation.mutate(data)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {classData ? 'Edit Class' : 'Create New Class'}
          </h2>
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
              Class Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Grade 10-9, Form 5A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g., 2024-2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isHomeroom}
                onChange={(e) => setIsHomeroom(e.target.checked)}
                className="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                This class is a homeroom
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-8">
              Homeroom classes use morning/afternoon attendance instead of period-based attendance
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
              disabled={createClassMutation.isPending || updateClassMutation.isPending}
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createClassMutation.isPending || updateClassMutation.isPending
                ? (classData ? 'Updating...' : 'Creating...')
                : (classData ? 'Update Class' : 'Create Class')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClassCreateModal







