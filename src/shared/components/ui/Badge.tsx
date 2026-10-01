import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
  className = ''
}) => {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }[variant];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};
