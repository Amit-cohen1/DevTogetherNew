import React, { useState } from 'react';
import { Calendar, Clock, Users, X, Video, Save } from 'lucide-react';
import { meetingService, MeetingCreateData } from '../../services/meetingService';
import { useAuth } from '../../contexts/AuthContext';

interface MeetingSchedulerModalProps {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
    onMeetingCreated?: () => void;
}

export default function MeetingSchedulerModal({ projectId, isOpen, onClose, onMeetingCreated }: MeetingSchedulerModalProps) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<MeetingCreateData, 'project_id'>>({
        title: '',
        description: '',
        meeting_date: '',
        duration_minutes: 60,
        meeting_type: 'standup',
        meeting_url: ''
    });

    const meetingTypes = [
        { value: 'standup', label: 'Daily Standup', icon: '⚡', description: 'Quick team sync and status updates' },
        { value: 'planning', label: 'Planning Meeting', icon: '📋', description: 'Sprint planning and task organization' },
        { value: 'review', label: 'Review Meeting', icon: '👁️', description: 'Demo and review completed work' },
        { value: 'retrospective', label: 'Retrospective', icon: '🔄', description: 'Team reflection and improvement' },
        { value: 'demo', label: 'Demo Session', icon: '🎯', description: 'Present work to stakeholders' },
        { value: 'other', label: 'Other Meeting', icon: '🤝', description: 'General team meeting' }
    ];

    const durations = [
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 45, label: '45 minutes' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
        { value: 120, label: '2 hours' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            // Generate Jitsi URL if none provided
            let meetingUrl = formData.meeting_url;
            if (!meetingUrl) {
                meetingUrl = meetingService.generateJitsiMeetUrl(projectId);
            }

            const result = await meetingService.createMeeting({
                ...formData,
                project_id: projectId,
                meeting_url: meetingUrl
            }, user.id);

            if (result.success) {
                onMeetingCreated?.();
                onClose();
                setFormData({
                    title: '',
                    description: '',
                    meeting_date: '',
                    duration_minutes: 60,
                    meeting_type: 'standup',
                    meeting_url: ''
                });
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateJitsiUrl = () => {
        const url = meetingService.generateJitsiMeetUrl(projectId);
        setFormData(prev => ({ ...prev, meeting_url: url }));
    };

    // Get current date for min date input
    const now = new Date();
    const minDateTime = now.toISOString().slice(0, 16);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        Schedule Team Meeting
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Meeting Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Meeting Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., Sprint Planning, Daily Standup"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Meeting Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Meeting Type</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {meetingTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, meeting_type: type.value as any }))}
                                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                                        formData.meeting_type === type.value
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{type.icon}</span>
                                        <span className="font-medium text-sm">{type.label}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{type.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="meeting_date" className="block text-sm font-medium text-gray-700 mb-2">
                                Date & Time *
                            </label>
                            <input
                                type="datetime-local"
                                id="meeting_date"
                                required
                                min={minDateTime}
                                value={formData.meeting_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, meeting_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                                Duration
                            </label>
                            <select
                                id="duration"
                                value={formData.duration_minutes}
                                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {durations.map((duration) => (
                                    <option key={duration.value} value={duration.value}>
                                        {duration.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Meeting agenda, topics to discuss, or any additional information..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Meeting URL */}
                    <div>
                        <label htmlFor="meeting_url" className="block text-sm font-medium text-gray-700 mb-2">
                            Video Meeting URL
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                id="meeting_url"
                                value={formData.meeting_url}
                                onChange={(e) => setFormData(prev => ({ ...prev, meeting_url: e.target.value }))}
                                placeholder="https://meet.jit.si/your-room or leave empty to auto-generate"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={handleGenerateJitsiUrl}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                <Video className="w-4 h-4" />
                                Generate Jitsi
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            A Jitsi Meet URL will be auto-generated if left empty
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Schedule Meeting
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 