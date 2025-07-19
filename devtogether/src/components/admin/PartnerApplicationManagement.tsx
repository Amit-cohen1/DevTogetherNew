import React, { useState, useEffect, useCallback } from 'react'
import { adminService, PartnerApplication } from '../../services/adminService'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Building,
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  Eye,
  Mail
} from 'lucide-react'
import AdminTabHeader from './AdminTabHeader';

interface PartnerApplicationManagementProps {}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected'

const partnerApplicationStatusOptions = [
  { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-800', badge: 'bg-gray-500' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', badge: 'bg-yellow-500' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800', badge: 'bg-green-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', badge: 'bg-red-500' },
];

const PartnerApplicationManagement: React.FC<PartnerApplicationManagementProps> = () => {
  const { profile } = useAuth()
  const [applications, setApplications] = useState<PartnerApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<PartnerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selectedApplication, setSelectedApplication] = useState<PartnerApplication | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadPartnerApplications()
  }, [])

  const filterAndSearchApplications = useCallback(() => {
    let filtered = applications

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus)
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(app =>
        app.organization?.organization_name?.toLowerCase().includes(term) ||
        app.organization?.email?.toLowerCase().includes(term) ||
        app.company_size.toLowerCase().includes(term) ||
        app.industry.toLowerCase().includes(term) ||
        app.why_partner.toLowerCase().includes(term)
      )
    }

    // Apply smart ordering ONLY for 'all' filter
    if (filterStatus === 'all') {
      filtered.sort((a, b) => {
        const statusPriority = {
          'pending': 1,
          'approved': 2,
          'rejected': 3
        };
        
        const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 4;
        const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 4;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        // Secondary sort by creation date (newest first for same status)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      // For specific filters, just sort by creation date (newest first)
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, filterStatus])

  useEffect(() => {
    filterAndSearchApplications()
  }, [filterAndSearchApplications])

  const loadPartnerApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getPartnerApplications()
      setApplications(data)
    } catch (err) {
      console.error('Error loading partner applications:', err)
      setError('Failed to load partner applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    if (!profile?.id) return

    try {
      setActionLoading(applicationId)
      await adminService.approvePartnerApplication(applicationId, profile.id)
      await loadPartnerApplications()
      setSelectedApplication(null)
    } catch (err) {
      console.error('Error approving partner application:', err)
      setError('Failed to approve partner application')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (applicationId: string) => {
    if (!profile?.id) return

    try {
      setActionLoading(applicationId)
      await adminService.rejectPartnerApplication(applicationId, profile.id)
      await loadPartnerApplications()
      setSelectedApplication(null)
    } catch (err) {
      console.error('Error rejecting partner application:', err)
      setError('Failed to reject partner application')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
    }
  }

  const getCompanySizeDisplay = (size: string) => {
    const sizeMap: { [key: string]: string } = {
      'startup': 'Startup (1-10)',
      'small': 'Small (11-50)',
      'medium': 'Medium (51-200)', 
      'large': 'Large (201-1000)',
      'enterprise': 'Enterprise (1000+)'
    }
    return sizeMap[size] || size
  }

  const getFilterCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    }
  }

  const filterCounts = getFilterCounts()

  const statArray = [
    { label: 'All', value: filterCounts.all, color: 'bg-blue-50' },
    { label: 'Pending', value: filterCounts.pending, color: 'bg-yellow-50' },
    { label: 'Approved', value: filterCounts.approved, color: 'bg-green-50' },
    { label: 'Rejected', value: filterCounts.rejected, color: 'bg-red-50' },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
                onClick={loadPartnerApplications}
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
      <AdminTabHeader
        title="Partner Applications"
        searchPlaceholder="Search partner applications..."
        onSearch={handleSearch}
        stats={statArray}
      >
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {partnerApplicationStatusOptions.map((status) => {
            const count = filterCounts[status.value as keyof typeof filterCounts] || 0;
            const isActive = filterStatus === status.value;
            return (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value as FilterStatus)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive 
                    ? status.color + ' ring-2 ring-blue-500 ring-opacity-30' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${status.badge}`}></span>
                {status.label} ({count})
              </button>
            );
          })}
        </div>
      </AdminTabHeader>

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No partner applications to display'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredApplications.map((app) => (
              <div key={app.id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl">
                          {app.organization?.organization_name || 'Unnamed Organization'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center mt-1 break-all">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          {app.organization?.email}
                        </p>
                      </div>
                      <div className="flex-shrink-0 mt-2 sm:mt-0">{getStatusDisplay(app.status)}</div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:gap-4">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                        <span className="font-medium">Company Size:</span>
                        <span className="ml-1 truncate">{getCompanySizeDisplay(app.company_size)}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <Building className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                        <span className="font-medium">Industry:</span>
                        <span className="ml-1 truncate">{app.industry}</span>
                      </div>
                    </div>

                    {app.website && (
                      <div className="mt-2">
                        <a
                          href={app.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800 truncate max-w-xs sm:max-w-md"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          {app.website}
                        </a>
                      </div>
                    )}

                    <div className="mt-3">
                      <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                        <span className="font-medium">Why Partner:</span> {app.why_partner}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Applied: {new Date(app.created_at).toLocaleDateString()}
                      </div>
                      {app.reviewed_at && (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Reviewed: {new Date(app.reviewed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4 sm:mt-0 ml-0 sm:ml-4 w-full sm:w-auto">
                    <Button
                      onClick={() => setSelectedApplication(app)}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto text-xs sm:text-sm !text-gray-700 hover:!text-gray-900 border-gray-300 hover:border-gray-400"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-500" />
                      View Details
                    </Button>

                    {app.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleApprove(app.id)}
                          disabled={actionLoading === app.id}
                          className="w-full sm:w-auto text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white border-0"
                          size="sm"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {actionLoading === app.id ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleReject(app.id)}
                          disabled={actionLoading === app.id}
                          className="w-full sm:w-auto text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white border-0"
                          size="sm"
                        >
                          <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {actionLoading === app.id ? 'Rejecting...' : 'Reject'}
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

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Partner Application Details
                  </h3>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    {selectedApplication.organization?.organization_name || 'Unnamed Organization'}
                  </p>
                  <div className="mt-2">{getStatusDisplay(selectedApplication.status)}</div>
                </div>
                <Button
                  onClick={() => setSelectedApplication(null)}
                  variant="secondary"
                  size="sm"
                  className="text-lg leading-none p-1 h-8 w-8"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* Organization Information */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3">Organization Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Name
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedApplication.organization?.organization_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base break-all">{selectedApplication.organization?.email}</p>
                    </div>
                  </div>
                  {selectedApplication.organization?.bio && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Description
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedApplication.organization.bio}</p>
                    </div>
                  )}
                </div>

                {/* Partnership Details */}
                <div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3">Partnership Details</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Size
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base">{getCompanySizeDisplay(selectedApplication.company_size)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedApplication.industry}</p>
                    </div>
                  </div>
                  {selectedApplication.website && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <a
                        href={selectedApplication.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm sm:text-base break-all"
                      >
                        {selectedApplication.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Partnership Motivation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Why do you want to partner with DevTogether?
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base">{selectedApplication.why_partner}</p>
                  </div>
                </div>

                {/* Application Timeline */}
                <div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3">Application Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Application Submitted</span>
                      <span className="font-medium text-sm">
                        {new Date(selectedApplication.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedApplication.reviewed_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Review Completed</span>
                        <span className="font-medium text-sm">
                          {new Date(selectedApplication.reviewed_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                {selectedApplication.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleApprove(selectedApplication.id)}
                      disabled={actionLoading === selectedApplication.id}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {actionLoading === selectedApplication.id ? 'Approving...' : 'Approve Application'}
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedApplication.id)}
                      disabled={actionLoading === selectedApplication.id}
                      variant="secondary"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 w-full sm:w-auto"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {actionLoading === selectedApplication.id ? 'Rejecting...' : 'Reject Application'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PartnerApplicationManagement