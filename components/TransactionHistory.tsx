import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { hydrateTransactions } from '../store/paymentSlice';
import { CheckCircle2, XCircle, Clock, Copy, Check } from 'lucide-react';
import { cn } from '../utils/cn';

export function TransactionHistory() {
  const dispatch = useDispatch();
  const transactions = useSelector((state: RootState) => state.payment.transactions);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      try {
        dispatch(hydrateTransactions(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to parse transactions');
      }
    }
  }, [dispatch]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'timeout': return <Clock className="w-5 h-5 text-orange-500" />;
      default: return null;
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Transactions Yet</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Your payment history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Transaction History</h2>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(tx.status)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {tx.currency} {tx.amount.toFixed(2)}
                    </span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider",
                      tx.status === 'success' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                      tx.status === 'failed' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      tx.status === 'timeout' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                    )}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
                    <span>{new Date(tx.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span className="font-mono">{tx.maskedCard}</span>
                    {tx.attemptCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{tx.attemptCount + 1} attempts</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => handleCopy(tx.id)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                  title="Copy Transaction ID"
                >
                  {copiedId === tx.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
