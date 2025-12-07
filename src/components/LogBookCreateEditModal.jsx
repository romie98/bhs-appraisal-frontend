import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { logbookApi, classesApi } from '../services/markbookApi'

const ENTRY_TYPES = [
  'Incident',
  'Reflection',
  'Parent Meeting',
  'Behaviour',
  'Achievement',
  'General',
  'Professional Development'
]

function LogBookCreateEditModal({ isOpen, onClose, entry, onSuccess, classes = [] }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    entry_type: 'General',
    date: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    class_id: '',
    student_id: '',
  })

  // Fetch students for selected class
  const { data: classStudents = [] } = useQuery({
    queryKey: ['class-students', formData.class_id],
    queryFn: () => classesApi.getStudents(formData.class_id),
    enabled: !!formData.class_id && formData.class_id !== '',
  })

  // Initialize form data when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        content: entry.content || '',
        entry_type: entry.entry_type || 'General',
        date: entry.date ? new Date(entry.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        class_id: entry.class_id || '',
        student_id: entry.student_id || '',
      })
    } else {
      setFormData({
        title: '',
        content: '',
        entry_type: 'General',
        date: new Date().toISOString().slice(0, 16),
        class_id: '',
        student_id: '',
      })
    }
  }, [entry, isOpen])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => logbookApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook'] })
      onSuccess()
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => logbookApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook'] })
      onSuccess()
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.content.trim()) {
      alert('Content is required')
      return
    }

    const payload = {
      title: formData.title || null,
      content: formData.content,
      entry_type: formData.entry_type,
      date: new Date(formData.date).toISOString(),
      class_id: formData.class_id || null,
      student_id: formData.student_id || null,
    }

    try {
      if (entry) {
        await updateMutation.mutateAsync({ id: entry.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Failed to save entry. Please try again.')
    }
  }

  const handleClassChange = (classId) => {
    setFormData(prev => ({
      ...prev,
      class_id: classId,
      student_id: '', // Reset student when class changes
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {entry ? 'Edit Entry' : 'New Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter entry title..."
            />
          </div>

          {/* Entry Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Entry Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.entry_type}
              onChange={(e) => setFormData(prev => ({ ...prev, entry_type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            >
              {ENTRY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class (Optional)
            </label>
            <select
              value={formData.class_id}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- No class --</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.academic_year})
                </option>
              ))}
            </select>
          </div>

          {/* Student */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Student (Optional)
            </label>
            <select
              value={formData.student_id}
              onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
              disabled={!formData.class_id}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- No student --</option>
              {classStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={12}
              placeholder="Write your journal entry here..."
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : entry
                ? 'Update Entry'
                : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LogBookCreateEditModal







