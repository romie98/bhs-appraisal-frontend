// Upload service for Supabase file uploads via backend
import { apiUrl } from "../config/api"

/**
 * Upload a file to the backend, which handles Supabase storage
 * @param {File} file - The file to upload
 * @param {string} type - Upload type: "evidence", "lesson-plan", "photo", "logbook", or "general"
 * @returns {Promise<{success: boolean, path?: string, file_url?: string, signed_url?: string, error?: string}>}
 */
export async function uploadFile(file, type = "general") {
  const formData = new FormData()
  formData.append("file", file)

  let endpoint = ""
  
  // Map upload types to backend endpoints
  switch (type) {
    case "evidence":
      endpoint = "/photo-library/upload"
      // Evidence uses photo-library endpoint but needs teacher_id
      // We'll need to get this from context/auth
      const teacherId = 'default-teacher-id' // TODO: Get from auth context
      formData.append("teacher_id", teacherId)
      break
    case "lesson-plan":
      endpoint = "/lesson-plans/upload"
      // Lesson plans need title and teacher_id - handled separately
      break
    case "photo":
      endpoint = "/photo-library/upload"
      const photoTeacherId = 'default-teacher-id' // TODO: Get from auth context
      formData.append("teacher_id", photoTeacherId)
      break
    case "logbook":
      endpoint = "/logbook/upload-image"
      break
    default:
      endpoint = "/upload" // General upload (if exists)
  }

  try {
    const response = await fetch(apiUrl(endpoint), {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
      return {
        success: false,
        error: error.detail || error.error || `HTTP error! status: ${response.status}`
      }
    }

    const data = await response.json()
    
    // Backend returns different formats, normalize them
    return {
      success: true,
      path: data.path || data.file_path,
      file_url: data.file_url || data.signed_url || data.url,
      signed_url: data.file_url || data.signed_url || data.url,
      ...data // Include any other fields (id, ocr_text, etc.)
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "Network error during upload"
    }
  }
}

/**
 * Upload lesson plan with title and teacher ID
 * @param {File} file - The file to upload
 * @param {string} title - Lesson plan title
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<{success: boolean, path?: string, file_url?: string, error?: string}>}
 */
export async function uploadLessonPlan(file, title, teacherId) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("title", title)
  formData.append("teacher_id", teacherId)

  try {
    const response = await fetch(apiUrl("/lesson-plans/upload"), {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
      return {
        success: false,
        error: error.detail || error.error || `HTTP error! status: ${response.status}`
      }
    }

    const data = await response.json()
    
    return {
      success: true,
      path: data.file_path,
      file_url: data.file_url,
      signed_url: data.file_url,
      id: data.id,
      ...data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "Network error during upload"
    }
  }
}

/**
 * Upload photo evidence with teacher ID
 * @param {File} file - The image file to upload
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<{success: boolean, path?: string, file_url?: string, error?: string}>}
 */
export async function uploadPhoto(file, teacherId) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("teacher_id", teacherId)

  try {
    const response = await fetch(apiUrl("/photo-library/upload"), {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
      return {
        success: false,
        error: error.detail || error.error || `HTTP error! status: ${response.status}`
      }
    }

    const data = await response.json()
    
    return {
      success: true,
      path: data.file_path,
      file_url: data.file_url,
      signed_url: data.file_url,
      id: data.id,
      ...data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "Network error during upload"
    }
  }
}

/**
 * Upload logbook image
 * @param {File} file - The image file to upload
 * @returns {Promise<{success: boolean, path?: string, file_url?: string, error?: string}>}
 */
export async function uploadLogbookImage(file) {
  const formData = new FormData()
  formData.append("file", file)

  try {
    const response = await fetch(apiUrl("/logbook/upload-image"), {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
      return {
        success: false,
        error: error.detail || error.error || `HTTP error! status: ${response.status}`
      }
    }

    const data = await response.json()
    
    return {
      success: true,
      path: data.path,
      file_url: data.file_url || data.signed_url,
      signed_url: data.file_url || data.signed_url,
      ...data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "Network error during upload"
    }
  }
}

