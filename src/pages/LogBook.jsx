import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  User,
  Users,
  FileText,
  Edit,
  Trash2,
  ArrowLeft
} from 'lucide-react'
import { logbookApi, classesApi } from '../services/markbookApi'
import LogBookCreateEditModal from '../components/LogBookCreateEditModal'
import { format } from 'date-fns'

const ENTRY_TYPES = [
  'Incident',
  'Reflection',
  'Parent Meeting',
  'Behaviour',
  'Achievement',
  'General',
  'Professional Development'
]

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

function LogBook() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [entryTypeFilter, setEntryTypeFilter] = useState('all')
  const [selectedClassId, setSelectedClassId] = useState('all')
  const [selectedStudentId, setSelectedStudentId] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  // Fetch classes
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.getAll(),
  })

  // Fetch students for selected class
  const { data: classStudents = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['class-students', selectedClassId],
    queryFn: () => classesApi.getStudents(selectedClassId),
    enabled: selectedClassId !== 'all' && selectedClassId !== '',
  })

  // Build query params
  const queryParams = useMemo(() => {
    const params = {}
    if (searchTerm) params.search = searchTerm
    if (entryTypeFilter !== 'all') params.entry_type = entryTypeFilter
    if (selectedClassId !== 'all' && selectedClassId) params.class_id = selectedClassId
    if (selectedStudentId !== 'all' && selectedStudentId) params.student_id = selectedStudentId
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    return params
  }, [searchTerm, entryTypeFilter, selectedClassId, selectedStudentId, dateFrom, dateTo])

  // Fetch log entries
  const { data: entries = [], isLoading: entriesLoading, refetch } = useQuery({
    queryKey: ['logbook', queryParams],
    queryFn: () => logbookApi.getAll(queryParams),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => logbookApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logbook'] })
    },
  })

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error) {
        alert('Failed to delete entry. Please try again.')
      }
    }
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setShowCreateModal(true)
  }

  const handleCreate = () => {
    setEditingEntry(null)
    setShowCreateModal(true)
  }

  const handleModalClose = () => {
    setShowCreateModal(false)
    setEditingEntry(null)
  }

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['logbook'] })
    handleModalClose()
  }

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-sky-600" />
              Log Book
            </h1>
            <p className="text-gray-600">
              Record events, incidents, reflections, and journal entries
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Entry Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Entry Type
              </label>
              <select
                value={entryTypeFilter}
                onChange={(e) => setEntryTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Types</option>
                {ENTRY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value)
                  setSelectedStudentId('all') // Reset student when class changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.academic_year})
                  </option>
                ))}
              </select>
            </div>

            {/* Student Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                disabled={selectedClassId === 'all'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="all">All Students</option>
                {classStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      {entriesLoading ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center text-gray-500">Loading entries...</div>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No entries found</p>
            <p className="text-sm mt-2">Create your first log entry to get started</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {(entries || []).map(entry => (
            <div
              key={entry.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/logbook/${entry.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEntryTypeColor(entry.entry_type)}`}>
                      {entry.entry_type}
                    </span>
                    {entry.title && (
                      <h3 className="text-lg font-semibold text-gray-800">{entry.title}</h3>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{truncateContent(entry.content)}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </div>
                    {entry.class_obj && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {entry.class_obj.name}
                      </div>
                    )}
                    {entry.student && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {entry.student.first_name} {entry.student.last_name}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-2 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <LogBookCreateEditModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        entry={editingEntry}
        onSuccess={handleModalSuccess}
        classes={classes}
      />
    </div>
  )
}

export default LogBook







