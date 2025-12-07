import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Upload as UploadIcon,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { photoLibraryApi } from '../services/markbookApi'
import { apiUrl } from '../config/api'

// Simple static teacher id placeholder – swap for real auth later
const TEACHER_ID = 'default-teacher-id'

// GP subsection names mapping
const GP_SUBSECTION_NAMES = {
  'GP1.1': 'Content Accuracy and Depth',
  'GP1.2': 'Curriculum Alignment',
  'GP1.3': 'Subject Expertise Demonstration',
  'GP1.4': 'Content Organization and Structure',
  'GP2.1': 'Curriculum Alignment and Planning',
  'GP2.2': 'Teaching Strategies and Methods',
  'GP2.3': 'Use of Assessment in Teaching',
  'GP2.4': 'Differentiation and Individualization',
  'GP2.5': 'Learning Environment Management',
  'GP3.1': 'Assessment Design and Implementation',
  'GP3.2': 'Feedback to Students',
  'GP3.3': 'Use of Assessment Data',
  'GP3.4': 'Student Progress Monitoring',
  'GP4.1': 'Reflective Practice',
  'GP4.2': 'Professional Growth Activities',
  'GP4.3': 'Collaboration with Colleagues',
  'GP4.4': 'Ethical Conduct and Professionalism',
  'GP5.1': 'Parent/Guardian Communication',
  'GP5.2': 'Community Involvement',
  'GP5.3': 'School-Community Partnerships',
  'GP5.4': 'Student Welfare and Support',
  'GP6.1': 'Use of ICT in Teaching',
  'GP6.2': 'Digital Tools and Resources',
  'GP6.3': 'Technology-Enhanced Learning',
  'GP6.4': 'Digital Literacy Development',
}

const GP_TITLES = {
  'GP1': 'GP1 — Subject Content Knowledge',
  'GP2': 'GP2 — Pedagogy & Teaching Strategies',
  'GP3': 'GP3 — Student Assessment & Feedback',
  'GP4': 'GP4 — Professional Development',
  'GP5': 'GP5 — Community Engagement',
  'GP6': 'GP6 — Technology Integration',
}

const GP_COLORS = {
  'GP1': 'bg-blue-100 text-blue-800 border-blue-200',
  'GP2': 'bg-green-100 text-green-800 border-green-200',
  'GP3': 'bg-purple-100 text-purple-800 border-purple-200',
  'GP4': 'bg-orange-100 text-orange-800 border-orange-200',
  'GP5': 'bg-pink-100 text-pink-800 border-pink-200',
  'GP6': 'bg-indigo-100 text-indigo-800 border-indigo-200',
}

