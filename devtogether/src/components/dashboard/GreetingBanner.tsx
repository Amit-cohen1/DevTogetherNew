import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface GreetingBannerProps {
  name?: string;
}

const GreetingBanner: React.FC<GreetingBannerProps> = ({ name = 'Developer' }) => {
  const hour = new Date().getHours();

  let greeting = 'Hello';
  let GradientClasses = 'from-blue-500 to-teal-500';
  let Icon = Sun;

  if (hour < 12) {
    greeting = 'Good morning';
    GradientClasses = 'from-yellow-400 to-orange-500';
    Icon = Sun;
  } else if (hour < 18) {
    greeting = 'Good afternoon';
    GradientClasses = 'from-blue-500 to-teal-500';
    Icon = Sun;
  } else {
    greeting = 'Good evening';
    GradientClasses = 'from-purple-700 to-indigo-700';
    Icon = Moon;
  }

  return (
    <div className={`relative rounded-xl overflow-hidden mb-8`}>
      {/* Accent bar */}
      <div className={`absolute inset-0 bg-gradient-to-r ${GradientClasses} opacity-10 pointer-events-none`} />

      <div className="relative z-10 flex items-center space-x-4 p-6 md:p-8">
        <div className="p-2.5 rounded-lg bg-white/60 backdrop-blur-sm shadow-md">
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {greeting}, {name}!
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Here’s an overview of your project activity and achievements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GreetingBanner; 