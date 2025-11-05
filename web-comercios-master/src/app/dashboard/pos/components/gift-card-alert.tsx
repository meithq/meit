'use client';

import { Gift, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GiftCardAlertProps {
  willGenerate: boolean;
  code?: string;
  value?: number;
  currentPoints: number;
  threshold?: number;
}

/**
 * Gift card generation alert component
 * Shows prominent notification when gift card will be generated
 */
export function GiftCardAlert({
  willGenerate,
  code,
  value = 5.0,
  currentPoints,
  threshold = 100,
}: GiftCardAlertProps) {
  if (!willGenerate) {
    // Show progress towards gift card
    const progress = (currentPoints / threshold) * 100;
    const pointsNeeded = threshold - currentPoints;

    if (currentPoints >= threshold * 0.7) {
      // Show when close to threshold (70%+)
      return (
        <Card className="p-4 border-accent-yellow/30 bg-accent-yellow/5">
          <div className="flex items-start gap-3">
            <Gift
              className="h-5 w-5 text-accent-yellow flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">
                ¡Cerca de generar Gift Card!
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                Faltan{' '}
                <span className="font-semibold text-accent-yellow">
                  {pointsNeeded} puntos
                </span>{' '}
                para alcanzar {threshold} pts
              </p>
              {/* Progress Bar */}
              <div className="mt-3 w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-accent-yellow transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={currentPoints}
                  aria-valuemin={0}
                  aria-valuemax={threshold}
                  aria-label="Progreso hacia gift card"
                />
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return null;
  }

  // Gift card will be generated
  return (
    <Card
      className={cn(
        'p-5 border-accent-green shadow-xl',
        'bg-gradient-to-br from-accent-green/10 to-accent-green/5',
        'animate-pulse-slow'
      )}
    >
      <div className="space-y-4">
        {/* Header with Icon */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-green text-neutral-900">
              <Gift className="h-7 w-7" aria-hidden="true" />
            </div>
            <Sparkles
              className="absolute -top-1 -right-1 h-5 w-5 text-accent-yellow animate-pulse"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              ¡GIFT CARD SERÁ GENERADA!
              <CheckCircle2
                className="h-5 w-5 text-accent-green"
                aria-hidden="true"
              />
            </h3>
            <p className="text-sm text-neutral-600">
              El cliente alcanzó {threshold} puntos
            </p>
          </div>
        </div>

        {/* Gift Card Details */}
        <div
          className="p-4 rounded-lg bg-white border-2 border-accent-green/30 space-y-2"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Valor</span>
            <span className="text-xl font-bold text-accent-green">
              ${value.toFixed(2)} USD
            </span>
          </div>

          {code && (
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
              <span className="text-sm text-neutral-600">Código</span>
              <span className="text-lg font-mono font-bold text-primary-600 tracking-wider">
                {code}
              </span>
            </div>
          )}
        </div>

        {/* Success Message */}
        <div className="flex items-start gap-2 text-sm">
          <svg
            className="h-5 w-5 text-accent-green flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-neutral-700">
            El cliente recibirá una notificación por WhatsApp con el código de
            su gift card
          </p>
        </div>
      </div>
    </Card>
  );
}
