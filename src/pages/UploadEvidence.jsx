import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { evidenceSchema } from '../data/evidenceSchema'
import { FileText, ArrowRight, Clock } from 'lucide-react'

// Fetch evidence from backend API
async function fetchEvidence() {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    console.warn("No auth token found");
    return [];
  }
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evidence/`, {
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

function UploadEvidence() {
  const navigate = useNavigate()
  const [gpStats, setGpStats] = useState({})
  const [loading, setLoading] = useState(true)

  // GP category titles
  const gpTitles = {
    'GP 1': 'Teacher Knows the Subject Content',
    'GP 2': 'Teacher Knows How to Teach',
    'GP 3': 'Classroom Management & Diversity',
    'GP 4': 'Professional Development',
    'GP 5': 'Parents & Community',
    'GP 6': 'Professional Conduct'
  }

  // GP colors for cards
  const gpColors = {
    'GP 1': 'bg-sky-50 border-sky-200 text-sky-700',
    'GP 2': 'bg-blue-50 border-blue-200 text-blue-700',
    'GP 3': 'bg-indigo-50 border-indigo-200 text-indigo-700',
    'GP 4': 'bg-purple-50 border-purple-200 text-purple-700',
    'GP 5': 'bg-pink-50 border-pink-200 text-pink-700',
    'GP 6': 'bg-rose-50 border-rose-200 text-rose-700'
  }

  // Load GP statistics from backend
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const allEvidence = await fetchEvidence();
        const stats = {}

        Object.keys(gpTitles).forEach(gp => {
          const evidence = allEvidence.filter(item => item.gp === gp);
          const subsections = evidenceSchema.filter(item => item.gp === gp)
          
          // Get last upload date
          const sortedEvidence = evidence.sort((a, b) => {
            const dateA = new Date(a.date_added || a.dateAdded || 0)
            const dateB = new Date(b.date_added || b.dateAdded || 0)
            return dateB - dateA
          })
          const lastUpload = sortedEvidence[0]?.date_added || sortedEvidence[0]?.dateAdded

          stats[gp] = {
            count: evidence.length,
            subsections: subsections.length,
            lastUpload
          }
        })

        setGpStats(stats)
      } catch (error) {
        console.error('Error loading stats:', error);
        setGpStats({});
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [])

  const formatLastUpload = (dateString) => {
    if (!dateString) return 'No uploads yet'
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  const handleGPClick = (gp) => {
    const gpNumber = gp.replace('GP ', '')
    navigate(`/gp${gpNumber}`)
  }

  // Get all GP categories
  const gpCategories = Object.keys(gpTitles)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">Upload Evidence</h1>
        <p className="text-base text-gray-600">
          Select a Graduate Professional category to view subsections and upload evidence.
        </p>
      </div>

      {/* GP Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gpCategories.map((gp) => {
          const stats = gpStats[gp] || { count: 0, subsections: 0, lastUpload: null }
          const colorClass = gpColors[gp] || 'bg-gray-50 border-gray-200 text-gray-700'
          const gpNumber = gp.replace('GP ', '')

          return (
            <button
              key={gp}
              onClick={() => handleGPClick(gp)}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out text-left focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {/* GP Header */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 ${colorClass}`}>
                <FileText className="w-4 h-4" />
                <span className="font-semibold text-sm">{gp}</span>
              </div>

              {/* GP Title */}
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {gpTitles[gp]}
              </h2>

              {/* Quick Summary */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Evidence Items</span>
                  <span className="font-semibold text-gray-800">{stats.count}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subsections</span>
                  <span className="font-semibold text-gray-800">{stats.subsections}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last Upload
                  </span>
                  <span className="font-semibold text-gray-800 text-xs">
                    {formatLastUpload(stats.lastUpload)}
                  </span>
                </div>
              </div>

              {/* Navigation Arrow */}
              <div className="flex items-center gap-2 text-sky-600 font-medium text-sm mt-4 pt-4 border-t border-gray-100">
                <span>View Details</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Summary Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-sky-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Total Subsections</p>
            <p className="text-2xl font-bold text-sky-600">{evidenceSchema.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Total Evidence Items</p>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '...' : Object.values(gpStats).reduce((sum, stat) => sum + (stat.count || 0), 0)}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">GP Categories</p>
            <p className="text-2xl font-bold text-purple-600">
              {gpCategories.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadEvidence
