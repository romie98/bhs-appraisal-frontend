import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  UserPlus, 
  Users, 
  Download,
  Minus,
  FileText,
  ArrowUpDown
} from 'lucide-react'
import { classesApi, exportApi } from '../services/markbookApi'
import SingleAddStudentModal from './SingleAddStudentModal'
import BulkAddStudentModal from './BulkAddStudentModal'

function ClassRoster({ classData, onBack, onUpdate }) {
  const [showSingleAdd, setShowSingleAdd] = useState(false)
  const [showBulkAdd, setShowBulkAdd] = useState(false)
  const [sortBy, setSortBy] = useState('name-asc')
  const queryClient = useQueryClient()

  // Fetch students in class
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['class-students', classData.id],
    queryFn: () => classesApi.getStudents(classData.id),
  })

  // Remove student mutation
  const removeStudentMutation = useMutation({
    mutationFn: (studentId) => classesApi.removeStudent(classData.id, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students', classData.id] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      // Update class data
      classesApi.getById(classData.id).then(updated => {
        onUpdate(updated)
      })
    },
  })

  const handleRemoveStudent = (studentId, studentName) => {
    if (window.confirm(`Remove ${studentName} from this class?`)) {
      removeStudentMutation.mutate(studentId)
    }
  }

  // Sort students based on selected option
  const sortedStudents = useMemo(() => {
    const studentsCopy = [...students]
    
    switch (sortBy) {
      case 'name-asc':
        return studentsCopy.sort((a, b) => {
          const nameA = `${a.first_name} ${a.last_name}`.toLowerCase()
          const nameB = `${b.first_name} ${b.last_name}`.toLowerCase()
          return nameA.localeCompare(nameB)
        })
      case 'name-desc':
        return studentsCopy.sort((a, b) => {
          const nameA = `${a.first_name} ${a.last_name}`.toLowerCase()
          const nameB = `${b.first_name} ${b.last_name}`.toLowerCase()
          return nameB.localeCompare(nameA)
        })
      case 'firstname-asc':
        return studentsCopy.sort((a, b) => a.first_name.localeCompare(b.first_name))
      case 'firstname-desc':
        return studentsCopy.sort((a, b) => b.first_name.localeCompare(a.first_name))
      case 'lastname-asc':
        return studentsCopy.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''))
      case 'lastname-desc':
        return studentsCopy.sort((a, b) => (b.last_name || '').localeCompare(a.last_name || ''))
      case 'gender-asc':
        return studentsCopy.sort((a, b) => {
          const genderA = (a.gender || '').toLowerCase()
          const genderB = (b.gender || '').toLowerCase()
          return genderA.localeCompare(genderB)
        })
      case 'gender-desc':
        return studentsCopy.sort((a, b) => {
          const genderA = (a.gender || '').toLowerCase()
          const genderB = (b.gender || '').toLowerCase()
          return genderB.localeCompare(genderA)
        })
      case 'grade-asc':
        return studentsCopy.sort((a, b) => {
          const gradeA = a.grade || ''
          const gradeB = b.grade || ''
          return gradeA.localeCompare(gradeB)
        })
      case 'grade-desc':
        return studentsCopy.sort((a, b) => {
          const gradeA = a.grade || ''
          const gradeB = b.grade || ''
          return gradeB.localeCompare(gradeA)
        })
      case 'contact-asc':
        return studentsCopy.sort((a, b) => {
          const contactA = (a.parent_contact || '').toLowerCase()
          const contactB = (b.parent_contact || '').toLowerCase()
          return contactA.localeCompare(contactB)
        })
      case 'contact-desc':
        return studentsCopy.sort((a, b) => {
          const contactA = (a.parent_contact || '').toLowerCase()
          const contactB = (b.parent_contact || '').toLowerCase()
          return contactB.localeCompare(contactA)
        })
      default:
        return studentsCopy
    }
  }, [students, sortBy])

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Grade', 'Gender', 'Parent Contact'].join(','),
      ...sortedStudents.map(s => [
        `"${s.first_name} ${s.last_name}"`,
        s.grade,
        s.gender || '',
        s.parent_contact || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `class_${classData.name.replace(/\s+/g, '_')}_roster.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1">
                {classData.name}
              </h1>
              <p className="text-gray-600">
                Academic Year: {classData.academic_year} • {students.length} {students.length === 1 ? 'student' : 'students'}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <FileText className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowBulkAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
            >
              <Users className="w-4 h-4" />
              Bulk Add
            </button>
            <button
              onClick={() => setShowSingleAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        </div>
        
        {/* Sort Controls */}
        <div className="flex items-center gap-3 pt-4 mt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-semibold text-gray-700">Sort by:</label>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
          >
            <option value="name-asc">Full Name (A-Z)</option>
            <option value="name-desc">Full Name (Z-A)</option>
            <option value="firstname-asc">First Name (A-Z)</option>
            <option value="firstname-desc">First Name (Z-A)</option>
            <option value="lastname-asc">Last Name (A-Z)</option>
            <option value="lastname-desc">Last Name (Z-A)</option>
            <option value="gender-asc">Gender (A-Z)</option>
            <option value="gender-desc">Gender (Z-A)</option>
            <option value="grade-asc">Grade (A-Z)</option>
            <option value="grade-desc">Grade (Z-A)</option>
            <option value="contact-asc">Parent Contact (A-Z)</option>
            <option value="contact-desc">Parent Contact (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Gender</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parent Contact</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{student.grade}</td>
                  <td className="px-4 py-3 text-gray-700">{student.gender || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{student.parent_contact || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleRemoveStudent(student.id, `${student.first_name} ${student.last_name}`)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from class"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedStudents.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No students in this class yet</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowSingleAdd(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </button>
                <button
                  onClick={() => setShowBulkAdd(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
                >
                  <Users className="w-4 h-4" />
                  Bulk Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSingleAdd && (
        <SingleAddStudentModal
          classId={classData.id}
          onClose={() => setShowSingleAdd(false)}
          onSuccess={() => {
            setShowSingleAdd(false)
            queryClient.invalidateQueries({ queryKey: ['class-students', classData.id] })
            queryClient.invalidateQueries({ queryKey: ['classes'] })
            classesApi.getById(classData.id).then(updated => {
              onUpdate(updated)
            })
          }}
        />
      )}

      {showBulkAdd && (
        <BulkAddStudentModal
          classId={classData.id}
          defaultGrade={classData.name.match(/\d+-\d+/)?.[0] || ''}
          onClose={() => setShowBulkAdd(false)}
          onSuccess={() => {
            setShowBulkAdd(false)
            queryClient.invalidateQueries({ queryKey: ['class-students', classData.id] })
            queryClient.invalidateQueries({ queryKey: ['classes'] })
            classesApi.getById(classData.id).then(updated => {
              onUpdate(updated)
            })
          }}
        />
      )}
    </div>
  )
}

export default ClassRoster

