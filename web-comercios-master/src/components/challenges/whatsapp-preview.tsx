'use client';

import * as React from 'react';
import { Target, DollarSign, Clock, Calendar, ShoppingBag } from 'lucide-react';

type ChallengeType = 'amount_min' | 'time_based' | 'frequency' | 'category';

interface AmountConfig {
  min_amount: number;
}

interface TimeBasedConfig {
  start_time: string;
  end_time: string;
}

interface FrequencyConfig {
  visits_required: number;
  period: 'daily' | 'weekly' | 'monthly';
}

interface CategoryConfig {
  categories: string[];
}

type ChallengeConfig = AmountConfig | TimeBasedConfig | FrequencyConfig | CategoryConfig;

interface WhatsAppPreviewProps {
  name: string;
  description: string;
  points: number;
  type: ChallengeType;
  config: ChallengeConfig;
}

/**
 * WhatsApp Message Preview
 *
 * Shows how the challenge will appear to customers via WhatsApp
 * Updates in real-time as form values change
 */
export function WhatsAppPreview({
  name,
  description,
  points,
  type,
  config,
}: WhatsAppPreviewProps) {
  // Generate requirements text based on type and config
  const requirementsText = React.useMemo(() => {
    switch (type) {
      case 'amount_min': {
        const amountConfig = config as AmountConfig;
        return amountConfig?.min_amount
          ? `Compra mínima: Bs. ${amountConfig.min_amount}`
          : 'Compra mínima requerida';
      }

      case 'time_based': {
        const timeConfig = config as TimeBasedConfig;
        if (timeConfig?.start_time && timeConfig?.end_time) {
          return `Visita entre ${formatTime(timeConfig.start_time)} y ${formatTime(timeConfig.end_time)}`;
        }
        return 'Visita en el horario especificado';
      }

      case 'frequency': {
        const freqConfig = config as FrequencyConfig;
        if (freqConfig?.visits_required && freqConfig?.period) {
          const periodText =
            freqConfig.period === 'daily'
              ? 'por día'
              : freqConfig.period === 'weekly'
                ? 'por semana'
                : 'por mes';
          return `${freqConfig.visits_required} visita${freqConfig.visits_required > 1 ? 's' : ''} ${periodText}`;
        }
        return 'Visitas frecuentes requeridas';
      }

      case 'category': {
        const catConfig = config as CategoryConfig;
        if (catConfig?.categories && catConfig.categories.length > 0) {
          const categoryLabels = catConfig.categories
            .map((c: string) => getCategoryLabel(c))
            .join(', ');
          return `Categorías: ${categoryLabels}`;
        }
        return 'Compra de categorías específicas';
      }

      default:
        return '';
    }
  }, [type, config]);

  // Get icon based on type
  const TypeIcon = React.useMemo(() => {
    switch (type) {
      case 'amount_min':
        return DollarSign;
      case 'time_based':
        return Clock;
      case 'frequency':
        return Calendar;
      case 'category':
        return ShoppingBag;
      default:
        return Target;
    }
  }, [type]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-white"
            fill="currentColor"
            aria-hidden
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900">
          Vista previa WhatsApp
        </h3>
      </div>

      <div
        className="rounded-lg border-2 border-neutral-200 bg-neutral-50 p-6"
        role="region"
        aria-label="Vista previa del mensaje de WhatsApp"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* WhatsApp Message Bubble */}
        <div className="mx-auto max-w-sm">
          <div className="rounded-lg bg-white p-4 shadow-md">
            {/* Header */}
            <div className="mb-3 flex items-center gap-3 border-b border-neutral-200 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <TypeIcon className="h-5 w-5 text-primary-600" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-semibold text-neutral-900">
                  {name || 'Nombre del reto'}
                </div>
                <div className="text-xs text-neutral-500">
                  🎯 Nuevo reto disponible
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-3">
              <p className="text-sm text-neutral-700">
                {description || 'Descripción del reto...'}
              </p>

              {/* Requirements */}
              {requirementsText && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs font-medium text-neutral-600 mb-1">
                    Requisito:
                  </p>
                  <p className="text-sm text-neutral-900">{requirementsText}</p>
                </div>
              )}

              {/* Points Reward */}
              <div className="flex items-center justify-between rounded-lg bg-accent-green/10 p-3">
                <span className="text-sm font-medium text-neutral-900">
                  Recompensa:
                </span>
                <span className="text-lg font-bold text-primary-600">
                  {points || 0} puntos
                </span>
              </div>

              {/* Call to Action */}
              <div className="pt-2 text-center">
                <p className="text-sm font-semibold text-primary-600">
                  ¡Complétalo hoy! 🚀
                </p>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="mt-1 text-right">
            <span className="text-xs text-neutral-500">
              {new Date().toLocaleTimeString('es-VE', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Sobre la vista previa
            </h4>
            <p className="text-xs text-blue-700">
              Esta es una aproximación de cómo se verá el mensaje enviado a tus
              clientes. El formato final puede variar ligeramente según el
              dispositivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper to format time (HH:MM to h:MM AM/PM)
 */
function formatTime(time: string): string {
  if (!time) return '';

  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  return `${displayHour}:${minutes} ${period}`;
}

/**
 * Helper to get category label
 */
function getCategoryLabel(categoryId: string): string {
  const labels: Record<string, string> = {
    'panaderia': 'Panadería',
    'bebidas': 'Bebidas',
    'snacks': 'Snacks',
    'comida-preparada': 'Comida preparada',
    'otros': 'Otros',
  };

  return labels[categoryId] || categoryId;
}
