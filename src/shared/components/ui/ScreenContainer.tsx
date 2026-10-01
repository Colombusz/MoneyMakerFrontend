import React from 'react';

export interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
  hasBottomNav?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  className = '',
  hasBottomNav = true
}) => {
  return (
    <div
      className={`w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden ${
        hasBottomNav ? 'pb-24 sm:pb-8' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
