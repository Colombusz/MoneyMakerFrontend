import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, cleanup, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import {
  CreateVacationModal,
  JoinVacationModal,
  DepositVacationModal,
  CreateExpenseItemModal,
  LogPersonalExpenseModal,
  RefundModal,
  PastVacationSummaryModal
} from '../VacationModals';
import { Account, Vacation, VacationChipIn, PastVacationSummary } from '../../../types';

afterEach(() => {
  cleanup();
});

const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    userId: 'u1',
    name: 'Payroll Account',
    type: 'payroll',
    startingBalanceCentavos: 100000,
    currentBalanceCentavos: 100000, // ₱1,000
    isArchived: false,
    updatedAt: ''
  }
];

const mockPastSummary: PastVacationSummary = {
  vacation: {
    _id: 'vac-1',
    name: 'Palawan Adventure 2026',
    description: 'El Nido and Coron',
    joinCode: 'V99ABC',
    creatorUserId: 'u1',
    status: 'concluded',
    createdAt: '2026-09-01T00:00:00.000Z',
    concludedAt: '2026-09-10T00:00:00.000Z'
  },
  sharedExpenses: [
    {
      _id: 'se-1',
      vacationId: 'vac-1',
      createdByUserId: 'u1',
      createdByName: 'Alice',
      title: 'Resort Beach Villa',
      amountCentavos: 100000,
      category: 'Accommodation',
      deductionSource: 'pool',
      date: '2026-09-02T00:00:00.000Z',
      createdAt: '2026-09-02T00:00:00.000Z'
    }
  ],
  myLoggedExpenses: [
    {
      _id: 'le-1',
      vacationId: 'vac-1',
      userId: 'u1',
      userName: 'Alice',
      title: 'Waterproof pouch',
      amountCentavos: 25000,
      category: 'Personal Shopping',
      date: '2026-09-02T00:00:00.000Z',
      notes: '',
      createdAt: '2026-09-02T00:00:00.000Z'
    }
  ],
  myChipIns: [
    {
      _id: 'ci-1',
      vacationId: 'vac-1',
      createdByUserId: 'u1',
      createdByName: 'Alice',
      title: 'Island Tour A',
      targetAmountCentavos: 100000,
      totalCollectedCentavos: 100000,
      description: 'Boat tour',
      status: 'closed',
      contributions: [
        {
          _id: 'cb-1',
          chipInId: 'ci-1',
          vacationId: 'vac-1',
          userId: 'u1',
          userName: 'Alice',
          amountCentavos: 50000,
          date: '2026-09-03T00:00:00.000Z',
          notes: 'My share'
        }
      ],
      createdAt: '2026-09-02T00:00:00.000Z'
    }
  ],
  summary: {
    totalSharedExpensesCentavos: 100000,
    myLoggedExpensesCentavos: 25000,
    myChipInContributionsCentavos: 50000,
    myDepositsCentavos: 100000,
    myRefundsCentavos: 20000,
    myTotalSpentCentavos: 155000
  }
};

