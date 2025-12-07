import { CLIENT_ID, API_KEY, SCOPES } from '../config/googleConfig'

let accessToken = null

// 1) Initialize token client
export function initTokenClient() {
  if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
    throw new Error('Google Identity Services not loaded. Please ensure the script is included in your HTML.')
  }

  return window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      accessToken = tokenResponse.access_token
      console.log('Access token acquired:', accessToken)
    },
  })
}

// 2) Request access token
export async function requestAccessToken(tokenClient) {
  return new Promise((resolve, reject) => {
    tokenClient.callback = (tokenResponse) => {
      if (tokenResponse.error) {
        reject(tokenResponse)
      } else {
        accessToken = tokenResponse.access_token
        resolve(accessToken)
      }
    }

    tokenClient.requestAccessToken()
  })
}

// 3) Ensure target folder exists
export async function ensurePortfolioFolder() {
  if (!accessToken) {
    throw new Error('Not authenticated. Please sign in first.')
  }

  const query = encodeURIComponent(
    "name = 'Teacher Portfolio Evidence' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
  )

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Failed to search for folder: ${res.statusText}`)
  }

  const data = await res.json()

  if (data.files && data.files.length > 0) {
    return data.files[0].id
  }

  // create folder
  const folderMetadata = {
    name: 'Teacher Portfolio Evidence',
    mimeType: 'application/vnd.google-apps.folder',
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(folderMetadata),
  })

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({ error: 'Folder creation failed' }))
    throw new Error(errorData.error?.message || `Failed to create folder: ${createRes.statusText}`)
  }

  const folderData = await createRes.json()
  return folderData.id
}

// 4) Upload a file to Google Drive
export async function uploadToDrive(file, folderId) {
  if (!accessToken) {
    throw new Error('Not authenticated. Please sign in first.')
  }

  const metadata = {
    name: file.name,
    parents: [folderId],
  }

  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const fileContent = await file.arrayBuffer()
  const base64Data = btoa(
    new Uint8Array(fileContent).reduce((data, byte) => data + String.fromCharCode(byte), '')
  )

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: ' +
    file.type +
    '\r\n' +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    base64Data +
    closeDelimiter

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(errorData.error?.message || `Upload failed: ${res.statusText}`)
  }

  const result = await res.json()

  // Get viewable link
  const permissionRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${result.id}/permissions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    }
  )

  if (!permissionRes.ok) {
    console.warn('Failed to set file permissions, but file was uploaded')
  }

  const linksRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${result.id}?fields=webViewLink,webContentLink`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!linksRes.ok) {
    throw new Error(`Failed to get file links: ${linksRes.statusText}`)
  }

  const linkData = await linksRes.json()
  return {
    id: result.id,
    webViewLink: linkData.webViewLink,
    downloadLink: linkData.webContentLink,
  }
}

// Helper function to check if user is signed in
export function isSignedIn() {
  return accessToken !== null
}

// Helper function to get access token
export function getAccessToken() {
  return accessToken
}

// Helper function to sign out (clear token)
export function signOut() {
  accessToken = null
}

