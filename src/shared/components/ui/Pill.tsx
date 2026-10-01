import React from 'react';

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'expense';
  size?: 'sm' | 'md';
  selected?: boolean;
  asButton?: boolean;
}

export const Pill: React.FC<PillProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  selected = false,
  asButton = false,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return selected
          ? 'bg-dark-primary dark:bg-dark-primary text-white border-transparent'
          : 'bg-dark-primaryLight dark:bg-dark-primaryLight text-dark-primaryDark dark:text-dark-primaryLight border-transparent';
      case 'secondary':
        return selected
          ? 'bg-dark-primary dark:bg-dark-primary text-white border-transparent'
          : 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border-light-border dark:border-dark-border';
      case 'outline':
        return selected
          ? 'bg-dark-primaryLight dark:bg-dark-primaryLight text-dark-primary dark:text-dark-primary border-dark-primary dark:border-dark-primary'
          : 'bg-transparent text-light-textSecondary dark:text-dark-textSecondary border-light-border dark:border-dark-border';
      case 'success':
        return selected
          ? 'bg-dark-success dark:bg-dark-success text-white border-transparent'
          : 'bg-dark-success/10 dark:bg-dark-success/10 text-dark-success dark:text-dark-success border-transparent';
      case 'warning':
        return selected
          ? 'bg-dark-warning dark:bg-dark-warning text-black border-transparent'
          : 'bg-dark-warning/10 dark:bg-dark-warning/10 text-dark-warning dark:text-dark-warning border-transparent';
      case 'expense':
        return selected
          ? 'bg-dark-expense dark:bg-dark-expense text-white border-transparent'
          : 'bg-dark-expenseLight dark:bg-dark-expenseLight text-dark-expense dark:text-dark-expense border-transparent';
      default:
        return '';
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2.5 py-0.5 text-[10px]' 
    : 'px-3 py-1 text-xs';

  const Component = asButton ? 'button' : 'span';

  return (
    <Component
      className={`
        inline-flex items-center justify-center font-semibold rounded-full border
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${sizeClasses}
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};