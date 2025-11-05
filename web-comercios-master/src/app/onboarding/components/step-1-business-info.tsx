'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  businessInfoSchema,
  type BusinessInfoData,
  type BusinessType,
} from '@meit/shared/validators/onboarding';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/forms/select';
import { Textarea } from '@/components/ui/textarea';

interface Step1BusinessInfoProps {
  defaultValues?: Partial<BusinessInfoData>;
  onNext: (data: BusinessInfoData) => void;
}

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'panaderia', label: 'Panadería' },
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'cafeteria', label: 'Cafetería' },
  { value: 'licoreria', label: 'Licorería' },
  { value: 'otro', label: 'Otro' },
];

export function Step1BusinessInfo({ defaultValues, onNext }: Step1BusinessInfoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<BusinessInfoData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: defaultValues || {
      name: '',
      type: undefined,
      phone: '',
      address: '',
      hours: {
        open: '08:00',
        close: '18:00',
      },
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: BusinessInfoData) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Información del Negocio
        </h2>
        <p className="text-neutral-600">
          Cuéntanos sobre tu comercio para personalizar tu experiencia
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Merchant Name */}
        <div>
          <Label htmlFor="name" required>
            Nombre del Comercio
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Ej: Panadería San José"
            error={!!errors.name}
            {...register('name')}
            autoComplete="organization"
          />
          {errors.name && (
            <p className="text-sm text-error-600 mt-1" role="alert">
              {errors.name.message}
            </p>
          )}
          <p className="text-xs text-neutral-500 mt-1">
            Este nombre aparecerá en las notificaciones de WhatsApp
          </p>
        </div>

        {/* Business Type */}
        <div>
          <Label htmlFor="type" required>
            Tipo de Negocio
          </Label>
          <Select
            id="type"
            value={selectedType}
            onChange={(e) => setValue('type', e.target.value as BusinessType, { shouldValidate: true })}
            placeholder="Selecciona el tipo de negocio"
            error={errors.type?.message}
            options={BUSINESS_TYPES}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Esto nos ayuda a sugerir retos relevantes para tu negocio
          </p>
        </div>

        {/* Phone/WhatsApp */}
        <div>
          <Label htmlFor="phone" required>
            Teléfono / WhatsApp
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+58 (XXX) XXX-XXXX"
            error={!!errors.phone}
            {...register('phone')}
            autoComplete="tel"
          />
          {errors.phone && (
            <p className="text-sm text-error-600 mt-1" role="alert">
              {errors.phone.message}
            </p>
          )}
          <p className="text-xs text-neutral-500 mt-1">
            Este será tu número de WhatsApp Business para notificaciones
          </p>
        </div>

        {/* Address (Optional) */}
        <div>
          <Label htmlFor="address">
            Dirección <span className="text-neutral-500 font-normal">(opcional)</span>
          </Label>
          <Textarea
            id="address"
            placeholder="Dirección física del negocio"
            error={!!errors.address}
            rows={3}
            {...register('address')}
            autoComplete="street-address"
          />
          {errors.address && (
            <p className="text-sm text-error-600 mt-1" role="alert">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Business Hours (Optional) */}
        <div>
          <Label>
            Horario de Atención <span className="text-neutral-500 font-normal">(opcional)</span>
          </Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label htmlFor="hours.open" className="text-sm">
                Apertura
              </Label>
              <Input
                id="hours.open"
                type="time"
                error={!!errors.hours?.open}
                {...register('hours.open')}
              />
              {errors.hours?.open && (
                <p className="text-sm text-error-600 mt-1" role="alert">
                  {errors.hours.open.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="hours.close" className="text-sm">
                Cierre
              </Label>
              <Input
                id="hours.close"
                type="time"
                error={!!errors.hours?.close}
                {...register('hours.close')}
              />
              {errors.hours?.close && (
                <p className="text-sm text-error-600 mt-1" role="alert">
                  {errors.hours.close.message}
                </p>
              )}
            </div>
          </div>
          {errors.hours?.root && (
            <p className="text-sm text-error-600 mt-1" role="alert">
              {errors.hours.root.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium
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
