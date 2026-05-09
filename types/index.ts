export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'timeout';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  timestamp: string;
  attemptCount: number;
  maskedCard: string;
}

export interface PaymentState {
  status: PaymentStatus;
  transactions: Transaction[];
  currentTransaction: {
    id: string | null;
    amount: number;
    currency: string;
  } | null;
  retryAttempts: number;
  errorMessage: string | null;
}

export type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';

export interface PaymentFormData {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: number;
  currency: string;
}
