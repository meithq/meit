'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  businessProfileSchema,
  type BusinessProfileFormData,
} from '@meit/shared/validators/settings';

const BUSINESS_TYPES = [
  { value: 'panaderia', label: 'Panadería' },
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'cafeteria', label: 'Cafetería' },
  { value: 'licoreria', label: 'Licorería' },
  { value: 'otro', label: 'Otro' },
];

export default function BusinessProfilePage() {
  const [loading, setLoading] = React.useState(false);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      merchant_name: '',
      business_type: 'panaderia',
      phone: '',
      address: '',
      business_hours_open: '09:00',
      business_hours_close: '18:00',
      logo_url: '',
    },
  });

  const businessType = watch('business_type');

  // Load merchant data on mount
  React.useEffect(() => {
    // TODO: Fetch merchant data from API
    // For now, using placeholder data
    setValue('merchant_name', 'Mi Comercio');
    setValue('business_type', 'panaderia');
    setValue('phone', '+584121234567');
  }, [setValue]);

  const onSubmit = async (data: BusinessProfileFormData) => {
    setLoading(true);
    try {
      // TODO: Call API to update business profile
      console.log('Saving business profile:', data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error saving business profile:', error);
      toast.error('Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('El logo debe pesar menos de 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('El archivo debe ser una imagen');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setValue('logo_url', reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Merchant Name */}
          <div className="space-y-2">
            <Label htmlFor="merchant_name">
              Nombre del comercio <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register('merchant_name')}
              id="merchant_name"
              placeholder="Ej: Panadería San Antonio"
              error={!!errors.merchant_name}
              aria-invalid={errors.merchant_name ? 'true' : undefined}
              aria-describedby={
                errors.merchant_name ? 'merchant_name-error' : undefined
              }
            />
            {errors.merchant_name && (
              <p id="merchant_name-error" className="text-sm text-red-600" role="alert">
                {errors.merchant_name.message}
              </p>
            )}
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="business_type">
              Tipo de negocio <span className="text-red-600">*</span>
            </Label>
            <Select
              value={businessType}
              onValueChange={(value) =>
                setValue(
                  'business_type',
                  value as BusinessProfileFormData['business_type'],
                  { shouldDirty: true }
                )
              }
            >
              <SelectTrigger id="business_type">
                <SelectValue placeholder="Selecciona el tipo de negocio" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.business_type && (
              <p className="text-sm text-red-600" role="alert">
                {errors.business_type.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Teléfono/WhatsApp <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register('phone')}
              id="phone"
              type="tel"
              placeholder="+584121234567"
              error={!!errors.phone}
              aria-invalid={errors.phone ? 'true' : undefined}
              aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
            />
            {!errors.phone && (
              <p id="phone-hint" className="text-sm text-neutral-500">
                Formato: +58 seguido de 10 dígitos
              </p>
            )}
            {errors.phone && (
              <p id="phone-error" className="text-sm text-red-600" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              {...register('address')}
              id="address"
              placeholder="Ej: Av. Principal, Centro Comercial Plaza, Local 10"
              rows={3}
              className="resize-none"
            />
            {errors.address && (
              <p className="text-sm text-red-600" role="alert">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Business Hours */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_hours_open">Hora de apertura</Label>
              <Input
                {...register('business_hours_open')}
                id="business_hours_open"
                type="time"
                error={!!errors.business_hours_open}
              />
              {errors.business_hours_open && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.business_hours_open.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_hours_close">Hora de cierre</Label>
              <Input
                {...register('business_hours_close')}
                id="business_hours_close"
                type="time"
                error={!!errors.business_hours_close}
              />
              {errors.business_hours_close && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.business_hours_close.message}
                </p>
              )}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo del comercio</Label>
            <div className="flex items-start gap-4">
              {logoPreview && (
                <div className="h-20 w-20 overflow-hidden rounded-lg border-2 border-neutral-200">
                  <img
                    src={logoPreview}
                    alt="Vista previa del logo"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <label
                  htmlFor="logo"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-600 hover:bg-primary-50 hover:text-primary-600"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  {logoPreview ? 'Cambiar logo' : 'Subir logo'}
                </label>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleLogoUpload}
                />
                <p className="mt-2 text-sm text-neutral-500">
                  PNG, JPG o GIF. Máximo 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={loading || !isDirty}
              onClick={() => window.location.reload()}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading} disabled={loading || !isDirty}>
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
