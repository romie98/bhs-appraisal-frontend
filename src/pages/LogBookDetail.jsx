import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Users,
  FileText
} from 'lucide-react'
import { logbookApi } from '../services/markbookApi'
import LogBookCreateEditModal from '../components/LogBookCreateEditModal'
import { format } from 'date-fns'

const getEntryTypeColor = (type) => {
  const colors = {
    'Incident': 'bg-red-100 text-red-800',
    'Reflection': 'bg-blue-100 text-blue-800',
    'Parent Meeting': 'bg-purple-100 text-purple-800',
    'Behaviour': 'bg-orange-100 text-orange-800',
    'Achievement': 'bg-green-100 text-green-800',
    'General': 'bg-gray-100 text-gray-800',
    'Professional Development': 'bg-indigo-100 text-indigo-800',
  }
  return colors[type] || colors['General']
}

function LogBookDetail() {
  const { entryId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showEditModal, setShowEditModal] = useState(false)

  // Fetch entry
  const { data: entry, isLoading, error } = useQuery({
    queryKey: ['logbook', entryId],
    queryFn: () => logbookApi.getById(entryId),
  })

  // Fetch classes for edit modal
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => import('../services/markbookApi').then(m => m.classesApi.getAll()),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => logbookApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook'] })
      navigate('/logbook')
    },
  })

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(entryId)
      } catch (error) {
        alert('Failed to delete entry. Please try again.')
      }
    }
  }

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['logbook', entryId] })
    setShowEditModal(false)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center text-gray-500">Loading entry...</div>
        </div>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center text-red-500">
            <p className="text-lg font-medium">Entry not found</p>
            <button
              onClick={() => navigate('/logbook')}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              Back to Log Book
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/logbook')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Log Book
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Entry
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEntryTypeColor(entry.entry_type)}`}>
            {entry.entry_type}
          </span>
          {entry.title && (
            <h1 className="text-2xl font-bold text-gray-800">{entry.title}</h1>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(entry.date), 'MMMM dd, yyyy')}</span>
          </div>
          {entry.class_obj && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{entry.class_obj.name} ({entry.class_obj.academic_year})</span>
            </div>
          )}
          {entry.student && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{entry.student.first_name} {entry.student.last_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Created: {format(new Date(entry.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {entry.content}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <LogBookCreateEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        entry={entry}
        onSuccess={handleEditSuccess}
        classes={classes}
      />
    </div>
  )
}

export default LogBookDetail







