// API service for Mark Book & Register system
import { apiFetch } from '../config/api'

// Helper function for API calls with automatic token injection
async function apiCall(endpoint, options = {}) {
  console.log("=== API DEBUG START ===");
  console.log("ENDPOINT:", endpoint);
  console.log("OPTIONS:", { method: options.method || 'GET', hasBody: !!options.body });
  
  try {
    // Ensure endpoint is properly formatted
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    
    // Based on network logs, backend redirects FROM /classes/ TO /classes (removes trailing slash)
    // So we should NOT add trailing slashes - let fetch follow redirects automatically
    // FastAPI typically expects NO trailing slash for GET requests
    // EXCEPTION: /evidence/ endpoint requires trailing slash for list operation
    const isGetRequest = !options.method || options.method === 'GET'
    
    // Remove trailing slashes for all requests EXCEPT /evidence/
    // Backend requires trailing slash for GET /evidence/ (list evidence)
    if (cleanEndpoint.endsWith('/') && cleanEndpoint !== '/' && cleanEndpoint !== '/evidence/') {
      cleanEndpoint = cleanEndpoint.slice(0, -1)
    }
    
    // Build full URL for logging
    const apiUrl = window.__APP_API_URL__ || ''
    const cleanBase = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const fullUrl = `${cleanBase}${cleanEndpoint}`
    
    console.log("CALLING:", fullUrl);
    console.log("METHOD:", options.method || 'GET');
    
    // Check authorization token
    const token = localStorage.getItem('auth_token');
    console.log("AUTH TOKEN:", token ? `Bearer ${token.substring(0, 20)}...` : 'MISSING');
    
    const response = await apiFetch(cleanEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Let fetch automatically follow redirects (default behavior)
      redirect: 'follow',
      ...options,
    })
    
    console.log("STATUS:", response.status);
    console.log("STATUS TEXT:", response.statusText);
    console.log("HEADERS:", Object.fromEntries(response.headers.entries()));
    
    // Clone response to read text without consuming the body
    const clonedResponse = response.clone();
    const rawText = await clonedResponse.text().catch(() => '');
    
    console.log("RAW RESPONSE LENGTH:", rawText.length, "bytes");
    console.log("RAW RESPONSE (first 500 chars):", rawText.substring(0, 500));
    
    // Detect non-JSON responses (HTML, empty body, redirects)
    const contentType = response.headers.get('content-type') || '';
    console.log("CONTENT-TYPE:", contentType);
    
    // Check for redirects (even though fetch follows them, we log the final status)
    if (response.status === 307 || response.status === 308 || response.status === 301 || response.status === 302) {
      const location = response.headers.get('location');
      console.error("⚠️ REDIRECT DETECTED:", {
        status: response.status,
        location: location,
        endpoint: cleanEndpoint
      });
    }
    
    // Check for empty responses
    if (rawText.length === 0) {
      console.error("⚠️ EMPTY RESPONSE DETECTED:", fullUrl);
      throw new Error(`Empty response from ${fullUrl} (0 bytes)`);
    }
    
    // Check for HTML responses
    if (contentType.includes('text/html')) {
      console.error("⚠️ HTML RESPONSE DETECTED:", fullUrl);
      console.error("HTML CONTENT:", rawText.substring(0, 500));
      throw new Error(`HTML response received from ${fullUrl} (expected JSON)`);
    }
    
    // Handle 401 Unauthorized - token is invalid
    if (response.status === 401) {
      console.error("⚠️ 401 UNAUTHORIZED:", fullUrl);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      // Check if response is HTML (login page) instead of JSON
      if (contentType.includes('text/html')) {
        console.error("401 HTML RESPONSE:", rawText.substring(0, 500));
        throw new Error('Authentication failed. Please login again.')
      }
      try {
        const error = JSON.parse(rawText);
        console.error("401 ERROR JSON:", error);
        throw new Error(error.detail || 'Authentication failed. Please login again.')
      } catch (parseError) {
        console.error("401 PARSE ERROR:", parseError);
        throw new Error('Authentication failed. Please login again.')
      }
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      console.error("⚠️ 403 FORBIDDEN:", fullUrl);
      if (contentType.includes('text/html')) {
        console.error("403 HTML RESPONSE:", rawText.substring(0, 500));
        throw new Error('Access forbidden. You do not have permission to access this resource.')
      }
      try {
        const error = JSON.parse(rawText);
        console.error("403 ERROR JSON:", error);
        throw new Error(error.detail || 'Access forbidden')
      } catch (parseError) {
        console.error("403 PARSE ERROR:", parseError);
        throw new Error('Access forbidden')
      }
    }

    if (!response.ok) {
      console.error("⚠️ HTTP ERROR:", response.status, fullUrl);
      // Check content type before trying to parse JSON
      if (!contentType.includes('application/json')) {
        console.error("NON-JSON ERROR RESPONSE:", rawText.substring(0, 500));
        throw new Error(`Server returned non-JSON response (${response.status}): ${rawText.substring(0, 100)}`)
      }
      
      try {
        const error = JSON.parse(rawText);
        console.error("ERROR JSON:", error);
        throw new Error(error.detail || error.message || `HTTP error! status: ${response.status}`)
      } catch (parseError) {
        console.error("ERROR PARSE ERROR:", parseError);
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    }

    // Verify response is JSON before parsing
    if (!contentType.includes('application/json')) {
      // For some endpoints (like file downloads), this might be OK
      // But for API endpoints, we expect JSON
      if (endpoint.includes('/export/') || endpoint.includes('/download/')) {
        console.log("⚠️ NON-JSON RESPONSE (expected for export/download):", contentType);
        // These might return blobs, let the caller handle it
        return response
      }
      console.error("⚠️ NON-JSON RESPONSE (unexpected):", fullUrl, contentType);
      console.error("RAW CONTENT:", rawText.substring(0, 500));
      throw new Error(`Server returned non-JSON response: ${rawText.substring(0, 100)}`)
    }

    // Parse JSON
    let json;
    try {
      json = JSON.parse(rawText);
      console.log("JSON PARSED SUCCESSFULLY");
      console.log("JSON DATA TYPE:", Array.isArray(json) ? 'array' : typeof json);
      console.log("JSON DATA LENGTH:", Array.isArray(json) ? json.length : Object.keys(json || {}).length);
      console.log("JSON DATA (first 500 chars):", JSON.stringify(json).substring(0, 500));
    } catch (parseError) {
      console.error("⚠️ JSON PARSE ERROR:", parseError);
      console.error("RAW TEXT THAT FAILED TO PARSE:", rawText);
      throw new Error(`Failed to parse JSON response: ${parseError.message}`)
    }
    
    console.log("=== API DEBUG END ===");
    return json
  } catch (error) {
    console.error("=== API ERROR ===");
    console.error("ENDPOINT:", endpoint);
    console.error("ERROR:", error);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR STACK:", error.stack);
    console.error("=== API ERROR END ===");
    
    // Re-throw with better error message
    if (error.message.includes('Authentication failed') || error.message.includes('Access forbidden')) {
      throw error
    }
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.')
    }
    // Re-throw the error (don't swallow it)
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
    console.log("=== API DEBUG START (lessonPlansApi.upload) ===");
    console.log("FILE:", file?.name, file?.size, "bytes");
    console.log("TITLE:", title);
    
    if (!file || !title) {
      throw new Error('File and title are required')
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    // teacher_id removed - backend gets it from JWT token
    
      const apiUrl = window.__APP_API_URL__ || ''
      const cleanBase = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
      const fullUrl = `${cleanBase}/lesson-plans/upload`
    console.log("CALLING:", fullUrl);
    console.log("METHOD: POST");
    
    const token = localStorage.getItem('auth_token');
    console.log("AUTH TOKEN:", token ? `Bearer ${token.substring(0, 20)}...` : 'MISSING');
    
    try {
      const response = await apiFetch('/lesson-plans/upload', {
        method: 'POST',
        body: formData,
      })
      
      console.log("STATUS:", response.status);
      console.log("STATUS TEXT:", response.statusText);
      console.log("HEADERS:", Object.fromEntries(response.headers.entries()));
      
      const clonedResponse = response.clone();
      const rawText = await clonedResponse.text().catch(() => '');
      console.log("RAW RESPONSE LENGTH:", rawText.length, "bytes");
      console.log("RAW RESPONSE (first 500 chars):", rawText.substring(0, 500));
      
      const contentType = response.headers.get('content-type') || '';
      console.log("CONTENT-TYPE:", contentType);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error("⚠️ 401 UNAUTHORIZED:", fullUrl);
        localStorage.removeItem('auth_token')
        if (contentType.includes('text/html')) {
          console.error("401 HTML RESPONSE:", rawText.substring(0, 500));
          throw new Error('Authentication failed. Please login again.')
        }
        try {
          const error = JSON.parse(rawText);
          console.error("401 ERROR JSON:", error);
          throw new Error(error.detail || 'Authentication failed. Please login again.')
        } catch (parseError) {
          throw new Error('Authentication failed. Please login again.')
        }
      }
      
      if (!response.ok) {
        console.error("⚠️ HTTP ERROR:", response.status, fullUrl);
        if (!contentType.includes('application/json')) {
          console.error("NON-JSON ERROR RESPONSE:", rawText.substring(0, 500));
          throw new Error(`Server error (${response.status}): ${rawText.substring(0, 100)}`)
        }
        try {
          const error = JSON.parse(rawText);
          console.error("ERROR JSON:", error);
          throw new Error(error.detail || `HTTP error! status: ${response.status}`)
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }
      
      if (!contentType.includes('application/json')) {
        console.error("⚠️ NON-JSON RESPONSE:", fullUrl, contentType);
        console.error("RAW CONTENT:", rawText.substring(0, 500));
        throw new Error('Server returned non-JSON response')
      }
      
      const json = JSON.parse(rawText);
      console.log("JSON PARSED:", json);
      console.log("=== API DEBUG END ===");
      return json
    } catch (error) {
      console.error("=== API ERROR ===");
      console.error("ENDPOINT: /lesson-plans/upload");
      console.error("ERROR:", error);
      console.error("=== API ERROR END ===");
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
    console.log("=== API DEBUG START (photoLibraryApi.upload) ===");
    console.log("FILE:", file?.name, file?.size, "bytes");
    
    if (!file) {
      throw new Error('File is required')
    }
    
    const formData = new FormData()
    formData.append('file', file)
    // teacher_id removed - backend gets it from JWT token

      const apiUrl = window.__APP_API_URL__ || ''
      const cleanBase = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
      const fullUrl = `${cleanBase}/photo-library/upload`
    console.log("CALLING:", fullUrl);
    console.log("METHOD: POST");
    
    const token = localStorage.getItem('auth_token');
    console.log("AUTH TOKEN:", token ? `Bearer ${token.substring(0, 20)}...` : 'MISSING');

    try {
      const response = await apiFetch('/photo-library/upload', {
        method: 'POST',
        body: formData,
      })

      console.log("STATUS:", response.status);
      console.log("STATUS TEXT:", response.statusText);
      console.log("HEADERS:", Object.fromEntries(response.headers.entries()));
      
      const clonedResponse = response.clone();
      const rawText = await clonedResponse.text().catch(() => '');
      console.log("RAW RESPONSE LENGTH:", rawText.length, "bytes");
      console.log("RAW RESPONSE (first 500 chars):", rawText.substring(0, 500));
      
      const contentType = response.headers.get('content-type') || '';
      console.log("CONTENT-TYPE:", contentType);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error("⚠️ 401 UNAUTHORIZED:", fullUrl);
        localStorage.removeItem('auth_token')
        if (contentType.includes('text/html')) {
          console.error("401 HTML RESPONSE:", rawText.substring(0, 500));
          throw new Error('Authentication failed. Please login again.')
        }
        try {
          const error = JSON.parse(rawText);
          console.error("401 ERROR JSON:", error);
          throw new Error(error.detail || 'Authentication failed. Please login again.')
        } catch (parseError) {
          throw new Error('Authentication failed. Please login again.')
        }
      }

      if (!response.ok) {
        console.error("⚠️ HTTP ERROR:", response.status, fullUrl);
        if (!contentType.includes('application/json')) {
          console.error("NON-JSON ERROR RESPONSE:", rawText.substring(0, 500));
          throw new Error(`Server error (${response.status}): ${rawText.substring(0, 100)}`)
        }
        try {
          const error = JSON.parse(rawText);
          console.error("ERROR JSON:", error);
          throw new Error(error.detail || `HTTP error! status: ${response.status}`)
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      if (!contentType.includes('application/json')) {
        console.error("⚠️ NON-JSON RESPONSE:", fullUrl, contentType);
        console.error("RAW CONTENT:", rawText.substring(0, 500));
        throw new Error('Server returned non-JSON response')
      }

      const json = JSON.parse(rawText);
      console.log("JSON PARSED:", json);
      console.log("=== API DEBUG END ===");
      return json
    } catch (error) {
      console.error("=== API ERROR ===");
      console.error("ENDPOINT: /photo-library/upload");
      console.error("ERROR:", error);
      console.error("=== API ERROR END ===");
      throw error
    }
  },

  list: () => {
    // Backend determines user from JWT token
    return apiCall('/photo-library')
  },

  getById: (id) => apiCall(`/photo-library/${id}`),
}

// Evidence API
export const evidenceApi = {
  // List all evidence (GET /evidence/)
  list: () => apiCall('/evidence/'),
  
  // Get specific evidence by ID (GET /evidence/{id})
  getById: (id) => apiCall(`/evidence/${id}`),
  
  // Upload evidence (POST /evidence/upload)
  upload: async (file, metadata = {}) => {
    console.log("=== API DEBUG START (evidenceApi.upload) ===");
    const formData = new FormData()
    formData.append('file', file)
    
    // Add metadata fields if provided
    if (metadata.gp) formData.append('gp', metadata.gp)
    if (metadata.subsection) formData.append('subsection', metadata.subsection)
    if (metadata.title) formData.append('title', metadata.title)
    if (metadata.notes) formData.append('notes', metadata.notes)
    if (metadata.selectedEvidence) {
      formData.append('selectedEvidence', JSON.stringify(metadata.selectedEvidence))
    }
    
    // Get API URL and construct full URL
    let apiUrl = window.__APP_API_URL__ || '';
    
    // Check if it's still a placeholder or invalid
    if (!apiUrl || apiUrl === '%VITE_API_BASE_URL%' || apiUrl.includes('%')) {
      // Fallback to environment variable if window variable is not set
      try {
        apiUrl = import.meta.env.VITE_API_BASE_URL || '';
      } catch (e) {
        apiUrl = '';
      }
    }
    
    if (!apiUrl) {
      const errorMsg = 'API_BASE_URL is not configured. window.__APP_API_URL__ is not set.';
      console.error(errorMsg);
      console.error('window.__APP_API_URL__ =', window.__APP_API_URL__);
      throw new Error(errorMsg);
    }
    
    // Validate URL format
    try {
      new URL(apiUrl);
    } catch (e) {
      const errorMsg = `Invalid API URL: ${apiUrl}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const cleanBase = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const fullUrl = `${cleanBase}/evidence/upload`;
    console.log("=== EVIDENCE UPLOAD DEBUG ===");
    console.log("window.__APP_API_URL__ =", window.__APP_API_URL__);
    console.log("Final apiUrl =", apiUrl);
    console.log("cleanBase =", cleanBase);
    console.log("FETCH URL:", fullUrl);
    console.log("METHOD: POST");
    console.log("Expected full URL: https://bhs-appraisal-backend-production.up.railway.app/evidence/upload");
    console.log("URLs match:", fullUrl === "https://bhs-appraisal-backend-production.up.railway.app/evidence/upload");
    
    // Get auth token
    const token = localStorage.getItem('auth_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // DO NOT set Content-Type for FormData - browser will set it automatically with boundary
    
    try {
      console.log("Making fetch request to:", fullUrl);
      console.log("Headers:", headers);
      console.log("FormData keys:", Array.from(formData.keys()));
      console.log("File name:", file?.name);
      console.log("File size:", file?.size);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: headers,
        body: formData,
      }).catch((fetchError) => {
        console.error("=== FETCH ERROR ===");
        console.error("URL:", fullUrl);
        console.error("Error type:", fetchError.name);
        console.error("Error message:", fetchError.message);
        console.error("Full error:", fetchError);
        console.error("=== FETCH ERROR END ===");
        throw new Error(`Network error: ${fetchError.message}. URL: ${fullUrl}`);
      })
      
      const contentType = response.headers.get('content-type') || ''
      const rawText = await response.clone().text()
      console.log("STATUS:", response.status);
      console.log("RAW RESPONSE LENGTH:", rawText.length, "bytes");
      
      if (!response.ok) {
        console.error("⚠️ HTTP ERROR:", response.status, response.statusText);
        console.error("URL:", fullUrl);
        console.error("Response headers:", Object.fromEntries(response.headers.entries()));
        console.error("Response body (first 500 chars):", rawText.substring(0, 500));
        
        if (contentType.includes('application/json')) {
          try {
            const error = JSON.parse(rawText)
            console.error("ERROR JSON:", error);
            const errorMsg = error.detail || error.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMsg)
          } catch (parseError) {
            console.error("Failed to parse error JSON:", parseError);
            throw new Error(`HTTP ${response.status} ${response.statusText}: ${rawText.substring(0, 200)}`)
          }
        }
        throw new Error(`HTTP ${response.status} ${response.statusText}. Response: ${rawText.substring(0, 200)}`)
      }
      
      if (!contentType.includes('application/json')) {
        console.error("⚠️ NON-JSON RESPONSE:", fullUrl, contentType);
        throw new Error('Server returned non-JSON response')
      }
      
      const json = JSON.parse(rawText)
      console.log("JSON PARSED:", json);
      console.log("=== API DEBUG END ===");
      return json
    } catch (error) {
      console.error("=== API ERROR ===");
      console.error("ENDPOINT: /evidence/upload");
      console.error("ERROR:", error);
      console.error("=== API ERROR END ===");
      throw error
    }
  },
  
  // Update evidence (PUT /evidence/{id})
  update: (id, data) => apiCall(`/evidence/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Delete evidence (DELETE /evidence/{id})
  delete: (id) => apiCall(`/evidence/${id}`, { method: 'DELETE' }),
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

