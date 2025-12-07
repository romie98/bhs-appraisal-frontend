// Service for managing local evidence store
// Uses localStorage to persist data, can be exported as JSON

const STORAGE_KEY = 'localEvidenceStore'

/**
 * Load evidence store from localStorage
 * @returns {Array} - Array of evidence metadata
 */
export function loadEvidenceStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return []
  } catch (error) {
    console.error('Error loading evidence store:', error)
    return []
  }
}

/**
 * Save evidence metadata to store
 * @param {Object} metadata - Evidence metadata object
 * @returns {void}
 */
export function saveEvidenceToStore(metadata) {
  try {
    const store = loadEvidenceStore()
    
    // Add new metadata entry
    store.push(metadata)
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store, null, 2))
    
    return store
  } catch (error) {
    console.error('Error saving evidence to store:', error)
    throw error
  }
}

/**
 * Get all evidence for a specific GP standard
 * @param {string} standardId - The standard ID (e.g., 'gp1.1')
 * @returns {Array} - Array of evidence metadata for that standard
 */
export function getEvidenceByStandard(standardId) {
  const store = loadEvidenceStore()
  return store.filter(item => item.standardId === standardId)
}

/**
 * Get all evidence for a GP category
 * @param {string} gpCategory - The GP category (e.g., 'GP1')
 * @returns {Array} - Array of evidence metadata for that GP
 */
export function getEvidenceByGP(gpCategory) {
  const store = loadEvidenceStore()
  return store.filter(item => item.gp && item.gp.startsWith(gpCategory))
}

/**
 * Export evidence store as JSON file
 * @returns {void}
 */
export function exportEvidenceStoreAsJSON() {
  try {
    const store = loadEvidenceStore()
    const jsonString = JSON.stringify(store, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'localEvidenceStore.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting evidence store:', error)
    throw error
  }
}

/**
 * Import evidence store from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Array>} - Imported evidence store
 */
export async function importEvidenceStoreFromJSON(file) {
  try {
    const text = await file.text()
    const store = JSON.parse(text)
    
    // Validate structure
    if (!Array.isArray(store)) {
      throw new Error('Invalid store format: expected an array')
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store, null, 2))
    
    return store
  } catch (error) {
    console.error('Error importing evidence store:', error)
    throw error
  }
}

/**
 * Clear all evidence from store
 * @returns {void}
 */
export function clearEvidenceStore() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Get total count of evidence items
 * @returns {number}
 */
export function getEvidenceCount() {
  return loadEvidenceStore().length
}


