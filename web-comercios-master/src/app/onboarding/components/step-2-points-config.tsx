'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  pointsConfigSchema,
  type PointsConfigData,
  calculateROI,
} from '@meit/shared/validators/onboarding';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface Step2PointsConfigProps {
  defaultValues?: Partial<PointsConfigData>;
  onNext: (data: PointsConfigData) => void;
  onBack: () => void;
}

const RECOMMENDED_CONFIG: PointsConfigData = {
  pointsPerDollar: 1,
  giftCardThreshold: 100,
  giftCardValue: 5,
  dailyLimit: 1000,
  minPurchase: 1,
};

export function Step2PointsConfig({ defaultValues, onNext, onBack }: Step2PointsConfigProps) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<PointsConfigData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pointsConfigSchema) as any,
    defaultValues: { ...RECOMMENDED_CONFIG, ...defaultValues },
    mode: 'onChange',
  });

  // Watch all values for real-time calculations
  const pointsPerDollar = watch('pointsPerDollar');
  const giftCardThreshold = watch('giftCardThreshold');
  const giftCardValue = watch('giftCardValue');
  const dailyLimit = watch('dailyLimit');
  const minPurchase = watch('minPurchase');

  // Calculate ROI in real-time
  const roi = calculateROI({
    pointsPerDollar,
    giftCardThreshold,
    giftCardValue,
    dailyLimit,
    minPurchase,
  });

  const onSubmit = async (data: PointsConfigData) => {
    onNext(data);
  };

  const applyRecommendedSettings = () => {
    setValue('pointsPerDollar', RECOMMENDED_CONFIG.pointsPerDollar, { shouldValidate: true });
    setValue('giftCardThreshold', RECOMMENDED_CONFIG.giftCardThreshold, { shouldValidate: true });
    setValue('giftCardValue', RECOMMENDED_CONFIG.giftCardValue, { shouldValidate: true });
    setValue('dailyLimit', RECOMMENDED_CONFIG.dailyLimit, { shouldValidate: true });
    setValue('minPurchase', RECOMMENDED_CONFIG.minPurchase, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Configuración de Puntos
        </h2>
        <p className="text-neutral-600">
          Define cómo tus clientes ganarán y canjearán puntos
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Use Recommended Settings Button */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-primary-900 font-medium mb-1">
                Configuración recomendada
              </p>
              <p className="text-xs text-primary-700 mb-3">
                Basada en mejores prácticas de negocios similares
              </p>
              <Button
                type="button"
                onClick={applyRecommendedSettings}
                variant="outline"
                size="sm"
                className="border-primary-600 text-primary-600 hover:bg-primary-100"
              >
                Usar configuración recomendada
              </Button>
            </div>
          </div>
        </div>

        {/* Points Per Dollar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="pointsPerDollar" required>
              Puntos por Dólar
            </Label>
            <span className="text-lg font-bold text-primary-600">
              {pointsPerDollar}
            </span>
          </div>
          <Slider
            id="pointsPerDollar"
            min={0.1}
            max={10}
            step={0.1}
            value={[pointsPerDollar]}
            onValueChange={([value]) => setValue('pointsPerDollar', value, { shouldValidate: true })}
            className="my-4"
          />
          <p className="text-sm text-neutral-600">
            Los clientes ganarán <strong>{pointsPerDollar} punto{pointsPerDollar !== 1 ? 's' : ''}</strong> por cada $1 USD de compra
          </p>
          {errors.pointsPerDollar && (
            <p className="text-sm text-error-600" role="alert">
              {errors.pointsPerDollar.message}
            </p>
          )}
        </div>

        {/* Gift Card Configuration */}
        <div className="border border-neutral-200 rounded-lg p-6 space-y-6">
          <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
            <span>Configuración de Gift Cards</span>
          </h3>

          {/* Gift Card Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="giftCardThreshold" required>
                Umbral para Gift Card (puntos)
              </Label>
              <span className="text-lg font-bold text-primary-600">
                {giftCardThreshold}
              </span>
            </div>
            <Slider
              id="giftCardThreshold"
              min={50}
              max={500}
              step={10}
              value={[giftCardThreshold]}
              onValueChange={([value]) => setValue('giftCardThreshold', value, { shouldValidate: true })}
              className="my-4"
            />
            <p className="text-sm text-neutral-600">
              Gift card generada al acumular {giftCardThreshold} puntos
            </p>
            {errors.giftCardThreshold && (
              <p className="text-sm text-error-600" role="alert">
                {errors.giftCardThreshold.message}
              </p>
            )}
          </div>

          {/* Gift Card Value */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="giftCardValue" required>
                Valor de Gift Card (USD)
              </Label>
              <span className="text-lg font-bold text-primary-600">
                ${giftCardValue}
              </span>
            </div>
            <Slider
              id="giftCardValue"
              min={2}
              max={25}
              step={1}
              value={[giftCardValue]}
              onValueChange={([value]) => setValue('giftCardValue', value, { shouldValidate: true })}
              className="my-4"
            />
            <p className="text-sm text-neutral-600">
              Valor de la gift card: ${giftCardValue} USD
            </p>
            {errors.giftCardValue && (
              <p className="text-sm text-error-600" role="alert">
                {errors.giftCardValue.message}
              </p>
            )}
          </div>
        </div>

        {/* ROI Visual Helper */}
        <div
          className={`
            rounded-lg p-6 border-2 transition-colors
            ${
              roi.isRecommended
                ? 'bg-success-50 border-success-300'
                : roi.returnRate > 20
                  ? 'bg-error-50 border-error-300'
                  : 'bg-warning-50 border-warning-300'
            }
          `}
        >
          <div className="flex items-start gap-3">
            {roi.isRecommended ? (
              <TrendingUp className="w-6 h-6 text-success-600 flex-shrink-0" />
            ) : roi.returnRate > 20 ? (
              <TrendingDown className="w-6 h-6 text-error-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-warning-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4
                className={`
                  font-semibold mb-2
                  ${roi.isRecommended ? 'text-success-900' : roi.returnRate > 20 ? 'text-error-900' : 'text-warning-900'}
                `}
              >
                Análisis de Configuración
              </h4>
              <div className="space-y-2 text-sm">
                <p
                  className={
                    roi.isRecommended
                      ? 'text-success-800'
                      : roi.returnRate > 20
                        ? 'text-error-800'
                        : 'text-warning-800'
                  }
                >
                  <strong>Gasto requerido:</strong> ${roi.thresholdSpending} USD para obtener una gift card de ${giftCardValue}
                </p>
                <p
                  className={
                    roi.isRecommended
                      ? 'text-success-800'
                      : roi.returnRate > 20
                        ? 'text-error-800'
                        : 'text-warning-800'
                  }
                >
                  <strong>Tasa de retorno:</strong> {roi.returnRate}%
                </p>
                {roi.isRecommended && (
                  <p className="text-success-700 font-medium mt-2">
                    ✓ Configuración óptima. Esta tasa incentiva la lealtad sin comprometer márgenes.
                  </p>
                )}
                {roi.returnRate > 20 && (
                  <p className="text-error-700 font-medium mt-2">
                    ⚠ El valor de gift card es muy alto. Podrías comprometer tus márgenes.
                  </p>
                )}
                {!roi.isRecommended && roi.returnRate <= 20 && (
                  <p className="text-warning-700 font-medium mt-2">
                    ⚠ Configuración funcional pero podría optimizarse.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Limits */}
        <div className="border border-neutral-200 rounded-lg p-6 space-y-6">
          <h3 className="font-semibold text-neutral-900">Límites de Seguridad</h3>

          {/* Daily Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="dailyLimit" required>
                Puntos máximos por día
              </Label>
              <span className="text-lg font-bold text-primary-600">
                {dailyLimit}
              </span>
            </div>
            <Slider
              id="dailyLimit"
              min={100}
              max={5000}
              step={100}
              value={[dailyLimit]}
              onValueChange={([value]) => setValue('dailyLimit', value, { shouldValidate: true })}
              className="my-4"
            />
            <p className="text-sm text-neutral-600">
              Límite máximo de puntos que un cliente puede ganar por día
            </p>
            {errors.dailyLimit && (
              <p className="text-sm text-error-600" role="alert">
                {errors.dailyLimit.message}
              </p>
            )}
          </div>

          {/* Minimum Purchase */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="minPurchase" required>
                Compra mínima (USD)
              </Label>
              <span className="text-lg font-bold text-primary-600">
                ${minPurchase}
              </span>
            </div>
            <Slider
              id="minPurchase"
              min={0.5}
              max={100}
              step={0.5}
              value={[minPurchase]}
              onValueChange={([value]) => setValue('minPurchase', value, { shouldValidate: true })}
              className="my-4"
            />
            <p className="text-sm text-neutral-600">
              Monto mínimo de compra para ganar puntos
            </p>
            {minPurchase > 5 && (
              <p className="text-sm text-warning-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Un mínimo alto podría desincentivar la participación
              </p>
            )}
            {errors.minPurchase && (
              <p className="text-sm text-error-600" role="alert">
                {errors.minPurchase.message}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            Atrás
          </Button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-auto bg-primary-600 text-white py-3 px-6 rounded-lg font-medium
                     hover:bg-primary-700 active:bg-primary-800
                     disabled:bg-neutral-400 disabled:cursor-not-allowed
                     transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
          >
            {isSubmitting ? 'Guardando...' : 'Continuar'}
          </button>
        </div>
      </form>
    </div>
  );
}
