import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { toMonthKey } from '../../shared/utils/monthKey';
import type { TransactionTypeFilter, UiState } from './types';

const createInitialState = (): UiState => ({
  selectedMonth: toMonthKey(),
  transactionTypeFilter: 'all',
  categoryFilter: null,
  activeSheet: null
});

const uiSlice = createSlice({
  name: 'ui',
  initialState: createInitialState(),
  reducers: {
    selectMonth(state, action: PayloadAction<string>) {
      state.selectedMonth = action.payload;
    },
    setTransactionTypeFilter(state, action: PayloadAction<TransactionTypeFilter>) {
      state.transactionTypeFilter = action.payload;
    },
    setCategoryFilter(state, action: PayloadAction<string | null>) {
      state.categoryFilter = action.payload;
    },
    openSheet(state, action: PayloadAction<string>) {
      state.activeSheet = action.payload;
    },
    closeSheet(state) {
      state.activeSheet = null;
    }
  }
});

export const {
  selectMonth,
  setTransactionTypeFilter,
  setCategoryFilter,
  openSheet,
  closeSheet
} = uiSlice.actions;
export default uiSlice.reducer;
