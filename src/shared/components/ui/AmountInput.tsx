import React, { useState, useEffect } from 'react';
import { parsePHPToCentavos, centavosToDisplayDecimal } from '../../utils/currency';

export interface AmountInputProps {
  label?: string;
  valueCentavos: number;
  onChangeCentavos: (centavos: number) => void;
  error?: string | null;
  placeholder?: string;
  disabled?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  label = 'Amount',
  valueCentavos,
  onChangeCentavos,
  error,
  placeholder = '0.00',
  disabled = false
}) => {
  const [displayValue, setDisplayValue] = useState<string>(
    valueCentavos > 0 ? centavosToDisplayDecimal(valueCentavos) : ''
  );

  useEffect(() => {
    if (valueCentavos === 0 && displayValue === '') return;
    const currentCentavos = parsePHPToCentavos(displayValue);
    if (currentCentavos !== valueCentavos) {
      setDisplayValue(valueCentavos > 0 ? centavosToDisplayDecimal(valueCentavos) : '');
    }
  }, [valueCentavos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow numbers and at most one decimal point
    if (!/^\d*\.?\d{0,2}$/.test(raw)) return;

    setDisplayValue(raw);
    const parsed = parsePHPToCentavos(raw);
    onChangeCentavos(parsed);
  };

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      )}
      <div className="relative flex items-center">
        <span className="absolute left-3 text-gray-500 dark:text-gray-400 font-semibold text-base select-none">
          ₱
        </span>
        <input
          type="text"
          aria-label={label}
          inputMode="decimal"
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-8 pr-3 py-2.5 text-base font-medium rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors focus:outline-none focus:ring-2 min-h-[44px] ${
            error
              ? 'border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
          }`}
        />
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};
