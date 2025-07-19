import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projects';
import { Button } from '../ui/Button';
import { CheckCircle, XCircle, AlertTriangle, Eye, Folder, Users, Building, Clock, FileText, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminTabHeader from './AdminTabHeader';
import { AdminDeletionButton } from './AdminDeletionButton';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

const statusOptions = [
  { value: 'open', label: 'Active', color: 'bg-green-100 text-green-800', badge: 'bg-green-500' },
  { value: 'in_progress', label: 'Active', color: 'bg-green-100 text-green-800', badge: 'bg-green-500' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', badge: 'bg-yellow-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', badge: 'bg-red-500' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800', badge: 'bg-gray-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-200 text-gray-700', badge: 'bg-gray-400' },
  { value: 'all', label: 'All', color: 'bg-white text-gray-800', badge: 'bg-gray-300' },
];

const statusToOption = (status: string) => statusOptions.find(opt => opt.value === status) || statusOptions[0];

const ProjectDetailsModal: React.FC<{
  project: any;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string, canResubmit: boolean) => void;
  onBlock: (reason: string) => void;
  onUnblock: () => void;
  onStatusChange: (status: string) => void;
  onRequestWorkspace: () => void;
  actionLoading: boolean;
  adminWorkspaceAccessRequested: boolean;
  adminWorkspaceAccessGranted: boolean;
}> = ({ project, onClose, onApprove, onReject, onBlock, onUnblock, onStatusChange, onRequestWorkspace, actionLoading, adminWorkspaceAccessRequested, adminWorkspaceAccessGranted }) => {
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showBlock, setShowBlock] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [canResubmit, setCanResubmit] = useState(true);

  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0 shadow-2xl border border-gray-100 p-2 sm:p-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 text-gray-500 hover:text-gray-700 focus:text-gray-700 shadow-sm transition z-10"
          aria-label="Close"
          style={{ fontSize: 24 }}
          disabled={actionLoading}
        >
          ×
        </button>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-100 bg-gray-50 rounded-t-lg gap-2 sm:gap-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                {project.title}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">{project.status}</span>
              </h3>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
              <span><Building className="inline w-4 h-4 mr-1" />{project.organization?.organization_name || 'Unknown Org'}</span>
              <span><Users className="inline w-4 h-4 mr-1" />{project.team_members?.length || 0} Members</span>
              <span><Clock className="inline w-4 h-4 mr-1" />{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
            {project.status === 'pending' && (
              <>
                <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm" size="sm" title="Approve Project" disabled={actionLoading}><CheckCircle className="w-4 h-4 mr-1" />Approve</Button>
                <Button onClick={() => setShowReject(true)} className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm" size="sm" title="Reject Project" disabled={actionLoading}><XCircle className="w-4 h-4 mr-1" />Reject</Button>
              </>
            )}
            {project.status !== 'rejected' ? (
              <Button onClick={() => setShowBlock(true)} className="bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm shadow" size="sm" title="Block Project" disabled={actionLoading}><AlertTriangle className="w-4 h-4 mr-1" />Block</Button>
            ) : (
              <Button onClick={onUnblock} className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm shadow" size="sm" title="Unblock Project" disabled={actionLoading}><CheckCircle className="w-4 h-4 mr-1" />Unblock</Button>
            )}
            {!adminWorkspaceAccessGranted ? (
              <Button
                onClick={onRequestWorkspace}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm shadow"
                size="sm"
                title="Request Workspace Access"
                disabled={adminWorkspaceAccessRequested || actionLoading}
              >
                <Folder className="w-4 h-4 mr-1" />
                {adminWorkspaceAccessRequested ? 'Request Pending' : 'Request Workspace'}
              </Button>
            ) : (
              <Button
                onClick={() => window.open(`/workspace/${project.id}`, '_blank')}
                className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm shadow"
                size="sm"
                title="Access Workspace"
                disabled={actionLoading}
              >
                <Folder className="w-4 h-4 mr-1" />
                Go to Workspace
              </Button>
            )}
            
            <AdminDeletionButton
              targetId={project.id}
              targetType="project"
              targetName={project.title}
              onDeleteSuccess={() => window.location.reload()}
              size="sm"
              className="text-xs sm:text-sm"
            />
          </div>
        </div>
        {/* Body */}
        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2"><FileText className="w-4 h-4" /> Description</h4>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{project.description}</p>
            </div>
          </div>
          {project.status === 'rejected' && project.rejection_reason && (
            <div>
              <h4 className="font-semibold mb-2 text-red-700 flex items-center gap-2"><XCircle className="w-4 h-4" /> Rejection Reason</h4>
              <div className="bg-red-50 rounded-lg p-3 sm:p-4">
                <p className="text-red-700 whitespace-pre-wrap text-sm sm:text-base">{project.rejection_reason}</p>
              </div>
            </div>
          )}
          <div>
            <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2"><Users className="w-4 h-4" /> Team</h4>
            <div className="flex flex-wrap gap-2">
              {project.team_members?.length === 0 && <span className="text-gray-400">No team members</span>}
              {project.team_members?.map((member: any) => (
                <div key={member.profile.id} className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                  {member.profile.avatar_url && <img src={member.profile.avatar_url} alt={member.profile.first_name} className="w-6 h-6 rounded-full" />}
                  <span>{member.profile.first_name} {member.profile.last_name}</span>
                  <span className="text-xs text-gray-400">({member.role})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Reject Modal */}
        {showReject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg max-w-md w-full mx-2 sm:mx-0 p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Reject Project</h3>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter rejection reason..." rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" />
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="canResubmit"
                  checked={canResubmit}
                  onChange={e => setCanResubmit(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="canResubmit" className="text-sm text-gray-700">Allow project to be resubmitted after rejection</label>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <Button onClick={() => { setShowReject(false); setRejectReason(''); setCanResubmit(true); }} variant="secondary" className="w-full sm:w-auto" disabled={actionLoading}>Cancel</Button>
                <Button onClick={() => { onReject(rejectReason, canResubmit); setShowReject(false); setRejectReason(''); setCanResubmit(true); }} disabled={!rejectReason.trim() || actionLoading} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">Reject Project</Button>
              </div>
            </div>
          </div>
        )}
        {/* Block Modal */}
        {showBlock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg max-w-md w-full mx-2 sm:mx-0 p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Block Project</h3>
              <textarea value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="Enter block reason..." rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" />
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <Button onClick={() => setShowBlock(false)} variant="secondary" className="w-full sm:w-auto" disabled={actionLoading}>Cancel</Button>
                <Button onClick={() => { onBlock(blockReason); setShowBlock(false); setBlockReason(''); }} disabled={!blockReason.trim() || actionLoading} className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto">Block Project</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectsManagement: React.FC = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // Default to All with smart ordering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{type: string, id: string, name: string} | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all projects with team/org info, including rejected
      const data = await projectService.getProjectsWithTeamMembers(undefined, true);
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.organization?.organization_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    
    if (filter === 'active') {
      matchesFilter = ['open', 'in_progress'].includes(p.status);
    } else if (filter === 'pending') {
      matchesFilter = p.status === 'pending';
    } else if (filter === 'rejected') {
      matchesFilter = p.status === 'rejected';
    } else if (filter === 'cancelled') {
      matchesFilter = p.status === 'cancelled';
    } else if (filter === 'completed') {
      matchesFilter = p.status === 'completed';
    }
    // filter === 'all' shows everything
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Smart ordering: pending first, then active, rejected, cancelled, completed last
    const statusPriority = {
      'pending': 1,
      'open': 2,
      'in_progress': 2,
      'rejected': 3,
      'cancelled': 4,
      'completed': 5
    };
    
    const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 6;
    const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 6;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Secondary sort by creation date (newest first for same status)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => ['open', 'in_progress'].includes(p.status)).length,
    pending: projects.filter(p => p.status === 'pending').length,
    rejected: projects.filter(p => p.status === 'rejected').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  const statArray = [
    { label: 'Total', value: stats.total, color: 'bg-blue-50' },
    { label: 'Active', value: stats.active, color: 'bg-green-50' },
    { label: 'Pending', value: stats.pending, color: 'bg-yellow-100 border border-yellow-300 shadow-lg' },
    { label: 'Rejected', value: stats.rejected, color: 'bg-red-50' },
    { label: 'Cancelled', value: stats.cancelled, color: 'bg-gray-100' },
    { label: 'Completed', value: stats.completed, color: 'bg-purple-50' },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handler functions for modal actions
  const handleApprove = async (project: any) => {
    if (!profile?.id) return;
    setActionLoading(true);
    try {
      await projectService.approveProject(project.id, profile.id);
      await loadProjects();
    } catch (err) {
      alert('Failed to approve project');
    } finally {
      setActionLoading(false);
      setSelectedProject(null);
    }
  };
  const handleReject = async (project: any, reason: string, canResubmit: boolean) => {
    if (!profile?.id) return;
    setActionLoading(true);
    try {
      await projectService.rejectProject(project.id, profile.id, reason, canResubmit);
      await loadProjects();
    } catch (err) {
      alert('Failed to reject project');
    } finally {
      setActionLoading(false);
      setSelectedProject(null);
    }
  };
  const handleBlock = async (project: any, reason: string) => {
    setActionLoading(true);
    try {
      await projectService.updateProject(project.id, { status: 'rejected', rejection_reason: reason });
      await loadProjects();
    } catch (err) {
      alert('Failed to block project');
    } finally {
      setActionLoading(false);
      setSelectedProject(null);
    }
  };
  const handleUnblock = async (project: any) => {
    setActionLoading(true);
    try {
      await projectService.updateProject(project.id, { status: 'pending', rejection_reason: null });
      await loadProjects();
    } catch (err) {
      alert('Failed to unblock project');
    } finally {
      setActionLoading(false);
      setSelectedProject(null);
    }
  };
  const handleStatusChange = async (project: any, status: 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'rejected') => {
    setActionLoading(true);
    try {
      await projectService.updateProject(project.id, { status });
      await loadProjects();
    } catch (err) {
      alert('Failed to change status');
    } finally {
      setActionLoading(false);
      setSelectedProject(null);
    }
  };

  const handleRequestWorkspace = async (project: any) => {
    if (project.status === 'pending') {
      alert('You must approve the project before requesting workspace access.');
      return;
    }
    setActionLoading(true);
    try {
      await projectService.requestWorkspaceAccess(project.id);
      await loadProjects();
    } catch (err) {
      alert('Failed to request workspace access');
    } finally {
      setActionLoading(false);
      setSelectedProject(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminTabHeader
        title="Projects"
        searchPlaceholder="Search projects..."
        onSearch={handleSearch}
        stats={statArray}
      >
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {[
            { value: 'all', label: 'All', color: 'bg-blue-50', badge: 'bg-blue-500' },
            { value: 'active', label: 'Active', color: 'bg-green-50', badge: 'bg-green-500' },
            { value: 'pending', label: 'Pending', color: 'bg-yellow-50', badge: 'bg-yellow-500' },
            { value: 'rejected', label: 'Rejected', color: 'bg-red-50', badge: 'bg-red-500' },
            { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-50', badge: 'bg-gray-500' },
            { value: 'completed', label: 'Completed', color: 'bg-purple-50', badge: 'bg-purple-500' }
          ].map((filterOption) => {
            const count = filterOption.value === 'all' ? stats.total :
                         filterOption.value === 'active' ? stats.active :
                         filterOption.value === 'pending' ? stats.pending :
                         filterOption.value === 'rejected' ? stats.rejected :
                         filterOption.value === 'cancelled' ? stats.cancelled :
                         filterOption.value === 'completed' ? stats.completed : 0;
            const isActive = filter === filterOption.value;
            return (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive 
                    ? filterOption.color + ' ring-2 ring-blue-500 ring-opacity-30' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${filterOption.badge}`}></span>
                {filterOption.label} ({count})
              </button>
            );
          })}
        </div>
      </AdminTabHeader>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No projects found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProjects.map((project) => {
              const statusOpt = statusToOption(project.status);
              const cardBg =
                project.status === 'open' || project.status === 'in_progress' ? 'bg-green-50' :
                project.status === 'pending' ? 'bg-yellow-50' :
                project.status === 'rejected' ? 'bg-red-50' :
                project.status === 'completed' ? 'bg-gray-50' :
                project.status === 'cancelled' ? 'bg-gray-100' :
                'bg-white';
              return (
                <div
                  key={project.id}
                  className={`p-4 sm:p-6 mb-2 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition ${cardBg}`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOpt.badge} text-white`}>
                          {statusOpt.label}
                        </span>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl ml-2">
                          {project.title}
                        </h3>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span><Building className="inline w-4 h-4 mr-1" />{project.organization?.organization_name || 'Unknown Org'}</span>
                        <span><Users className="inline w-4 h-4 mr-1" />{project.team_members?.length || 0} Members</span>
                        <span><Clock className="inline w-4 h-4 mr-1" />{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      {project.status === 'rejected' && project.rejection_reason && (
                        <div className="mt-2 text-xs text-red-600 font-semibold">
                          Rejection Reason: {project.rejection_reason}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 mt-4 sm:mt-0 ml-0 sm:ml-4 w-full sm:w-auto">
                      <Button
                        onClick={(e) => { e.stopPropagation(); setSelectedProject(project); }}
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto text-xs sm:text-sm border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        View Details
                      </Button>

                      {/* Action Buttons Based on Status */}
                      {project.status === 'pending' && (
                        <>
                          <Button
                            onClick={(e) => { e.stopPropagation(); handleApprove(project); }}
                            disabled={actionLoading}
                            className="w-full sm:w-auto text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white border-0"
                            size="sm"
                          >
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {actionLoading ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProject(project);
                              // We'll trigger reject modal from the details modal
                            }}
                            className="w-full sm:w-auto text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white border-0"
                            size="sm"
                          >
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {(project.status === 'open' || project.status === 'in_progress') && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            // Block action will be handled in modal
                          }}
                          className="w-full sm:w-auto text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-white border-0"
                          size="sm"
                        >
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Block
                        </Button>
                      )}

                      {project.status === 'rejected' && project.can_resubmit && (
                        <div className="text-xs text-blue-600 font-medium">
                          Can Resubmit
                        </div>
                      )}

                      {/* Delete Button (Always Available for Admin) */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open deletion modal
                          setDeleteTarget({ type: 'project', id: project.id, name: project.title });
                        }}
                        className="w-full sm:w-auto text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white border-0"
                        size="sm"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onApprove={() => handleApprove(selectedProject)}
          onReject={(reason, canResubmit) => handleReject(selectedProject, reason, canResubmit)}
          onBlock={(reason) => handleBlock(selectedProject, reason)}
          onUnblock={() => handleUnblock(selectedProject)}
          onStatusChange={(status) => handleStatusChange(selectedProject, status as 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'rejected')}
          onRequestWorkspace={() => handleRequestWorkspace(selectedProject)}
          adminWorkspaceAccessRequested={!!selectedProject.admin_workspace_access_requested}
          adminWorkspaceAccessGranted={!!selectedProject.admin_workspace_access_granted}
          actionLoading={actionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmationModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          targetId={deleteTarget.id}
          targetType={deleteTarget.type as 'project'}
          targetName={deleteTarget.name}
          onDeleteComplete={(result) => {
            setDeleteTarget(null);
            if (result.success) {
              loadProjects();
            }
          }}
        />
      )}
    </div>
  );
};

export default ProjectsManagement; 