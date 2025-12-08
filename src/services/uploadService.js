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
  
  // Handle evidence upload separately with direct fetch
  if (type === "evidence") {
    const apiUrl = window.__APP_API_URL__ || '';
    if (!apiUrl) {
      return {
        success: false,
        error: 'API_BASE_URL is not configured'
      };
    }
    const cleanApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const fullUrl = `${cleanApiUrl}/evidence/upload`;
    const token = localStorage.getItem('auth_token');
    
    console.log("=== EVIDENCE UPLOAD (uploadService) ===");
    console.log("apiUrl =", apiUrl);
    console.log("cleanApiUrl =", cleanApiUrl);
    console.log("fullUrl =", fullUrl);
    
    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
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
        path: data.path || data.file_path,
        file_url: data.file_url || data.signed_url || data.url,
        signed_url: data.file_url || data.signed_url || data.url,
        supabase_url: data.supabase_url || data.file_url || data.signed_url || data.url,
        ...data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Network error during upload"
      }
    }
  }
  
  // Handle photo upload separately with direct fetch (like evidence)
  if (type === "photo") {
    // Use the uploadPhoto function we already defined
    return await uploadPhoto(file);
  }
  
  // Map other upload types to backend endpoints
  let endpoint = ""
  switch (type) {
    case "lesson-plan":
      endpoint = "/lesson-plans/upload"
      // Lesson plans need title - handled separately
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

  // Get API URL - ensure we use window.__APP_API_URL__ (Railway backend)
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
    return {
      success: false,
      error: 'API_BASE_URL is not configured. window.__APP_API_URL__ is not set.'
    };
  }
  
  // Remove trailing slash from apiUrl if present
  const cleanBase = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
  const fullUrl = `${cleanBase}/photo-library/upload`;
  
  console.log("=== PHOTO UPLOAD (uploadService) ===");
  console.log("window.__APP_API_URL__ =", window.__APP_API_URL__);
  console.log("apiUrl =", apiUrl);
  console.log("cleanBase =", cleanBase);
  console.log("UPLOAD URL:", fullUrl);
  
  const token = localStorage.getItem('auth_token');
  
  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
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
    
    // Clean Supabase URLs by trimming trailing '?'
    if (data.supabase_url && typeof data.supabase_url === 'string') {
      data.supabase_url = data.supabase_url.replace(/\?+$/, '')
    }
    
    return {
      success: true,
      path: data.file_path || data.supabase_path,
      file_url: data.file_url || data.supabase_url,
      signed_url: data.file_url || data.supabase_url,
      supabase_url: data.supabase_url || data.file_url,
      supabase_path: data.supabase_path,
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

