import React, { useState, useEffect, useCallback } from 'react'
import { adminService, PendingOrganization } from '../../services/adminService'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  MapPin,
  Calendar,
  Building,
  AlertTriangle,
  Eye
} from 'lucide-react'
import type { Profile } from '../../types/database';

interface OrganizationManagementProps {}

type FilterStatus = 'all' | 'pending' | 'verified' | 'rejected'

// If PendingOrganization already exists, extend it with moderation fields:
// type PendingOrganization = Profile & {
//   organization_status?: 'pending' | 'approved' | 'rejected' | 'blocked';
//   can_resubmit?: boolean;
//   organization_rejection_reason?: string | null;
// };

const OrganizationManagement: React.FC<OrganizationManagementProps> = () => {
  const { profile } = useAuth()
  const [organizations, setOrganizations] = useState<PendingOrganization[]>([])
  const [filteredOrganizations, setFilteredOrganizations] = useState<PendingOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selectedOrganization, setSelectedOrganization] = useState<PendingOrganization | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filterAndSearchOrganizations = useCallback(() => {
    let filtered = organizations.filter(org => org.onboarding_complete === true);

    // Apply status filter
    if (filterStatus === 'pending') {
      filtered = filtered.filter(org => (org as Profile).organization_status === 'pending')
    } else if (filterStatus === 'verified') {
      filtered = filtered.filter(org => (org as Profile).organization_status === 'approved')
    } else if (filterStatus === 'rejected') {
      filtered = filtered.filter(org => (org as Profile).organization_status === 'rejected')
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(org =>
        org.organization_name?.toLowerCase().includes(term) ||
        org.email.toLowerCase().includes(term) ||
        org.bio?.toLowerCase().includes(term)
      )
    }

    setFilteredOrganizations(filtered)
  }, [organizations, searchTerm, filterStatus])

  useEffect(() => {
    loadOrganizations()
  }, [])

  useEffect(() => {
    filterAndSearchOrganizations()
  }, [filterAndSearchOrganizations])

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAllOrganizations()
      setOrganizations(data)
    } catch (err) {
      console.error('Error loading organizations:', err)
      setError('Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (organizationId: string) => {
    if (!profile?.id) return

    try {
      setActionLoading(organizationId)
      await adminService.approveOrganization(organizationId, profile.id)
      await loadOrganizations()
      setSelectedOrganization(null)
    } catch (err) {
      console.error('Error approving organization:', err)
      setError('Failed to approve organization')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!profile?.id || !selectedOrganization || !rejectReason.trim()) return

    try {
      setActionLoading(selectedOrganization.id)
      await adminService.rejectOrganization(selectedOrganization.id, profile.id, rejectReason)
      await loadOrganizations()
      setShowRejectModal(false)
      setSelectedOrganization(null)
      setRejectReason('')
    } catch (err) {
      console.error('Error rejecting organization:', err)
      setError('Failed to reject organization')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusDisplay = (org: PendingOrganization) => {
    if (((org as Profile).organization_status === 'approved')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </span>
      )
    } else if (((org as Profile).organization_status === 'rejected')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      )
    }
  }

  const getFilterCounts = () => {
    return {
      all: organizations.length,
      pending: organizations.filter(org => (org as Profile).organization_status === 'pending').length,
      verified: organizations.filter(org => (org as Profile).organization_status === 'approved').length,
      rejected: organizations.filter(org => (org as Profile).organization_status === 'rejected').length
    }
  }

  const filterCounts = getFilterCounts()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <Button
                onClick={loadOrganizations}
                className="bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Organization Management</h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Review and manage organization verification requests
          </p>
        </div>
        <Button onClick={loadOrganizations} variant="secondary" className="w-full sm:w-auto">
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto text-sm sm:text-base"
          >
            <option value="all">All ({filterCounts.all})</option>
            <option value="pending">Pending ({filterCounts.pending})</option>
            <option value="verified">Verified ({filterCounts.verified})</option>
            <option value="rejected">Rejected ({filterCounts.rejected})</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{filterCounts.all}</div>
          <div className="text-xs sm:text-sm text-blue-600">Total Organizations</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">{filterCounts.pending}</div>
          <div className="text-xs sm:text-sm text-yellow-600">Pending Review</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-green-600">{filterCounts.verified}</div>
          <div className="text-xs sm:text-sm text-green-600">Verified</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-red-600">{filterCounts.rejected}</div>
          <div className="text-xs sm:text-sm text-red-600">Rejected</div>
        </div>
      </div>

      {/* Organization List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredOrganizations.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No organizations to display'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrganizations.map((org) => (
              <div key={org.id} className="p-4 sm:p-6 hover:bg-gray-50 max-w-full overflow-x-auto">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                          {org.organization_name || 'Unnamed Organization'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 break-all break-words max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl truncate">
                          {org.email}
                        </p>
                      </div>
                      <div className="flex-shrink-0 mt-2 sm:mt-0">{getStatusDisplay(org)}</div>
                    </div>

                    {org.bio && (
                      <p className="text-gray-700 mt-2 text-xs sm:text-sm break-words overflow-hidden line-clamp-3 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                        {org.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {new Date(org.created_at).toLocaleDateString()}
                      </div>
                      {org.location && (
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="truncate max-w-[100px] sm:max-w-[120px]">{org.location}</span>
                        </div>
                      )}
                      {org.website && (
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 truncate max-w-[100px] sm:max-w-[120px]"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Website
                        </a>
                      )}
                    </div>

                    {org.organization_rejection_reason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs sm:text-sm text-red-800 break-words">
                          <strong>Rejection Reason:</strong> {org.organization_rejection_reason}
                        </p>
                      </div>
                    )}

                    {org.organization_verified_at && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs sm:text-sm text-green-800">
                          <strong>Verified:</strong> {new Date(org.organization_verified_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 mt-4 sm:mt-0 ml-0 sm:ml-6 w-full sm:w-auto">
                    <Button
                      onClick={() => setSelectedOrganization(org)}
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      View Details
                    </Button>

                    {((org as Profile).organization_status === 'pending') && (
                      <>
                        <Button
                          onClick={() => handleApprove(org.id)}
                          disabled={actionLoading === org.id}
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs sm:text-sm"
                          size="sm"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {actionLoading === org.id ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedOrganization(org)
                            setShowRejectModal(true)
                          }}
                          variant="secondary"
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 w-full sm:w-auto text-xs sm:text-sm"
                          size="sm"
                        >
                          <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Organization Details Modal */}
      {selectedOrganization && !showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {selectedOrganization.organization_name || 'Unnamed Organization'}
                  </h3>
                  <div className="mt-2">{getStatusDisplay(selectedOrganization)}</div>
                </div>
                <Button
                  onClick={() => setSelectedOrganization(null)}
                  variant="secondary"
                  size="sm"
                  className="text-lg leading-none p-1 h-8 w-8"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 text-sm sm:text-base break-all">{selectedOrganization.email}</p>
                </div>

                {selectedOrganization.bio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-gray-900 text-sm sm:text-base">{selectedOrganization.bio}</p>
                  </div>
                )}

                {selectedOrganization.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <p className="text-gray-900 text-sm sm:text-base">{selectedOrganization.location}</p>
                  </div>
                )}

                {selectedOrganization.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <a
                      href={selectedOrganization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm sm:text-base break-all"
                    >
                      {selectedOrganization.website}
                    </a>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Date
                  </label>
                  <p className="text-gray-900 text-sm sm:text-base">
                    {new Date(selectedOrganization.created_at).toLocaleDateString()}
                  </p>
                </div>

                {selectedOrganization.organization_rejection_reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason
                    </label>
                    <p className="text-red-600 text-sm sm:text-base">{selectedOrganization.organization_rejection_reason}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                {((selectedOrganization as Profile).organization_status === 'pending') && (
                  <>
                    <Button
                      onClick={() => handleApprove(selectedOrganization.id)}
                      disabled={actionLoading === selectedOrganization.id}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {actionLoading === selectedOrganization.id ? 'Approving...' : 'Approve Organization'}
                    </Button>
                    <Button
                      onClick={() => setShowRejectModal(true)}
                      variant="secondary"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 w-full sm:w-auto"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Organization
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedOrganization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-2 sm:mx-0">
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                Reject Organization
              </h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Please provide a reason for rejecting <strong>{selectedOrganization.organization_name}</strong>:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectReason('')
                  }}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || actionLoading === selectedOrganization.id}
                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                >
                  {actionLoading === selectedOrganization.id ? 'Rejecting...' : 'Reject Organization'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrganizationManagement