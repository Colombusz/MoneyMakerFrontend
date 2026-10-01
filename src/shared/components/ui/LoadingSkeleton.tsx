import React from 'react';

export interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 1,
  height = 'h-12',
  className = ''
}) => {
  return (
    <div className="w-full flex flex-col gap-2.5 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`w-full bg-gray-200 dark:bg-gray-700/60 rounded-lg ${height} ${className}`}
        />
      ))}
    </div>
  );
};
