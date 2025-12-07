import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Users, 
  Plus, 
  Trash2, 
  UserPlus, 
  FileText,
  Calendar,
  X,
  ArrowUpDown
} from 'lucide-react'
import { classesApi } from '../services/markbookApi'
import ClassCreateModal from '../components/ClassCreateModal'
import ClassRoster from '../components/ClassRoster'

function Classes() {
  const [selectedClass, setSelectedClass] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sortBy, setSortBy] = useState('name-asc')
  const queryClient = useQueryClient()

  // Fetch all classes
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.getAll(),
  })

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: (id) => classesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      if (selectedClass?.id === id) {
        setSelectedClass(null)
      }
    },
  })

  const handleDeleteClass = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the class "${name}"? This will remove all student associations but not delete the students themselves.`)) {
      deleteClassMutation.mutate(id)
    }
  }

  // Sort classes based on selected option
  const sortedClasses = useMemo(() => {
    const classesCopy = [...classes]
    
    switch (sortBy) {
      case 'name-asc':
        return classesCopy.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return classesCopy.sort((a, b) => b.name.localeCompare(a.name))
      case 'year-desc':
        return classesCopy.sort((a, b) => {
          // Extract year numbers for comparison
          const yearA = parseInt(a.academic_year.split('-')[0]) || 0
          const yearB = parseInt(b.academic_year.split('-')[0]) || 0
          return yearB - yearA
        })
      case 'year-asc':
        return classesCopy.sort((a, b) => {
          const yearA = parseInt(a.academic_year.split('-')[0]) || 0
          const yearB = parseInt(b.academic_year.split('-')[0]) || 0
          return yearA - yearB
        })
      case 'students-desc':
        return classesCopy.sort((a, b) => (b.student_count || 0) - (a.student_count || 0))
      case 'students-asc':
        return classesCopy.sort((a, b) => (a.student_count || 0) - (b.student_count || 0))
      case 'created-desc':
        return classesCopy.sort((a, b) => {
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateB - dateA
        })
      case 'created-asc':
        return classesCopy.sort((a, b) => {
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateA - dateB
        })
      default:
        return classesCopy
    }
  }, [classes, sortBy])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  // If a class is selected, show the roster
  if (selectedClass) {
    return (
      <ClassRoster 
        classData={selectedClass}
        onBack={() => setSelectedClass(null)}
        onUpdate={(updatedClass) => {
          setSelectedClass(updatedClass)
          queryClient.invalidateQueries({ queryKey: ['classes'] })
        }}
      />
    )
  }

  // Show class list
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-sky-600" />
              Class Management
            </h1>
            <p className="text-gray-600">
              Create and manage your classes
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Class
          </button>
        </div>
        
        {/* Sort Controls */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-semibold text-gray-700">Sort by:</label>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="year-desc">Academic Year (Newest)</option>
            <option value="year-asc">Academic Year (Oldest)</option>
            <option value="students-desc">Student Count (Most)</option>
            <option value="students-asc">Student Count (Least)</option>
            <option value="created-desc">Date Created (Newest)</option>
            <option value="created-asc">Date Created (Oldest)</option>
          </select>
        </div>
      </div>

      {/* Class List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedClass(cls)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{cls.name}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {cls.academic_year}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteClass(cls.id, cls.name)
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete class"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{cls.student_count || 0} {cls.student_count === 1 ? 'student' : 'students'}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedClass(cls)
                }}
                className="w-full px-4 py-2 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors font-medium text-sm"
              >
                View Roster
              </button>
            </div>
          </div>
        ))}

        {sortedClasses.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No classes yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Your First Class
            </button>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <ClassCreateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newClass) => {
            setShowCreateModal(false)
            setSelectedClass(newClass)
            queryClient.invalidateQueries({ queryKey: ['classes'] })
          }}
        />
      )}
    </div>
  )
}

export default Classes

