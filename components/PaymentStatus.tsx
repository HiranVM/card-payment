import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setStatus, incrementRetry, resetPayment, setErrorMessage } from '../store/paymentSlice';
import { Button } from './ui/Button';
import { CheckCircle2, XCircle, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import { Transaction } from '../types';

export function PaymentStatus() {
  const dispatch = useDispatch();
  const { status, errorMessage, retryAttempts, currentTransaction } = useSelector((state: RootState) => state.payment);

  if (status === 'idle') return null;

  const handleRetry = async () => {
    if (retryAttempts >= 3) return;
    
    dispatch(setStatus('processing'));
    dispatch(incrementRetry());

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: currentTransaction?.id,
          amount: currentTransaction?.amount,
          currency: currentTransaction?.currency
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        dispatch(setStatus('success'));
      } else {
        dispatch(setStatus('failed'));
        dispatch(setErrorMessage(data.reason || 'Payment failed'));
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        dispatch(setStatus('timeout'));
        dispatch(setErrorMessage('Request timed out'));
      } else {
        dispatch(setStatus('failed'));
        dispatch(setErrorMessage('Network error occurred'));
      }
    }
  };

  const handleReset = () => {
    dispatch(resetPayment());
  };

  const isRetriable = (status === 'failed' || status === 'timeout') && retryAttempts < 3;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
      {status === 'processing' && (
        <>
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-ping opacity-75"></div>
            <div className="relative flex items-center justify-center w-16 h-16 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full">
              <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Processing Payment</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Please wait while we process your transaction...</p>
          </div>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Payment Successful</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Your transaction has been completed successfully.</p>
          </div>
          <Button onClick={handleReset} variant="outline" className="mt-4">
            New Payment
          </Button>
        </>
      )}

      {(status === 'failed' || status === 'timeout') && (
        <>
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full mb-2">
            {status === 'timeout' ? <Clock className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {status === 'timeout' ? 'Payment Timeout' : 'Payment Failed'}
            </h3>
            <div className="flex items-center justify-center mt-2 text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>{errorMessage}</span>
            </div>
            {retryAttempts > 0 && retryAttempts < 3 && (
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                Attempt {retryAttempts} of 3
              </p>
            )}
            {retryAttempts >= 3 && (
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
                Maximum retry attempts reached. Please try again later or use a different card.
              </p>
            )}
          </div>
          
          <div className="flex gap-3 mt-4">
            {isRetriable && (
              <Button onClick={handleRetry} className="flex items-center">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Payment
              </Button>
            )}
            <Button onClick={handleReset} variant={isRetriable ? 'outline' : 'primary'}>
              {isRetriable ? 'Cancel' : 'Start Over'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
