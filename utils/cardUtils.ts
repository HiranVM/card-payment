import { CardType } from '../types';

export const detectCardType = (cardNumber: string): CardType => {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (/^4/.test(sanitized)) return 'visa';
  if (/^5[1-5]/.test(sanitized) || /^2(?:2(?:2[1-9]|[3-9]\d)|[3-6]\d\d|7(?:[01]\d|20))/.test(sanitized)) return 'mastercard';
  if (/^3[47]/.test(sanitized)) return 'amex';
  return 'unknown';
};

export const formatCardNumber = (value: string): string => {
  const sanitized = value.replace(/\D/g, '');
  const match = sanitized.match(/.{1,4}/g);
  return match ? match.join(' ') : sanitized;
};

export const validateExpiry = (value: string): boolean => {
  if (!/^\d{2}\/\d{2}$/.test(value)) return false;
  const [monthStr, yearStr] = value.split('/');
  const month = parseInt(monthStr, 10);
  const year = parseInt(`20${yearStr}`, 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

export const maskCardNumber = (cardNumber: string): string => {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (sanitized.length < 4) return sanitized;
  const last4 = sanitized.slice(-4);
  return `**** **** **** ${last4}`;
};

export const luhnCheck = (cardNumber: string): boolean => {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (!sanitized) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};
