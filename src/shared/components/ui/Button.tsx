import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]';

  const variantClasses = {
    primary: 'bg-dark-primary dark:bg-dark-primary text-white hover:bg-dark-primaryDark dark:hover:bg-dark-primaryDark focus:ring-dark-primary',
    secondary:
      'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border focus:ring-light-textMuted dark:focus:ring-dark-textMuted',
    danger: 'bg-light-expense dark:bg-dark-expense text-white hover:bg-light-expenseLight dark:hover:bg-dark-expenseLight focus:ring-light-expense dark:focus:ring-dark-expense',
    outline:
      'border border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary hover:bg-light-primaryLight dark:hover:bg-dark-primaryLight focus:ring-light-primary dark:focus:ring-dark-primary',
    ghost:
      'text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surface dark:hover:bg-dark-surface focus:ring-light-textMuted dark:focus:ring-dark-textMuted'
  }[variant];

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }[size];

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
