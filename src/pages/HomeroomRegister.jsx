import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { 
  ClipboardCheck, 
  Calendar, 
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
import { classesApi, homeroomRegisterApi } from '../services/markbookApi'

function HomeroomRegister() {
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const queryClient = useQueryClient()

  // Fetch all classes
  const { data: allClasses = [], isLoading: classesLoading, refetch: refetchClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.getAll(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  // Refetch classes when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchClasses()
      }
    }
    
    const handleStorageChange = (e) => {
      if (e.key === 'classes_updated') {
        refetchClasses()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [refetchClasses])

  // Filter to only homeroom classes
  const homeroomClasses = allClasses.filter(cls => {
    const isHomeroom = cls.is_homeroom === true || cls.is_homeroom === 'true' || cls.is_homeroom === 1
    return isHomeroom
  })

  // Fetch students for selected class
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['class-students', selectedClassId],
    queryFn: () => classesApi.getStudents(selectedClassId),
    enabled: !!selectedClassId,
  })

  // Fetch homeroom register records for selected class
  const { data: registerRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['homeroom-register', selectedClassId],
    queryFn: () => homeroomRegisterApi.getAll(selectedClassId),
    enabled: !!selectedClassId,
  })

  // Find register for selected date
  const currentRegister = registerRecords.find(r => r.date === selectedDate)

  // Track individual student attendance (morning/afternoon present/absent)
  // Format: { studentId: { morning: 'Present'|'Absent', afternoon: 'Present'|'Absent' } }
  const [studentAttendance, setStudentAttendance] = useState({})

  // Initialize student attendance from existing register or default to all present
  useEffect(() => {
    if (students.length > 0 && selectedDate) {
      // If we have existing register data, we need to reconstruct individual attendance
      // For now, initialize all as Present (we'll need backend to support individual records later)
      const initialAttendance = {}
      students.forEach(student => {
        initialAttendance[student.id] = {
          morning: 'Present',
          afternoon: 'Present',
        }
      })
      setStudentAttendance(initialAttendance)
    }
  }, [students, selectedDate])

  // Calculate totals from individual student attendance
  const totals = useMemo(() => {
    let morningBoys = 0
    let morningGirls = 0
    let afternoonBoys = 0
    let afternoonGirls = 0

    students.forEach(student => {
      const attendance = studentAttendance[student.id] || { morning: 'Present', afternoon: 'Present' }
      const isBoy = student.gender === 'Male' || student.gender === 'M' || student.gender === 'male'
      
      if (attendance.morning === 'Present') {
        if (isBoy) morningBoys++
        else morningGirls++
      }
      
      if (attendance.afternoon === 'Present') {
        if (isBoy) afternoonBoys++
        else afternoonGirls++
      }
    })

    return {
      morning_boys: morningBoys,
      morning_girls: morningGirls,
      morning_total: morningBoys + morningGirls,
      afternoon_boys: afternoonBoys,
      afternoon_girls: afternoonGirls,
      afternoon_total: afternoonBoys + afternoonGirls,
    }
  }, [students, studentAttendance])

  // Create/Update homeroom register mutation
  const saveRegisterMutation = useMutation({
    mutationFn: (data) => homeroomRegisterApi.createOrUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeroom-register', selectedClassId] })
    },
  })

  const handleAttendanceClick = (studentId, session, status) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [session]: status,
      }
    }))
  }

  const handleSave = async () => {
    if (!selectedClassId) {
      alert('Please select a homeroom class')
      return
    }

    try {
      await saveRegisterMutation.mutateAsync({
        classroom_id: selectedClassId,
        date: selectedDate,
        morning_boys: totals.morning_boys,
        morning_girls: totals.morning_girls,
        afternoon_boys: totals.afternoon_boys,
        afternoon_girls: totals.afternoon_girls,
      })
    } catch (error) {
      console.error('Failed to save homeroom register:', error)
      alert(error.message || 'Failed to save register')
    }
  }

  const handleMarkAllPresent = () => {
    const newAttendance = {}
    students.forEach(student => {
      newAttendance[student.id] = {
        morning: 'Present',
        afternoon: 'Present',
      }
    })
    setStudentAttendance(newAttendance)
  }

  if (classesLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  if (!selectedClassId) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <ClipboardCheck className="w-8 h-8 text-sky-600" />
                Homeroom Register
              </h1>
              <p className="text-gray-600">
                Track morning and afternoon attendance for homeroom classes
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Homeroom Class
            </label>
            <select
              value={selectedClassId || ''}
              onChange={(e) => {
                const classId = e.target.value || null
                setSelectedClassId(classId)
                if (classId) {
                  queryClient.invalidateQueries({ queryKey: ['homeroom-register', classId] })
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Select a homeroom class --</option>
              {homeroomClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.academic_year})
                </option>
              ))}
            </select>
          </div>
          {homeroomClasses.length === 0 && (
            <p className="mt-4 text-gray-500 text-center">
              No homeroom classes available. Please mark a class as homeroom in Class Management.
            </p>
          )}
        </div>
      </div>
    )
  }

  const selectedClass = homeroomClasses.find(c => c.id === selectedClassId)

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-sky-600" />
              Homeroom Register
            </h1>
            <p className="text-gray-600">
              {selectedClass?.name} • {selectedClass?.academic_year}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class
            </label>
            <select
              value={selectedClassId || ''}
              onChange={(e) => {
                const classId = e.target.value || null
                setSelectedClassId(classId)
                if (classId) {
                  queryClient.invalidateQueries({ queryKey: ['homeroom-register', classId] })
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Select a homeroom class --</option>
              {homeroomClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.academic_year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Morning Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌅</span>
            Morning
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700">{totals.morning_boys}</div>
              <div className="text-sm text-gray-600">👦 Boys</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700">{totals.morning_girls}</div>
              <div className="text-sm text-gray-600">👧 Girls</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-800">{totals.morning_total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>

        {/* Afternoon Summary */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌇</span>
            Afternoon
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-700">{totals.afternoon_boys}</div>
              <div className="text-sm text-gray-600">👦 Boys</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-700">{totals.afternoon_girls}</div>
              <div className="text-sm text-gray-600">👧 Girls</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-800">{totals.afternoon_total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Attendance Table */}
      {studentsLoading ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center">Loading students...</div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center text-gray-500">
            No students in this class. Please add students first.
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Student Attendance - {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Mark All Present
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center justify-center gap-2">
                      <span>🌅</span>
                      <span>Morning</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center justify-center gap-2">
                      <span>🌇</span>
                      <span>Afternoon</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => {
                  const attendance = studentAttendance[student.id] || { morning: 'Present', afternoon: 'Present' }
                  const isBoy = student.gender === 'Male' || student.gender === 'M' || student.gender === 'male'
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span>{isBoy ? '👦' : '👧'}</span>
                          <span className="font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAttendanceClick(student.id, 'morning', 'Present')}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              attendance.morning === 'Present'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                            }`}
                            title="Mark Present"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAttendanceClick(student.id, 'morning', 'Absent')}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              attendance.morning === 'Absent'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                            }`}
                            title="Mark Absent"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAttendanceClick(student.id, 'afternoon', 'Present')}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              attendance.afternoon === 'Present'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                            }`}
                            title="Mark Present"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAttendanceClick(student.id, 'afternoon', 'Absent')}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              attendance.afternoon === 'Absent'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                            }`}
                            title="Mark Absent"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <button
          onClick={handleSave}
          disabled={saveRegisterMutation.isPending || studentsLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveRegisterMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Register'
          )}
        </button>
      </div>

      {/* Recent Records */}
      {registerRecords.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Morning</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Afternoon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registerRecords.slice(0, 10).map((record) => (
                  <tr 
                    key={record.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${record.date === selectedDate ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedDate(record.date)}
                  >
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-3 text-center text-sm text-gray-700">
                      👦 {record.morning_boys || 0}  👧 {record.morning_girls || 0}  <span className="font-semibold">Total: {record.morning_total || 0}</span>
                    </td>
                    <td className="px-6 py-3 text-center text-sm text-gray-700">
                      👦 {record.afternoon_boys || 0}  👧 {record.afternoon_girls || 0}  <span className="font-semibold">Total: {record.afternoon_total || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomeroomRegister
