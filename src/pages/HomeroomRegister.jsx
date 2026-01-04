import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { 
  ClipboardCheck, 
  Calendar, 
  Users,
  Loader2
} from 'lucide-react'
import { classesApi, homeroomRegisterApi } from '../services/markbookApi'

function HomeroomRegister() {
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const queryClient = useQueryClient()

  // Fetch all classes
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.getAll(),
  })

  // Filter to only homeroom classes
  const homeroomClasses = classes.filter(cls => cls.is_homeroom === true)

  // Fetch homeroom register records for selected class
  const { data: registerRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['homeroom-register', selectedClassId],
    queryFn: () => homeroomRegisterApi.getAll(selectedClassId),
    enabled: !!selectedClassId,
  })

  // Find register for selected date
  const currentRegister = registerRecords.find(r => r.date === selectedDate)

  // Create/Update homeroom register mutation
  const saveRegisterMutation = useMutation({
    mutationFn: (data) => homeroomRegisterApi.createOrUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeroom-register', selectedClassId] })
    },
  })

  const [formData, setFormData] = useState({
    morning_boys: 0,
    morning_girls: 0,
    afternoon_boys: 0,
    afternoon_girls: 0,
  })

  // Initialize form data when register or date changes
  useEffect(() => {
    if (currentRegister) {
      setFormData({
        morning_boys: currentRegister.morning_boys || 0,
        morning_girls: currentRegister.morning_girls || 0,
        afternoon_boys: currentRegister.afternoon_boys || 0,
        afternoon_girls: currentRegister.afternoon_girls || 0,
      })
    } else {
      setFormData({
        morning_boys: 0,
        morning_girls: 0,
        afternoon_boys: 0,
        afternoon_girls: 0,
      })
    }
  }, [currentRegister, selectedDate])

  const handleInputChange = (field, value) => {
    const numValue = parseInt(value) || 0
    setFormData(prev => ({
      ...prev,
      [field]: numValue
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
        morning_boys: formData.morning_boys,
        morning_girls: formData.morning_girls,
        afternoon_boys: formData.afternoon_boys,
        afternoon_girls: formData.afternoon_girls,
      })
    } catch (error) {
      console.error('Failed to save homeroom register:', error)
      alert(error.message || 'Failed to save register')
    }
  }

  // Calculate totals
  const morningTotal = formData.morning_boys + formData.morning_girls
  const afternoonTotal = formData.afternoon_boys + formData.afternoon_girls

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
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  // Reset form when date changes
                  const newRegister = registerRecords.find(r => r.date === e.target.value)
                  if (newRegister) {
                    setFormData({
                      morning_boys: newRegister.morning_boys || 0,
                      morning_girls: newRegister.morning_girls || 0,
                      afternoon_boys: newRegister.afternoon_boys || 0,
                      afternoon_girls: newRegister.afternoon_girls || 0,
                    })
                  } else {
                    setFormData({
                      morning_boys: 0,
                      morning_girls: 0,
                      afternoon_boys: 0,
                      afternoon_girls: 0,
                    })
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Register Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Date: {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Morning Section */}
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🌅</span>
                Morning
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👦 Boys
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.morning_boys}
                    onChange={(e) => handleInputChange('morning_boys', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👧 Girls
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.morning_girls}
                    onChange={(e) => handleInputChange('morning_girls', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-blue-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-blue-700">{morningTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Afternoon Section */}
            <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🌇</span>
                Afternoon
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👦 Boys
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.afternoon_boys}
                    onChange={(e) => handleInputChange('afternoon_boys', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👧 Girls
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.afternoon_girls}
                    onChange={(e) => handleInputChange('afternoon_girls', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="pt-4 border-t border-orange-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-orange-700">{afternoonTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saveRegisterMutation.isPending}
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
        </div>
      </div>

      {/* Recent Records */}
      {registerRecords.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                    onClick={() => {
                      setSelectedDate(record.date)
                      setFormData({
                        morning_boys: record.morning_boys || 0,
                        morning_girls: record.morning_girls || 0,
                        afternoon_boys: record.afternoon_boys || 0,
                        afternoon_girls: record.afternoon_girls || 0,
                      })
                    }}
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
