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
  Eye,
  User,
  Folder
} from 'lucide-react'
import type { Profile } from '../../types/database';
import { organizationDashboardService } from '../../services/organizationDashboardService';
import { projectService } from '../../services/projects';
import AdminTabHeader from './AdminTabHeader';
import { AdminDeletionButton } from './AdminDeletionButton';

interface OrganizationManagementProps {}

type FilterStatus = 'all' | 'pending' | 'verified' | 'rejected' | 'blocked'

const organizationStatusOptions = [
  { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-800', badge: 'bg-gray-500' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', badge: 'bg-yellow-500' },
  { value: 'verified', label: 'Verified', color: 'bg-green-100 text-green-800', badge: 'bg-green-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', badge: 'bg-red-500' },
  { value: 'blocked', label: 'Blocked', color: 'bg-amber-100 text-amber-800', badge: 'bg-amber-500' },
];

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
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [orgStats, setOrgStats] = useState<Record<string, any>>({});
  const [orgTeam, setOrgTeam] = useState<Record<string, any>>({});
  const [orgProjects, setOrgProjects] = useState<Record<string, any>>({});
  const [canResubmit, setCanResubmit] = useState(true);

  const filterAndSearchOrganizations = useCallback(() => {
    let filtered = organizations.filter(org => org.onboarding_complete === true);

    // Apply status filter
    if (filterStatus === 'pending') {
      filtered = filtered.filter(org => {
        const status = (org as Profile).organization_status;
        return status === 'pending' || status === null;
      });
    } else if (filterStatus === 'verified') {
      filtered = filtered.filter(org => (org as Profile).organization_status === 'approved')
    } else if (filterStatus === 'rejected') {
      filtered = filtered.filter(org => (org as Profile).organization_status === 'rejected')
    } else if (filterStatus === 'blocked') {
      filtered = filtered.filter(org => (org as Profile).organization_status === 'blocked')
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

    // Apply smart ordering ONLY for 'all' filter
    if (filterStatus === 'all') {
      filtered.sort((a, b) => {
        const aStatus = (a as Profile).organization_status || 'pending';
        const bStatus = (b as Profile).organization_status || 'pending';
        
        const statusPriority = {
          'pending': 1,
          'approved': 2, 
          'rejected': 3,
          'blocked': 4
        };
        
        const aPriority = statusPriority[aStatus as keyof typeof statusPriority] || 5;
        const bPriority = statusPriority[bStatus as keyof typeof statusPriority] || 5;
        
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
    setActionLoading(selectedOrganization.id)
    setError(null)
    try {
      await adminService.rejectOrganization(selectedOrganization.id, profile.id, rejectReason, canResubmit)
      setShowRejectModal(false)
      setRejectReason('')
      setCanResubmit(true)
      await loadOrganizations()
      setSelectedOrganization(null)
    } catch (err) {
      console.error('Error rejecting organization:', err)
      setError('Failed to reject organization')
    }
    setActionLoading(null)
  }

  const handleBlock = async () => {
    if (!profile?.id || !selectedOrganization || !blockReason.trim()) return;
    try {
      setActionLoading(selectedOrganization.id);
      await adminService.blockOrganization(selectedOrganization.id, blockReason);
      await loadOrganizations();
      setShowBlockModal(false);
      setSelectedOrganization(null);
      setBlockReason('');
    } catch (err) {
      setError('Failed to block organization');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (organizationId: string) => {
    if (!profile?.id) return;
    try {
      setActionLoading(organizationId);
      await adminService.unblockOrganization(organizationId);
      await loadOrganizations();
    } catch (err) {
      setError('Failed to unblock organization');
    } finally {
      setActionLoading(null);
    }
  };

  const loadOrgStats = async (orgId: string) => {
    const [stats, team, projects] = await Promise.all([
      organizationDashboardService.getOrganizationStats(orgId),
      organizationDashboardService.getTeamAnalytics(orgId),
      projectService.getOrganizationProjectsWithTeamMembers(orgId)
    ]);
    setOrgStats((prev) => ({ ...prev, [orgId]: stats }));
    setOrgTeam((prev) => ({ ...prev, [orgId]: team }));
    setOrgProjects((prev) => ({ ...prev, [orgId]: projects }));
  };

  useEffect(() => {
    if (selectedOrganization) {
      loadOrgStats(selectedOrganization.id);
    }
  }, [selectedOrganization]);

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
    } else if (((org as Profile).organization_status === 'blocked')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Blocked
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
      pending: organizations.filter(org => {
        const status = (org as Profile).organization_status;
        return status === 'pending' || status === null;
      }).length,
      verified: organizations.filter(org => (org as Profile).organization_status === 'approved').length,
      rejected: organizations.filter(org => (org as Profile).organization_status === 'rejected').length,
      blocked: organizations.filter(org => (org as Profile).organization_status === 'blocked').length
    }
  }

  const filterCounts = getFilterCounts()

  const statArray = [
    { label: 'All', value: filterCounts.all, color: 'bg-blue-50' },
    { label: 'Pending', value: filterCounts.pending, color: 'bg-yellow-50' },
    { label: 'Verified', value: filterCounts.verified, color: 'bg-green-50' },
    { label: 'Rejected', value: filterCounts.rejected, color: 'bg-red-50' },
    { label: 'Blocked', value: filterCounts.blocked, color: 'bg-amber-50' },
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
      <AdminTabHeader
        title="Organizations"
        searchPlaceholder="Search organizations..."
        onSearch={handleSearch}
        stats={statArray}
      >
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {organizationStatusOptions.map((status) => {
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
                    {/* Member and Project Counts */}
                    {orgStats[org.id] && (
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span><User className="inline w-4 h-4 mr-1" />{orgStats[org.id].totalTeamMembers} Members</span>
                        <span><Folder className="inline w-4 h-4 mr-1" />{orgStats[org.id].totalProjects} Projects</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-4 sm:mt-0 ml-0 sm:ml-4 w-full sm:w-auto">
                    <Button
                      onClick={() => setSelectedOrganization(org)}
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto text-xs sm:text-sm border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      View Details
                    </Button>

                    {((org as Profile).organization_status === 'pending') && (
                      <>
                        <Button
                          onClick={() => handleApprove(org.id)}
                          disabled={actionLoading === org.id}
                          className="w-full sm:w-auto text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white border-0"
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
                          className="w-full sm:w-auto text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white border-0"
                          size="sm"
                        >
                          <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {/* Block/Unblock Button */}
                    {((org as Profile).organization_status !== 'blocked') ? (
                      <Button
                        onClick={() => {
                          setSelectedOrganization(org)
                          setShowBlockModal(true)
                        }}
                        className="w-full sm:w-auto text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-white border-0"
                        size="sm"
                        disabled={actionLoading === org.id}
                      >
                        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Block
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleUnblock(org.id)}
                        className="w-full sm:w-auto text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white border-0"
                        size="sm"
                        disabled={actionLoading === org.id}
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {actionLoading === org.id ? 'Unblocking...' : 'Unblock'}
                      </Button>
                    )}
                    
                    <AdminDeletionButton
                      targetId={org.id}
                      targetType="organization"
                      targetName={org.organization_name || 'Unnamed Organization'}
                      onDeleteSuccess={loadOrganizations}
                      size="sm"
                      className="w-full sm:w-auto"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Organization Details Modal */}
      {selectedOrganization && !showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          {/* Outer modal container: */}
          <div className="bg-white rounded-2xl max-w-2xl w-full mx-2 sm:mx-0 shadow-2xl border border-gray-100 p-2 sm:p-4 relative flex flex-col">
            {/* Modal Header */}
            <button
              onClick={() => setSelectedOrganization(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 text-gray-500 hover:text-gray-700 focus:text-gray-700 shadow-sm transition z-10"
              aria-label="Close"
              style={{ fontSize: 24 }}
            >
              ×
            </button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-100 bg-gray-50 rounded-t-2xl gap-2 sm:gap-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    {selectedOrganization.organization_name || 'Unnamed Organization'}
                    <span>{getStatusDisplay(selectedOrganization)}</span>
                  </h3>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                  <span><User className="inline w-4 h-4 mr-1" />{orgStats[selectedOrganization.id]?.totalTeamMembers ?? '-'} Members</span>
                  <span><Folder className="inline w-4 h-4 mr-1" />{orgStats[selectedOrganization.id]?.totalProjects ?? '-'} Projects</span>
                </div>
              </div>
            </div>
            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[65vh]">
              {/* Info Section */}
              <div>
                <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2"><Building className="w-4 h-4" /> Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-900 text-sm break-all">{selectedOrganization.email}</p>
                  </div>
                  {selectedOrganization.website && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
                      <a
                        href={selectedOrganization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {selectedOrganization.website}
                      </a>
                    </div>
                  )}
                  {selectedOrganization.location && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                      <p className="text-gray-900 text-sm">{selectedOrganization.location}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Registration Date</label>
                    <p className="text-gray-900 text-sm">{new Date(selectedOrganization.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {selectedOrganization.bio && (
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <p className="text-gray-900 text-sm whitespace-pre-wrap">{selectedOrganization.bio}</p>
                  </div>
                )}
                {selectedOrganization.organization_rejection_reason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-red-800 break-words">
                      <strong>Rejection Reason:</strong> {selectedOrganization.organization_rejection_reason}
                    </p>
                  </div>
                )}
              </div>
              {/* Members Section */}
              <div>
                <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2"><User className="w-4 h-4" /> Members</h4>
                <div className="flex flex-wrap gap-2">
                  {orgTeam[selectedOrganization.id]?.totalMembers === 0 && <span className="text-gray-400">No members</span>}
                  {orgTeam[selectedOrganization.id]?.memberDistribution?.flatMap((dist: any) => dist.members).map((member: any) => (
                    <div key={member.id} className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                      {member.avatar_url && <img src={member.avatar_url} alt={member.name} className="w-6 h-6 rounded-full" />}
                      <span>{member.name}</span>
                      <span className="text-xs text-gray-400">({member.projectCount} projects)</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Projects Section */}
              <div>
                <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2"><Folder className="w-4 h-4" /> Projects</h4>
                <div className="flex flex-col gap-2">
                  {orgProjects[selectedOrganization.id]?.length === 0 && <span className="text-gray-400">No projects</span>}
                  {orgProjects[selectedOrganization.id]?.map((project: any) => {
                    // Show status badge and member count like in project modal
                    let badgeColor =
                      project.status === 'open' || project.status === 'in_progress' ? 'bg-green-500' :
                      project.status === 'pending' ? 'bg-yellow-500' :
                      project.status === 'rejected' ? 'bg-red-500' :
                      project.status === 'completed' ? 'bg-gray-500' :
                      project.status === 'cancelled' ? 'bg-gray-400' : 'bg-gray-300';
                    let badgeLabel =
                      project.status === 'open' || project.status === 'in_progress' ? 'Active' :
                      project.status.charAt(0).toUpperCase() + project.status.slice(1);
                    return (
                      <div key={project.id} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${badgeColor}`}>{badgeLabel}</span>
                        <span className="font-medium">{project.title}</span>
                        <span className="text-xs text-gray-400">{project.team_members.length} members</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Activity Section (optional) */}
              {orgTeam[selectedOrganization.id]?.recentActivity && orgTeam[selectedOrganization.id].recentActivity.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2"><Clock className="w-4 h-4" /> Recent Activity</h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {orgTeam[selectedOrganization.id].recentActivity.map((activity: any, idx: number) => (
                      <li key={idx}>
                        <span className="font-medium">{activity.memberName}</span> {activity.action.replace('_', ' ')} <span className="text-gray-500">{activity.projectTitle}</span> on {new Date(activity.timestamp).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Modal Footer Controls (for mobile/easy access) */}
            <div className="flex flex-wrap gap-2 justify-end p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              {((selectedOrganization as Profile).organization_status === 'pending') && (
                <>
                  <Button
                    onClick={() => handleApprove(selectedOrganization.id)}
                    disabled={actionLoading === selectedOrganization.id}
                    className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                    size="sm"
                    title="Approve Organization"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {actionLoading === selectedOrganization.id ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={() => setShowRejectModal(true)}
                    variant="secondary"
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 text-xs sm:text-sm"
                    size="sm"
                    title="Reject Organization"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              {((selectedOrganization as Profile).organization_status !== 'blocked') ? (
                <Button
                  onClick={() => setShowBlockModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm shadow"
                  size="sm"
                  title="Block Organization"
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Block
                </Button>
              ) : (
                <Button
                  onClick={() => handleUnblock(selectedOrganization.id)}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm shadow"
                  size="sm"
                  title="Unblock Organization"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Unblock
                </Button>
              )}
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
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="canResubmit"
                  checked={canResubmit}
                  onChange={e => setCanResubmit(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="canResubmit" className="text-sm text-gray-700">Allow organization to resubmit after rejection</label>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectReason('')
                    setCanResubmit(true)
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
      {selectedOrganization && orgTeam[selectedOrganization.id] && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Members</h4>
          <div className="flex flex-wrap gap-2">
            {orgTeam[selectedOrganization.id].totalMembers === 0 && <span className="text-gray-400">No members</span>}
            {orgTeam[selectedOrganization.id].memberDistribution?.flatMap((dist: any) => dist.members).map((member: any) => (
              <div key={member.id} className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                {member.avatar_url && <img src={member.avatar_url} alt={member.name} className="w-6 h-6 rounded-full" />}
                <span>{member.name}</span>
                <span className="text-xs text-gray-400">({member.projectCount} projects)</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedOrganization && orgProjects[selectedOrganization.id] && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Projects</h4>
          <div className="flex flex-col gap-2">
            {orgProjects[selectedOrganization.id].length === 0 && <span className="text-gray-400">No projects</span>}
            {orgProjects[selectedOrganization.id].map((project: any) => (
              <div key={project.id} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                <span className="font-medium">{project.title}</span>
                <span className="text-xs text-gray-500">{project.status}</span>
                <span className="text-xs text-gray-400">{project.team_members.length} members</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {showBlockModal && selectedOrganization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-2 sm:mx-0 shadow-2xl border border-gray-100">
            <div className="p-4 sm:p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 mr-2" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Block Organization</h3>
              </div>
              <p className="text-gray-700 mb-4 text-sm sm:text-base">
                Are you sure you want to <span className="font-semibold text-amber-600">block</span> <strong>{selectedOrganization.organization_name}</strong>?
                <br />Blocked organizations cannot access the platform until unblocked.
              </p>
              <label className="block text-xs font-medium text-gray-500 mb-1">Reason for blocking (required)</label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base mb-2"
              />
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700 mb-2">{error}</div>
              )}
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  onClick={() => {
                    setShowBlockModal(false);
                    setBlockReason('');
                    setError(null);
                  }}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBlock}
                  disabled={!blockReason.trim() || actionLoading === selectedOrganization.id}
                  className="bg-amber-500 hover:bg-amber-600 w-full sm:w-auto text-white"
                >
                  {actionLoading === selectedOrganization.id ? 'Blocking...' : 'Confirm Block'}
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