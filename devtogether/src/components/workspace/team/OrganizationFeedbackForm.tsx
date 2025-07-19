import React, { useState } from 'react';
import { Star, MessageSquare, Send, X, Eye, EyeOff, Globe } from 'lucide-react';
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full h-full sm:h-auto sm:max-h-[95vh] flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-xl">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg flex-shrink-0">
                                    <Star className="w-4 h-4 sm:w-6 sm:h-6" />
                                </div>
                                <span className="truncate">Give Feedback to {developerName}</span>
                            </h2>
                            <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-lg">
                                Help {developerName} build their professional reputation
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg flex-shrink-0"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Enhanced Rating Section */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-3 sm:p-5">
                        <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-600" />
                            Rate {developerName}'s Performance
                        </label>
                        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
                                        star <= rating
                                            ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-100 shadow-lg'
                                            : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'
                                    }`}
                                    title={`${star} star${star !== 1 ? 's' : ''}`}
                                >
                                    <Star className={`w-6 h-6 sm:w-8 sm:h-8 ${star <= rating ? 'fill-current' : ''}`} />
                                </button>
                            ))}
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-yellow-700 mb-1">
                                {rating} out of 5 stars
                            </div>
                            <div className="text-sm text-gray-600">
                                {rating === 5 && "⭐ Exceptional work!"}
                                {rating === 4 && "🌟 Great job!"}
                                {rating === 3 && "👍 Good work!"}
                                {rating === 2 && "👌 Satisfactory"}
                                {rating === 1 && "⚠️ Needs improvement"}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Feedback Text Section */}
                    <div>
                        <label htmlFor="feedback" className="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            Share Your Experience with {developerName}
                        </label>
                        
                        {/* Feedback Guidelines */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-blue-900 mb-2">💡 What makes great feedback:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• <strong>Technical skills:</strong> Code quality, problem-solving, tech expertise</li>
                                <li>• <strong>Communication:</strong> How well they communicated and collaborated</li>
                                <li>• <strong>Reliability:</strong> Meeting deadlines and commitments</li>
                                <li>• <strong>Impact:</strong> Specific contributions to project success</li>
                                <li>• <strong>Growth:</strong> Learning ability and adaptability</li>
                            </ul>
                        </div>

                        <textarea
                            id="feedback"
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            rows={5}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base resize-none"
                            placeholder="Example: &quot;[Developer Name] was exceptional to work with on our project. Their JavaScript skills were outstanding, and they consistently delivered clean, well-documented code. They were proactive in suggesting improvements and always met project deadlines. Their communication was clear and professional throughout the collaboration. I would definitely work with them again!&quot;"
                            required
                            maxLength={1000}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <div className="text-sm text-gray-500">
                                💡 Tip: Specific examples make feedback more valuable
                            </div>
                            <div className={`text-sm font-medium ${
                                feedbackText.length > 900 ? 'text-red-600' : 
                                feedbackText.length > 700 ? 'text-yellow-600' : 'text-gray-500'
                            }`}>
                                {feedbackText.length}/1000 characters
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Visibility Settings */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                        <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-gray-600" />
                            Feedback Visibility
                        </label>
                        <div className="space-y-4">
                            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                isVisible ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={isVisible}
                                    onChange={() => setIsVisible(true)}
                                    className="text-green-600 focus:ring-green-500 mt-1"
                                />
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-900 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-green-600" />
                                        Public Feedback (Recommended)
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Appears on {developerName}'s public profile after they approve it. 
                                        Helps them build their professional reputation and showcase their work.
                                    </div>
                                </div>
                            </label>
                            <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                !isVisible ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={!isVisible}
                                    onChange={() => setIsVisible(false)}
                                    className="text-blue-600 focus:ring-blue-500 mt-1"
                                />
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-900 flex items-center gap-2">
                                        <EyeOff className="w-4 h-4 text-blue-600" />
                                        Private Feedback
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Only visible to you and {developerName}. Won't appear on their public profile.
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Enhanced Privacy Notice */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Star className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-purple-900 mb-2 text-base">
                                    🛡️ How Feedback Works
                                </h4>
                                <div className="space-y-2 text-sm text-purple-800">
                                    <div className="flex items-start gap-2">
                                        <span className="text-purple-600">1️⃣</span>
                                        <span><strong>{developerName}</strong> receives your feedback immediately</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-purple-600">2️⃣</span>
                                        <span>They can <strong>approve</strong> it for public display on their profile</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-purple-600">3️⃣</span>
                                        <span>Approved feedback helps them showcase their professional experience</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-purple-600">🔒</span>
                                        <span>Only team members from shared projects can give feedback</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Actions Section */}
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4 mt-auto">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                            <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                            <span>Your feedback helps developers grow and build their careers</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base order-2 sm:order-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || !feedbackText.trim()}
                                className="flex items-center justify-center gap-2 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all order-1 sm:order-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span className="hidden sm:inline">Submitting Feedback...</span>
                                        <span className="sm:hidden">Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline">Submit {rating}-Star Feedback</span>
                                        <span className="sm:hidden">Submit ({rating}⭐)</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrganizationFeedbackForm; 