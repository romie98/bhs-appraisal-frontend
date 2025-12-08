import { useState, useEffect } from 'react'
import { evidenceSchema } from '../data/evidenceSchema'
import { evidenceApi } from '../services/markbookApi'
import GPAccordion from '../components/GPAccordion'

// Fetch evidence from backend API
async function fetchEvidence() {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    console.warn("No auth token found");
    return [];
  }
  
  const apiUrl = window.__APP_API_URL__ || '';
  if (!apiUrl) {
    throw new Error('API_BASE_URL is not configured');
  }
  const cleanBase = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
  const fullUrl = `${cleanBase}/evidence/`;
  
  try {
    const response = await fetch(fullUrl, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`Failed to fetch evidence: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return [];
  }
}

function GPPage({ gpCode }) {
  const [evidenceData, setEvidenceData] = useState({})
  const [editingEvidence, setEditingEvidence] = useState(null)
  const [loading, setLoading] = useState(true)

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

  // Load evidence for this GP from backend
  useEffect(() => {
    const loadEvidence = async () => {
      setLoading(true);
      try {
        const allEvidence = await fetchEvidence();
        const subsections = evidenceSchema.filter(item => item.gp === gp)
        const evidenceMap = {}
        
        subsections.forEach(subsection => {
          // Filter evidence by GP and subsection
          const evidence = allEvidence.filter(item => 
            item.gp === gp && item.subsection === subsection.subsection
          );
          evidenceMap[subsection.subsection] = evidence
        })
        
        setEvidenceData(evidenceMap)
      } catch (error) {
        console.error('Error loading evidence:', error);
        setEvidenceData({});
      } finally {
        setLoading(false);
      }
    }

    loadEvidence();
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
            onDelete={async (evidenceId) => {
              if (window.confirm('Are you sure you want to delete this evidence?')) {
                try {
                  await evidenceApi.delete(evidenceId);
                  // Reload evidence after deletion
                  const allEvidence = await fetchEvidence();
                  const subsections = evidenceSchema.filter(item => item.gp === gp)
                  const evidenceMap = {}
                  subsections.forEach(subsection => {
                    const evidence = allEvidence.filter(item => 
                      item.gp === gp && item.subsection === subsection.subsection
                    );
                    evidenceMap[subsection.subsection] = evidence
                  })
                  setEvidenceData(evidenceMap)
                } catch (error) {
                  console.error('Error deleting evidence:', error);
                  alert('Failed to delete evidence. Please try again.');
                }
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

