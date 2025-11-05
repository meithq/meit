'use client';

import { Trophy, Zap, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { PointsCalculation } from '@/hooks/use-points-calculator';

interface PointsCalculatorProps {
  calculation: PointsCalculation | null;
  loading: boolean;
  error: string | null;
}

/**
 * Points calculation display component
 * Shows breakdown of points to be assigned including challenges
 */
export function PointsCalculator({
  calculation,
  loading,
  error,
}: PointsCalculatorProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase text-neutral-600 tracking-wide">
            Puntos a Asignar
          </h2>
        </div>
        <Card className="p-5">
          <Skeleton className="h-12 w-32 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase text-neutral-600 tracking-wide">
            Puntos a Asignar
          </h2>
        </div>
        <Card className="p-5 border-semantic-error/30 bg-semantic-error/5">
          <p className="text-sm text-semantic-error">{error}</p>
        </Card>
      </div>
    );
  }

  if (!calculation) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase text-neutral-600 tracking-wide">
            Puntos a Asignar
          </h2>
        </div>
        <Card className="p-5 border-neutral-200 bg-neutral-50">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Trophy
              className="h-12 w-12 text-neutral-300 mb-3"
              aria-hidden="true"
            />
            <p className="text-sm text-neutral-500">
              Ingrese un monto para calcular puntos
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const hasBonus = calculation.bonusPoints > 0;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <h2 className="text-sm font-semibold uppercase text-neutral-600 tracking-wide">
          Puntos a Asignar
        </h2>
      </div>

      {/* Points Breakdown Card */}
      <Card
        className={cn(
          'p-5 transition-all',
          hasBonus
            ? 'border-accent-green/50 bg-accent-green/5 shadow-lg shadow-accent-green/10'
            : 'border-primary-600/30 bg-primary-600/5'
        )}
      >
        <div className="space-y-4">
          {/* Total Points - Large Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full',
                  hasBonus
                    ? 'bg-accent-green text-neutral-900'
                    : 'bg-primary-600 text-white'
                )}
              >
                <Trophy className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-neutral-600 uppercase tracking-wide">
                  Total
                </p>
                <p
                  className={cn(
                    'text-4xl font-bold',
                    hasBonus ? 'text-accent-green' : 'text-primary-600'
                  )}
                >
                  {calculation.totalPoints}
                </p>
              </div>
            </div>
            <div>
              <span className="text-lg font-medium text-neutral-600">pts</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 pt-3 border-t border-neutral-200">
            {/* Base Points */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary-600" />
                <span className="text-sm text-neutral-700">
                  Puntos base (compra)
                </span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">
                {calculation.basePoints} pts
              </span>
            </div>

            {/* Bonus Points */}
            {hasBonus && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap
                    className="h-4 w-4 text-accent-yellow"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-neutral-700">
                    Puntos bonus (retos)
                  </span>
                </div>
                <span className="text-sm font-semibold text-accent-green">
                  +{calculation.bonusPoints} pts
                </span>
              </div>
            )}

            {/* Completed Challenges */}
            {calculation.completedChallenges.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Retos Completados
                </p>
                <div className="space-y-1.5">
                  {calculation.completedChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="flex items-center justify-between pl-2"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="success"
                          className="text-xs font-normal"
                        >
                          {challenge.name}
                        </Badge>
                      </div>
                      <span className="text-xs font-medium text-accent-green">
                        +{challenge.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Active Challenges */}
            {!hasBonus && (
              <div className="pt-2">
                <p className="text-xs text-neutral-500 italic">
                  No hay retos activos aplicables
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
