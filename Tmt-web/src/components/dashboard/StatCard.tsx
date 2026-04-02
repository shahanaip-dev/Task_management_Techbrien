import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export default function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-[#E8DDD4] p-5 shadow-sm transition-all hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-[#F5E6DC] rounded-lg flex items-center justify-center text-[#7D1F1F]">
          {icon || (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
            <span>{trend.isUp ? '↑' : '↓'} {trend.value}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-[#8A8278] uppercase tracking-wider">{label}</p>
        <p className="font-serif text-2xl font-bold text-[#1C1A18] mt-1">{value}</p>
      </div>
    </div>
  );
}
