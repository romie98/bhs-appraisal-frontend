import { useState } from 'react'
import { GP_CATEGORIES, getAllTypes } from '../data/portfolioData'

function UploadForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    fileUrl: '',
    tags: '',
  })

  const [errors, setErrors] = useState({})

  const types = getAllTypes()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.type) {
      newErrors.type = 'Type is required'
    }

    if (!formData.fileUrl.trim()) {
      newErrors.fileUrl = 'File URL is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Process tags - split by comma and trim
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    // Create portfolio item object
    const portfolioItem = {
      id: Date.now().toString(), // Temporary ID generation
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      type: formData.type,
      fileUrl: formData.fileUrl.trim(),
      date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      tags: tagsArray,
    }

    // TODO: Integrate with backend (Firebase/Supabase/API)
    // Example:
    // await uploadPortfolioItem(portfolioItem)
    // or
    // await supabase.from('portfolio_items').insert(portfolioItem)

    console.log('Portfolio Item:', portfolioItem)

    // Reset form after submission
    setFormData({
      title: '',
      description: '',
      category: '',
      type: '',
      fileUrl: '',
      tags: '',
    })
    setErrors({})

    // Show success message (you can replace this with a toast notification)
    alert('Portfolio item submitted successfully! Check console for details.')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter portfolio item title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter a detailed description of the portfolio item"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Category and Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a category</option>
            {GP_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white ${
              errors.type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a type</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-500">{errors.type}</p>
          )}
        </div>
      </div>

      {/* File URL */}
      <div>
        <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-2">
          File URL <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="fileUrl"
          name="fileUrl"
          value={formData.fileUrl}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            errors.fileUrl ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="/assets/lessons/example.pdf or https://example.com/file.pdf"
        />
        {errors.fileUrl && (
          <p className="mt-1 text-sm text-red-500">{errors.fileUrl}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Enter a file path or URL. File upload functionality will be added later.
        </p>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Enter tags separated by commas (e.g., algebra, mathematics, 7th grade)"
        />
        <p className="mt-1 text-sm text-gray-500">
          Separate multiple tags with commas
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              category: '',
              type: '',
              fileUrl: '',
              tags: '',
            })
            setErrors({})
          }}
          className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all font-medium"
        >
          Clear
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-md transition-all font-medium shadow-sm"
        >
          Submit Portfolio Item
        </button>
      </div>
    </form>
  )
}

export default UploadForm

