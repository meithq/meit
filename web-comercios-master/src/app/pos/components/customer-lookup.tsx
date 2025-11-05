'use client';

import { Search, X, User, Phone, Trophy, Gift } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { Customer } from '@/hooks/use-customer-lookup';

interface CustomerLookupProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  onSearch: () => void;
  onClear: () => void;
}

/**
 * Customer lookup component for POS interface
 * Allows searching customers by phone number and displays customer info
 */
export function CustomerLookup({
  phone,
  onPhoneChange,
  customer,
  loading,
  error,
  onSearch,
  onClear,
}: CustomerLookupProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClear();
    }
  };

  const formatPhoneDisplay = (phoneNumber: string) => {
    // Format: +58 412-345-6789
    if (phoneNumber.startsWith('+58') && phoneNumber.length >= 12) {
      const areaCode = phoneNumber.slice(3, 6);
      const part1 = phoneNumber.slice(6, 9);
      const part2 = phoneNumber.slice(9, 13);
      return `+58 ${areaCode}-${part1}-${part2}`;
    }
    return phoneNumber;
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <h2 className="text-sm font-semibold uppercase text-neutral-600 tracking-wide">
          Cliente
        </h2>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="tel"
            placeholder="+58 412-345-6789"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            onKeyDown={handleKeyDown}
            error={!!error && !customer}
            disabled={loading}
            className="pl-10"
            autoFocus
            aria-label="Número de teléfono del cliente"
          />
          <Phone
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
            aria-hidden="true"
          />
        </div>

        <Button
          onClick={onSearch}
          disabled={loading || !phone || phone.length < 10}
          variant="primary"
          size="md"
          className="min-w-[120px]"
          aria-label="Buscar cliente"
        >
          {loading ? (
            <>
              <Spinner className="h-4 w-4" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Buscar
            </>
          )}
        </Button>

        {(customer || phone) && (
          <Button
            onClick={onClear}
            disabled={loading}
            variant="outline"
            size="md"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && !customer && (
        <Card className="p-4 border-semantic-warning bg-semantic-warning/5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-semantic-warning"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-semantic-warning">
                {error}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                Puede continuar sin registro del cliente
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Customer Info Card */}
      {customer && (
        <Card className="p-5 border-accent-teal/30 bg-accent-teal/5">
          <div className="space-y-3">
            {/* Customer Name */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white">
                <User className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900">
                  {customer.name}
                </h3>
                <p className="text-sm text-neutral-600">
                  {formatPhoneDisplay(customer.phone)}
                </p>
              </div>
              <Badge variant="success" className="text-xs">
                Activo
              </Badge>
            </div>

            {/* Customer Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <Trophy
                  className="h-5 w-5 text-accent-yellow"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs text-neutral-600">Puntos</p>
                  <p className="text-lg font-bold text-primary-600">
                    {customer.total_points}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-accent-green" aria-hidden="true" />
                <div>
                  <p className="text-xs text-neutral-600">Gift Cards</p>
                  <p
                    className={cn(
                      'text-lg font-bold',
                      customer.gift_cards_count && customer.gift_cards_count > 0
                        ? 'text-accent-green'
                        : 'text-neutral-400'
                    )}
                  >
                    {customer.gift_cards_count || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
