import React, { useState } from 'react';
import { Calendar, Clock, Target, TrendingUp, Edit3, Save, X, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Project, ProjectStatus as ProjectStatusType } from '../../types/database';
import { workspaceService, ProjectStatusUpdate } from '../../services/workspaceService';

interface ProjectStatusProps {
    project: Project;
    isOwner: boolean;
    canEditStatus?: boolean;
    onStatusUpdate?: () => void;
}

export default function ProjectStatus({ project, isOwner, canEditStatus, onStatusUpdate }: ProjectStatusProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingStatus, setEditingStatus] = useState<{
        currentPhase: ProjectStatusType;
        progress: number;
        nextMilestone: string;
        deadline: string;
        notes: string;
    }>({
        currentPhase: project.status || 'open',
        progress: 0,
        nextMilestone: '',
        deadline: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const statusOptions = [
        { value: 'open' as ProjectStatusType, label: 'Open', color: 'bg-gray-100 text-gray-800', icon: Target },
        { value: 'in_progress' as ProjectStatusType, label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
        { value: 'completed' as ProjectStatusType, label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
        { value: 'cancelled' as ProjectStatusType, label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: X },
    ];

    const currentStatus = statusOptions.find(s => s.value === project.status) || statusOptions[0];

    // Enhanced status manager permissions
    let allowedStatusOptions = statusOptions;
    if (!isOwner && !canEditStatus) {
        allowedStatusOptions = [];
    } else if (isOwner) {
        // Organization owner - full control
        if (project.status === 'rejected') {
            // Allow resubmit: can set to 'pending' (resubmit flow)
            allowedStatusOptions = statusOptions.filter(option => option.value !== 'open');
            allowedStatusOptions.unshift({ 
                value: 'pending' as ProjectStatusType, 
                label: 'Pending', 
                color: 'bg-yellow-100 text-yellow-800',
                icon: Clock
            });
        } else {
            // Regular org: cannot set to 'open' or 'pending' (admin only)
            allowedStatusOptions = statusOptions.filter(option => option.value !== 'open' && option.value !== 'pending');
        }
    } else if (canEditStatus) {
        // Status manager - can only move from 'open' to 'in_progress'
        allowedStatusOptions = statusOptions.filter(option => {
            // Status managers can only start projects, cannot complete them
            if (project.status === 'open') {
                // From 'open' can only go to 'in_progress'
                return option.value === 'in_progress';
            }
            // Cannot change projects that are already in_progress, completed, or cancelled
            // Only organization owners can complete projects to award stars
            return false;
        });
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleSaveStatus = async () => {
        if (!isOwner && !canEditStatus) return;

        setLoading(true);
        try {
            const success = await workspaceService.updateProjectStatus(project.id, editingStatus);
            if (success) {
                setIsEditing(false);
                onStatusUpdate?.();
            } else {
                alert('Failed to update project status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update project status');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingStatus({
            currentPhase: project.status || 'open',
            progress: 0,
            nextMilestone: '',
            deadline: '',
            notes: ''
        });
    };

    const canEdit = isOwner || canEditStatus;
    const isStatusManager = canEditStatus && !isOwner;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Status Manager Limitation Notice */}
            {isStatusManager && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-blue-900 text-sm sm:text-base">Status Manager Controls</h4>
                            <p className="text-blue-700 text-xs sm:text-sm mt-1">
                                You can start projects by changing status from 'open' to 'in_progress'. Only organization owners can complete projects to award completion stars.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Status Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Project Status
                        </h3>
                        {canEdit && !isEditing && allowedStatusOptions.length > 0 && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                            >
                                <Edit3 className="w-4 h-4" />
                                <span className="hidden sm:inline">Edit Status</span>
                                <span className="sm:hidden">Edit</span>
                            </button>
                        )}
                    </div>

                    {/* Current Status Display */}
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 sm:p-3 rounded-lg ${currentStatus.color.replace('text-', 'bg-').replace('-800', '-100').replace('-700', '-100')}`}>
                                    <currentStatus.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-900">{currentStatus.label}</h4>
                                    <p className="text-gray-600 text-sm">Current project status</p>
                                </div>
                            </div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color} self-start sm:self-center`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                    project.status === 'open' ? 'bg-gray-500' :
                                    project.status === 'in_progress' ? 'bg-blue-500' :
                                    project.status === 'completed' ? 'bg-green-500' :
                                    'bg-red-500'
                                }`} />
                                {currentStatus.label}
                            </div>
                        </div>
                    </div>

                    {/* Status Edit Form */}
                    {isEditing && (
                        <div className="space-y-4 sm:space-y-6 border-t border-gray-200 pt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Change Status
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {allowedStatusOptions.map((option) => {
                                        const OptionIcon = option.icon;
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => setEditingStatus(prev => ({ ...prev, currentPhase: option.value }))}
                                                className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                                                    editingStatus.currentPhase === option.value
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <OptionIcon className="w-5 h-5 text-gray-600" />
                                                <div>
                                                    <span className="font-medium text-gray-900 text-sm sm:text-base">{option.label}</span>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {option.value === 'open' && 'Ready for development'}
                                                        {option.value === 'in_progress' && 'Currently being developed'}
                                                        {option.value === 'completed' && 'Project finished (awards stars)'}
                                                        {option.value === 'cancelled' && 'Project cancelled'}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status Manager Info */}
                            {isStatusManager && project.status === 'in_progress' && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-orange-900 text-sm">Project Completion</h4>
                                            <p className="text-orange-700 text-xs sm:text-sm mt-1">
                                                Only organization owners can mark projects as 'completed' since this awards completion stars to developers.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    onClick={handleSaveStatus}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                                >
                                    <Save className="w-4 h-4" />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Status Information */}
                    {!isEditing && (
                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Project Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Difficulty:</span>
                                    <span className="ml-2 text-gray-600 capitalize">{project.difficulty_level}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Max Team Size:</span>
                                    <span className="ml-2 text-gray-600">{project.max_team_size || 'Flexible'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Application Type:</span>
                                    <span className="ml-2 text-gray-600 capitalize">{project.application_type}</span>
                                </div>
                                {project.location && (
                                    <div>
                                        <span className="font-medium text-gray-700">Location:</span>
                                        <span className="ml-2 text-gray-600">{project.is_remote ? 'Remote' : project.location}</span>
                                    </div>
                                )}
                                {project.estimated_duration && (
                                    <div>
                                        <span className="font-medium text-gray-700">Duration:</span>
                                        <span className="ml-2 text-gray-600">{project.estimated_duration}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="font-medium text-gray-700">Created:</span>
                                    <span className="ml-2 text-gray-600">{formatDate(project.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 