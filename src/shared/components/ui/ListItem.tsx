import React from 'react';

export interface ListItemProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  icon,
  title,
  subtitle,
  trailing,
  onClick,
  className = ''
}) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3.5 rounded-lg transition-colors text-left ${
        onClick ? 'hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer min-h-[48px]' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        {icon && <div className="shrink-0 flex items-center justify-center">{icon}</div>}
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</div>
          )}
        </div>
      </div>
      {trailing && <div className="shrink-0 text-right">{trailing}</div>}
    </Component>
  );
};
