import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Building, Calendar } from 'lucide-react';
import { supabase } from '../../utils/supabase';

interface OrganizationFeedback {
    id: string;
    organization_id: string;
    project_id: string;
    feedback_text: string;
    rating: number;
    created_at: string;
    organization: {
        organization_name: string;
        avatar_url?: string;
    };
    project: {
        title: string;
    };
}

interface PublicFeedbackDisplayProps {
    userId: string;
    className?: string;
}

export const PublicFeedbackDisplay: React.FC<PublicFeedbackDisplayProps> = ({
    userId,
    className = ''
}) => {
    const [feedback, setFeedback] = useState<OrganizationFeedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPublicFeedback();
    }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadPublicFeedback = async () => {
        try {
            setLoading(true);
            
            // Query for approved and visible feedback only (public viewing)
            const { data, error } = await supabase
                .from('organization_feedback')
                .select(`
                    id,
                    organization_id,
                    project_id,
                    feedback_text,
                    rating,
                    created_at,
                    organization:profiles!organization_feedback_organization_id_fkey(
                        organization_name,
                        avatar_url
                    ),
                    project:projects!organization_feedback_project_id_fkey(
                        title
                    )
                `)
                .eq('developer_id', userId)
                .eq('is_visible', true)
                .eq('developer_approved', true)
                .eq('developer_hidden', false)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading public feedback:', error);
                return;
            }

            setFeedback(data || []);
        } catch (error) {
            console.error('Error loading public feedback:', error);
        } finally {
            setLoading(false);
        }
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

    const calculateAverageRating = () => {
        if (feedback.length === 0) return 0;
        const total = feedback.reduce((sum, item) => sum + item.rating, 0);
        return Math.round((total / feedback.length) * 10) / 10;
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-20 bg-gray-200 rounded" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const averageRating = calculateAverageRating();

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Organization Feedback
                            </h2>
                            <p className="text-sm text-gray-600">
                                {feedback.length === 0 ? 'Professional feedback from organizations' : `${feedback.length} review${feedback.length !== 1 ? 's' : ''} from organizations`}
                            </p>
                        </div>
                    </div>
                    
                    {/* Average Rating Display - Only show when there's feedback */}
                    {feedback.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                {renderStars(Math.round(averageRating))}
                            </div>
                            <span className="text-lg font-semibold text-gray-900">
                                {averageRating}
                            </span>
                            <span className="text-sm text-gray-500">
                                ({feedback.length})
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6">
                {feedback.length === 0 ? (
                    /* Empty State for Public Viewing */
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Public Feedback Yet
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-4">
                            This developer hasn't received any approved organization feedback yet. 
                            Feedback from completed projects will appear here once approved by the developer.
                        </p>
                        <div className="bg-blue-50 rounded-lg p-4 max-w-sm mx-auto">
                            <p className="text-sm text-blue-800">
                                <span className="font-medium">✨ Coming Soon:</span> Professional feedback from organizations this developer has worked with.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {feedback.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {item.organization.avatar_url ? (
                                                <img
                                                    src={item.organization.avatar_url}
                                                    alt={item.organization.organization_name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                                                    <Building className="w-6 h-6 text-purple-600" />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-lg">
                                                    {item.organization.organization_name}
                                                </h4>
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <span>Project:</span>
                                                    <span className="font-medium">{item.project.title}</span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-1">
                                                {renderStars(item.rating)}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(item.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-800 leading-relaxed">
                                            "{item.feedback_text}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Footer - Only show when there's feedback */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-blue-800 font-medium mb-1">
                                    ✨ Professional Feedback Summary:
                                </p>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• <strong>{feedback.length}</strong> organization{feedback.length !== 1 ? 's have' : ' has'} provided feedback</li>
                                    <li>• Average rating: <strong>{averageRating}/5</strong> stars</li>
                                    <li>• All feedback has been approved by the developer for public display</li>
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}; 