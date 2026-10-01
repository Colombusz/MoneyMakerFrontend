import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'primary',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }[padding];

  const variantClasses = {
    primary: 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border',
    secondary: 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border',
    outlined: 'bg-transparent border-light-border dark:border-dark-border',
  }[variant];

  return (
    <div
      className={`${variantClasses} rounded-2xl border ${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
