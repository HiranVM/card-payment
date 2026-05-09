import React from 'react';
import { detectCardType, formatCardNumber } from '../utils/cardUtils';
import { cn } from '../utils/cn';

interface CardPreviewProps {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
}

export function CardPreview({ cardNumber, cardholderName, expiryDate }: CardPreviewProps) {
  const cardType = detectCardType(cardNumber);
  const formattedNumber = formatCardNumber(cardNumber);
  const displayName = cardholderName.trim() || 'CARDHOLDER NAME';
  const displayExpiry = expiryDate || 'MM/YY';

  const cardBackgrounds = {
    unknown: 'from-slate-700 to-slate-900',
    visa: 'from-blue-600 to-blue-800',
    mastercard: 'from-orange-500 to-red-600',
    amex: 'from-emerald-500 to-emerald-700',
  };

  return (
    <div className="w-full max-w-[400px] mx-auto perspective-1000">
      <div
        className={cn(
          "relative w-full aspect-[1.586/1] rounded-2xl p-6 text-white shadow-2xl transition-all duration-500 transform-gpu preserve-3d overflow-hidden",
          "bg-gradient-to-br",
          cardBackgrounds[cardType]
        )}
      >
        {/* Glassmorphism overlays */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm mix-blend-overlay"></div>
        <div className="absolute -inset-[100%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            {/* Chip */}
            <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md opacity-90 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 border border-yellow-600/30 rounded-md"></div>
              <div className="w-full h-[1px] bg-yellow-600/30 absolute top-1/2"></div>
              <div className="h-full w-[1px] bg-yellow-600/30 absolute left-1/2"></div>
            </div>

            {/* Logo area */}
            <div className="h-8 flex items-center justify-end w-16">
              {cardType === 'visa' && (
                <div className="text-2xl font-bold italic tracking-wider">VISA</div>
              )}
              {cardType === 'mastercard' && (
                <div className="flex">
                  <div className="w-6 h-6 bg-red-500 rounded-full mix-blend-screen opacity-90 -mr-2"></div>
                  <div className="w-6 h-6 bg-orange-500 rounded-full mix-blend-screen opacity-90"></div>
                </div>
              )}
              {cardType === 'amex' && (
                <div className="text-xl font-bold tracking-tight text-blue-50">AMEX</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-2xl font-mono tracking-widest drop-shadow-md">
              {formattedNumber || '•••• •••• •••• ••••'}
            </div>

            <div className="flex justify-between items-end pb-1">
              <div className="flex flex-col uppercase max-w-[70%]">
                <span className="text-[10px] opacity-70 mb-1">Cardholder Name</span>
                <span className="font-medium tracking-wider truncate drop-shadow-sm">
                  {displayName}
                </span>
              </div>
              <div className="flex flex-col uppercase">
                <span className="text-[10px] opacity-70 mb-1">Expires</span>
                <span className="font-medium tracking-widest drop-shadow-sm">
                  {displayExpiry}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