function Upload() {
  const queryClient = useQueryClient()

  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [selectedGpFilter, setSelectedGpFilter] = useState('all')
  const [selectedSubsectionFilter, setSelectedSubsectionFilter] = useState('all')
  const [showAllGPs, setShowAllGPs] = useState(false)

  // Load existing photo evidence for this teacher
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['photo-library', TEACHER_ID],
    queryFn: () => photoLibraryApi.list(TEACHER_ID),
  })

  // Upload + analyze mutation (single image)
  const uploadMutation = useMutation({
    mutationFn: ({ file, teacherId }) => photoLibraryApi.upload(file, teacherId),
    onSuccess: (data) => {
      setResult(data)
      queryClient.invalidateQueries({ queryKey: ['photo-library'] })
    },
    onError: (err) => {
      setError(err.message || 'Failed to upload and analyze photo.')
    },
  })

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    const ext = selected.name.toLowerCase().split('.').pop()
    if (!['jpg', 'jpeg', 'png', 'heic'].includes(ext)) {
      setError('Please select a JPG, JPEG, PNG, or HEIC image.')
      return
    }

    setFile(selected)
    setError('')
    setResult(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const handleUploadAndAnalyze = () => {
    if (!file) {
      setError('Please choose an image first.')
      return
    }
    setError('')
    uploadMutation.mutate({ file, teacherId: TEACHER_ID })
  }

  // Get all unique subsections from all photos for filter dropdown
  const allSubsections = useMemo(() => {
    const subsections = new Set()
    photos.forEach((photo) => {
      const gpSubsections = photo.gp_subsections || {}
      Object.values(gpSubsections).forEach((gpData) => {
        if (gpData && gpData.subsections) {
          gpData.subsections.forEach((sub) => subsections.add(sub))
        }
      })
    })
    return Array.from(subsections).sort()
  }, [photos])

  const filteredPhotos = useMemo(() => {
    let filtered = photos

    // Filter by GP
    if (selectedGpFilter !== 'all') {
      filtered = filtered.filter((p) => {
        const gpSubsections = p.gp_subsections || {}
        const gpData = gpSubsections[selectedGpFilter]
        return gpData && gpData.subsections && gpData.subsections.length > 0
      })
    }

    // Filter by subsection
    if (selectedSubsectionFilter !== 'all') {
      filtered = filtered.filter((p) => {
        const gpSubsections = p.gp_subsections || {}
        return Object.values(gpSubsections).some((gpData) => {
          return gpData && gpData.subsections && gpData.subsections.includes(selectedSubsectionFilter)
        })
      })
    }

    return filtered
  }, [photos, selectedGpFilter, selectedSubsectionFilter])

  const GP_KEYS = ['GP1', 'GP2', 'GP3', 'GP4', 'GP5', 'GP6']

  // Get GPs with matches for result display
  const gpsWithMatches = useMemo(() => {
    if (!result || !result.gp_subsections) return []
    return GP_KEYS.filter((gp) => {
      const gpData = result.gp_subsections[gp]
      return gpData && gpData.subsections && gpData.subsections.length > 0
    })
  }, [result])

  const allGPs = GP_KEYS

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          Photo Evidence Library
        </h1>
        <p className="text-base text-gray-600">
          Upload a classroom photo, then analyze which Guiding Principles (GP1–GP6) and subsections it best supports.
        </p>
      </div>

      {/* Single Image Upload + Analyze */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-sky-600" />
          Upload a Photo
        </h2>

        {/* Upload Area */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl px-6 py-8 flex flex-col items-center justify-center text-center hover:border-sky-400 transition-colors">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className="max-h-64 rounded-lg object-contain mb-4"
                />
              ) : (
                <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
              )}
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop an image here, or click to browse.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supported formats: JPG, JPEG, PNG, HEIC
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-sky-700 transition-colors">
                <UploadIcon className="w-4 h-4" />
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Analyze Panel */}
          <div className="flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-600" />
                Analyze Evidence
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Once you select a photo, click{" "}
                <span className="font-semibold">Analyze Photo</span> to run OCR and let the AI
                suggest which GP(s) and subsections this evidence best supports.
              </p>
              <button
                type="button"
                onClick={handleUploadAndAnalyze}
                disabled={!file || uploadMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Photo
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Photo analyzed and saved to your evidence library.</span>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Result for current upload */}
        {result && result.gp_subsections && (
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">GP Recommendations & Subsections</h3>
              {gpsWithMatches.length < allGPs.length && (
                <button
                  onClick={() => setShowAllGPs(!showAllGPs)}
                  className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  {showAllGPs ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Empty GPs
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show All GP Areas
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="space-y-4">
              {(showAllGPs ? allGPs : gpsWithMatches).map((gp) => {
                const gpData = result.gp_subsections[gp] || { subsections: [], justifications: {} }
                const { subsections, justifications } = gpData
                
                if (!showAllGPs && (!subsections || subsections.length === 0)) return null

                return (
                  <div key={gp} className={`border rounded-xl p-4 ${GP_COLORS[gp]}`}>
                    <h4 className="font-semibold mb-3">{GP_TITLES[gp]}</h4>
                    {subsections && subsections.length > 0 ? (
                      <div className="space-y-2">
                        {subsections.map((subsection) => {
                          const justification = justifications[subsection] || ''
                          const subsectionName = GP_SUBSECTION_NAMES[subsection] || subsection
                          return (
                            <div key={subsection} className="flex items-start gap-2 text-sm">
                              <span className="font-semibold text-gray-800">•</span>
                              <div className="flex-1">
                                <span className="font-medium">{subsection}</span>
                                {' — '}
                                <span className="text-gray-700">{subsectionName}</span>
                                {justification && (
                                  <div className="mt-1 text-xs text-gray-600 italic pl-4">
                                    "{justification}"
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No subsections identified for this GP.</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Photo Evidence Gallery</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-600">Filter by GP:</span>
            <select
              value={selectedGpFilter}
              onChange={(e) => {
                setSelectedGpFilter(e.target.value)
                setSelectedSubsectionFilter('all') // Reset subsection filter when GP changes
              }}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              {GP_KEYS.map((gp) => (
                <option key={gp} value={gp}>
                  {gp}
                </option>
              ))}
            </select>
            <span className="text-gray-600 ml-2">Subsection:</span>
            <select
              value={selectedSubsectionFilter}
              onChange={(e) => setSelectedSubsectionFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              disabled={allSubsections.length === 0}
            >
              <option value="all">All</option>
              {allSubsections.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {photosLoading ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading photos...
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No photos found</p>
            <p className="text-sm mt-1">
              {selectedGpFilter !== 'all' || selectedSubsectionFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Upload a photo above to start building your evidence library.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPhotos.map((photo) => {
              // Collect all subsections from this photo
              const allPhotoSubsections = []
              const gpSubsections = photo.gp_subsections || {}
              Object.values(gpSubsections).forEach((gpData) => {
                if (gpData && gpData.subsections) {
                  allPhotoSubsections.push(...gpData.subsections)
                }
              })

              return (
                <div
                  key={photo.id}
                  className="border rounded-xl overflow-hidden bg-gray-50 flex flex-col"
                >
                  <div className="bg-gray-200 aspect-video overflow-hidden">
                    <img
                      src={apiUrl(photo.file_path.startsWith('/') ? photo.file_path : `/${photo.file_path}`)}
                      alt="Photo evidence"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-2">
                    {/* GP Category Tags */}
                    <div className="flex flex-wrap gap-1">
                      {GP_KEYS.map((gp) => {
                        const gpData = gpSubsections[gp]
                        if (!gpData || !gpData.subsections || gpData.subsections.length === 0) return null
                        return (
                          <span
                            key={gp}
                            className={`px-2 py-0.5 text-[10px] rounded-full border ${GP_COLORS[gp]}`}
                          >
                            {gp}
                          </span>
                        )
                      })}
                    </div>
                    {/* Subsection Tags */}
                    {allPhotoSubsections.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {allPhotoSubsections.map((subsection) => {
                          const subsectionName = GP_SUBSECTION_NAMES[subsection] || subsection
                          const gpData = Object.values(gpSubsections).find(
                            (data) => data && data.subsections && data.subsections.includes(subsection)
                          )
                          const justification = gpData?.justifications?.[subsection] || ''
                          return (
                            <div
                              key={subsection}
                              className="group relative"
                              title={justification || subsectionName}
                            >
                              <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-700 border border-gray-300 cursor-help">
                                {subsection}
                              </span>
                              {justification && (
                                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                  <div className="font-semibold mb-1">{subsectionName}</div>
                                  <div>{justification}</div>
                                  <div className="absolute bottom-0 left-4 transform translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {photo.ocr_text && (
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {photo.ocr_text}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Upload
