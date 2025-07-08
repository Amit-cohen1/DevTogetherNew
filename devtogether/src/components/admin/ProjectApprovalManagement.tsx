import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Building,
  Calendar,
  AlertTriangle,
  FileText,
  Mail,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';

interface PendingProject {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  status: string;
  created_at: string;
  organization_name: string;
  organization_email: string;
  hours_waiting: number;
}

interface ProjectDetailsModalProps {
  project: PendingProject | null;
  onClose: () => void;
  onApprove: (projectId: string) => void;
  onReject: (projectId: string, reason: string) => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ 
  project, 
  onClose, 
  onApprove, 
  onReject 
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!project) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove(project.id);
    setIsProcessing(false);
    onClose();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }
    setIsProcessing(true);
    await onReject(project.id, rejectionReason);
    setIsProcessing(false);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUrgencyColor = (hours: number) => {
    if (hours > 72) return 'text-red-600 bg-red-100';
    if (hours > 24) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{project.title}</h3>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {project.organization_name}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {project.organization_email}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(project.created_at)}
                </span>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(project.hours_waiting)}`}>
                  <Clock className="h-3 w-3 mr-1" />
                  Waiting {Math.round(project.hours_waiting)} hours
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  {project.difficulty_level}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Project Description</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
              </div>
            </div>

            {project.hours_waiting > 48 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div className="ml-3">
                    <h5 className="text-sm font-medium text-red-800">
                      Project pending for a long time
                    </h5>
                    <p className="text-sm text-red-700 mt-1">
                      This project has been pending approval for more than 48 hours. Please address it as soon as possible.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {!showRejectForm ? (
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowRejectForm(true)}
                variant="secondary"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Project
              </Button>
              <Button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isProcessing ? 'Approving...' : 'Approve Project'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection reason:
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter reason for rejecting the project..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setShowRejectForm(false)}
                  variant="secondary"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProjectApprovalManagement: React.FC = () => {
  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PendingProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPendingProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('admin_pending_projects')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setPendingProjects(data || []);
    } catch (error) {
      console.error('Error loading pending projects:', error);
      setError('Error loading pending projects');
    } finally {
      setLoading(false);
    }
  };

  const approveProject = async (projectId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('approve_project', {
        project_id: projectId,
        admin_id: user.user.id
      });

      if (error) throw error;

      if (data.success) {
        await loadPendingProjects();
        alert('Project approved successfully!');
      } else {
        alert('Error approving project: ' + data.error);
      }
    } catch (error) {
      console.error('Error approving project:', error);
      alert('Error approving project');
    }
  };

  const rejectProject = async (projectId: string, reason: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('reject_project', {
        project_id: projectId,
        admin_id: user.user.id,
        reason: reason
      });

      if (error) throw error;

      if (data.success) {
        await loadPendingProjects();
        alert('Project rejected successfully!');
      } else {
        alert('Error rejecting project: ' + data.error);
      }
    } catch (error) {
      console.error('Error rejecting project:', error);
      alert('Error rejecting project');
    }
  };

  useEffect(() => {
    loadPendingProjects();
  }, []);

  const getUrgencyColor = (hours: number) => {
    if (hours > 72) return 'border-l-red-500 bg-red-50';
    if (hours > 24) return 'border-l-yellow-500 bg-yellow-50';
    return 'border-l-green-500 bg-green-50';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Project Approval Management</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow border p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Approval Management</h2>
          <p className="text-gray-600 mt-1">
            Projects pending approval before being published on the site
          </p>
        </div>
        <Button onClick={loadPendingProjects} variant="secondary">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {pendingProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects pending approval
          </h3>
          <p className="text-gray-500">
            All new projects will appear here for approval
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingProjects.map((project) => (
            <div 
              key={project.id} 
              className={`bg-white rounded-lg shadow border-l-4 p-6 ${getUrgencyColor(project.hours_waiting)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.title}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {project.difficulty_level}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.hours_waiting > 72 ? 'bg-red-100 text-red-800' :
                      project.hours_waiting > 24 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.round(project.hours_waiting)} hours
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {project.organization_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(project.created_at).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mr-4">
                  <Button
                    onClick={() => setSelectedProject(project)}
                    variant="secondary"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    הצג פרטים
                  </Button>
                  <Button
                    onClick={() => rejectProject(project.id, 'Quick rejection')}
                    variant="secondary"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => approveProject(project.id)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onApprove={approveProject}
          onReject={rejectProject}
        />
      )}
    </div>
  );
};

export default ProjectApprovalManagement; 