import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  ClipboardCheck, 
  TrendingDown, 
  Clock,
  Download
} from 'lucide-react'
import { classesApi, registerApi, exportApi, markbookApi } from '../services/markbookApi'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts'

function RegisterAnalytics() {
  const [selectedClassId, setSelectedClassId] = useState(null)

  // Fetch all classes
  const { data: classes = [] } = useQuery({
    queryKey: ['markbook-classes'],
    queryFn: () => markbookApi.getClasses(),
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

  // Calculate chronic lateness (students with >3 late entries in a month)
  const chronicLateness = useMemo(() => {
    // This would require additional backend endpoint or processing
    // For now, return empty array
    return []
  }, [monthlySummary])

  // Calculate monthly absentee report
  const monthlyAbsenteeReport = useMemo(() => {
    return monthlySummary.map(day => ({
      date: day.date,
      absent: day.absent,
      present: day.present,
      late: day.late,
      excused: day.excused,
    }))
  }, [monthlySummary])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-sky-600" />
              Attendance Analytics
            </h1>
            <p className="text-gray-600">
              Attendance insights and trends
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedClassId || ''}
              onChange={(e) => setSelectedClassId(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">-- Select a class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.academic_year})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const selectedClass = classes.find(c => c.id === selectedClassId)
                const gradeName = selectedClass?.name || 'unknown'
                exportApi.exportRegisterPDF(gradeName, {})
              }}
              disabled={!selectedClassId}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Weekly Avg Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {weeklySummary.length > 0
                  ? (weeklySummary.reduce((sum, day) => sum + day.attendance_rate, 0) / weeklySummary.length).toFixed(1)
                  : '0'}%
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Avg Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {monthlySummary.length > 0
                  ? (monthlySummary.reduce((sum, day) => sum + day.attendance_rate, 0) / monthlySummary.length).toFixed(1)
                  : '0'}%
              </p>
            </div>
            <ClipboardCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Absences</p>
              <p className="text-2xl font-bold text-red-600">
                {monthlySummary.reduce((sum, day) => sum + day.absent, 0)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Chronic Lateness</p>
              <p className="text-2xl font-bold text-yellow-600">{chronicLateness.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Attendance Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Attendance Breakdown</h3>
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
              <Bar dataKey="excused" fill="#3b82f6" name="Excused" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Attendance Trend */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance_rate" stroke="#3b82f6" name="Attendance Rate %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Absentee Report */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Absentee Report</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyAbsenteeReport}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="absent" fill="#ef4444" name="Absent" />
            <Bar dataKey="present" fill="#10b981" name="Present" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chronic Lateness Table */}
      {chronicLateness.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Students with Chronic Lateness
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Late Count</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {chronicLateness.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-center font-semibold text-yellow-600">
                      {student.lateCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Needs Attention
                      </span>
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

export default RegisterAnalytics

