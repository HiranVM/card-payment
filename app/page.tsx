'use client';

import React, { useState, useCallback } from 'react';
import { PaymentForm } from '../components/PaymentForm';
import { CardPreview } from '../components/CardPreview';
import { PaymentStatus } from '../components/PaymentStatus';
import { TransactionHistory } from '../components/TransactionHistory';
import { ShieldCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { PaymentFormData } from '../types';

export default function Home() {
  const [previewData, setPreviewData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
  });

  const status = useSelector((state: RootState) => state.payment.status);

  const handleFormChange = useCallback((data: Partial<PaymentFormData>) => {
    setPreviewData(prev => {
      const cardNumber = data.cardNumber ?? prev.cardNumber;
      const cardholderName = data.cardholderName ?? prev.cardholderName;
      const expiryDate = data.expiryDate ?? prev.expiryDate;
      
      if (
        prev.cardNumber === cardNumber &&
        prev.cardholderName === cardholderName &&
        prev.expiryDate === expiryDate
      ) {
        return prev;
      }
      return { cardNumber, cardholderName, expiryDate };
    });
  }, []);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">PayGate</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 lg:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Form & Status */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Complete your payment</h1>
              <p className="text-slate-500 dark:text-slate-400">Enter your credit card details below to securely process your transaction.</p>
            </div>

            {status === 'idle' ? (
              <PaymentForm onFormChange={handleFormChange} />
            ) : (
              <PaymentStatus />
            )}
          </div>

          {/* Right Column: Card Preview & History */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
            <div className="hidden sm:block">
              <CardPreview 
                cardNumber={previewData.cardNumber}
                cardholderName={previewData.cardholderName}
                expiryDate={previewData.expiryDate}
              />
            </div>
            
            <TransactionHistory />
          </div>

        </div>
      </main>
    </div>
  );
}
