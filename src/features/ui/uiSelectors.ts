import type { RootState } from '../../store';

export const selectSelectedMonth = (state: RootState) => state.ui.selectedMonth;
export const selectTransactionTypeFilter = (state: RootState) => state.ui.transactionTypeFilter;
export const selectCategoryFilter = (state: RootState) => state.ui.categoryFilter;
export const selectActiveSheet = (state: RootState) => state.ui.activeSheet;
