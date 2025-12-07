// Service for managing local evidence store
// Uses Node fs in development (Cursor), localStorage in browser
// Includes example local file path for evidence from that source

const PATH = './src/data/localEvidenceStore.json'
const STORAGE_KEY = 'localEvidenceStore'
const EXAMPLE_LOCAL_PATH = '/mnt/data/Beginning Teachers Appraisal (Mar. 31, 2020).pdf'

// Check if we're in Node.js environment
const isNode = typeof window === 'undefined' && typeof process !== 'undefined' && typeof require !== 'undefined'

// Lazy load fs and path only in Node environment
let fs, path
if (isNode) {
  try {
    fs = require('fs')
    path = require('path')
  } catch (e) {
    // fs not available
  }
}

/**
 * Load evidence from file (Node) or localStorage (browser)
 * @returns {Promise<Array>} - Array of evidence metadata
 */
export async function loadEvidence() {
  try {
    if (isNode) {
      // Node.js environment - use fs
      try {
        const filePath = path.resolve(PATH)
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8')
          return JSON.parse(fileContent)
        }
        return []
      } catch (error) {
        console.error('Error reading evidence file:', error)
        return []
      }
    } else {
      // Browser environment - use localStorage
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      return []
    }
  } catch (error) {
    console.error('Error loading evidence:', error)
    return []
  }
}

/**
 * Save evidence item to store
 * @param {Object} item - Evidence metadata object
 * @returns {Promise<Array>} - Updated store
 */
export async function saveEvidence(item) {
  try {
    // Add example local path if item comes from that source
    // This is a placeholder - in real implementation, you'd check the source
    if (!item.localPath && !item.driveFileId) {
      // If no file source specified, use example path
      item.localPath = EXAMPLE_LOCAL_PATH
    }

    const store = await loadEvidence()
    store.push(item)

    if (isNode) {
      // Node.js environment - write to file
      const filePath = path.resolve(PATH)
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8')
    } else {
      // Browser environment - save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store, null, 2))
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('evidenceStoreUpdated', { detail: store }))
    }

    return store
  } catch (error) {
    console.error('Error saving evidence:', error)
    throw error
  }
}

/**
 * Get evidence by GP code
 * @param {string} gpCode - The GP code (e.g., "GP 1", "GP 2")
 * @returns {Promise<Array>} - Array of evidence metadata for that GP
 */
export async function getEvidenceByGP(gpCode) {
  try {
    const store = await loadEvidence()
    // Normalize GP code format
    const normalizedGP = gpCode.replace(/\s/g, ' ').trim()
    return store.filter(item => {
      if (!item.gp) return false
      const itemGP = item.gp.replace(/\s/g, ' ').trim()
      return itemGP === normalizedGP || itemGP.startsWith(normalizedGP)
    })
  } catch (error) {
    console.error('Error getting evidence by GP:', error)
    return []
  }
}

/**
 * Get evidence by GP and subsection
 * @param {string} gp - The GP (e.g., 'GP 1')
 * @param {string} subsection - The subsection (e.g., '1.1')
 * @returns {Promise<Array>} - Array of evidence metadata
 */
export async function getEvidenceByGPAndSubsection(gp, subsection) {
  try {
    const store = await loadEvidence()
    return store.filter(item => {
      return item.gp === gp && item.subsection === subsection
    })
  } catch (error) {
    console.error('Error getting evidence by GP and subsection:', error)
    return []
  }
}

// Synchronous versions for backward compatibility (use localStorage in browser)
export function loadEvidenceStore() {
  try {
    if (isNode) {
      try {
        const filePath = path.resolve(PATH)
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8')
          return JSON.parse(fileContent)
        }
        return []
      } catch (error) {
        console.error('Error reading evidence file:', error)
        return []
      }
    } else {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      return []
    }
  } catch (error) {
    console.error('Error loading evidence store:', error)
    return []
  }
}

export function saveEvidenceToStore(metadata) {
  try {
    // Add example local path if no file source specified
    if (!metadata.localPath && !metadata.driveFileId) {
      metadata.localPath = EXAMPLE_LOCAL_PATH
    }

    const store = loadEvidenceStore()
    store.push(metadata)

    if (isNode) {
      const filePath = path.resolve(PATH)
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8')
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store, null, 2))
      window.dispatchEvent(new CustomEvent('evidenceStoreUpdated', { detail: store }))
    }

    return store
  } catch (error) {
    console.error('Error saving evidence to store:', error)
    throw error
  }
}

export function getEvidenceByGPAndSubsectionSync(gp, subsection) {
  const store = loadEvidenceStore()
  return store.filter(item => {
    return item.gp === gp && item.subsection === subsection
  })
}
