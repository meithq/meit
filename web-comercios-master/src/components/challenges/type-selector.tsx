'use client';

import * as React from 'react';
import { DollarSign, Clock, Calendar, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChallengeType = 'amount_min' | 'time_based' | 'frequency' | 'category';

interface TypeOption {
  value: ChallengeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    value: 'amount_min',
    label: 'Por monto mínimo',
    description: 'Compra un monto mínimo específico',
    icon: DollarSign,
  },
  {
    value: 'time_based',
    label: 'Por horario de visita',
    description: 'Visita durante un horario específico',
    icon: Clock,
  },
  {
    value: 'frequency',
    label: 'Por frecuencia de visitas',
    description: 'Visita X veces en un período',
    icon: Calendar,
  },
  {
    value: 'category',
    label: 'Por categoría de producto',
    description: 'Compra de categorías específicas',
    icon: ShoppingBag,
  },
];

interface TypeSelectorProps {
  value: ChallengeType;
  onChange: (type: ChallengeType) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Challenge Type Selector
 *
 * Radio group for selecting challenge type with:
 * - Visual cards for each option
 * - Icons for better UX
 * - Accessible keyboard navigation
 */
export function TypeSelector({
  value,
  onChange,
  error,
  disabled = false,
}: TypeSelectorProps) {
  return (
    <div className="space-y-4">
      <fieldset
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? 'type-error' : undefined}
      >
        <legend className="text-lg font-semibold text-neutral-900 mb-3">
          Tipo de Reto
        </legend>

        <div className="grid gap-3 sm:grid-cols-2">
          {TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = value === option.value;

            return (
              <label
                key={option.value}
                className={cn(
                  'relative flex cursor-pointer rounded-lg border-2 p-4 transition-all',
                  'focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2',
                  isSelected
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                <input
                  type="radio"
                  name="challenge-type"
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value as ChallengeType)}
                  className="sr-only"
                  disabled={disabled}
                  aria-describedby={`type-${option.value}-description`}
                />

                <div className="flex flex-1 items-start gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-900">
                      {option.label}
                    </div>
                    <p
                      id={`type-${option.value}-description`}
                      className="mt-1 text-xs text-neutral-600"
                    >
                      {option.description}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={cn(
                      'h-5 w-5 shrink-0 rounded-full border-2 transition-all',
                      isSelected
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-neutral-300 bg-white'
                    )}
                    aria-hidden
                  >
                    {isSelected && (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <p id="type-error" className="text-xs text-semantic-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
