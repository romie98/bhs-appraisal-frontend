import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { evidenceSchema } from '../data/evidenceSchema'
import { evidenceApi } from '../services/markbookApi'
import GPAccordion from '../components/GPAccordion'

function GPPage({ gpCode }) {
  const queryClient = useQueryClient()

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

  // Fetch all evidence from backend using React Query
  const { data: allEvidence = [], isLoading, refetch } = useQuery({
    queryKey: ['evidence', 'all'],
    queryFn: () => evidenceApi.list(),
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  })

  // Group evidence by subsection for this GP
  const evidenceData = useMemo(() => {
    const subsections = evidenceSchema.filter(item => item.gp === gp)
    const evidenceMap = {}
    
    subsections.forEach(subsection => {
      // Construct current subsection code in format "GP 1.1"
      const currentSubsection = `${gp} ${subsection.subsection}`.trim()
      
      // Filter evidence by GP and subsection
      // Also include items with gp_section === null if they match this GP and subsection
      // Backend may return gp as "GP 1" or "GP1", normalize for comparison
      const evidence = allEvidence.filter(item => {
        // Match by gp_section (format: "GP 1.1") - primary method
        if (item.gp_section === currentSubsection) {
          return true
        }
        
        // For items with null gp_section, match by GP and subsection separately
        // Only show if BOTH GP and subsection are present and match
        if (item.gp_section === null || item.gp_section === undefined) {
          const itemGP = item.gp || ''
          const itemSubsection = item.subsection || ''
          
          // Require both GP and subsection to be present
          if (!itemGP || !itemSubsection) {
            return false
          }
          
          const normalizedItemGP = itemGP.trim()
          const normalizedGP = gp.trim()
          const normalizedItemSubsection = itemSubsection.trim()
          const normalizedSubsection = subsection.subsection.trim()
          
          // Only show if GP matches AND subsection matches exactly
          return normalizedItemGP === normalizedGP && normalizedItemSubsection === normalizedSubsection
        }
        
        // Fallback: match by GP and subsection separately (for backward compatibility)
        const itemGP = item.gp || ''
        const itemSubsection = item.subsection || ''
        
        if (!itemGP || !itemSubsection) {
          return false
        }
        
        const normalizedItemGP = itemGP.trim()
        const normalizedGP = gp.trim()
        const normalizedItemSubsection = itemSubsection.trim()
        const normalizedSubsection = subsection.subsection.trim()
        
        return normalizedItemGP === normalizedGP && normalizedItemSubsection === normalizedSubsection
      })
      evidenceMap[subsection.subsection] = evidence
    })
    
    return evidenceMap
  }, [allEvidence, gp])

  // Get all subsections for this GP
  const subsections = evidenceSchema.filter(item => item.gp === gp)

  // Group subsections by their subsection number for better organization
  const groupedSubsections = subsections.map(subsection => ({
    ...subsection,
    evidenceItems: evidenceData[subsection.subsection] || []
  }))

  // Handle evidence deletion with refetch
  const handleDelete = async (evidenceId) => {
    if (window.confirm('Are you sure you want to delete this evidence?')) {
      try {
        await evidenceApi.delete(evidenceId)
        // Invalidate and refetch evidence
        queryClient.invalidateQueries({ queryKey: ['evidence', 'all'] })
        await refetch()
      } catch (error) {
        console.error('Error deleting evidence:', error)
        alert('Failed to delete evidence. Please try again.')
      }
    }
  }

  // Handle evidence saved - refetch the list
  const handleEvidenceSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['evidence', 'all'] })
    refetch()
  }

  return (
    <div className="max-w-7xl mx-auto" style={{ overflow: 'visible', position: 'relative' }}>
      <div className="mb-8 bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
          {gp} — {gpTitle}
        </h1>
        <p className="text-base text-gray-600">
          {subsections.length} {subsections.length === 1 ? 'subsection' : 'subsections'} • {' '}
          {isLoading ? 'Loading...' : (
            <>
              {Object.values(evidenceData).flat().length} {Object.values(evidenceData).flat().length === 1 ? 'evidence item' : 'evidence items'}
            </>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Loading evidence...</p>
        </div>
      ) : (
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
                // TODO: Open edit modal or navigate to edit page
                console.log('Edit evidence:', evidence)
              }}
              onDelete={handleDelete}
              onEvidenceSaved={handleEvidenceSaved}
            />
          ))}
        </div>
      )}

      {subsections.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No subsections found for {gp}</p>
        </div>
      )}
    </div>
  )
}

export default GPPage

