import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { classesApi, studentsApi } from '../services/markbookApi'

function SingleAddStudentModal({ classId, onClose, onSuccess }) {
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [showNewStudentForm, setShowNewStudentForm] = useState(false)
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    grade: '',
    gender: '',
    parent_contact: ''
  })

  // Fetch all students
  const { data: allStudents = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getAll(),
  })

  // Add student to class mutation
  const addStudentMutation = useMutation({
    mutationFn: (studentId) => classesApi.addStudent(classId, studentId),
    onSuccess: () => {
      onSuccess()
    },
  })

  // Create new student and add to class
  const createAndAddMutation = useMutation({
    mutationFn: async (studentData) => {
      // First create the student
      const newStudent = await studentsApi.create(studentData)
      // Then add to class
      await classesApi.addStudent(classId, newStudent.id)
      return newStudent
    },
    onSuccess: () => {
      onSuccess()
    },
  })

  const handleAddExisting = () => {
    if (!selectedStudentId) {
      alert('Please select a student')
      return
    }
    addStudentMutation.mutate(selectedStudentId)
  }

  const handleCreateAndAdd = (e) => {
    e.preventDefault()
    if (!newStudent.first_name.trim() || !newStudent.last_name.trim() || !newStudent.grade.trim()) {
      alert('Please fill in all required fields (Name and Grade)')
      return
    }
    createAndAddMutation.mutate(newStudent)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add Student to Class</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle between existing and new student */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowNewStudentForm(false)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              !showNewStudentForm
                ? 'bg-sky-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Select Existing Student
          </button>
          <button
            onClick={() => setShowNewStudentForm(true)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              showNewStudentForm
                ? 'bg-sky-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create New Student
          </button>
        </div>

        {!showNewStudentForm ? (
          /* Select Existing Student */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">-- Select a student --</option>
                {allStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.last_name} ({student.grade})
                  </option>
                ))}
              </select>
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
                onClick={handleAddExisting}
                disabled={addStudentMutation.isPending || !selectedStudentId}
                className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addStudentMutation.isPending ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </div>
        ) : (
          /* Create New Student */
          <form onSubmit={handleCreateAndAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={newStudent.first_name}
                  onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={newStudent.last_name}
                  onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Grade *
                </label>
                <input
                  type="text"
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  placeholder="e.g., 10-9"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={newStudent.gender}
                  onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Parent Contact
              </label>
              <input
                type="text"
                value={newStudent.parent_contact}
                onChange={(e) => setNewStudent({ ...newStudent, parent_contact: e.target.value })}
                placeholder="Phone or email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
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
                disabled={createAndAddMutation.isPending}
                className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createAndAddMutation.isPending ? 'Creating...' : 'Create & Add'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default SingleAddStudentModal







