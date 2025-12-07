// API service for Mark Book & Register system
import { apiUrl } from '../config/api'

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const response = await fetch(apiUrl(endpoint), {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Students API
export const studentsApi = {
  getAll: (grade) => apiCall(`/students${grade ? `?grade=${grade}` : ''}`),
  getById: (id) => apiCall(`/students/${id}`),
  create: (data) => apiCall('/students', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/students/${id}`, { method: 'DELETE' }),
}

// Assessments API
export const assessmentsApi = {
  getAll: (grade, classId) => {
    const params = new URLSearchParams()
    if (classId) params.append('class_id', classId)
    else if (grade) params.append('grade', grade)
    const query = params.toString()
    return apiCall(`/assessments${query ? `?${query}` : ''}`)
  },
  getById: (id) => apiCall(`/assessments/${id}`),
  create: (data) => apiCall('/assessments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/assessments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/assessments/${id}`, { method: 'DELETE' }),
  getStudentsWithScores: (assessmentId, classId) => {
    const params = new URLSearchParams()
    if (classId) params.append('class_id', classId)
    const query = params.toString()
    return apiCall(`/assessments/${assessmentId}/students-with-scores${query ? `?${query}` : ''}`)
  },
}

// Assessment Scores API
export const scoresApi = {
  getByAssessment: (assessmentId, classId) => {
    const params = new URLSearchParams()
    if (classId) params.append('class_id', classId)
    const query = params.toString()
    return apiCall(`/assessments/scores/by-assessment/${assessmentId}${query ? `?${query}` : ''}`)
  },
  getByStudent: (studentId) => apiCall(`/assessments/scores/by-student/${studentId}`),
  createBulk: (data) => apiCall('/assessments/scores/bulk', { method: 'POST', body: JSON.stringify(data) }),
  bulkImport: (data) => apiCall('/assessments/scores/bulk-import', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/assessments/scores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/assessments/scores/${id}`, { method: 'DELETE' }),
}

// Register API
export const registerApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.class_id) queryParams.append('class_id', params.class_id)
    else if (params.grade) queryParams.append('grade', params.grade)
    if (params.date) queryParams.append('date', params.date)
    if (params.student_id) queryParams.append('student_id', params.student_id)
    const query = queryParams.toString()
    return apiCall(`/register${query ? `?${query}` : ''}`)
  },
  create: (data) => apiCall('/register', { method: 'POST', body: JSON.stringify(data) }),
  createBulk: (data) => apiCall('/register/bulk', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/register/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getWeeklySummary: (grade, classId) => {
    const params = new URLSearchParams()
    if (classId) params.append('class_id', classId)
    else if (grade) params.append('grade', grade)
    return apiCall(`/register/summary/weekly?${params.toString()}`)
  },
  getMonthlySummary: (grade, classId) => {
    const params = new URLSearchParams()
    if (classId) params.append('class_id', classId)
    else if (grade) params.append('grade', grade)
    return apiCall(`/register/summary/monthly?${params.toString()}`)
  },
}

// Classes API
export const classesApi = {
  getAll: () => apiCall('/classes'),
  getById: (id) => apiCall(`/classes/${id}`),
  create: (data) => apiCall('/classes', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/classes/${id}`, { method: 'DELETE' }),
  getStudents: (classId) => apiCall(`/classes/${classId}/students`),
  addStudent: (classId, studentId) => apiCall(`/classes/${classId}/students`, {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId })
  }),
  bulkAddStudents: (classId, data) => apiCall(`/classes/${classId}/students/bulk`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  removeStudent: (classId, studentId) => apiCall(`/classes/${classId}/students/${studentId}`, { method: 'DELETE' }),
}

// Markbook helper API
export const markbookApi = {
  getClasses: () => apiCall('/markbook/classes'),
}

// Log Book API
export const logbookApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.entry_type) queryParams.append('entry_type', params.entry_type)
    if (params.class_id) queryParams.append('class_id', params.class_id)
    if (params.student_id) queryParams.append('student_id', params.student_id)
    if (params.date_from) queryParams.append('date_from', params.date_from)
    if (params.date_to) queryParams.append('date_to', params.date_to)
    if (params.search) queryParams.append('search', params.search)
    const query = queryParams.toString()
    return apiCall(`/logbook${query ? `?${query}` : ''}`)
  },
  getById: (id) => apiCall(`/logbook/${id}`),
  create: (data) => apiCall('/logbook', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/logbook/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/logbook/${id}`, { method: 'DELETE' }),
}

// Lesson Plans API
export const lessonPlansApi = {
  getAll: (teacherId) => {
    const params = new URLSearchParams()
    if (teacherId) params.append('teacher_id', teacherId)
    const query = params.toString()
    return apiCall(`/lesson-plans${query ? `?${query}` : ''}`)
  },
  getById: (id) => apiCall(`/lesson-plans/${id}`),
  upload: async (file, title, teacherId) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('teacher_id', teacherId)
    
    const response = await fetch(apiUrl('/lesson-plans/upload'), {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },
  createFromText: (data) => apiCall('/lesson-plans/create-text', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id, data) => apiCall(`/lesson-plans/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id) => apiCall(`/lesson-plans/${id}`, { method: 'DELETE' }),
  extractEvidence: (id) => apiCall(`/lesson-plans/${id}/extract-evidence`, { 
    method: 'POST' 
  }),
}

// Photo Evidence Library API
export const photoLibraryApi = {
  upload: async (file, teacherId) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('teacher_id', teacherId)

    const response = await fetch(apiUrl('/photo-library/upload'), {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  list: (teacherId) => {
    const params = new URLSearchParams()
    if (teacherId) params.append('teacher_id', teacherId)
    const query = params.toString()
    return apiCall(`/photo-library${query ? `?${query}` : ''}`)
  },

  getById: (id) => apiCall(`/photo-library/${id}`),
}

// Export to PDF
export const exportApi = {
  exportMarkBookPDF: async (grade, filters) => {
    try {
      const response = await fetch(apiUrl(`/export/markbook/${grade}`))
      if (!response.ok) throw new Error('Failed to generate PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `markbook_grade_${grade}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    }
  },
  exportRegisterPDF: async (grade, dateRange) => {
    try {
      const response = await fetch(apiUrl(`/export/attendance/${grade}`))
      if (!response.ok) throw new Error('Failed to generate PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance_grade_${grade}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    }
  },
  exportStudentProgressPDF: async (studentId) => {
    try {
      const response = await fetch(apiUrl(`/export/student/${studentId}`))
      if (!response.ok) throw new Error('Failed to generate PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `student_progress_${studentId}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    }
  },
}

