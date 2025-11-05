'use client';

import { useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

export default function ChallengesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error('Challenges page error:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retos y Desafíos"
        subtitle="Gestiona los retos de fidelización para tus clientes"
        actions={<Button disabled>Crear Reto</Button>}
      />
      <EmptyState
        title="Error al cargar retos"
        description="Ha ocurrido un error al cargar los retos. Por favor, intenta nuevamente."
        icon="error"
        action={{
          label: 'Reintentar',
          onClick: reset,
        }}
      />
    </div>
  );
}
