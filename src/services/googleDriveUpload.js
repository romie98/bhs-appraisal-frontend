import { loadGapiInsideDOM } from 'gapi-script'
import { CLIENT_ID, API_KEY, SCOPES, DISCOVERY_DOCS } from '../config/googleDriveConfig'

// Access gapi from window object after loading
const getGapi = () => window.gapi

let isInitialized = false
let isSignedIn = false

/**
 * Initialize Google Drive API
 * Loads gapi client and optionally authenticates user
 * @param {boolean} autoSignIn - Whether to automatically sign in if not already signed in
 * @returns {Promise<boolean>} - Returns true if initialization successful
 */
export async function initGoogleDrive(autoSignIn = true) {
  try {
    // Load gapi script
    await loadGapiInsideDOM()
    
    const gapi = getGapi()
    
    // Load the gapi client
    await new Promise((resolve) => {
      gapi.load('client:auth2', resolve)
    })

    // Initialize the API client
    await gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    })

    isInitialized = true

    // Check if user is already signed in
    const authInstance = gapi.auth2.getAuthInstance()
    isSignedIn = authInstance.isSignedIn.get()

    // If not signed in and autoSignIn is true, sign in the user
    if (!isSignedIn && autoSignIn) {
      await authInstance.signIn()
      isSignedIn = true
    }

    return true
  } catch (error) {
    console.error('Error initializing Google Drive:', error)
    throw new Error(`Failed to initialize Google Drive: ${error.message}`)
  }
}

/**
 * Check if user is signed in, if not, sign them in
 * @returns {Promise<boolean>}
 */
async function ensureSignedIn() {
  if (!isInitialized) {
    await initGoogleDrive()
  }

  const gapi = getGapi()
  const authInstance = gapi.auth2.getAuthInstance()
  if (!authInstance.isSignedIn.get()) {
    await authInstance.signIn()
    isSignedIn = true
  }

  return true
}

/**
 * Create a folder in Google Drive if it doesn't exist
 * @param {string} folderName - Name of the folder to create
 * @param {string} parentFolderId - Optional parent folder ID
 * @returns {Promise<Object>} - Folder object with id, name, webViewLink, webContentLink
 */
export async function createFolderIfNotExists(folderName, parentFolderId = null) {
  try {
    await ensureSignedIn()

    const gapi = getGapi()

    // First, check if folder already exists
    let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`
    } else {
      query += ` and 'root' in parents`
    }

    const response = await gapi.client.drive.files.list({
      q: query,
      fields: 'files(id, name, webViewLink)',
      spaces: 'drive'
    })

    // If folder exists, return it
    if (response.result.files && response.result.files.length > 0) {
      const folder = response.result.files[0]
      return {
        id: folder.id,
        name: folder.name,
        webViewLink: folder.webViewLink,
        webContentLink: null // Folders don't have webContentLink
      }
    }

    // Create new folder
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    }

    if (parentFolderId) {
      folderMetadata.parents = [parentFolderId]
    }

    const createResponse = await gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id, name, webViewLink'
    })

    return {
      id: createResponse.result.id,
      name: createResponse.result.name,
      webViewLink: createResponse.result.webViewLink,
      webContentLink: null // Folders don't have webContentLink
    }
  } catch (error) {
    console.error('Error creating folder:', error)
    throw new Error(`Failed to create folder: ${error.message}`)
  }
}

/**
 * Upload a file to Google Drive
 * @param {File} file - The file to upload
 * @param {string} folderId - Optional folder ID to upload to
 * @returns {Promise<Object>} - File object with id, name, webViewLink, webContentLink
 */
export async function uploadFileToDrive(file, folderId = null) {
  try {
    await ensureSignedIn()

    const gapi = getGapi()

    // Create file metadata
    const fileMetadata = {
      name: file.name
    }

    if (folderId) {
      fileMetadata.parents = [folderId]
    }

    // Convert file to base64 for upload
    const reader = new FileReader()
    const fileContent = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result.split(',')[1]) // Remove data:type;base64, prefix
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    // Create the file using gapi.client.drive.files.create()
    const boundary = '-------314159265358979323846'
    const delimiter = `\r\n--${boundary}\r\n`
    const closeDelim = `\r\n--${boundary}--`

    const metadata = JSON.stringify(fileMetadata)
    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      metadata +
      delimiter +
      'Content-Type: ' + file.type + '\r\n' +
      'Content-Transfer-Encoding: base64\r\n' +
      '\r\n' +
      fileContent +
      closeDelim

    const request = gapi.client.request({
      path: 'https://www.googleapis.com/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart', fields: 'id, name, webViewLink, webContentLink' },
      headers: {
        'Content-Type': `multipart/related; boundary="${boundary}"`
      },
      body: multipartRequestBody
    })

    const response = await request

    return {
      id: response.result.id,
      name: response.result.name,
      webViewLink: response.result.webViewLink,
      webContentLink: response.result.webContentLink
    }
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }
}

/**
 * Sign out from Google Drive
 * @returns {Promise<void>}
 */
export async function signOut() {
  try {
    if (isInitialized) {
      const gapi = getGapi()
      const authInstance = gapi.auth2.getAuthInstance()
      await authInstance.signOut()
      isSignedIn = false
    }
  } catch (error) {
    console.error('Error signing out:', error)
    throw new Error(`Failed to sign out: ${error.message}`)
  }
}

/**
 * Check if user is currently signed in
 * @returns {boolean}
 */
export function isSignedInToGoogle() {
  if (!isInitialized) {
    return false
  }
  
  try {
    const gapi = getGapi()
    const authInstance = gapi.auth2.getAuthInstance()
    isSignedIn = authInstance.isSignedIn.get()
    return isSignedIn
  } catch (error) {
    console.error('Error checking sign-in status:', error)
    return false
  }
}

/**
 * Get current user information
 * @returns {Promise<Object|null>} - User object with name, email, imageUrl, or null if not signed in
 */
export async function getCurrentUser() {
  try {
    if (!isInitialized) {
      await initGoogleDrive(false)
    }

    const gapi = getGapi()
    const authInstance = gapi.auth2.getAuthInstance()
    
    if (!authInstance.isSignedIn.get()) {
      return null
    }

    const user = authInstance.currentUser.get()
    const profile = user.getBasicProfile()
    
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl(),
      givenName: profile.getGivenName(),
      familyName: profile.getFamilyName()
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

