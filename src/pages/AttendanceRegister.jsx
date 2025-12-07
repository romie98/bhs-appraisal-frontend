// This file needs to be recreated with the attendance register functionality
// It was previously in Register.jsx before it was replaced with user registration
// The attendance register should use registerApi from markbookApi
// For now, this is a placeholder - you may need to restore it from git history

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { 
  ClipboardCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck,
  Download
} from 'lucide-react'
import { classesApi, registerApi, exportApi, markbookApi } from '../services/markbookApi'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function AttendanceRegister() {
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const queryClient = useQueryClient()

  // Fetch all classes
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['markbook-classes'],
    queryFn: () => markbookApi.getClasses(),
  })

  // Fetch students for selected class
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: ['class-students', selectedClassId],
    queryFn: async () => {
      console.log('Fetching students for class:', selectedClassId)
      const result = await classesApi.getStudents(selectedClassId)
      console.log('Students fetched:', result)
      return result
    },
    enabled: !!selectedClassId,
  })

  // Log errors for debugging
  if (studentsError) {
    console.error('Error fetching students:', studentsError)
  }
  
  // Debug log
  console.log('Current state:', { selectedClassId, studentsCount: students.length, students })

  // Fetch register records for selected date and class
  const { data: registerRecords = [] } = useQuery({
    queryKey: ['register', selectedClassId, selectedDate],
    queryFn: () => registerApi.getAll({ class_id: selectedClassId, date: selectedDate }),
    enabled: !!selectedClassId,
  })

  // Fetch weekly summary
  const { data: weeklySummary = [] } = useQuery({
    queryKey: ['register-summary-weekly', selectedClassId],
    queryFn: () => registerApi.getWeeklySummary(null, selectedClassId),
    enabled: !!selectedClassId,
  })

  // Fetch monthly summary
  const { data: monthlySummary = [] } = useQuery({
    queryKey: ['register-summary-monthly', selectedClassId],
    queryFn: () => registerApi.getMonthlySummary(null, selectedClassId),
    enabled: !!selectedClassId,
  })

  // Create register record mutation
  const createRecordMutation = useMutation({
    mutationFn: (data) => registerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['register'] })
      queryClient.invalidateQueries({ queryKey: ['register-summary'] })
    },
  })

  // Update register record mutation
  const updateRecordMutation = useMutation({
    mutationFn: ({ id, data }) => registerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['register'] })
      queryClient.invalidateQueries({ queryKey: ['register-summary'] })
    },
  })

  // Bulk create mutation
  const bulkCreateMutation = useMutation({
    mutationFn: (data) => registerApi.createBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['register'] })
      queryClient.invalidateQueries({ queryKey: ['register-summary'] })
    },
  })

  // Create attendance map for quick lookup
  const attendanceMap = useMemo(() => {
    const map = {}
    registerRecords.forEach(record => {
      map[record.student_id] = record
    })
    return map
  }, [registerRecords])

  // Get attendance data for each student
  const studentAttendance = useMemo(() => {
    if (!students || students.length === 0) {
      console.log('No students available for attendance')
      return []
    }
    const attendance = (students || []).map(student => {
      const record = attendanceMap[student.id]
      return {
        ...student,
        recordId: record?.id,
        status: record?.status || 'Present',
        comment: record?.comment || '',
      }
    })
    console.log('Student attendance data:', attendance)
    return attendance
  }, [students, attendanceMap])

  const handleStatusClick = async (studentId, newStatus) => {
    const student = studentAttendance.find(s => s.id === studentId)
    
    if (student.recordId) {
      // Update existing record
      updateRecordMutation.mutate({
        id: student.recordId,
        data: { status: newStatus },
      })
    } else {
      // Create new record
      createRecordMutation.mutate({
        student_id: studentId,
        date: selectedDate,
        status: newStatus,
      })
    }
  }

  const handleMarkAllPresent = async () => {
    const records = (students || []).map(student => ({
      student_id: student.id,
      date: selectedDate,
      status: 'Present',
    }))

    bulkCreateMutation.mutate({
      class_id: selectedClassId,
      date: selectedDate,
      records,
    })
  }

  const handleCommentChange = async (studentId, comment) => {
    const student = studentAttendance.find(s => s.id === studentId)
    
    if (student.recordId) {
      updateRecordMutation.mutate({
        id: student.recordId,
        data: { comment },
      })
    } else {
      createRecordMutation.mutate({
        student_id: studentId,
        date: selectedDate,
        status: 'Present',
        comment,
      })
    }
  }

  const handleExportPDF = () => {
    const selectedClass = classes.find(c => c.id === selectedClassId)
    const gradeName = selectedClass?.name || 'unknown'
    exportApi.exportRegisterPDF(gradeName, {
      date: selectedDate,
    })
  }

  const getStatusCounts = () => {
    const counts = { Present: 0, Absent: 0, Late: 0, Excused: 0 }
    studentAttendance.forEach(student => {
      counts[student.status] = (counts[student.status] || 0) + 1
    })
    return counts
  }

  const statusCounts = getStatusCounts()
  const totalStudents = students.length
  const presentCount = statusCounts.Present + statusCounts.Late + statusCounts.Excused
  const attendanceRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0

  if (classesLoading || studentsLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  if (!selectedClassId) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <ClipboardCheck className="w-8 h-8 text-sky-600" />
                Attendance Register
              </h1>
              <p className="text-gray-600">
                Track and manage student attendance
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClassId || ''}
              onChange={(e) => {
                const classId = e.target.value || null
                setSelectedClassId(classId)
                if (classId) {
                  queryClient.invalidateQueries({ queryKey: ['class-students', classId] })
                  queryClient.invalidateQueries({ queryKey: ['register', classId] })
                  queryClient.invalidateQueries({ queryKey: ['register-summary-weekly', classId] })
                  queryClient.invalidateQueries({ queryKey: ['register-summary-monthly', classId] })
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Select a class --</option>
              {(classes || []).map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.academic_year})
                </option>
              ))}
            </select>
          </div>
          {classes.length === 0 && (
            <p className="mt-4 text-gray-500 text-center">
              No classes available. Please create a class first.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-sky-600" />
              Attendance Register
            </h1>
            <p className="text-gray-600">
              Track and manage student attendance
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  queryClient.invalidateQueries({ queryKey: ['class-students', classId] })
                  queryClient.invalidateQueries({ queryKey: ['register', classId] })
                  queryClient.invalidateQueries({ queryKey: ['register-summary-weekly', classId] })
                  queryClient.invalidateQueries({ queryKey: ['register-summary-monthly', classId] })
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              disabled={classesLoading}
            >
              <option value="">-- Select a class --</option>
              {(classes || []).map((cls) => (
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

          <div className="flex items-end">
            <button
              onClick={handleMarkAllPresent}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <UserCheck className="w-4 h-4" />
              Mark All Present
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{totalStudents}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.Present}</div>
            <div className="text-sm text-gray-600">Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{statusCounts.Absent}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.Late}</div>
            <div className="text-sm text-gray-600">Late</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{attendanceRate}%</div>
            <div className="text-sm text-gray-600">Rate</div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">P</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">A</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">L</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">E</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(studentAttendance || []).map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleStatusClick(student.id, 'Present')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        student.status === 'Present'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleStatusClick(student.id, 'Absent')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        student.status === 'Absent'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleStatusClick(student.id, 'Late')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        student.status === 'Late'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-yellow-100'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleStatusClick(student.id, 'Excused')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        student.status === 'Excused'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-blue-100'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={student.comment}
                      onChange={(e) => handleCommentChange(student.id, e.target.value)}
                      onBlur={(e) => handleCommentChange(student.id, e.target.value)}
                      placeholder="Add comment..."
                      className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {studentAttendance.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {studentsLoading ? 'Loading students...' : students.length === 0 ? 'No students in this class. Please add students to the class first.' : 'No students found'}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Summary Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklySummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Present" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              <Bar dataKey="late" fill="#f59e0b" name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Summary Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance_rate" stroke="#3b82f6" name="Attendance Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AttendanceRegister