describe('VacationModals', () => {
  it('submits CreateVacationModal with name and description', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText } = render(
      <CreateVacationModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />
    );

    const nameInput = getByLabelText(/Vacation Name/i);
    fireEvent.change(nameInput, { target: { value: 'Japan 2026' } });

    const submitBtn = getByText('Create Vacation');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('Japan 2026', undefined);
    });
  });

  it('submits JoinVacationModal with uppercase code', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = render(
      <JoinVacationModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />
    );

    const codeInput = getByPlaceholderText(/e\.g\. V269EC/i);
    fireEvent.change(codeInput, { target: { value: 'v12345' } });

    const submitBtn = getByText('Join Vacation');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('V12345');
    });
  });

  it('blocks deposit if amount exceeds local account balance', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText } = render(
      <DepositVacationModal
        isOpen={true}
        onClose={vi.fn()}
        accounts={mockAccounts}
        currency="PHP"
        onSubmit={onSubmit}
      />
    );

    // Available is ₱1,000 (100000 centavos)
    const amountInput = getByLabelText(/Deposit Amount/i) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '1500' } }); // ₱1,500 exceeds

    const submitBtn = getByText('Deposit Funds');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(getByText(/Insufficient funds in/i)).toBeDefined();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('blocks expense creation if amount exceeds vacation balance', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText } = render(
      <CreateExpenseItemModal
        isOpen={true}
        onClose={vi.fn()}
        vacationBalanceCentavos={50000} // ₱500
        currency="PHP"
        onSubmit={onSubmit}
      />
    );

    const titleInput = getByLabelText(/Expense Title/i);
    fireEvent.change(titleInput, { target: { value: 'Expensive Dinner' } });

    const amountInput = getByLabelText(/Expense Amount/i) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '800' } }); // ₱800 > ₱500

    expect(getByText(/Amount exceeds available pool balance/i)).toBeDefined();

    const submitBtn = getByText('Deduct & Record');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('allows user to choose chip-in item as deduction source and handles overdraft', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const mockChipIns = [
      {
        _id: 'ci-boat',
        vacationId: 'vac-1',
        createdByUserId: 'u1',
        createdByName: 'Alice',
        title: 'Boat Rental Pool',
        totalCollectedCentavos: 50000, // ₱500
        totalSpentCentavos: 10000, // ₱100 spent, ₱400 remaining
        status: 'open' as const,
        contributions: [],
        createdAt: '2026-09-02T00:00:00.000Z'
      }
    ];

    const { getByLabelText, getByText } = render(
      <CreateExpenseItemModal
        isOpen={true}
        onClose={vi.fn()}
        vacationBalanceCentavos={100000}
        chipIns={mockChipIns}
        currency="PHP"
        onSubmit={onSubmit}
      />
    );

    // Switch deduction source to Chip-in Item
    const chipInBtn = getByText('Chip-in Item');
    fireEvent.click(chipInBtn);

    expect(getByText(/Available Chip-in Balance:/i)).toBeDefined();
    expect(getByText('₱400.00')).toBeDefined();

    const titleInput = getByLabelText(/Expense Title/i);
    fireEvent.change(titleInput, { target: { value: 'Boat Captain Tip' } });

    const amountInput = getByLabelText(/Expense Amount/i) as HTMLInputElement;
    // Overdraft test on chip in: available is 400, enter 450
    fireEvent.change(amountInput, { target: { value: '450' } });
    expect(getByText(/Amount exceeds available chip-in balance/i)).toBeDefined();

    const submitBtn = getByText('Deduct & Record');
    fireEvent.click(submitBtn);
    expect(onSubmit).not.toHaveBeenCalled();

    // Valid amount: 200
    fireEvent.change(amountInput, { target: { value: '200' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        'Boat Captain Tip',
        20000,
        'Accommodation',
        undefined,
        'chip_in',
        'ci-boat'
      );
    });
  });

  it('allows user to choose account for personal expense and blocks overdraft', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText } = render(
      <LogPersonalExpenseModal
        isOpen={true}
        onClose={vi.fn()}
        accounts={mockAccounts}
        currency="PHP"
        onSubmit={onSubmit}
      />
    );

    const titleInput = getByLabelText(/Item \/ Activity Name/i);
    fireEvent.change(titleInput, { target: { value: 'Local Souvenir' } });

    // Try amount exceeding selected account (₱1,200 > ₱1,000)
    const amountInput = getByLabelText(/Amount Spent/i) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '1200' } });

    expect(getByText(/Amount exceeds available account balance/i)).toBeDefined();

    const submitBtn = getByText('Deduct & Save');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });

    // Valid amount (₱200)
    fireEvent.change(amountInput, { target: { value: '200' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        'Local Souvenir',
        20000,
        'acc-1',
        'Personal Shopping',
        undefined
      );
    });
  });

  it('allows Master to refund from chip-in item remaining balance and blocks overdraft', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const mockVacationWithMembers: Vacation = {
      _id: 'vac-1',
      name: 'Boracay Trip',
      joinCode: 'V12345',
      creatorUserId: 'u1',
      status: 'active',
      members: [
        { userId: 'u1', name: 'Alice', role: 'master', joinedAt: '2026-09-01T00:00:00.000Z' },
        { userId: 'u2', name: 'Bob', role: 'member', joinedAt: '2026-09-01T00:00:00.000Z' }
      ],
      balanceCentavos: 50000,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z'
    };

    const mockChipInsWithBalance: VacationChipIn[] = [
      {
        _id: 'ci-boat',
        vacationId: 'vac-1',
        createdByUserId: 'u1',
        createdByName: 'Alice',
        title: 'Boat Rental',
        totalCollectedCentavos: 80000,
        totalSpentCentavos: 60000,
        totalRefundedCentavos: 0, // Remaining: 20,000 centavos = ₱200
        status: 'open',
        contributions: [],
        createdAt: '2026-09-01T00:00:00.000Z'
      }
    ];

    const { getByText, getByLabelText } = render(
      <RefundModal
        isOpen={true}
        onClose={vi.fn()}
        vacation={mockVacationWithMembers}
        chipIns={mockChipInsWithBalance}
        currency="PHP"
        onSubmit={onSubmit}
      />
    );

    // Switch to Chip-in Item source
    const chipInSourceBtn = getByText('Chip-in Item');
    fireEvent.click(chipInSourceBtn);

    expect(getByText(/Available Chip-in Remaining:/i)).toBeDefined();
    expect(getByText('₱200.00')).toBeDefined();

    // Overdraft test (try ₱300 when only ₱200 available)
    const amountInput = getByLabelText(/Refund Amount/i) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '300' } });

    expect(getByText(/Amount exceeds remaining chip-in balance/i)).toBeDefined();

    // Enter valid refund: ₱200 = 20000 centavos
    fireEvent.change(amountInput, { target: { value: '200' } });

    const submitBtn = getByText('Transfer Refund');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        'u1',
        20000,
        undefined,
        'chip_in',
        'ci-boat'
      );
    });
  });

  it('renders PastVacationSummaryModal showing everyone shared expenses and viewing member own records', () => {
    const { getByText, getAllByText } = render(
      <PastVacationSummaryModal
        isOpen={true}
        onClose={vi.fn()}
        summary={mockPastSummary}
        currency="PHP"
      />
    );

    expect(getByText('Palawan Adventure 2026')).toBeDefined();
    expect(getByText('Concluded & Read-Only')).toBeDefined();
    expect(getByText('₱1,550.00')).toBeDefined(); // Net total
    expect(getByText('Group Shared Total')).toBeDefined();
    expect(getAllByText('₱1,000.00').length).toBeGreaterThanOrEqual(1);

    // Default tab is Shared Expenses
    expect(getByText('Resort Beach Villa')).toBeDefined(); // Shared group expense visible to everyone
    expect(getByText(/by Alice/)).toBeDefined();

    // Switch to personal expenses tab
    const personalTab = getByText(/Your Logged Expenses/i);
    fireEvent.click(personalTab);
    expect(getByText('Waterproof pouch')).toBeDefined(); // Own expense

    // Privacy notice
    expect(getByText(/Transparent Shared Group Records & Strict Personal Privacy:/i)).toBeDefined();
  });
});

