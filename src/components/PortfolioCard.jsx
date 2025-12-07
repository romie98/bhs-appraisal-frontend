function PortfolioCard({ title, description, type, date, fileUrl, tags }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleViewEvidence = () => {
    if (fileUrl) {
      // Open in new tab if it's a URL, otherwise it's a local file
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        window.open(fileUrl, '_blank', 'noopener,noreferrer')
      } else {
        // For local files, you might want to handle differently
        // This assumes the file is accessible via the public folder
        window.open(fileUrl, '_blank', 'noopener,noreferrer')
      }
    }
  }

  const getTypeBadgeColor = (type) => {
    const typeColors = {
      'lesson plan': 'bg-blue-100 text-blue-700',
      'certificate': 'bg-green-100 text-green-700',
      'reflection': 'bg-purple-100 text-purple-700',
      'student work': 'bg-yellow-100 text-yellow-700',
      'report': 'bg-indigo-100 text-indigo-700',
    }
    return typeColors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        {/* Type Badge */}
        <div className="mb-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(type)}`}>
            {type}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>

        {/* Date */}
        <div className="mb-4">
          <span className="text-sm text-gray-500">
            {formatDate(date)}
          </span>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* View Evidence Button */}
        <button
          onClick={handleViewEvidence}
          className="w-full mt-4 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-md transition-all duration-200 font-medium"
        >
          View Evidence
        </button>
      </div>
    </div>
  )
}

export default PortfolioCard

