import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getUsers, grantPremium, revokePremium, getBillingPortalUrl } from '../services/adminUserService'
import { Users, Sparkles, ExternalLink, Loader2, X, Calendar, Info } from 'lucide-react'
import { Toast } from '../components/Toast'
import UserDetailModal from '../components/UserDetailModal'
import GrantPremiumModal from '../components/GrantPremiumModal'

/**
 * Get plan badge component
 */
function PlanBadge({ plan, source }) {
  const isPremium = plan === 'PREMIUM'
  const isStripe = source === 'STRIPE'
  const isAdmin = source === 'ADMIN'
  
  if (!isPremium) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
        ⚪ Free
      </span>
    )
  }
  
  if (isStripe) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        🟢 Premium (Stripe)
      </span>
    )
  }
  
  if (isAdmin) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
        🟣 Premium (Admin)
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
      Premium
    </span>
  )
}

/**
 * Get source display text
 */
function SourceBadge({ source }) {
  if (source === 'STRIPE') {
    return (
      <span className="text-sm text-gray-700 font-medium">Stripe</span>
    )
  }
  if (source === 'ADMIN') {
    return (
      <span className="text-sm text-gray-700 font-medium">Admin</span>
    )
  }
  return (
    <span className="text-sm text-gray-500">None</span>
  )
}

function UserManagement() {
  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState(null)
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getUsers,
  })

  const handleViewUser = async (user) => {
    setSelectedUser(user)
  }

  const handleGrantPremium = (user) => {
    setSelectedUser(user)
    setShowGrantModal(true)
  }

  const handleGrantSuccess = () => {
    setShowGrantModal(false)
    setSelectedUser(null)
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    setToast({
      show: true,
      message: 'Premium access granted successfully',
      type: 'success'
    })
  }

  const handleRevokePremium = async (userId) => {
    if (!window.confirm('Are you sure you want to revoke premium access from this user?')) {
      return
    }

    try {
      await revokePremium(userId)
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      if (selectedUser?.id === userId) {
        setSelectedUser(null)
      }
      setToast({
        show: true,
        message: 'Premium access revoked successfully',
        type: 'success'
      })
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Failed to revoke premium access',
        type: 'error'
      })
    }
  }

  const handleViewBilling = async (userId) => {
    try {
      const { portal_url } = await getBillingPortalUrl(userId)
      window.open(portal_url, '_blank')
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Failed to open billing portal',
        type: 'error'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          </div>
          <p className="text-gray-600">Manage user subscriptions and premium access</p>
        </div>

        {/* Toast */}
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
              <p className="text-sm text-gray-500">Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600">{error.message || 'Failed to load users'}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name / Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan Badge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                          {user.name && (
                            <div className="text-sm text-gray-500">{user.name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PlanBadge plan={user.subscription_plan} source={user.subscription_source} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <SourceBadge source={user.subscription_source} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          {user.subscription_source !== 'STRIPE' && user.subscription_plan === 'PREMIUM' && (
                            <button
                              onClick={() => handleRevokePremium(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Revoke
                            </button>
                          )}
                          {user.subscription_plan === 'FREE' && (
                            <button
                              onClick={() => handleGrantPremium(user)}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            >
                              <Sparkles className="w-4 h-4" />
                              Grant
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && !showGrantModal && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onGrantPremium={() => {
            setShowGrantModal(true)
          }}
          onRevokePremium={handleRevokePremium}
          onViewBilling={handleViewBilling}
        />
      )}

      {/* Grant Premium Modal */}
      {showGrantModal && selectedUser && (
        <GrantPremiumModal
          user={selectedUser}
          onClose={() => {
            setShowGrantModal(false)
            setSelectedUser(null)
          }}
          onSuccess={handleGrantSuccess}
        />
      )}
    </div>
  )
}

export default UserManagement
