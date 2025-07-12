import React from 'react';
import StatsCard from './StatsCard';
import { DeveloperStats } from '../../services/dashboardService';

interface StatsOverviewProps {
  stats: DeveloperStats | null;
  loading?: boolean;
  onAppsClick?: () => void;
  onActiveClick?: () => void;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, loading = false, onAppsClick, onActiveClick }) => {
  // For now we keep values 0 when loading or stats null.
  const totalApps = stats?.totalApplications ?? 0;
  const activeProjects = stats?.activeProjects ?? 0;
  const acceptanceRate = stats ? `${stats.acceptanceRate}%` : '0%';
  const completedProjects = stats?.completedProjects ?? 0;

  const cards = [
    {
      title: 'Total Applications',
      value: totalApps,
      subtitle: 'Applications submitted',
      icon: 'Send' as const,
      color: 'blue' as const,
      onClick: onAppsClick
    },
    {
      title: 'Acceptance Rate',
      value: acceptanceRate,
      subtitle: 'Success rate',
      icon: 'CheckCircle' as const,
      color: 'green' as const
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      subtitle: 'Currently working on',
      icon: 'FolderOpen' as const,
      color: 'yellow' as const,
      onClick: onActiveClick
    },
    {
      title: 'Completed Projects',
      value: completedProjects,
      subtitle: 'Finished projects',
      icon: 'Award' as const,
      color: 'purple' as const
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map(card => (
        <StatsCard key={card.title} {...card} size="sm" />
      ))}
    </div>
  );
};

export default StatsOverview; 