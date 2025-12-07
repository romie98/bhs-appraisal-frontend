// Profile data storage utility
// Uses localStorage in browser, fs in Node.js (Cursor environment)

const STORAGE_KEY = 'teacherProfile'
const FILE_PATH = './src/data/teacherProfile.json' // For Cursor's Node.js environment

// Check if we're in Node.js environment (Cursor)
const isNode = typeof window === 'undefined'

export function loadProfile() {
  try {
    if (isNode) {
      // Node.js environment (Cursor)
      const fs = require('fs')
      if (fs.existsSync(FILE_PATH)) {
        const data = fs.readFileSync(FILE_PATH, 'utf8')
        return JSON.parse(data)
      }
      return getDefaultProfile()
    } else {
      // Browser environment
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      return getDefaultProfile()
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    return getDefaultProfile()
  }
}

export function saveProfile(profileData) {
  try {
    if (isNode) {
      // Node.js environment (Cursor)
      const fs = require('fs')
      const path = require('path')
      const dir = path.dirname(FILE_PATH)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(FILE_PATH, JSON.stringify(profileData, null, 2), 'utf8')
    } else {
      // Browser environment
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData))
    }
    return true
  } catch (error) {
    console.error('Error saving profile:', error)
    return false
  }
}

function getDefaultProfile() {
  return {
    name: '',
    profilePicture: null, // base64 string or URL
    qualifications: '',
    description: ''
  }
}

export function getProfileJSON() {
  return JSON.stringify(loadProfile(), null, 2)
}








