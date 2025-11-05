'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Info, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  pointsConfigSchema,
  type PointsConfigFormData,
} from '@meit/shared/validators/settings';

const DEFAULT_CONFIG: PointsConfigFormData = {
  points_per_dollar: 1,
  gift_card_threshold: 100,
  gift_card_value: 5,
  daily_points_limit: 1000,
  minimum_purchase: 1,
};

export default function PointsConfigPage() {
  const [loading, setLoading] = React.useState(false);
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<PointsConfigFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pointsConfigSchema) as any,
    defaultValues: DEFAULT_CONFIG,
  });

  const pointsPerDollar = watch('points_per_dollar');
  const giftCardThreshold = watch('gift_card_threshold');
  const giftCardValue = watch('gift_card_value');

  // Calculate example values
  const examplePurchase = 25;
  const examplePoints = examplePurchase * (pointsPerDollar || 1);
  const purchaseNeeded = (giftCardThreshold || 100) / (pointsPerDollar || 1);

  // Load config on mount
  React.useEffect(() => {
    // TODO: Fetch points config from API
    // For now, using default values
    reset(DEFAULT_CONFIG);
  }, [reset]);

  const onSubmit = async (data: PointsConfigFormData) => {
    setLoading(true);
    try {
      // TODO: Call API to update points config
      console.log('Saving points config:', data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Configuración de puntos actualizada');
    } catch (error) {
      console.error('Error saving points config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    reset(DEFAULT_CONFIG);
    setResetDialogOpen(false);
    toast.success('Configuración restaurada a valores por defecto');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-600" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">
              Configuración de sistema de puntos
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Define cómo tus clientes acumulan puntos y obtienen gift cards. Los
              cambios afectan solo a las transacciones futuras.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Points per Dollar */}
          <div className="space-y-2">
            <Label htmlFor="points_per_dollar">
              Puntos por dólar <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register('points_per_dollar', { valueAsNumber: true })}
              id="points_per_dollar"
              type="number"
              min="0.1"
              max="1000"
              step="0.1"
              error={!!errors.points_per_dollar}
              aria-invalid={errors.points_per_dollar ? 'true' : undefined}
              aria-describedby={
                errors.points_per_dollar
                  ? 'points_per_dollar-error'
                  : 'points_per_dollar-hint'
              }
            />
            {!errors.points_per_dollar && (
              <p id="points_per_dollar-hint" className="text-sm text-neutral-500">
                Cuántos puntos se otorgan por cada $1 USD de compra
              </p>
            )}
            {errors.points_per_dollar && (
              <p
                id="points_per_dollar-error"
                className="text-sm text-red-600"
                role="alert"
              >
                {errors.points_per_dollar.message}
              </p>
            )}
          </div>

          {/* Gift Card Threshold */}
          <div className="space-y-2">
            <Label htmlFor="gift_card_threshold">
              Puntos necesarios para gift card <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register('gift_card_threshold', { valueAsNumber: true })}
              id="gift_card_threshold"
              type="number"
              min="50"
              max="500"
              step="10"
              error={!!errors.gift_card_threshold}
              aria-invalid={errors.gift_card_threshold ? 'true' : undefined}
              aria-describedby={
                errors.gift_card_threshold
                  ? 'gift_card_threshold-error'
                  : 'gift_card_threshold-hint'
              }
            />
            {!errors.gift_card_threshold && (
              <p
                id="gift_card_threshold-hint"
                className="text-sm text-neutral-500"
              >
                Cantidad de puntos que el cliente debe acumular para recibir una
                gift card
              </p>
            )}
            {errors.gift_card_threshold && (
              <p
                id="gift_card_threshold-error"
                className="text-sm text-red-600"
                role="alert"
              >
                {errors.gift_card_threshold.message}
              </p>
            )}
          </div>

          {/* Gift Card Value */}
          <div className="space-y-2">
            <Label htmlFor="gift_card_value">
              Valor de la gift card (USD) <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register('gift_card_value', { valueAsNumber: true })}
              id="gift_card_value"
              type="number"
              min="2"
              max="25"
              step="0.5"
              error={!!errors.gift_card_value}
              aria-invalid={errors.gift_card_value ? 'true' : undefined}
              aria-describedby={
                errors.gift_card_value
                  ? 'gift_card_value-error'
                  : 'gift_card_value-hint'
              }
            />
            {!errors.gift_card_value && (
              <p id="gift_card_value-hint" className="text-sm text-neutral-500">
                Valor en dólares de cada gift card generada
              </p>
            )}
            {errors.gift_card_value && (
              <p
                id="gift_card_value-error"
                className="text-sm text-red-600"
                role="alert"
              >
                {errors.gift_card_value.message}
              </p>
            )}
          </div>

          {/* Daily Points Limit */}
          <div className="space-y-2">
            <Label htmlFor="daily_points_limit">
              Límite diario de puntos por cliente{' '}
              <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register('daily_points_limit', { valueAsNumber: true })}
              id="daily_points_limit"
              type="number"
              min="100"
              max="5000"
              step="100"
              error={!!errors.daily_points_limit}
              aria-invalid={errors.daily_points_limit ? 'true' : undefined}
              aria-describedby={
                errors.daily_points_limit
                  ? 'daily_points_limit-error'
                  : 'daily_points_limit-hint'
              }
            />
            {!errors.daily_points_limit && (
              <p
                id="daily_points_limit-hint"
                className="text-sm text-neutral-500"
              >
                Máximo de puntos que un cliente puede acumular en un día
              </p>
            )}
            {errors.daily_points_limit && (
              <p
                id="daily_points_limit-error"
                className="text-sm text-red-600"
                role="alert"
              >
                {errors.daily_points_limit.message}
              </p>
            )}
          </div>

          {/* Minimum Purchase */}
          <div className="space-y-2">
            <Label htmlFor="minimum_purchase">
              Compra mínima (USD) <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register('minimum_purchase', { valueAsNumber: true })}
              id="minimum_purchase"
              type="number"
              min="0.5"
              max="100"
              step="0.5"
              error={!!errors.minimum_purchase}
              aria-invalid={errors.minimum_purchase ? 'true' : undefined}
              aria-describedby={
                errors.minimum_purchase
                  ? 'minimum_purchase-error'
                  : 'minimum_purchase-hint'
              }
            />
            {!errors.minimum_purchase && (
              <p id="minimum_purchase-hint" className="text-sm text-neutral-500">
                Monto mínimo de compra para que el cliente pueda ganar puntos
              </p>
            )}
            {errors.minimum_purchase && (
              <p
                id="minimum_purchase-error"
                className="text-sm text-red-600"
                role="alert"
              >
                {errors.minimum_purchase.message}
              </p>
            )}
          </div>

          {/* Visual Helper */}
          <div className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4">
            <h4 className="text-sm font-semibold text-primary-900">
              Vista previa de configuración
            </h4>
            <div className="mt-3 space-y-2 text-sm text-primary-700">
              <p>
                Una compra de <span className="font-semibold">${examplePurchase}</span>{' '}
                = <span className="font-semibold">{examplePoints} puntos</span>
              </p>
              <p>
                El cliente necesita comprar{' '}
                <span className="font-semibold">${purchaseNeeded.toFixed(2)}</span>{' '}
                para obtener una gift card de{' '}
                <span className="font-semibold">${giftCardValue}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetDialogOpen(true)}
              disabled={loading}
            >
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Restaurar valores por defecto
            </Button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={loading || !isDirty}
                onClick={() => reset()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading || !isDirty}
              >
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                Guardar configuración
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Reset Confirmation Dialog */}
      {resetDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setResetDialogOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="reset-dialog-title"
            aria-describedby="reset-dialog-description"
          >
            <h3
              id="reset-dialog-title"
              className="text-lg font-semibold text-neutral-900"
            >
              Restaurar valores por defecto
            </h3>
            <p
              id="reset-dialog-description"
              className="mt-2 text-sm text-neutral-600"
            >
              ¿Estás seguro de que deseas restaurar la configuración a los valores
              por defecto? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setResetDialogOpen(false)}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleResetToDefaults}
                fullWidth
              >
                Restaurar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
