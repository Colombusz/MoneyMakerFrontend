import React, { useState } from 'react';
import { Category } from '../../types';
import { formatCentavos } from '../../shared/utils/currency';
import { Card } from '../../shared/components/ui';

/**
 * A single category's contribution to the month's expenses. Lives here rather
 * than in a separate breakdown module because the pie chart is now the only
 * consumer — it renders this data as both the chart and its own legend.
 */
export interface CategoryBreakdownItem {
  category: Category | undefined;
  amountCentavos: number;
  count: number;
  catKey: string; // preserves virtual keys like '__shared_goal__'
}

export interface CategoryPieChartProps {
  breakdown: CategoryBreakdownItem[];
  totalExpenseCentavos: number;
  currency?: string;
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeDonutSlice(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
) {
  const p1 = polarToCartesian(cx, cy, outerR, startAngle);
  const p2 = polarToCartesian(cx, cy, outerR, endAngle);
  const p3 = polarToCartesian(cx, cy, innerR, endAngle);
  const p4 = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  breakdown,
  totalExpenseCentavos,
  currency = 'PHP',
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  const nonZeroItems = breakdown.filter((item) => item.amountCentavos > 0);

  if (nonZeroItems.length === 0 || totalExpenseCentavos <= 0) {
    return null;
  }

  let currentAngle = 0;
  const slices = nonZeroItems.map((item, index) => {
    const cat = item.category;
    const catId = item.catKey; // Use the preserved key (handles virtual keys)
    
    // Handle virtual category keys for shared goal contributions and shared account deposits
    let name = cat?.name;
    let color = cat?.color;
    
    if (catId === '__shared_goal__') {
      name = 'Shared Goal Contribution';
      color = color || '#8B5CF6'; // Purple
    } else if (catId === '__shared_account__') {
      name = 'Shared Account Deposit';
      color = color || '#06B6D4'; // Cyan
    } else if (catId === '__uncategorized__') {
      name = 'Uncategorized';
      color = color || '#6B7280'; // Gray
    } else {
      name = name || 'Uncategorized';
      color = color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
    }
    
    const percentage = (item.amountCentavos / totalExpenseCentavos) * 100;
    const sliceAngle = (item.amountCentavos / totalExpenseCentavos) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle += sliceAngle;

    return {
      catId,
      name,
      color,
      amountCentavos: item.amountCentavos,
      percentage,
      startAngle,
      endAngle,
    };
  });

  const CX = 100;
  const CY = 100;
  const OUTER_RADIUS = 80;
  const INNER_RADIUS = 50;
  const activeSlice = selectedCatId ? slices.find((s) => s.catId === selectedCatId) : null;

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Expense Distribution
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Monthly Share
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
        {/* SVG Pie / Donut Chart */}
        <div className="relative w-48 h-48 shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-0">
            {slices.length === 1 ? (
              <circle
                cx={CX}
                cy={CY}
                r={(OUTER_RADIUS + INNER_RADIUS) / 2}
                fill="none"
                stroke={slices[0].color}
                strokeWidth={OUTER_RADIUS - INNER_RADIUS}
              />
            ) : (
              slices.map((slice) => {
                const isSelected = selectedCatId === slice.catId;
                const outerR = isSelected ? OUTER_RADIUS + 4 : OUTER_RADIUS;
                const innerR = isSelected ? INNER_RADIUS - 2 : INNER_RADIUS;

                return (
                  <path
                    key={slice.catId}
                    d={describeDonutSlice(CX, CY, innerR, outerR, slice.startAngle, slice.endAngle)}
                    fill={slice.color}
                    className="cursor-pointer transition-all duration-200 stroke-white dark:stroke-slate-900"
                    strokeWidth="2"
                    opacity={selectedCatId && !isSelected ? 0.45 : 1}
                    onMouseEnter={() => setSelectedCatId(slice.catId)}
                    onMouseLeave={() => setSelectedCatId(null)}
                    onClick={() =>
                      setSelectedCatId(selectedCatId === slice.catId ? null : slice.catId)
                    }
                  >
                    <title>{`${slice.name}: ${formatCentavos(slice.amountCentavos, currency)} (${Math.round(slice.percentage)}%)`}</title>
                  </path>
                );
              })
            )}
          </svg>

          {/* Center Info Overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-2 text-center"
            style={{ width: `${INNER_RADIUS * 2}px`, height: `${INNER_RADIUS * 2}px`, margin: 'auto' }}
          >
            <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-full">
              {formatCentavos(
                activeSlice ? activeSlice.amountCentavos : totalExpenseCentavos,
                currency
              )}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-full">
              {activeSlice ? activeSlice.name : 'Total Expense'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full sm:w-auto flex-1 grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
          {slices.map((slice) => {
            const isSelected = selectedCatId === slice.catId;
            return (
              <button
                key={slice.catId}
                type="button"
                className={`flex items-center justify-between text-left p-2 rounded-lg text-xs transition-colors border ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
                onMouseEnter={() => setSelectedCatId(slice.catId)}
                onMouseLeave={() => setSelectedCatId(null)}
                onClick={() =>
                  setSelectedCatId(selectedCatId === slice.catId ? null : slice.catId)
                }
              >
                <div className="flex items-center gap-2 min-w-0 mr-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                    {slice.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">
                    {Math.round(slice.percentage)}%
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCentavos(slice.amountCentavos, currency)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
