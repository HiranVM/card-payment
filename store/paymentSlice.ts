import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaymentState, PaymentStatus, Transaction } from '../types';

const initialState: PaymentState = {
  status: 'idle',
  transactions: [], // Will be hydrated from localStorage on client
  currentTransaction: null,
  retryAttempts: 0,
  errorMessage: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<PaymentStatus>) => {
      state.status = action.payload;
    },
    setCurrentTransaction: (state, action: PayloadAction<PaymentState['currentTransaction']>) => {
      state.currentTransaction = action.payload;
      state.retryAttempts = 0; // Reset on new transaction
    },
    incrementRetry: (state) => {
      state.retryAttempts += 1;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      // Prevent duplicates based on ID
      const exists = state.transactions.some(t => t.id === action.payload.id);
      if (!exists) {
        state.transactions.unshift(action.payload);
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('transactions', JSON.stringify(state.transactions));
        }
      }
    },
    hydrateTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    setErrorMessage: (state, action: PayloadAction<string | null>) => {
      state.errorMessage = action.payload;
    },
    resetPayment: (state) => {
      state.status = 'idle';
      state.currentTransaction = null;
      state.retryAttempts = 0;
      state.errorMessage = null;
    }
  },
});

export const { 
  setStatus, 
  setCurrentTransaction, 
  incrementRetry, 
  addTransaction, 
  hydrateTransactions,
  setErrorMessage,
  resetPayment
} = paymentSlice.actions;

export default paymentSlice.reducer;
