'use client';

import * as React from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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

interface ConfigFieldsProps {
  type: ChallengeType;
  config: ChallengeConfig;
  errors: Record<string, { message?: string }> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
}

const CATEGORIES = [
  { id: 'panaderia', label: 'Panadería' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'comida-preparada', label: 'Comida preparada' },
  { id: 'otros', label: 'Otros' },
];

const PERIODS = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
];

/**
 * Configuration Fields
 *
 * Renders type-specific configuration fields based on challenge type
 */
export function ConfigFields({
  type,
  config,
  errors,
  register,
  setValue,
}: ConfigFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">
        Configuración del Reto
      </h3>

      {/* Amount Minimum Configuration */}
      {type === 'amount_min' && (
        <div className="space-y-2">
          <Label htmlFor="config.min_amount" required>
            Monto mínimo de compra
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="text-neutral-500">Bs.</span>
            </div>
            <Input
              id="config.min_amount"
              type="number"
              min={0}
              step={0.01}
              placeholder="10.00"
              className="pl-12"
              error={!!errors?.min_amount}
              aria-describedby={
                errors?.min_amount ? 'min-amount-error' : undefined
              }
              {...register('config.min_amount', { valueAsNumber: true })}
            />
          </div>
          {errors?.min_amount && (
            <p
              id="min-amount-error"
              className="text-xs text-semantic-error"
              role="alert"
            >
              {errors.min_amount.message}
            </p>
          )}
          <p className="text-xs text-neutral-500">
            El cliente debe comprar al menos este monto para completar el reto
          </p>
        </div>
      )}

      {/* Time Range Configuration */}
      {type === 'time_based' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="config.start_time" required>
              Hora de inicio
            </Label>
            <Input
              id="config.start_time"
              type="time"
              error={!!errors?.start_time}
              aria-describedby={
                errors?.start_time ? 'start-time-error' : undefined
              }
              {...register('config.start_time')}
            />
            {errors?.start_time && (
              <p
                id="start-time-error"
                className="text-xs text-semantic-error"
                role="alert"
              >
                {errors.start_time.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="config.end_time" required>
              Hora de fin
            </Label>
            <Input
              id="config.end_time"
              type="time"
              error={!!errors?.end_time}
              aria-describedby={
                errors?.end_time ? 'end-time-error' : undefined
              }
              {...register('config.end_time')}
            />
            {errors?.end_time && (
              <p
                id="end-time-error"
                className="text-xs text-semantic-error"
                role="alert"
              >
                {errors.end_time.message}
              </p>
            )}
          </div>

          <p className="text-xs text-neutral-500 sm:col-span-2">
            El cliente debe visitar durante este rango de horario
          </p>
        </div>
      )}

      {/* Visit Frequency Configuration */}
      {type === 'frequency' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="config.visits_required" required>
              Visitas requeridas
            </Label>
            <Input
              id="config.visits_required"
              type="number"
              min={1}
              placeholder="3"
              error={!!errors?.visits_required}
              aria-describedby={
                errors?.visits_required ? 'visits-required-error' : undefined
              }
              {...register('config.visits_required', { valueAsNumber: true })}
            />
            {errors?.visits_required && (
              <p
                id="visits-required-error"
                className="text-xs text-semantic-error"
                role="alert"
              >
                {errors.visits_required.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="config.period" required>
              Período
            </Label>
            <select
              id="config.period"
              className={cn(
                'flex w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-neutral-900 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-0',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
                errors?.period
                  ? 'border-semantic-error'
                  : 'border-neutral-300 hover:border-neutral-400'
              )}
              aria-invalid={!!errors?.period}
              aria-describedby={errors?.period ? 'period-error' : undefined}
              {...register('config.period')}
            >
              {PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            {errors?.period && (
              <p
                id="period-error"
                className="text-xs text-semantic-error"
                role="alert"
              >
                {errors.period.message}
              </p>
            )}
          </div>

          <p className="text-xs text-neutral-500">
            El cliente debe visitar el número de veces especificado en el
            período seleccionado
          </p>
        </div>
      )}

      {/* Category Configuration */}
      {type === 'category' && (
        <div className="space-y-2">
          <fieldset
            aria-invalid={!!errors?.categories}
            aria-describedby={
              errors?.categories ? 'categories-error' : undefined
            }
          >
            <legend className="text-sm font-medium text-neutral-900 mb-3">
              Categorías de productos
              <span className="ml-1 text-semantic-error" aria-label="required">
                *
              </span>
            </legend>

            <div className="space-y-2">
              {CATEGORIES.map((category) => {
                const categoryConfig = config as CategoryConfig;
                const isChecked =
                  categoryConfig?.categories?.includes(category.id) || false;

                return (
                  <label
                    key={category.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all',
                      'hover:bg-neutral-50',
                      isChecked
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-neutral-200 bg-white'
                    )}
                  >
                    <input
                      type="checkbox"
                      value={category.id}
                      checked={isChecked}
                      onChange={(e) => {
                        const currentCategories = categoryConfig?.categories || [];
                        const newCategories = e.target.checked
                          ? [...currentCategories, category.id]
                          : currentCategories.filter(
                              (c: string) => c !== category.id
                            );
                        setValue('config.categories', newCategories);
                      }}
                      className={cn(
                        'h-4 w-4 rounded border-neutral-300 text-primary-600',
                        'focus:ring-2 focus:ring-primary-600 focus:ring-offset-2'
                      )}
                    />
                    <span className="text-sm text-neutral-900">
                      {category.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {errors?.categories && (
            <p
              id="categories-error"
              className="text-xs text-semantic-error"
              role="alert"
            >
              {errors.categories.message}
            </p>
          )}

          <p className="text-xs text-neutral-500">
            El cliente debe comprar al menos un producto de las categorías
            seleccionadas
          </p>
        </div>
      )}
    </div>
  );
}
