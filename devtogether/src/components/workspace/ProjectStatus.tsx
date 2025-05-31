import React, { useState } from 'react';
import { Calendar, Clock, Target, TrendingUp, Edit3, Save, X } from 'lucide-react';
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
        { value: 'open' as ProjectStatusType, label: 'Open', color: 'bg-gray-100 text-gray-800' },
        { value: 'in_progress' as ProjectStatusType, label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
        { value: 'completed' as ProjectStatusType, label: 'Completed', color: 'bg-green-100 text-green-800' },
        { value: 'cancelled' as ProjectStatusType, label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    ];

    const currentStatus = statusOptions.find(s => s.value === project.status) || statusOptions[0];

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

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Project Status
                </h3>

                {(isOwner || canEditStatus) && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                        Update Status
                    </button>
                )}

                {isEditing && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSaveStatus}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Current Status */}
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Current Phase</label>
                    {isEditing ? (
                        <select
                            value={editingStatus.currentPhase}
                            onChange={(e) => setEditingStatus(prev => ({ ...prev, currentPhase: e.target.value as ProjectStatusType }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${currentStatus.color}`}>
                            {currentStatus.label}
                        </span>
                    )}
                </div>

                {/* Project Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Created</p>
                            <p className="text-sm text-gray-600">{formatDate(project.created_at)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Last Updated</p>
                            <p className="text-sm text-gray-600">{formatDate(project.updated_at)}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Indicator */}
                {isEditing && (
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Progress ({editingStatus.progress}%)
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={editingStatus.progress}
                            onChange={(e) => setEditingStatus(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>
                )}

                {/* Next Milestone */}
                {isEditing && (
                    <div>
                        <label htmlFor="nextMilestone" className="text-sm font-medium text-gray-700 mb-2 block">
                            Next Milestone
                        </label>
                        <input
                            type="text"
                            id="nextMilestone"
                            value={editingStatus.nextMilestone}
                            onChange={(e) => setEditingStatus(prev => ({ ...prev, nextMilestone: e.target.value }))}
                            placeholder="e.g., Complete user authentication"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                )}

                {/* Deadline */}
                {isEditing && (
                    <div>
                        <label htmlFor="deadline" className="text-sm font-medium text-gray-700 mb-2 block">
                            Target Deadline
                        </label>
                        <input
                            type="date"
                            id="deadline"
                            value={editingStatus.deadline}
                            onChange={(e) => setEditingStatus(prev => ({ ...prev, deadline: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                )}

                {/* Notes */}
                {isEditing && (
                    <div>
                        <label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                            Notes & Updates
                        </label>
                        <textarea
                            id="notes"
                            value={editingStatus.notes}
                            onChange={(e) => setEditingStatus(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Add any status updates, blockers, or notes for the team..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                )}

                {/* Project Key Info */}
                <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Project Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
                        {project.deadline && (
                            <div>
                                <span className="font-medium text-gray-700">Deadline:</span>
                                <span className="ml-2 text-gray-600">{formatDate(project.deadline)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 