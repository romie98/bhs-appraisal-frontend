// API service for Mark Book & Register system
import { apiFetch } from '../config/api'

// Helper function for API calls with automatic token injection
async function apiCall(endpoint, options = {}) {
  try {
    // Ensure endpoint is properly formatted
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    
    const response = await apiFetch(cleanEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    // Handle 401 Unauthorized - token is invalid
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('auth_token')
      // Check if response is HTML (login page) instead of JSON
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/html')) {
        throw new Error('Authentication failed. Please login again.')
      }
      const error = await response.json().catch(() => ({ detail: 'Authentication failed. Please login again.' }))
      throw new Error(error.detail || 'Authentication failed. Please login again.')
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/html')) {
        throw new Error('Access forbidden. You do not have permission to access this resource.')
      }
      const error = await response.json().catch(() => ({ detail: 'Access forbidden' }))
      throw new Error(error.detail || 'Access forbidden')
    }

    if (!response.ok) {
      // Check content type before trying to parse JSON
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await response.text().catch(() => 'Unknown error')
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}`)
      }
      
      const error = await response.json().catch(() => ({ 
        detail: `HTTP error! status: ${response.status}` 
      }))
      throw new Error(error.detail || error.message || `HTTP error! status: ${response.status}`)
    }

    // Verify response is JSON before parsing
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      // For some endpoints (like file downloads), this might be OK
      // But for API endpoints, we expect JSON
      if (endpoint.includes('/export/') || endpoint.includes('/download/')) {
        // These might return blobs, let the caller handle it
        return response
      }
      const text = await response.text().catch(() => 'Unknown response')
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    // Re-throw with better error message
    if (error.message.includes('Authentication failed') || error.message.includes('Access forbidden')) {
      throw error
    }
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.')
    }
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
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
  getById: (id) => {
    if (!id) {
      throw new Error('Assessment ID is required')
    }
    return apiCall(`/assessments/${id}`)
  },
  create: (data) => {
    if (!data) {
      throw new Error('Assessment data is required')
    }
    return apiCall('/assessments', { method: 'POST', body: JSON.stringify(data) })
  },
  update: (id, data) => {
    if (!id) {
      throw new Error('Assessment ID is required')
    }
    if (!data) {
      throw new Error('Update data is required')
    }
    return apiCall(`/assessments/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  delete: (id) => {
    if (!id) {
      throw new Error('Assessment ID is required')
    }
    return apiCall(`/assessments/${id}`, { method: 'DELETE' })
  },
  getStudentsWithScores: (assessmentId, classId) => {
    if (!assessmentId) {
      throw new Error('Assessment ID is required')
    }
    if (!classId) {
      throw new Error('Class ID is required')
    }
    const params = new URLSearchParams()
    params.append('class_id', classId)
    return apiCall(`/assessments/${assessmentId}/students-with-scores?${params.toString()}`)
  },
}

