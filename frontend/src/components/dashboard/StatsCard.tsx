import { ReactNode } from 'react';

interface StatsCardProps {
  title:    string;
  value:    string | number;
  icon:     ReactNode;
  subtitle?: string;
  color?:   'blue' | 'green' | 'orange' | 'purple';
}

const colorMap = {
  blue:   'bg-blue-50   text-blue-700',
  green:  'bg-green-50  text-green-700',
  orange: 'bg-orange-50 text-orange-700',
  purple: 'bg-purple-50 text-purple-700',
};

export default function StatsCard({ title, value, icon, subtitle, color='blue' }: StatsCardProps) {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5
                   hover:shadow-md transition-shadow'>
      <div className='flex items-center justify-between mb-3'>
        <p className='text-sm font-medium text-gray-500'>{title}</p>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className='text-2xl font-bold text-gray-900'>{value}</p>
      {subtitle && <p className='text-xs text-gray-400 mt-1'>{subtitle}</p>}
    </div>
  );
}