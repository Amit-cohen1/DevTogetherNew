import React from 'react';
import { Shield, Star, Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface StatusManagerNotificationProps {
    userIsStatusManager: boolean;
    projectId: string;
}

export default function StatusManagerNotification({ userIsStatusManager, projectId }: StatusManagerNotificationProps) {
    if (!userIsStatusManager) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-green-900 flex items-center gap-2">
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            Status Manager Privileges
                        </h3>
                        <p className="text-green-700 text-sm sm:text-base">
                            You have been promoted to Status Manager for this project
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white/60 border border-green-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Settings className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-green-900 text-sm sm:text-base">Project Status</h4>
                    </div>
                    <p className="text-green-700 text-xs sm:text-sm">
                        Change project status from 'open' to 'in_progress' and manage project updates
                    </p>
                </div>

                <div className="bg-white/60 border border-green-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-green-900 text-sm sm:text-base">Team Progress</h4>
                    </div>
                    <p className="text-green-700 text-xs sm:text-sm">
                        Monitor team activity and coordinate development progress
                    </p>
                </div>

                <div className="bg-white/60 border border-orange-200 rounded-lg p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <h4 className="font-semibold text-orange-900 text-sm sm:text-base">Limitation</h4>
                    </div>
                    <p className="text-orange-700 text-xs sm:text-sm">
                        Only organization owners can set status to 'completed' to award stars
                    </p>
                </div>
            </div>

            <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-3">
                <p className="text-green-800 text-xs sm:text-sm font-medium">
                    💡 <strong>Pro Tip:</strong> Use the 'Status' tab to manage project progression and keep the team updated on milestones.
                </p>
            </div>
        </div>
    );
} 