// Assessment Scores API
export const scoresApi = {
  getByAssessment: (assessmentId, classId) => {
    if (!assessmentId) {
      throw new Error('Assessment ID is required')
    }
    const params = new URLSearchParams()
    if (classId) params.append('class_id', classId)
    const query = params.toString()
    return apiCall(`/assessments/scores/by-assessment/${assessmentId}${query ? `?${query}` : ''}`)
  },
  getByStudent: (studentId) => {
    if (!studentId) {
      throw new Error('Student ID is required')
    }
    return apiCall(`/assessments/scores/by-student/${studentId}`)
  },
  createBulk: (data) => {
    if (!data || !data.assessment_id || !data.scores || !Array.isArray(data.scores)) {
      throw new Error('Invalid data format. Expected { assessment_id, scores: [] }')
    }
    return apiCall('/assessments/scores/bulk', { method: 'POST', body: JSON.stringify(data) })
  },
  bulkImport: (data) => {
    if (!data) {
      throw new Error('Data is required')
    }
    return apiCall('/assessments/scores/bulk-import', { method: 'POST', body: JSON.stringify(data) })
  },
  update: (id, data) => {
    if (!id) {
      throw new Error('Score ID is required')
    }
    if (!data) {
      throw new Error('Update data is required')
    }
    return apiCall(`/assessments/scores/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  delete: (id) => {
    if (!id) {
      throw new Error('Score ID is required')
    }
    return apiCall(`/assessments/scores/${id}`, { method: 'DELETE' })
  },
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
  getById: (id) => {
    if (!id) {
      throw new Error('Class ID is required')
    }
    return apiCall(`/classes/${id}`)
  },
  create: (data) => {
    if (!data) {
      throw new Error('Class data is required')
    }
    return apiCall('/classes', { method: 'POST', body: JSON.stringify(data) })
  },
  delete: (id) => {
    if (!id) {
      throw new Error('Class ID is required')
    }
    return apiCall(`/classes/${id}`, { method: 'DELETE' })
  },
  getStudents: (classId) => {
    if (!classId) {
      throw new Error('Class ID is required')
    }
    return apiCall(`/classes/${classId}/students`)
  },
  addStudent: (classId, studentId) => {
    if (!classId || !studentId) {
      throw new Error('Class ID and Student ID are required')
    }
    return apiCall(`/classes/${classId}/students`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId })
    })
  },
  bulkAddStudents: (classId, data) => {
    if (!classId) {
      throw new Error('Class ID is required')
    }
    if (!data || !Array.isArray(data)) {
      throw new Error('Data must be an array')
    }
    return apiCall(`/classes/${classId}/students/bulk`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  removeStudent: (classId, studentId) => {
    if (!classId || !studentId) {
      throw new Error('Class ID and Student ID are required')
    }
    return apiCall(`/classes/${classId}/students/${studentId}`, { method: 'DELETE' })
  },
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
  getAll: () => {
    // Backend determines user from JWT token
    return apiCall('/lesson-plans')
  },
  getById: (id) => apiCall(`/lesson-plans/${id}`),
  upload: async (file, title) => {
    if (!file || !title) {
      throw new Error('File and title are required')
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    // teacher_id removed - backend gets it from JWT token
    
    try {
      const response = await apiFetch('/lesson-plans/upload', {
        method: 'POST',
        body: formData,
      })
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        throw new Error('Authentication failed. Please login again.')
      }
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          const text = await response.text().catch(() => 'Unknown error')
          throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`)
        }
        const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
        throw new Error(error.detail || `HTTP error! status: ${response.status}`)
      }
      
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error uploading lesson plan:', error)
      throw error
    }
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
  upload: async (file) => {
    if (!file) {
      throw new Error('File is required')
    }
    
    const formData = new FormData()
    formData.append('file', file)
    // teacher_id removed - backend gets it from JWT token

    try {
      const response = await apiFetch('/photo-library/upload', {
        method: 'POST',
        body: formData,
      })

      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        throw new Error('Authentication failed. Please login again.')
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          const text = await response.text().catch(() => 'Unknown error')
          throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`)
        }
        const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
        throw new Error(error.detail || `HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response')
      }

      return await response.json()
    } catch (error) {
      console.error('Error uploading photo:', error)
      throw error
    }
  },

  list: () => {
    // Backend determines user from JWT token
    return apiCall('/photo-library')
  },

  getById: (id) => apiCall(`/photo-library/${id}`),
}

// Export to PDF
export const exportApi = {
  exportMarkBookPDF: async (grade, filters) => {
    if (!grade) {
      throw new Error('Grade is required')
    }
    try {
      const response = await apiFetch(`/export/markbook/${grade}`)
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        throw new Error('Authentication failed. Please login again.')
      }
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const error = await response.json().catch(() => ({ detail: 'Failed to generate PDF' }))
          throw new Error(error.detail || 'Failed to generate PDF')
        }
        throw new Error(`Failed to generate PDF (${response.status})`)
      }
      
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
      alert(`Failed to export PDF: ${error.message}`)
      throw error
    }
  },
  exportRegisterPDF: async (grade, dateRange) => {
    if (!grade) {
      throw new Error('Grade is required')
    }
    try {
      const response = await apiFetch(`/export/attendance/${grade}`)
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        throw new Error('Authentication failed. Please login again.')
      }
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const error = await response.json().catch(() => ({ detail: 'Failed to generate PDF' }))
          throw new Error(error.detail || 'Failed to generate PDF')
        }
        throw new Error(`Failed to generate PDF (${response.status})`)
      }
      
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
      alert(`Failed to export PDF: ${error.message}`)
      throw error
    }
  },
  exportStudentProgressPDF: async (studentId) => {
    if (!studentId) {
      throw new Error('Student ID is required')
    }
    try {
      const response = await apiFetch(`/export/student/${studentId}`)
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        throw new Error('Authentication failed. Please login again.')
      }
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const error = await response.json().catch(() => ({ detail: 'Failed to generate PDF' }))
          throw new Error(error.detail || 'Failed to generate PDF')
        }
        throw new Error(`Failed to generate PDF (${response.status})`)
      }
      
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
      alert(`Failed to export PDF: ${error.message}`)
      throw error
    }
  },
}

