'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@meit/shared/validators/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Monitor auth state for diagnostic purposes
  useEffect(() => {
    console.log('[LoginPage] useEffect: auth state changed', {
      loading,
      hasUser: !!user,
      isLoading,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    // If finished loading and no user, ensure local spinner is disabled
    if (!loading && !user && isLoading) {
      console.log('[LoginPage] useEffect: loading finished with no user, disabling spinner');
      setIsLoading(false);
    }
    // No navigation here - middleware handles all redirects
  }, [user, loading, isLoading]); // Removed router dependency

  const onSubmit = async (data: LoginFormData) => {
    console.log('[LoginPage] onSubmit: form submitted', {
      email: data.email,
      timestamp: new Date().toISOString()
    });

    setIsLoading(true);
    console.log('[LoginPage] onSubmit: isLoading set to true, calling signIn');

    const success = await signIn(data.email, data.password);

    console.log('[LoginPage] onSubmit: signIn returned', {
      success,
      timestamp: new Date().toISOString()
    });

    if (success) {
      console.log('[LoginPage] onSubmit: login successful, refreshing router to sync with middleware');
      router.refresh(); // This will cause middleware to re-run and detect the session
      // Middleware will automatically redirect to /dashboard
    } else {
      // Login failed - error toast already shown by signIn
      console.log('[LoginPage] onSubmit: login failed, resetting isLoading to false');
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
            Bienvenido a Meit!
          </h1>
          <p className="text-neutral-600">
            Inicia sesión para gestionar tu programa de lealtad
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Correo electrónico
              </label>
              <input
                {...register('email')}
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
                Contraseña
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
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
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error-600" role="alert">
                  {errors.password.message}
                </p>
              )}
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
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Link to Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/register"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500">
            Al iniciar sesión, aceptas nuestros términos de servicio y política
            de privacidad
          </p>
        </div>
      </div>
    </div>
  );
}
