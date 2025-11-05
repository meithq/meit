'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createUserSchema,
  type CreateUserFormData,
} from '@meit/shared/validators/settings';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData) => Promise<void>;
}

export function CreateUserModal({
  open,
  onClose,
  onSubmit,
}: CreateUserModalProps) {
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'operator',
    },
  });

  const handleFormSubmit = async (data: CreateUserFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch {
      // Error is handled in parent
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="create-user-title"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 id="create-user-title" className="text-xl font-semibold text-neutral-900">
            <UserPlus className="mr-2 inline h-5 w-5" />
            Crear usuario
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre completo <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register('name')}
              id="name"
              placeholder="Ej: Juan Pérez"
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-600" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register('email')}
              id="email"
              type="email"
              placeholder="juan@ejemplo.com"
              error={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Contraseña <span className="text-red-600">*</span>
            </Label>
            <Input
              {...register('password')}
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              error={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Rol <span className="text-red-600">*</span>
            </Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="operator">Operador</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-sm text-red-600" role="alert">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Role Description */}
          <div className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
            <p className="font-medium">Permisos por rol:</p>
            <ul className="mt-1 space-y-1">
              <li>• <strong>Administrador:</strong> Acceso completo, puede gestionar usuarios</li>
              <li>• <strong>Operador:</strong> Solo acceso a POS y visualización de clientes</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              fullWidth
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading} disabled={loading} fullWidth>
              Crear usuario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
