import React from 'react';
import { Code, Zap, Star, TrendingUp } from 'lucide-react';
import { SkillProficiency } from '../../services/profileService';

interface SkillsShowcaseProps {
    skills: SkillProficiency[];
    className?: string;
}

export const SkillsShowcase: React.FC<SkillsShowcaseProps> = ({
    skills,
    className = ''
}) => {
    const getLevelConfig = (level: string) => {
        switch (level) {
            case 'expert':
                return {
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50',
                    borderColor: 'border-purple-200',
                    progress: 100,
                    label: 'Expert'
                };
            case 'advanced':
                return {
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    progress: 75,
                    label: 'Advanced'
                };
            case 'intermediate':
                return {
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    progress: 50,
                    label: 'Intermediate'
                };
            default:
                return {
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200',
                    progress: 25,
                    label: 'Beginner'
                };
        }
    };

    const groupedSkills = skills.reduce((acc, skill) => {
        if (!acc[skill.level]) {
            acc[skill.level] = [];
        }
        acc[skill.level].push(skill);
        return acc;
    }, {} as Record<string, SkillProficiency[]>);

    const levelOrder = ['expert', 'advanced', 'intermediate', 'beginner'];

    if (skills.length === 0) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Code className="w-5 h-5 text-blue-600" />
                        Skills & Expertise
                    </h2>
                    <div className="text-center py-8">
                        <Code className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No skills added yet</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    Skills & Expertise
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Technical skills based on project experience
                </p>
            </div>

            <div className="p-6">
                {/* Skills by Level */}
                {levelOrder.map(level => {
                    const levelSkills = groupedSkills[level];
                    if (!levelSkills || levelSkills.length === 0) return null;

                    const levelConfig = getLevelConfig(level);

                    return (
                        <div key={level} className="mb-6 last:mb-0">
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-3 h-3 rounded-full ${levelConfig.bgColor} ${levelConfig.borderColor} border-2`} />
                                <h3 className={`text-sm font-medium ${levelConfig.color} capitalize`}>
                                    {levelConfig.label} ({levelSkills.length})
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {levelSkills.map((skill, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg border ${levelConfig.borderColor} ${levelConfig.bgColor} hover:shadow-md transition-all group`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className={`font-medium ${levelConfig.color} text-sm mb-1`}>
                                                    {skill.skill}
                                                </h4>

                                                {/* Project count */}
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <Star className="w-3 h-3" />
                                                    <span>{skill.projectCount} project{skill.projectCount !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>

                                            {/* Recent usage indicator */}
                                            {skill.recentUsage && (
                                                <div className="flex items-center gap-1">
                                                    <Zap className="w-3 h-3 text-yellow-500" />
                                                    <span className="text-xs text-yellow-600 font-medium">Recent</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Proficiency Progress Bar */}
                                        <div className="mb-2">
                                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                <span>Proficiency</span>
                                                <span>{levelConfig.label}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all duration-500 group-hover:animate-pulse`}
                                                    style={{
                                                        width: `${levelConfig.progress}%`,
                                                        background: level === 'expert'
                                                            ? 'linear-gradient(90deg, #8B5CF6, #A855F7)'
                                                            : level === 'advanced'
                                                                ? 'linear-gradient(90deg, #3B82F6, #2563EB)'
                                                                : level === 'intermediate'
                                                                    ? 'linear-gradient(90deg, #10B981, #059669)'
                                                                    : 'linear-gradient(90deg, #F59E0B, #D97706)'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Trend indicator */}
                                        {skill.recentUsage && (
                                            <div className="flex items-center gap-1 text-xs text-green-600">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>Actively using</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Skills Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Skills Overview</h4>
                            <p className="text-xs text-gray-600">
                                {skills.length} total skills • {skills.filter(s => s.recentUsage).length} recently used
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {levelOrder.map(level => {
                                const count = groupedSkills[level]?.length || 0;
                                if (count === 0) return null;
                                const config = getLevelConfig(level);
                                return (
                                    <div key={level} className="text-center">
                                        <div className={`w-2 h-2 rounded-full ${config.bgColor} ${config.borderColor} border mx-auto mb-1`} />
                                        <span className="text-xs text-gray-600">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};