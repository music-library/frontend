import { TypedUseSelectorHook, useDispatch as useDefaultDispatch, useSelector as useDefaultSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

// Use instead of plain `useDispatch` and `useSelector`
export const useDispatch = () => useDefaultDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useDefaultSelector;
