'use client';

import * as React from 'react';
import { Edit, Pause, Play, BarChart3, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Challenge } from '@/types/database';

export interface ChallengeCardProps {
  challenge: Challenge;
  completedCount?: number;
  onEdit: (challenge: Challenge) => void;
  onToggleStatus: (challenge: Challenge) => void;
  onDelete: (challenge: Challenge) => void;
  onViewAnalytics: (challenge: Challenge) => void;
}

const challengeTypeLabels: Record<Challenge['type'], string> = {
  amount_min: 'Monto mínimo',
  time_based: 'Horario',
  frequency: 'Frecuencia',
  category: 'Categoría',
};

const challengeTypeIcons: Record<Challenge['type'], string> = {
  amount_min: '💰',
  time_based: '🌅',
  frequency: '🎯',
  category: '🍞',
};

export const ChallengeCard = React.forwardRef<HTMLDivElement, ChallengeCardProps>(
  (
    {
      challenge,
      completedCount = 0,
      onEdit,
      onToggleStatus,
      onDelete,
      onViewAnalytics,
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className="relative flex flex-col overflow-hidden transition-all hover:shadow-md"
      >
        <div className="p-6">
          {/* Header with icon and name */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="text-3xl" aria-hidden="true">
                {challengeTypeIcons[challenge.type]}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900">
                  {challenge.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" size="sm">
                    {challengeTypeLabels[challenge.type]}
                  </Badge>
                  <Badge
                    variant={challenge.is_active ? 'success' : 'default'}
                    size="sm"
                    dot
                  >
                    {challenge.is_active ? 'Activo' : 'Pausado'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {challenge.description && (
            <p className="mb-4 text-sm text-neutral-600 line-clamp-2">
              {challenge.description}
            </p>
          )}

          {/* Metrics */}
          <div className="mb-4 flex items-center justify-between rounded-lg bg-neutral-50 p-3">
            <div>
              <p className="text-xs text-neutral-600">Puntos</p>
              <p className="text-2xl font-bold text-primary-600">
                {challenge.points}
              </p>
            </div>
            {challenge.target_value && (
              <div className="text-right">
                <p className="text-xs text-neutral-600">Meta</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {challenge.target_value}
                </p>
              </div>
            )}
          </div>

          {/* Completion stats */}
          <div className="mb-4">
            <p className="text-sm text-neutral-600">
              <span className="font-semibold text-neutral-900">
                {completedCount}
              </span>{' '}
              completados {challenge.is_active ? 'hoy' : 'antes de pausar'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(challenge)}
              className="flex-1 sm:flex-none"
              aria-label={`Editar reto ${challenge.name}`}
            >
              <Edit className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Editar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(challenge)}
              className="flex-1 sm:flex-none"
              aria-label={
                challenge.is_active
                  ? `Pausar reto ${challenge.name}`
                  : `Activar reto ${challenge.name}`
              }
            >
              {challenge.is_active ? (
                <>
                  <Pause className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Activar
                </>
              )}
            </Button>

            {challenge.is_active && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewAnalytics(challenge)}
                className="flex-1 sm:flex-none"
                aria-label={`Ver analíticas de ${challenge.name}`}
              >
                <BarChart3 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Analytics
              </Button>
            )}

            {!challenge.is_active && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(challenge)}
                className="flex-1 text-error-600 hover:bg-error-50 hover:text-error-700 sm:flex-none"
                aria-label={`Eliminar reto ${challenge.name}`}
              >
                <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }
);

ChallengeCard.displayName = 'ChallengeCard';
