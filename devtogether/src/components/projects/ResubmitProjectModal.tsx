import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { projectService } from '../../services/projects';
import type { ProjectWithTeamMembers } from '../../types/database';
import { TECHNOLOGY_STACK_OPTIONS, DIFFICULTY_LEVELS, APPLICATION_TYPES, ESTIMATED_DURATIONS } from '../../utils/constants';
import { TechnologyStackSelector } from './TechnologyStackSelector';
import { toastService } from '../../services/toastService';

interface ResubmitProjectModalProps {
  open: boolean;
  project: ProjectWithTeamMembers | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResubmitProjectModal({ open, project, onClose, onSuccess }: ResubmitProjectModalProps) {
  const [resubmitTitle, setResubmitTitle] = useState('');
  const [resubmitDescription, setResubmitDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [technologyStack, setTechnologyStack] = useState<string[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');
  const [applicationType, setApplicationType] = useState('both');
  const [maxTeamSize, setMaxTeamSize] = useState<number | ''>('');
  const [deadline, setDeadline] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [isRemote, setIsRemote] = useState(true);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (open && project) {
      setResubmitTitle(project.title || '');
      setResubmitDescription(project.description || '');
      setRequirements(project.requirements || '');
      setTechnologyStack(project.technology_stack || []);
      setDifficultyLevel(project.difficulty_level || 'beginner');
      setApplicationType(project.application_type || 'both');
      setMaxTeamSize(project.max_team_size || '');
      setDeadline(project.deadline || '');
      setEstimatedDuration(project.estimated_duration || '');
      setIsRemote(project.is_remote ?? true);
      setLocation(project.location || '');
    }
  }, [open, project]);

  if (!open || !project || project.status !== 'rejected' || !project.can_resubmit) return null;

  const handleResubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build update object with all fields
      const updateData: any = {
        title: resubmitTitle,
        description: resubmitDescription,
        requirements,
        technology_stack: technologyStack,
        difficulty_level: difficultyLevel,
        application_type: applicationType,
        max_team_size: applicationType === 'individual' ? 1 : maxTeamSize || null,
        deadline: deadline || null,
        estimated_duration: estimatedDuration || null,
        is_remote: isRemote,
        location: isRemote ? null : location || null,
      };
      await projectService.updateProject(project.id, updateData);
      const ok = await projectService.resubmitProject(project.id);
      if (ok) {
        setSuccess(true);
        toastService.success('Project resubmitted successfully! It will be reviewed by our admin team.');
        setTimeout(() => {
          setSuccess(false);
          onSuccess && onSuccess();
        }, 1000);
      } else {
        setError('Failed to resubmit project.');
        toastService.error('Failed to resubmit project. Please try again.');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to resubmit project.';
      setError(errorMessage);
      toastService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Resubmit Project</h2>
        {project.rejection_reason && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            <b>Rejection Reason:</b> {project.rejection_reason}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={resubmitTitle} onChange={e => { setResubmitTitle(e.target.value); }} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
          <textarea className="w-full border rounded px-3 py-2" rows={3} value={resubmitDescription} onChange={e => { setResubmitDescription(e.target.value); }} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Requirements & Expectations</label>
          <textarea className="w-full border rounded px-3 py-2" rows={3} value={requirements} onChange={e => setRequirements(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Technology Stack</label>
          <TechnologyStackSelector selectedTechnologies={technologyStack} onSelectionChange={setTechnologyStack} options={TECHNOLOGY_STACK_OPTIONS} />
        </div>
        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
            <select className="w-full border rounded px-3 py-2" value={difficultyLevel} onChange={e => setDifficultyLevel(e.target.value as any)}>
              {DIFFICULTY_LEVELS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Type</label>
            <select className="w-full border rounded px-3 py-2" value={applicationType} onChange={e => setApplicationType(e.target.value as any)}>
              {APPLICATION_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        {applicationType !== 'individual' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Size</label>
            <input type="number" className="w-full border rounded px-3 py-2" value={maxTeamSize} onChange={e => setMaxTeamSize(Number(e.target.value))} min={2} max={20} />
          </div>
        )}
        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration</label>
            <select className="w-full border rounded px-3 py-2" value={estimatedDuration} onChange={e => setEstimatedDuration(e.target.value)}>
              <option value="">Select...</option>
              {ESTIMATED_DURATIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={deadline || ''} onChange={e => setDeadline(e.target.value)} />
          </div>
        </div>
        <div className="mb-4 flex gap-2 items-center">
          <input type="checkbox" id="isRemote" checked={isRemote} onChange={e => setIsRemote(e.target.checked)} className="mr-2" />
          <label htmlFor="isRemote" className="text-sm text-gray-700">Remote Project</label>
        </div>
        {!isRemote && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
        )}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">Project resubmitted successfully!</div>}
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleResubmit} loading={loading}>Resubmit</Button>
        </div>
      </div>
    </div>
  );
} 