import React, { useState } from 'react';

interface StatBox {
  label: string;
  value: number;
  color?: string; // Tailwind color class
}

interface AdminTabHeaderProps {
  title: string;
  searchPlaceholder: string;
  onSearch: (value: string) => void;
  stats: StatBox[];
  children?: React.ReactNode;
}

const AdminTabHeader: React.FC<AdminTabHeaderProps> = ({
  title,
  searchPlaceholder,
  onSearch,
  stats,
  children,
}) => {
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="w-full mb-4 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-0">{title}</h2>
        {children && <div className="flex-shrink-0">{children}</div>}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
        <div className="flex-1 flex flex-col">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm"
          />
        </div>
        <div className="flex flex-row flex-wrap gap-2 sm:ml-4 justify-start sm:justify-end mt-2 sm:mt-0">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center justify-center px-3 sm:px-4 py-2 rounded-xl min-w-[80px] sm:min-w-[90px] border border-gray-200 shadow-md bg-gradient-to-br ${
                stat.color || 'from-gray-50 to-white'
              } hover:shadow-lg transition-shadow duration-150`}
              style={{ fontSize: 13 }}
            >
              <span className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 drop-shadow-sm">{stat.value}</span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTabHeader; 