import { useState, useEffect } from 'react'
import { evidenceSchema } from '../data/evidenceSchema'
import { getEvidenceByGPAndSubsectionSync, loadEvidenceStore, saveEvidenceToStore } from '../utils/evidenceStore'
import GPAccordion from '../components/GPAccordion'

function GPPage({ gpCode }) {
  const [evidenceData, setEvidenceData] = useState({})
  const [editingEvidence, setEditingEvidence] = useState(null)

  // GP titles mapping
  const gpTitles = {
    'GP 1': 'Teacher Knows the Subject Content',
    'GP 2': 'Teacher Knows How to Teach',
    'GP 3': 'Classroom Management & Diversity',
    'GP 4': 'Professional Development',
    'GP 5': 'Parents & Community',
    'GP 6': 'Professional Conduct'
  }

  // Normalize gpCode (accept "GP 1", "GP1", or number)
  const gp = gpCode?.startsWith('GP') ? gpCode : `GP ${gpCode || 1}`
  const gpTitle = gpTitles[gp] || `${gp} Standards`

  // Load evidence for this GP
  useEffect(() => {
    const loadEvidence = () => {
      const subsections = evidenceSchema.filter(item => item.gp === gp)
      const evidenceMap = {}
      
      subsections.forEach(subsection => {
        const evidence = getEvidenceByGPAndSubsectionSync(gp, subsection.subsection)
        evidenceMap[subsection.subsection] = evidence
      })
      
      setEvidenceData(evidenceMap)
    }

    loadEvidence()

    // Listen for store updates
    const handleStoreUpdate = () => {
      loadEvidence()
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('evidenceStoreUpdated', handleStoreUpdate)
      return () => window.removeEventListener('evidenceStoreUpdated', handleStoreUpdate)
    }
  }, [gp])

  // Get all subsections for this GP
  const subsections = evidenceSchema.filter(item => item.gp === gp)

  // Group subsections by their subsection number for better organization
  const groupedSubsections = subsections.map(subsection => ({
    ...subsection,
    evidenceItems: evidenceData[subsection.subsection] || []
  }))

  return (
    <div className="max-w-7xl mx-auto" style={{ overflow: 'visible', position: 'relative' }}>
      <div className="mb-8 bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
          {gp} — {gpTitle}
        </h1>
        <p className="text-base text-gray-600">
          {subsections.length} {subsections.length === 1 ? 'subsection' : 'subsections'} • {' '}
          {Object.values(evidenceData).flat().length} {Object.values(evidenceData).flat().length === 1 ? 'evidence item' : 'evidence items'}
        </p>
      </div>

      <div className="space-y-4" style={{ overflow: 'visible' }}>
        {groupedSubsections.map((subsection) => (
          <GPAccordion
            key={subsection.id}
            subsection={subsection.subsection}
            title={subsection.title}
            description={subsection.description}
            evidenceItems={subsection.evidenceItems}
            schema={subsection}
            onEdit={(evidence) => {
              setEditingEvidence(evidence)
              // TODO: Open edit modal or navigate to edit page
              console.log('Edit evidence:', evidence)
            }}
            onDelete={(evidenceId) => {
              if (window.confirm('Are you sure you want to delete this evidence?')) {
                const store = loadEvidenceStore()
                const updatedStore = store.filter(item => item.id !== evidenceId)
                localStorage.setItem('localEvidenceStore', JSON.stringify(updatedStore, null, 2))
                window.dispatchEvent(new CustomEvent('evidenceStoreUpdated', { detail: updatedStore }))
              }
            }}
          />
        ))}
      </div>

      {subsections.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No subsections found for {gp}</p>
        </div>
      )}
    </div>
  )
}

export default GPPage

