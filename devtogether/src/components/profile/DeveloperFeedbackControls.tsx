import React, { useState, useEffect } from 'react';
import { Star, Eye, EyeOff, Check, X, Clock, MessageSquare, Building } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface OrganizationFeedback {
    id: string;
    organization_id: string;
    project_id: string;
    feedback_text: string;
    rating: number;
    is_visible: boolean;
    developer_approved: boolean | null;
    developer_hidden: boolean;
    created_at: string;
    organization: {
        organization_name: string;
        avatar_url?: string;
    };
    project: {
        title: string;
    };
}

export const DeveloperFeedbackControls: React.FC = () => {
    const { user } = useAuth();
    const [feedback, setFeedback] = useState<OrganizationFeedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (user) {
            loadFeedback();
        }
    }, [user]);

    const loadFeedback = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('organization_feedback')
                .select(`
                    id,
                    organization_id,
                    project_id,
                    feedback_text,
                    rating,
                    is_visible,
                    developer_approved,
                    developer_hidden,
                    created_at,
                    organization:profiles!organization_feedback_organization_id_fkey(
                        organization_name,
                        avatar_url
                    ),
                    project:projects!organization_feedback_project_id_fkey(
                        title
                    )
                `)
                .eq('developer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading feedback:', error);
                return;
            }

            setFeedback(data || []);
        } catch (error) {
            console.error('Error loading feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateFeedback = async (feedbackId: string, updates: { developer_approved?: boolean | null, developer_hidden?: boolean }) => {
        setProcessingIds(prev => new Set(prev).add(feedbackId));

        try {
            const { error } = await supabase
                .from('organization_feedback')
                .update(updates)
                .eq('id', feedbackId);

            if (error) {
                console.error('Error updating feedback:', error);
                alert('Failed to update feedback. Please try again.');
                return;
            }

            // Update local state
            setFeedback(prev => prev.map(f => 
                f.id === feedbackId ? { ...f, ...updates } : f
            ));

        } catch (error) {
            console.error('Error updating feedback:', error);
            alert('Failed to update feedback. Please try again.');
        } finally {
            setProcessingIds(prev => {
                const updated = new Set(prev);
                updated.delete(feedbackId);
                return updated;
            });
        }
    };

    const approveFeedback = (feedbackId: string) => {
        updateFeedback(feedbackId, { developer_approved: true, developer_hidden: false });
    };

    const hideFeedback = (feedbackId: string) => {
        updateFeedback(feedbackId, { developer_hidden: true });
    };

    const rejectFeedback = (feedbackId: string) => {
        updateFeedback(feedbackId, { developer_approved: false });
    };

    const restoreFeedback = (feedbackId: string) => {
        updateFeedback(feedbackId, { developer_hidden: false });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${
                    index < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                }`}
            />
        ));
    };

    const getFeedbackStatus = (feedback: OrganizationFeedback) => {
        if (feedback.developer_hidden) return 'hidden';
        if (feedback.developer_approved === true) return 'approved';
        if (feedback.developer_approved === false) return 'rejected';
        return 'pending';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'hidden': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <Check className="w-4 h-4" />;
            case 'rejected': return <X className="w-4 h-4" />;
            case 'hidden': return <EyeOff className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Organization Feedback
                        </h2>
                        <p className="text-sm text-gray-600">
                            Manage feedback from organizations you've worked with
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {feedback.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Feedback Yet
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Organizations you work with can provide feedback about your contributions. 
                            When you receive feedback, you'll be able to manage it here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feedback.map((item) => {
                            const status = getFeedbackStatus(item);
                            const isProcessing = processingIds.has(item.id);

                            return (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {item.organization.avatar_url ? (
                                                <img
                                                    src={item.organization.avatar_url}
                                                    alt={item.organization.organization_name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <Building className="w-5 h-5 text-gray-500" />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {item.organization.organization_name}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    Project: {item.project.title}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                {renderStars(item.rating)}
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getStatusColor(status)}`}>
                                                {getStatusIcon(status)}
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {item.feedback_text}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500">
                                            Received {new Date(item.created_at).toLocaleDateString()}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            {status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => approveFeedback(item.id)}
                                                        disabled={isProcessing}
                                                        className="!bg-green-600 hover:!bg-green-700 !text-white flex items-center gap-1"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => rejectFeedback(item.id)}
                                                        disabled={isProcessing}
                                                        className="!text-red-600 !border-red-300 hover:!bg-red-50 flex items-center gap-1"
                                                    >
                                                        <X className="w-3 h-3" />
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => hideFeedback(item.id)}
                                                        disabled={isProcessing}
                                                        className="!text-gray-600 !border-gray-300 hover:!bg-gray-50 flex items-center gap-1"
                                                    >
                                                        <EyeOff className="w-3 h-3" />
                                                        Hide
                                                    </Button>
                                                </>
                                            )}

                                            {status === 'approved' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => hideFeedback(item.id)}
                                                    disabled={isProcessing}
                                                    className="!text-gray-600 !border-gray-300 hover:!bg-gray-50 flex items-center gap-1"
                                                >
                                                    <EyeOff className="w-3 h-3" />
                                                    Hide
                                                </Button>
                                            )}

                                            {status === 'rejected' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => approveFeedback(item.id)}
                                                    disabled={isProcessing}
                                                    className="!bg-green-600 hover:!bg-green-700 !text-white flex items-center gap-1"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Approve
                                                </Button>
                                            )}

                                            {status === 'hidden' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => restoreFeedback(item.id)}
                                                    disabled={isProcessing}
                                                    className="!text-blue-600 !border-blue-300 hover:!bg-blue-50 flex items-center gap-1"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    Restore
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">How Feedback Works:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• <strong>Approve:</strong> Feedback appears on your public profile and helps build your reputation</li>
                            <li>• <strong>Reject:</strong> Feedback won't appear publicly but remains in your private records</li>
                            <li>• <strong>Hide:</strong> Temporarily hide feedback from your profile (can be restored later)</li>
                            <li>• <strong>Pending:</strong> New feedback waiting for your decision</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperFeedbackControls; 