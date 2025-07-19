import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { 
  adminDeletionService, 
  DeletionAnalysis, 
  DeletionResult 
} from '../../services/adminDeletionService';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'organization' | 'project' | 'developer';
  targetName: string;
  onDeleteComplete: (result: DeletionResult) => void;
}

type Step = 'analysis' | 'confirmation' | 'reason' | 'processing' | 'result';

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetName,
  onDeleteComplete
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('analysis');
  const [analysis, setAnalysis] = useState<DeletionAnalysis | null>(null);
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<DeletionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('analysis');
      setAnalysis(null);
      setReason('');
      setResult(null);
      setError(null);
      performAnalysis();
    }
  }, [isOpen, targetId]);

  const performAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let analysisResult: DeletionAnalysis;
      
      switch (targetType) {
        case 'organization':
          analysisResult = await adminDeletionService.analyzeOrganizationDeletion(targetId);
          break;
        case 'project':
          analysisResult = await adminDeletionService.analyzeProjectDeletion(targetId);
          break;
        case 'developer':
          analysisResult = await adminDeletionService.analyzeDeveloperDeletion(targetId);
          break;
        default:
          throw new Error('Invalid target type');
      }
      
      setAnalysis(analysisResult);
      setCurrentStep('confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeletion = () => {
    if (!analysis?.safe_to_delete && analysis?.warnings && analysis.warnings.length > 0) {
      // Show warnings for unsafe deletions
      setCurrentStep('confirmation');
    } else {
      setCurrentStep('reason');
    }
  };

  const handleProceedWithDeletion = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for deletion');
      return;
    }

    setCurrentStep('processing');
    setIsLoading(true);
    setError(null);

    try {
      let deletionResult: DeletionResult;
      
      switch (targetType) {
        case 'organization':
          deletionResult = await adminDeletionService.safeDeleteOrganization(targetId, reason);
          break;
        case 'project':
          deletionResult = await adminDeletionService.safeDeleteProject(targetId, reason);
          break;
        case 'developer':
          deletionResult = await adminDeletionService.safeDeleteDeveloper(targetId, reason);
          break;
        default:
          throw new Error('Invalid target type');
      }
      
      setResult(deletionResult);
      setCurrentStep('result');
      
      if (deletionResult.success) {
        onDeleteComplete(deletionResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deletion failed');
      setCurrentStep('reason');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const getStepTitle = () => {
    switch (currentStep) {
      case 'analysis':
        return 'Analyzing Impact...';
      case 'confirmation':
        return 'Confirm Deletion';
      case 'reason':
        return 'Deletion Reason';
      case 'processing':
        return 'Processing Deletion...';
      case 'result':
        return result?.success ? 'Deletion Complete' : 'Deletion Failed';
      default:
        return 'Delete Confirmation';
    }
  };

  const getTypeIcon = () => {
    switch (targetType) {
      case 'organization':
        return '🏢';
      case 'project':
        return '📋';
      case 'developer':
        return '👤';
      default:
        return '📄';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-red-100 rounded-full flex-shrink-0">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {getStepTitle()}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {getTypeIcon()} {targetName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
          >
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Analysis Step */}
          {currentStep === 'analysis' && (
            <div className="text-center py-6 sm:py-8">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Analyzing deletion impact and dependencies...
              </p>
            </div>
          )}

          {/* Confirmation Step */}
          {currentStep === 'confirmation' && analysis && (
            <div className="space-y-4">
              {/* Enhanced Impact Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Impact Summary</h4>
                <p className="text-sm text-gray-600">{analysis.impact_summary}</p>
                
                {/* Impact Level Badge */}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    analysis.deletion_impact === 'minimal' ? 'bg-green-100 text-green-800' :
                    analysis.deletion_impact === 'low' ? 'bg-blue-100 text-blue-800' :
                    analysis.deletion_impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {analysis.deletion_impact?.toUpperCase()} Impact
                  </span>
                </div>
              </div>

              {/* Enhanced Target Information */}
              {analysis.target_info && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Target Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {analysis.target_info.email && (
                      <p>📧 Email: {analysis.target_info.email}</p>
                    )}
                    {analysis.target_info.member_since && (
                      <p>📅 Member since: {new Date(analysis.target_info.member_since).toLocaleDateString()}</p>
                    )}
                    {analysis.target_info.verified !== undefined && (
                      <p>✅ Verified: {analysis.target_info.verified ? 'Yes' : 'No'}</p>
                    )}
                    {analysis.target_info.experience_level && (
                      <p>⭐ Experience: {analysis.target_info.experience_level}</p>
                    )}
                                         {analysis.target_info.active_projects_list?.length && analysis.target_info.active_projects_list.length > 0 && (
                       <p>🔗 Active in: {analysis.target_info.active_projects_list.join(', ')}</p>
                     )}
                    {analysis.target_info.action_required && (
                      <p className="font-medium text-purple-700">⚠️ Action required: {analysis.target_info.action_required}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Dependencies */}
              {analysis.dependencies && Object.keys(analysis.dependencies).length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    Dependencies & Impact
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {analysis.dependencies.projects && (
                      <p>📋 {analysis.dependencies.projects} project(s)</p>
                    )}
                    {analysis.dependencies.active_projects && (
                      <p>🔥 {analysis.dependencies.active_projects} active project(s)</p>
                    )}
                    {analysis.dependencies.applications && (
                      <p>📝 {analysis.dependencies.applications} application(s)</p>
                    )}
                    {analysis.dependencies.pending_applications && (
                      <p>⏳ {analysis.dependencies.pending_applications} pending application(s)</p>
                    )}
                    {analysis.dependencies.messages && (
                      <p>💬 {analysis.dependencies.messages} message(s)</p>
                    )}
                    {analysis.dependencies.team_memberships && (
                      <p>👥 {analysis.dependencies.team_memberships} team membership(s)</p>
                    )}
                    {analysis.dependencies.team_activities && (
                      <p>📊 {analysis.dependencies.team_activities} team activity record(s)</p>
                    )}
                  </div>
                </div>
              )}

              {analysis.warnings && analysis.warnings.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Warnings
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {analysis.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={`p-4 rounded-lg ${
                analysis.safe_to_delete 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center">
                  {analysis.safe_to_delete ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  )}
                  <p className={`text-sm font-medium ${
                    analysis.safe_to_delete ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    {analysis.safe_to_delete 
                      ? 'Safe to delete' 
                      : 'Deletion will impact other data'
                    }
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Are you sure you want to permanently delete this {targetType}? 
                This action cannot be undone.
              </p>
            </div>
          )}

          {/* Reason Step */}
          {currentStep === 'reason' && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="deletion-reason" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Reason for deletion <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="deletion-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Please explain why this deletion is necessary..."
                  required
                />
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs sm:text-sm text-yellow-700">
                  This action will be logged for audit purposes. Please provide a clear reason.
                </p>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {currentStep === 'processing' && (
            <div className="text-center py-6 sm:py-8">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Deleting {targetType}... Please wait.
              </p>
            </div>
          )}

          {/* Result Step */}
          {currentStep === 'result' && result && (
            <div className="text-center py-4 sm:py-6">
              {result.success ? (
                <div className="space-y-3 sm:space-y-4">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mx-auto" />
                  <div>
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      Deletion Successful
                    </h4>
                    <p className="text-gray-600">{result.message}</p>
                    {result.audit_id && (
                      <p className="text-xs text-gray-500 mt-2">
                        Audit ID: {result.audit_id}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <XCircle className="w-12 h-12 text-red-600 mx-auto" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Deletion Failed
                    </h4>
                    <p className="text-gray-600">{result.message}</p>
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-3 text-left">
                        <ul className="text-sm text-red-600 space-y-1">
                          {result.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t bg-gray-50">
          {currentStep === 'confirmation' && (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDeletion}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Continue
              </Button>
            </>
          )}

          {currentStep === 'reason' && (
            <>
              <Button
                variant="outline"
                onClick={() => setCurrentStep('confirmation')}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Back
              </Button>
              <Button
                variant="danger"
                onClick={handleProceedWithDeletion}
                disabled={isLoading || !reason.trim()}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Delete {targetType}
              </Button>
            </>
          )}

          {currentStep === 'result' && (
            <Button
              onClick={handleClose}
              variant={result?.success ? "primary" : "outline"}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 