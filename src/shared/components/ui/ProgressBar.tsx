import React from 'react';

export interface ProgressBarProps {
  percentage: number;
  color?: string;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = 'bg-blue-600',
  height = 'md',
  showLabel = false
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }[height];

  return (
    <div className="w-full flex flex-col gap-1">
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClasses}`}
      >
        <div
          className={`${color} h-full rounded-full transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
