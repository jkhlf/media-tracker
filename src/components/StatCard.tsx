import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  format?: (value: number) => string;
  className?: string;
}

export function StatCard({ title, value, icon, description, format, className = '' }: StatCardProps) {
  const formattedValue = typeof value === 'number' && format ? format(value) : value;
  
  return (
    <div className={`bg-gray-900 rounded-lg p-6 flex items-center gap-4 ${className}`}>
      <div className="bg-gray-800 p-3 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-lg">{title}</h3>
        <p className="text-2xl font-bold">{formattedValue}</p>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
}

export default StatCard;
