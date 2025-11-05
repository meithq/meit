'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '@meit/shared/validators/auth';
import { signup } from '@meit/supabase/mutations/auth';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      merchant_name: '',
      role: 'admin',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      const { error } = await signup(data);

      if (error) {
        toast.error(error.message || 'Error al crear la cuenta');
        setIsLoading(false);
        return;
      }

      toast.success('Cuenta creada exitosamente. Redirigiendo...');

      // Navigate to dashboard - auth state will be handled by AuthContext
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al crear la cuenta';
      toast.error(errorMessage);
      console.error('Signup error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-teal/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <span className="text-3xl font-bold text-white">M!</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Crea tu cuenta
          </h1>
          <p className="text-neutral-600">
            Comienza a fidelizar a tus clientes en minutos
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nombre del Comercio */}
            <div>
              <label
                htmlFor="merchant_name"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Nombre del comercio <span className="text-error-500">*</span>
              </label>
              <input
                {...registerField('merchant_name')}
                id="merchant_name"
                type="text"
                autoComplete="organization"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 rounded-lg border transition-colors
                  ${
                    errors.merchant_name
                      ? 'border-error-500 focus:ring-error-500'
                      : 'border-neutral-300 focus:ring-primary-600'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  disabled:bg-neutral-100 disabled:cursor-not-allowed
                `}
                placeholder="Panadería San José"
              />
              {errors.merchant_name && (
                <p className="mt-1 text-sm text-error-600" role="alert">
                  {errors.merchant_name.message}
                </p>
              )}
            </div>

            {/* Nombre del Administrador */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Tu nombre completo <span className="text-error-500">*</span>
              </label>
              <input
                {...registerField('name')}
                id="name"
                type="text"
                autoComplete="name"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 rounded-lg border transition-colors
                  ${
                    errors.name
                      ? 'border-error-500 focus:ring-error-500'
                      : 'border-neutral-300 focus:ring-primary-600'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  disabled:bg-neutral-100 disabled:cursor-not-allowed
                `}
                placeholder="Juan Pérez"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-600" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Correo electrónico <span className="text-error-500">*</span>
              </label>
              <input
                {...registerField('email')}
                id="email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 rounded-lg border transition-colors
                  ${
                    errors.email
                      ? 'border-error-500 focus:ring-error-500'
                      : 'border-neutral-300 focus:ring-primary-600'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  disabled:bg-neutral-100 disabled:cursor-not-allowed
                `}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Contraseña <span className="text-error-500">*</span>
              </label>
              <input
                {...registerField('password')}
                id="password"
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 rounded-lg border transition-colors
                  ${
                    errors.password
                      ? 'border-error-500 focus:ring-error-500'
                      : 'border-neutral-300 focus:ring-primary-600'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  disabled:bg-neutral-100 disabled:cursor-not-allowed
                `}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error-600" role="alert">
                  {errors.password.message}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                Debe tener al menos 6 caracteres
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-accent-teal/10 border border-accent-teal/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-accent-teal flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-neutral-700">
                  <p className="font-medium mb-1">¿Qué incluye tu cuenta?</p>
                  <ul className="space-y-1 text-neutral-600">
                    <li>• Tu comercio se creará automáticamente</li>
                    <li>• Serás el administrador principal</li>
                    <li>• Podrás agregar más usuarios después</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full px-6 py-3 rounded-lg font-medium text-white
                transition-all duration-200
                ${
                  isLoading
                    ? 'bg-neutral-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 active:transform active:scale-95'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2
                flex items-center justify-center
              `}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500">
            Al crear una cuenta, aceptas nuestros términos de servicio y
            política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
}
