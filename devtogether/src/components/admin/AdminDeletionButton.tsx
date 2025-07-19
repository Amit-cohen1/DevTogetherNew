import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { DeletionResult } from '../../services/adminDeletionService';
import { toastService } from '../../services/toastService';

interface AdminDeletionButtonProps {
  targetId: string;
  targetType: 'organization' | 'project' | 'developer';
  targetName: string;
  onDeleteSuccess?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'danger' | 'outline';
}

export const AdminDeletionButton: React.FC<AdminDeletionButtonProps> = ({
  targetId,
  targetType,
  targetName,
  onDeleteSuccess,
  className = '',
  size = 'sm',
  variant = 'danger'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteComplete = (result: DeletionResult) => {
    if (result.success) {
      toastService.success(result.message);
      
      // Close modal
      setIsModalOpen(false);
      
      // Trigger parent refresh
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } else {
      toastService.error(result.message);
    }
  };

  const getButtonText = () => {
    switch (targetType) {
      case 'organization':
        return 'Delete Org';
      case 'project':
        return 'Delete Project';
      case 'developer':
        return 'Delete User';
      default:
        return 'Delete';
    }
  };

  const getTooltipText = () => {
    return `Permanently delete ${targetType}: ${targetName}`;
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center space-x-1 ${className}`}
        title={getTooltipText()}
      >
        <Trash2 className="w-4 h-4" />
        {size !== 'sm' && <span>{getButtonText()}</span>}
      </Button>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetId={targetId}
        targetType={targetType}
        targetName={targetName}
        onDeleteComplete={handleDeleteComplete}
      />
    </>
  );
}; 