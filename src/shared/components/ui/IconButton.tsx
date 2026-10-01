import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: 'ghost' | 'secondary' | 'danger' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 min-h-[44px] min-w-[44px]';

  const variantClasses = {
    ghost:
      'text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surface dark:hover:bg-dark-surface',
    secondary:
      'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border',
    danger: 'text-light-expense dark:text-dark-expense hover:bg-light-expenseLight dark:hover:bg-dark-expenseLight',
    primary: 'bg-dark-primary dark:bg-dark-primary text-white hover:bg-dark-primaryDark dark:hover:bg-dark-primaryDark',
  }[variant];

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  }[size];

  return (
    <button
      aria-label={label}
      title={label}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
