import React from 'react';
import { formatCentavos } from '../../shared/utils/currency';

interface NetWorthBannerProps {
  accountsCount: number;
  totalBalanceCentavos: number;
  monthIncomeCentavos: number;
  monthExpenseCentavos: number;
  monthNetCentavos: number;
  currency: string;
}

export const NetWorthBanner: React.FC<NetWorthBannerProps> = ({
  accountsCount,
  totalBalanceCentavos,
  monthIncomeCentavos,
  monthExpenseCentavos,
  monthNetCentavos,
  currency
}) => {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-500/15">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-blue-200">
          Total Net Worth
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm font-medium">
          {accountsCount} Active {accountsCount === 1 ? 'Account' : 'Accounts'}
        </span>
      </div>
      <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
        {formatCentavos(totalBalanceCentavos, currency)}
      </div>

      {/* Quick Month Metrics */}
      <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/20 text-center">
        <div>
          <div className="text-[11px] font-medium text-blue-200">Income</div>
          <div className="text-sm sm:text-base font-bold text-emerald-300">
            +{formatCentavos(monthIncomeCentavos, currency)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-blue-200">Expenses</div>
          <div className="text-sm sm:text-base font-bold text-rose-300">
            -{formatCentavos(monthExpenseCentavos, currency)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-blue-200">Net Flow</div>
          <div
            className={`text-sm sm:text-base font-bold ${
              monthNetCentavos >= 0 ? 'text-white' : 'text-amber-300'
            }`}
          >
            {monthNetCentavos >= 0 ? '+' : ''}
            {formatCentavos(monthNetCentavos, currency)}
          </div>
        </div>
      </div>
    </div>
  );
};
