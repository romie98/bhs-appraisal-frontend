import { Link } from 'react-router-dom'
import { portfolioItems, GP_CATEGORIES, filterItemsByGP } from '../data/portfolioData'
import PortfolioCard from '../components/PortfolioCard'
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  UserCircle,
  ArrowRight,
  Upload as UploadIcon,
  FileText
} from 'lucide-react'

function Home() {
  // Get counts for each GP category
  const getGPCounts = () => {
    return GP_CATEGORIES.map(category => ({
      category,
      count: filterItemsByGP(category).length,
      title: getGPTitle(category)
    }))
  }

  // Get GP title based on category
  const getGPTitle = (category) => {
    const titles = {
      'GP1': 'Subject Content Knowledge',
      'GP2': 'Pedagogy & Teaching Strategies',
      'GP3': 'Student Assessment & Feedback',
      'GP4': 'Professional Development',
      'GP5': 'Community Engagement',
      'GP6': 'Technology Integration'
    }
    return titles[category] || category
  }

  // Get GP icon based on category
  const getGPIcon = (category) => {
    const icons = {
      'GP1': BookOpen,
      'GP2': GraduationCap,
      'GP3': Users,
      'GP4': UserCircle,
      'GP5': Users,
      'GP6': GraduationCap
    }
    return icons[category] || FileText
  }

  // Get recent items (last 4, sorted by date)
  const getRecentItems = () => {
    return [...portfolioItems]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4)
  }

  const gpCounts = getGPCounts()
  const recentItems = getRecentItems()
  const totalItems = portfolioItems.length

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm p-8 sm:p-12 border border-gray-100">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
          Teacher Professional Portfolio
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl leading-relaxed">
          Showcase your professional growth and teaching excellence through evidence-based documentation. 
          Organize, manage, and present your achievements across all six Graduate Professional standards.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-md transition-all font-medium"
          >
            <UploadIcon className="w-5 h-5" />
            Upload New Item
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all font-medium border border-gray-200"
          >
            Learn More
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Portfolio Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {gpCounts.map(({ category, count, title }) => {
            const Icon = getGPIcon(category)
            return (
              <div
                key={category}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-800">{count}</span>
                </div>
                <p className="text-xs font-semibold text-gray-700">{category}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{title}</p>
              </div>
            )
          })}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Portfolio Items</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{totalItems}</p>
            </div>
            <Link
              to="/upload"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors"
            >
              Add More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gpCounts.map(({ category, count, title }) => {
            const Icon = getGPIcon(category)
            return (
              <Link
                key={category}
                to={`/${category.toLowerCase()}`}
                className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                    {count} items
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {category}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{title}</p>
                <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                  View Portfolio
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Recent Uploads</h2>
          <Link
            to="/upload"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors text-sm"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentItems.map((item) => (
              <PortfolioCard
                key={item.id}
                title={item.title}
                description={item.description}
                type={item.type}
                date={item.date}
                fileUrl={item.fileUrl}
                tags={item.tags}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No recent uploads</p>
            <Link
              to="/upload"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Upload your first item
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
