import React, { useState, useEffect } from 'react';
import { Shield, X, CheckCircle, InfoIcon } from 'lucide-react';

interface StatusManagerNotificationProps {
    userIsStatusManager: boolean;
    projectId?: string;
    onDismiss?: () => void;
}

export default function StatusManagerNotification({ userIsStatusManager, projectId, onDismiss }: StatusManagerNotificationProps) {
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if notification was previously dismissed for this project
        if (projectId) {
            const storageKey = `status-manager-notification-dismissed-${projectId}`;
            const wasDismissed = localStorage.getItem(storageKey) === 'true';
            setIsDismissed(wasDismissed);
        }
    }, [projectId]);

    // Only show if user is a status manager and hasn't dismissed
    if (!userIsStatusManager || isDismissed) {
        return null;
    }

    const handleDismiss = () => {
        setIsDismissed(true);

        // Persist dismissal state
        if (projectId) {
            const storageKey = `status-manager-notification-dismissed-${projectId}`;
            localStorage.setItem(storageKey, 'true');
        }

        onDismiss?.();
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                You're now a Status Manager!
                            </h3>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>

                        <p className="text-gray-700 mb-4">
                            Congratulations! The organization has promoted you to <strong>Status Manager</strong> for this project.
                            This means you now have additional responsibilities and permissions.
                        </p>

                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-3">
                                <InfoIcon className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-gray-900">Your new permissions include:</span>
                            </div>

                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                    <span>Update project status and progress</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                    <span>Set project milestones and deadlines</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                    <span>Add progress notes and updates</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                    <span>Help coordinate team activities</span>
                                </li>
                            </ul>

                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>💡 Tip:</strong> You can update the project status by navigating to the "Status" tab.
                                    This helps keep the team and organization informed about project progress.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Dismiss notification"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
} 