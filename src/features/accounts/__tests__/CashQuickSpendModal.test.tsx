import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, cleanup, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { CashQuickSpendModal } from '../CashQuickSpendModal';
import { Account, Category } from '../../../types';

afterEach(() => {
  cleanup();
});

const mockCashAccount: Account = {
  id: 'acc-cash',
  userId: 'user1',
  name: 'Cash',
  type: 'cash',
  startingBalanceCentavos: 200000,
  currentBalanceCentavos: 200000, // 2,000 PHP
  isArchived: false,
  updatedAt: ''
};

const mockCategories: Category[] = [
  { id: 'cat-quickspend', userId: 'user1', name: 'Quick Spend', type: 'expense', icon: 'zap', color: '#F97316', isDefault: true, updatedAt: '2026-10-01T00:00:00.000Z' },
  { id: 'cat-food', userId: 'user1', name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#EF4444', isDefault: true, updatedAt: '2026-10-01T00:00:00.000Z' }
];

describe('CashQuickSpendModal', () => {
  it('renders current cash balance and quick spend category', () => {
    const { getByText } = render(
      <CashQuickSpendModal
        isOpen={true}
        onClose={vi.fn()}
        account={mockCashAccount}
        categories={mockCategories}
        currency="PHP"
        onAddTransaction={vi.fn()}
      />
    );

    expect(getByText('⚡ Cash Quick Spend')).toBeDefined();
    expect(getByText('₱2,000.00')).toBeDefined();
    expect(getByText('Quick Spend')).toBeDefined();
  });

  it('updates remaining balance when amount spent changes', () => {
    const { getByLabelText } = render(
      <CashQuickSpendModal
        isOpen={true}
        onClose={vi.fn()}
        account={mockCashAccount}
        categories={mockCategories}
        currency="PHP"
        onAddTransaction={vi.fn()}
      />
    );

    const spentInput = getByLabelText(/How much did you spend/i) as HTMLInputElement;
    const remainingInput = getByLabelText(/Or New Remaining Balance/i) as HTMLInputElement;

    fireEvent.change(spentInput, { target: { value: '150' } });
    expect(remainingInput.value).toBe('1850.00');
  });

  it('updates spent amount when remaining balance changes', () => {
    const { getByLabelText } = render(
      <CashQuickSpendModal
        isOpen={true}
        onClose={vi.fn()}
        account={mockCashAccount}
        categories={mockCategories}
        currency="PHP"
        onAddTransaction={vi.fn()}
      />
    );

    const spentInput = getByLabelText(/How much did you spend/i) as HTMLInputElement;
    const remainingInput = getByLabelText(/Or New Remaining Balance/i) as HTMLInputElement;

    fireEvent.change(remainingInput, { target: { value: '1850' } });
    expect(spentInput.value).toBe('150.00');
  });

  it('clicking a quick amount chip adds to spent', () => {
    const { getByText, getByLabelText } = render(
      <CashQuickSpendModal
        isOpen={true}
        onClose={vi.fn()}
        account={mockCashAccount}
        categories={mockCategories}
        currency="PHP"
        onAddTransaction={vi.fn()}
      />
    );

    const chip = getByText('+₱15 (Jeepney)');
    fireEvent.click(chip);

    const spentInput = getByLabelText(/How much did you spend/i) as HTMLInputElement;
    expect(spentInput.value).toBe('15.00');
  });

  it('submits transaction with Quick Spend category on valid input', async () => {
    const onAddTransaction = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    const { getByLabelText, container } = render(
      <CashQuickSpendModal
        isOpen={true}
        onClose={onClose}
        account={mockCashAccount}
        categories={mockCategories}
        currency="PHP"
        onAddTransaction={onAddTransaction}
      />
    );

    const spentInput = getByLabelText(/How much did you spend/i);
    fireEvent.change(spentInput, { target: { value: '150' } });

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onAddTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'expense',
          amountCentavos: 15000,
          accountId: 'acc-cash',
          categoryId: 'cat-quickspend',
          notes: 'Quick spend',
        })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });
});
