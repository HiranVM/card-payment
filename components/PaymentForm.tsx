import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setStatus, setCurrentTransaction, setErrorMessage, addTransaction } from '../store/paymentSlice';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { detectCardType, formatCardNumber, validateExpiry, maskCardNumber } from '../utils/cardUtils';
import { CreditCard, User, Calendar, Lock, DollarSign } from 'lucide-react';
import { PaymentFormData, Transaction } from '../types';

interface PaymentFormProps {
  onFormChange: (data: Partial<PaymentFormData>) => void;
}

export function PaymentForm({ onFormChange }: PaymentFormProps) {
  const dispatch = useDispatch();
  const status = useSelector((state: RootState) => state.payment.status);

  const [formData, setFormData] = useState<PaymentFormData>({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    amount: 0,
    currency: 'USD',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PaymentFormData, boolean>>>({});
  const [isValid, setIsValid] = useState(false);

  // Update parent for live preview
  useEffect(() => {
    onFormChange({
      cardNumber: formData.cardNumber,
      cardholderName: formData.cardholderName,
      expiryDate: formData.expiryDate,
    });
  }, [formData.cardNumber, formData.cardholderName, formData.expiryDate, onFormChange]);

  // Validation Logic
  useEffect(() => {
    const newErrors: Partial<Record<keyof PaymentFormData, string>> = {};
    let isFormValid = true;

    // Cardholder Name
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
      isFormValid = false;
    } else if (formData.cardholderName.length < 3) {
      newErrors.cardholderName = 'Name must be at least 3 characters';
      isFormValid = false;
    }

    // Card Number
    const sanitizedCard = formData.cardNumber.replace(/\D/g, '');
    if (!sanitizedCard) {
      newErrors.cardNumber = 'Card number is required';
      isFormValid = false;
    } else if (sanitizedCard.length < 15 || sanitizedCard.length > 19) {
      newErrors.cardNumber = 'Invalid card number length';
      isFormValid = false;
    }

    // Expiry Date
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
      isFormValid = false;
    } else if (!validateExpiry(formData.expiryDate)) {
      newErrors.expiryDate = 'Invalid or expired date';
      isFormValid = false;
    }

    // CVV
    const cardType = detectCardType(formData.cardNumber);
    const requiredCvvLength = cardType === 'amex' ? 4 : 3;
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
      isFormValid = false;
    } else if (formData.cvv.length !== requiredCvvLength) {
      newErrors.cvv = `CVV must be ${requiredCvvLength} digits`;
      isFormValid = false;
    }

    // Amount
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
      isFormValid = false;
    }

    setErrors(newErrors);
    setIsValid(isFormValid);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let newValue = value;
    if (name === 'cardNumber') {
      newValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      newValue = value.replace(/\D/g, '');
      if (newValue.length > 2) {
        newValue = `${newValue.slice(0, 2)}/${newValue.slice(2, 4)}`;
      }
    } else if (name === 'cvv') {
      newValue = value.replace(/\D/g, '').slice(0, 4);
      const cardType = detectCardType(formData.cardNumber);
      if (cardType !== 'amex') newValue = newValue.slice(0, 3);
    } else if (name === 'amount') {
      newValue = parseFloat(value).toString();
      if (isNaN(newValue as any)) newValue = '0';
    }

    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(newValue) : newValue }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || status === 'processing') return;

    // Generate Transaction ID
    const transactionId = crypto.randomUUID();
    
    dispatch(setCurrentTransaction({
      id: transactionId,
      amount: formData.amount,
      currency: formData.currency
    }));
    
    dispatch(setStatus('processing'));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          amount: formData.amount,
          currency: formData.currency
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      const newTransaction: Transaction = {
        id: transactionId,
        amount: formData.amount,
        currency: formData.currency,
        status: response.ok ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
        attemptCount: 0,
        maskedCard: maskCardNumber(formData.cardNumber)
      };

      if (response.ok) {
        dispatch(setStatus('success'));
        dispatch(addTransaction(newTransaction));
      } else {
        dispatch(setStatus('failed'));
        dispatch(setErrorMessage(data.reason || 'Payment failed'));
        dispatch(addTransaction(newTransaction));
      }
    } catch (error: any) {
      const timeoutTransaction: Transaction = {
        id: transactionId,
        amount: formData.amount,
        currency: formData.currency,
        status: 'timeout',
        timestamp: new Date().toISOString(),
        attemptCount: 0,
        maskedCard: maskCardNumber(formData.cardNumber)
      };
      
      dispatch(addTransaction(timeoutTransaction));

      if (error.name === 'AbortError') {
        dispatch(setStatus('timeout'));
        dispatch(setErrorMessage('Request timed out'));
      } else {
        dispatch(setStatus('failed'));
        dispatch(setErrorMessage('Network error occurred'));
      }
    }
  };


  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Payment Details</h2>
        
        <Input
          label="Cardholder Name"
          name="cardholderName"
          placeholder="John Doe"
          value={formData.cardholderName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.cardholderName ? errors.cardholderName : undefined}
          icon={<User className="w-4 h-4" />}
          autoComplete="cc-name"
        />

        <Input
          label="Card Number"
          name="cardNumber"
          placeholder="0000 0000 0000 0000"
          value={formData.cardNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.cardNumber ? errors.cardNumber : undefined}
          icon={<CreditCard className="w-4 h-4" />}
          autoComplete="cc-number"
          maxLength={19}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Expiry Date"
            name="expiryDate"
            placeholder="MM/YY"
            value={formData.expiryDate}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.expiryDate ? errors.expiryDate : undefined}
            icon={<Calendar className="w-4 h-4" />}
            autoComplete="cc-exp"
            maxLength={5}
          />
          <Input
            label="CVV"
            name="cvv"
            type="password"
            placeholder="123"
            value={formData.cvv}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.cvv ? errors.cvv : undefined}
            icon={<Lock className="w-4 h-4" />}
            autoComplete="cc-csc"
            maxLength={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={formData.amount || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.amount ? errors.amount : undefined}
            icon={<DollarSign className="w-4 h-4" />}
          />
          <Select
            label="Currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            options={[
              { label: 'USD ($)', value: 'USD' },
              { label: 'INR (₹)', value: 'INR' },
            ]}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!isValid || status === 'processing'}
        isLoading={status === 'processing'}
      >
        Pay {formData.currency} {formData.amount ? Number(formData.amount).toFixed(2) : '0.00'}
      </Button>
    </form>
  );
}
