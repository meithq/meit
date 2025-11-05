'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { ChallengeForm } from '@/components/challenges/challenge-form';
import { useChallenges } from '@/hooks/use-challenges';
import type { CreateChallengeDto } from '@/types/database';

/**
 * Challenge Creation Page
 *
 * Allows merchants to create new challenges with:
 * - Type selection (amount, time range, visit frequency, category)
 * - Conditional configuration fields
 * - Live WhatsApp preview
 * - Save as active or draft
 */
export default function NewChallengePage() {
  const router = useRouter();
  const { createChallenge, loading } = useChallenges();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (
    data: CreateChallengeDto,
    isActive: boolean
  ) => {
    setIsSubmitting(true);

    try {
      const challengeData = {
        ...data,
        is_active: isActive,
      };

      const result = await createChallenge(challengeData);

      if (result) {
        toast.success(
          isActive
            ? 'Reto creado y activado exitosamente'
            : 'Reto guardado como borrador'
        );
        router.push('/dashboard/challenges');
      } else {
        toast.error('Error al crear el reto. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Error al crear el reto. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/challenges');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crear Nuevo Reto"
        subtitle="Define un reto de fidelización para incentivar a tus clientes"
        onBack={handleCancel}
      />

      <ChallengeForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading || isSubmitting}
      />
    </div>
  );
}
