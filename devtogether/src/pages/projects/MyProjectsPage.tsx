import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projects';
import { Layout } from '../../components/layout';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Loader2, AlertCircle } from 'lucide-react';
import type { ProjectWithTeamMembers } from '../../types/database';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Active' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusFilterToStatuses = (filter: string) => {
  if (filter === 'all') return undefined;
  if (filter === 'open') return ['open'];
  if (filter === 'in_progress') return ['in_progress'];
  if (filter === 'completed') return ['completed'];
  if (filter === 'cancelled') return ['cancelled'];
  return undefined;
};

const MyProjectsPage: React.FC = () => {
  const { user, isDeveloper } = useAuth();
  const [projects, setProjects] = useState<ProjectWithTeamMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user && isDeveloper) {
      loadProjects();
    }
    // eslint-disable-next-line
  }, [user, isDeveloper]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const statuses = statusFilterToStatuses(statusFilter);
      const data = await projectService.getDeveloperProjectsWithTeamMembers(user!.id, statuses);
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isDeveloper) {
      loadProjects();
    }
    // eslint-disable-next-line
  }, [statusFilter]);

  if (!isDeveloper) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-2">All projects you have participated in as a team member</p>
            </div>
            <div className="flex gap-2 items-center">
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="min-w-[140px]"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
              <Button variant="outline" onClick={loadProjects}>
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadProjects}>Try Again</Button>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
              <p className="text-gray-600 mb-4">You haven't participated in any projects yet.</p>
              <Button onClick={() => window.location.href = '/projects'}>Browse Projects</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyProjectsPage; 