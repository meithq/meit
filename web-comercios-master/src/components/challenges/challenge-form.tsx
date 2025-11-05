'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TypeSelector } from '@/components/challenges/type-selector';
import { ConfigFields } from '@/components/challenges/config-fields';
import { WhatsAppPreview } from '@/components/challenges/whatsapp-preview';
import type { CreateChallengeDto } from '@/types/database';

/**
 * Challenge form validation schema
 *
 * Uses discriminated union for type-specific validation
 */
const baseSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  points: z
    .number({ message: 'Los puntos deben ser un número' })
    .int('Los puntos deben ser un número entero')
    .min(1, 'Los puntos deben ser al menos 1')
    .max(100, 'Los puntos no pueden exceder 100'),
});

const challengeSchema = z.discriminatedUnion('type', [
  z.object({
    ...baseSchema.shape,
    type: z.literal('amount_min'),
    config: z.object({
      min_amount: z
        .number({ message: 'El monto debe ser un número' })
        .positive('El monto debe ser mayor a 0'),
    }),
  }),
  z.object({
    ...baseSchema.shape,
    type: z.literal('time_based'),
    config: z.object({
      start_time: z.string().min(1, 'Selecciona la hora de inicio'),
      end_time: z.string().min(1, 'Selecciona la hora de fin'),
    }),
  }),
  z.object({
    ...baseSchema.shape,
    type: z.literal('frequency'),
    config: z.object({
      visits_required: z
        .number({ message: 'Las visitas deben ser un número' })
        .int('Las visitas deben ser un número entero')
        .min(1, 'Las visitas deben ser al menos 1'),
      period: z.enum(['daily', 'weekly', 'monthly'], 'Selecciona un período válido'),
    }),
  }),
  z.object({
    ...baseSchema.shape,
    type: z.literal('category'),
    config: z.object({
      categories: z
        .array(z.string())
        .min(1, 'Selecciona al menos una categoría'),
    }),
  }),
]);

type ChallengeFormData = z.infer<typeof challengeSchema>;

interface ChallengeFormProps {
  onSubmit: (data: CreateChallengeDto, isActive: boolean) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<ChallengeFormData>;
}

/**
 * Challenge Creation Form
 *
 * Features:
 * - Type selection (amount_min, time_based, frequency, category)
 * - Conditional configuration fields
 * - Live WhatsApp preview
 * - Save as active or draft
 * - Full validation with Zod
 */
export function ChallengeForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
}: ChallengeFormProps) {
  const [isDirty, setIsDirty] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      type: 'amount_min',
      points: 20,
      config: {
        min_amount: 10,
      },
    },
  });

  // Watch all form values for preview
  const formValues = watch();

  // Track form changes for dirty state
  React.useEffect(() => {
    const subscription = watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleFormSubmit = (isActive: boolean) => {
    return handleSubmit((data) => {
      // Convert form data to CreateChallengeDto format
      const challengeDto: CreateChallengeDto = {
        name: data.name,
        description: data.description,
        type: data.type,
        points: data.points,
        target_value: getTargetValue(data),
        is_active: isActive,
      };

      onSubmit(challengeDto, isActive);
    });
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        '¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.'
      );
      if (!confirmed) return;
    }
    onCancel();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form Section */}
      <div className="space-y-6">
        <form className="space-y-6">
          {/* Challenge Type Selection */}
          <TypeSelector
            value={formValues.type}
            onChange={(type) => {
              setValue('type', type);
              // Reset config when type changes
              switch (type) {
                case 'amount_min':
                  setValue('config', { min_amount: 10 });
                  break;
                case 'time_based':
                  setValue('config', { start_time: '06:00', end_time: '11:00' });
                  break;
                case 'frequency':
                  setValue('config', { visits_required: 1, period: 'daily' });
                  break;
                case 'category':
                  setValue('config', { categories: [] });
                  break;
              }
            }}
            error={errors.type?.message}
          />

          {/* Challenge Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Detalles del Reto
            </h3>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" required>
                Nombre
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Ej: Compra en la mañana"
                error={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                {...register('name')}
              />
              {errors.name && (
                <p
                  id="name-error"
                  className="text-xs text-semantic-error"
                  role="alert"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" required>
                Descripción
              </Label>
              <Textarea
                id="description"
                placeholder="Describe el reto para tus clientes..."
                error={!!errors.description}
                showCount
                maxLength={500}
                rows={3}
                aria-describedby={
                  errors.description ? 'description-error' : undefined
                }
                {...register('description')}
              />
              {errors.description && (
                <p
                  id="description-error"
                  className="text-xs text-semantic-error"
                  role="alert"
                >
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Points */}
            <div className="space-y-2">
              <Label htmlFor="points" required>
                Puntos a otorgar
              </Label>
              <Input
                id="points"
                type="number"
                min={1}
                max={100}
                error={!!errors.points}
                aria-describedby={errors.points ? 'points-error' : undefined}
                {...register('points', { valueAsNumber: true })}
              />
              {errors.points && (
                <p
                  id="points-error"
                  className="text-xs text-semantic-error"
                  role="alert"
                >
                  {errors.points.message}
                </p>
              )}
              <p className="text-xs text-neutral-500">
                Los clientes recibirán estos puntos al completar el reto
              </p>
            </div>
          </div>

          {/* Type-Specific Configuration */}
          <ConfigFields
            type={formValues.type}
            config={formValues.config}
            errors={errors.config as Record<string, { message?: string }> | undefined}
            register={register}
            setValue={setValue}
          />

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={handleFormSubmit(true)}
              loading={loading}
              disabled={loading}
            >
              Guardar y activar
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleFormSubmit(false)}
              loading={loading}
              disabled={loading}
            >
              Guardar como borrador
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <WhatsAppPreview
          name={formValues.name}
          description={formValues.description}
          points={formValues.points}
          type={formValues.type}
          config={formValues.config}
        />
      </div>
    </div>
  );
}

/**
 * Helper function to extract target_value from form data
 */
function getTargetValue(data: ChallengeFormData): number | undefined {
  switch (data.type) {
    case 'amount_min':
      return data.config.min_amount;
    case 'frequency':
      return data.config.visits_required;
    default:
      return undefined;
  }
}
