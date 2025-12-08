// Upload service for Supabase file uploads via backend
import { apiFetch } from "../config/api"

// Get API base URL from window.__APP_API_URL__
const getApiUrl = () => {
  return window.__APP_API_URL__ || '';
}

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
      endpoint = "/evidence/upload"
      // teacher_id removed - backend gets it from JWT token
      break
    case "lesson-plan":
      endpoint = "/lesson-plans/upload"
      // Lesson plans need title - handled separately
      break
    case "photo":
      endpoint = "/photo-library/upload"
      // teacher_id removed - backend gets it from JWT token
      break
    case "logbook":
      endpoint = "/logbook/upload-image"
      break
    default:
      // Default to photo-library upload for general files
      endpoint = "/photo-library/upload"
  }

  try {
    const response = await apiFetch(endpoint, {
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
 * Upload lesson plan with title
 * @param {File} file - The file to upload
 * @param {string} title - Lesson plan title
 * @returns {Promise<{success: boolean, path?: string, file_url?: string, error?: string}>}
 */
export async function uploadLessonPlan(file, title) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("title", title)
  // teacher_id removed - backend gets it from JWT token

  try {
    const response = await apiFetch("/lesson-plans/upload", {
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
 * Upload photo evidence
 * @param {File} file - The image file to upload
 * @returns {Promise<{success: boolean, path?: string, file_url?: string, error?: string}>}
 */
export async function uploadPhoto(file) {
  const formData = new FormData()
  formData.append("file", file)
  // teacher_id removed - backend gets it from JWT token

  try {
    const response = await apiFetch("/photo-library/upload", {
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
    const token = localStorage.getItem("auth_token");
    if (!token) {
      return {
        success: false,
        error: "Authentication required. Please login."
      };
    }

    const response = await apiFetch("/logbook/upload-image", {
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

