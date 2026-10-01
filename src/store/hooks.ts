import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ThunkAction, Action } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/** Typed hook to dispatch actions/thunks. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
/** Typed hook to read state through selectors. */
export const useAppSelector = useSelector.withTypes<RootState>();

/**
 * Pre-typed `createAsyncThunk` for the rare async logic that isn't a server
 * call (server calls go through RTK Query endpoints).
 */
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;
