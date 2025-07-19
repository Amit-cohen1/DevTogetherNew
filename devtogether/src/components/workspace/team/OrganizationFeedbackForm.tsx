import React, { useState } from 'react';
import { Star, MessageSquare, Send, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../ui/Button';
import { supabase } from '../../../utils/supabase';

interface OrganizationFeedbackFormProps {
    projectId: string;
    developerId: string;
    developerName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const OrganizationFeedbackForm: React.FC<OrganizationFeedbackFormProps> = ({
    projectId,
    developerId,
    developerName,
    onClose,
    onSuccess
}) => {
    const { user } = useAuth();
    const [feedbackText, setFeedbackText] = useState('');
    const [rating, setRating] = useState<number>(5);
    const [isVisible, setIsVisible] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!feedbackText.trim()) {
            alert('Please provide feedback text');
            return;
        }

        if (!user) {
            alert('You must be logged in to submit feedback');
            return;
        }

        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('organization_feedback')
                .insert({
                    organization_id: user.id,
                    developer_id: developerId,
                    project_id: projectId,
                    feedback_text: feedbackText.trim(),
                    rating: rating,
                    is_visible: isVisible,
                    developer_approved: null, // Pending developer approval
                    developer_hidden: false
                });

            if (error) {
                console.error('Error submitting feedback:', error);
                alert('Failed to submit feedback. Please try again.');
                return;
            }

            alert('Feedback submitted successfully! The developer can choose to approve it for public display.');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            Give Feedback to {developerName}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Share your experience working with this developer
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Overall Rating
                        </label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                        star <= rating
                                            ? 'text-yellow-500 hover:text-yellow-600'
                                            : 'text-gray-300 hover:text-gray-400'
                                    }`}
                                >
                                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                                {rating} star{rating !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Feedback Text */}
                    <div>
                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                            Feedback
                        </label>
                        <textarea
                            id="feedback"
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Share your experience working with this developer. What did they do well? How did they contribute to the project's success?"
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {feedbackText.length}/1000 characters
                        </p>
                    </div>

                    {/* Visibility Settings */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Visibility
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={isVisible}
                                    onChange={() => setIsVisible(true)}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    Public (visible on developer's profile after approval)
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={!isVisible}
                                    onChange={() => setIsVisible(false)}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    Private (only visible to you and the developer)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">About Feedback Privacy:</p>
                                <ul className="space-y-1 text-blue-700">
                                    <li>• The developer will receive your feedback and can choose to approve it for public display</li>
                                    <li>• You can only give feedback to developers in your projects</li>
                                    <li>• This feedback helps developers build their portfolio and reputation</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || !feedbackText.trim()}
                            className="flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Submit Feedback
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrganizationFeedbackForm; 