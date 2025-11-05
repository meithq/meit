'use client';

import { DollarSign, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PurchaseInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  onClear: () => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Purchase amount input component for POS
 * Handles currency formatting and validation
 */
export function PurchaseInput({
  amount,
  onAmountChange,
  onClear,
  disabled = false,
  error,
}: PurchaseInputProps) {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      onAmountChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent 'e', '+', '-' keys
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const numericAmount = parseFloat(amount) || 0;
  const isValid = numericAmount >= 1;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <h2 className="text-sm font-semibold uppercase text-neutral-600 tracking-wide">
          Monto de Compra
        </h2>
      </div>

      {/* Amount Input */}
      <div className="relative">
        <div className="relative flex items-center gap-2">
          {/* Currency Symbol */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
            <DollarSign
              className="h-6 w-6 text-accent-teal"
              aria-hidden="true"
            />
          </div>

          {/* Amount Input */}
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            error={!!error || (amount !== '' && !isValid)}
            className={cn(
              'pl-12 pr-20 text-4xl font-bold h-20',
              'placeholder:text-neutral-300',
              isValid && 'text-primary-600',
              !isValid && amount !== '' && 'text-semantic-error'
            )}
            aria-label="Monto de compra en dólares"
            aria-invalid={!!error || (amount !== '' && !isValid)}
            aria-describedby={
              error || (amount !== '' && !isValid)
                ? 'amount-error'
                : undefined
            }
          />

          {/* Clear Button */}
          {amount && (
            <Button
              type="button"
              onClick={onClear}
              disabled={disabled}
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              aria-label="Limpiar monto"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* USD Label */}
        <div className="absolute right-14 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className="text-lg font-medium text-neutral-400">USD</span>
        </div>
      </div>

      {/* Error/Helper Text */}
      {(error || (amount !== '' && !isValid)) && (
        <div id="amount-error" className="flex items-start gap-2" role="alert">
          <svg
            className="h-4 w-4 text-semantic-error flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-semantic-error">
            {error || 'El monto mínimo es $1.00 USD'}
          </p>
        </div>
      )}

      {/* Helper Text */}
      {!error && isValid && (
        <p className="text-sm text-neutral-600">
          Puntos base: <span className="font-semibold">{Math.floor(numericAmount)}</span> pts
        </p>
      )}
    </div>
  );
}
