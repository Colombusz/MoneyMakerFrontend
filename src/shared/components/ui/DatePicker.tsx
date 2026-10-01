import React from 'react';

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label = 'Date',
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      )}
      <input
        type="date"
        className={`w-full px-3 py-2.5 text-base rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors focus:outline-none focus:ring-2 min-h-[44px] ${
          error
            ? 'border-red-500 focus:ring-red-500/20'
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};
