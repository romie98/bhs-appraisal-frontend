import { useState, useEffect } from 'react'
import { Edit, Save, X, Upload, User } from 'lucide-react'
import { loadProfile, saveProfile } from '../utils/profileStore'

const getDefaultProfile = () => ({
  name: '',
  profilePicture: null,
  qualifications: '',
  description: ''
})

function About() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(getDefaultProfile())
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)

  useEffect(() => {
    const loadedProfile = loadProfile()
    if (loadedProfile) {
      setProfile(loadedProfile)
      if (loadedProfile.profilePicture) {
        setProfilePicturePreview(loadedProfile.profilePicture)
      } else {
        setProfilePicturePreview(null)
      }
    } else {
      setProfile(getDefaultProfile())
      setProfilePicturePreview(null)
    }
  }, [])

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Convert to base64 for storage
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setProfilePicturePreview(base64String)
        handleInputChange('profilePicture', base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    const saved = saveProfile(profile)
    if (saved) {
      setIsEditing(false)
      // Show success message (optional)
    } else {
      alert('Failed to save profile. Please try again.')
    }
  }

  const handleCancel = () => {
    const loadedProfile = loadProfile()
    setProfile(loadedProfile)
    if (loadedProfile.profilePicture) {
      setProfilePicturePreview(loadedProfile.profilePicture)
    } else {
      setProfilePicturePreview(null)
    }
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">About</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-start gap-4">
                {profilePicturePreview && (
                  <div className="flex-shrink-0">
                    <img
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Qualifications Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qualifications
              </label>
              <textarea
                value={profile.qualifications || ''}
                onChange={(e) => handleInputChange('qualifications', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-y min-h-[100px]"
                placeholder="Enter your qualifications (e.g., Bachelor of Education, Teaching Certificate, etc.)"
              />
            </div>

            {/* Description/Paragraph Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                About Me / Description
              </label>
              <textarea
                value={profile.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-y min-h-[150px]"
                placeholder="Write a paragraph about yourself, your teaching philosophy, experience, etc."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* Name and Profile Picture */}
            <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {profile.name || 'Your Name'}
                </h2>
                {!profile.name && (
                  <p className="text-sm text-gray-500 italic">Click Edit to add your name</p>
                )}
              </div>
            </div>

            {/* Qualifications */}
            {profile.qualifications ? (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Qualifications</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {profile.qualifications}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm italic">No qualifications added yet. Click Edit to add your qualifications.</p>
              </div>
            )}

            {/* Description */}
            {profile.description ? (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">About Me</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {profile.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm italic">No description added yet. Click Edit to write about yourself.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default About
