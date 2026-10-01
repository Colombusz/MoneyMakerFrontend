import { describe, expect, it } from 'vitest';
import { render, within } from '@testing-library/react';
import React from 'react';
import { CategoryPieChart } from '../CategoryPieChart';
import { Category } from '../../../types';

const mockCategories: Category[] = [
  {
    id: 'cat-food',
    userId: 'user1',
    name: 'Food & Dining',
    type: 'expense',
    color: '#EF4444',
    icon: 'utensils',
    isDefault: true,
    updatedAt: '',
  },
  {
    id: 'cat-transport',
    userId: 'user1',
    name: 'Transportation',
    type: 'expense',
    color: '#3B82F6',
    icon: 'car',
    isDefault: true,
    updatedAt: '',
  },
];

// The separate category list was removed as a duplicate of this chart's legend,
// so the pie chart is now the single expense-distribution view on the calendar.

describe('CategoryPieChart Component', () => {
  it('renders null when totalExpenseCentavos is 0', () => {
    const { container } = render(
      <CategoryPieChart breakdown={[]} totalExpenseCentavos={0} currency="PHP" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders svg and slices when breakdown has expenses', () => {
    const items = [
      { category: mockCategories[0], amountCentavos: 700000, count: 3, catKey: 'cat-food' },
      { category: mockCategories[1], amountCentavos: 300000, count: 1, catKey: 'cat-transport' },
    ];

    const { container } = render(
      <CategoryPieChart breakdown={items} totalExpenseCentavos={1000000} currency="PHP" />
    );

    expect(within(container).getByText('Expense Distribution')).toBeDefined();
    expect(within(container).getAllByText('Food & Dining').length).toBeGreaterThan(0);
    expect(within(container).getAllByText('Transportation').length).toBeGreaterThan(0);
    expect(within(container).getByText('70%')).toBeDefined();
    expect(within(container).getByText('30%')).toBeDefined();
    // SVG paths should exist for multiple slices
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(2);
  });
});
