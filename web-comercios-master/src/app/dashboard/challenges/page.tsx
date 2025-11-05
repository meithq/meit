'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ChallengeCard } from '@/components/challenges/challenge-card';
import { DeleteChallengeModal } from '@/components/challenges/delete-challenge-modal';
import { ChallengesSkeleton } from '@/components/challenges/challenges-skeleton';
import { useChallenges } from '@/hooks/use-challenges';
import type { Challenge } from '@/types/database';

export default function ChallengesPage() {
  const router = useRouter();
  const {
    challenges,
    loading,
    error,
    fetchChallenges,
    toggleChallengeStatus,
    updateChallenge,
  } = useChallenges();

  const [showPaused, setShowPaused] = React.useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [challengeToDelete, setChallengeToDelete] =
    React.useState<Challenge | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Fetch challenges on mount
  React.useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Separate active and paused challenges
  const activeChallenges = React.useMemo(
    () => challenges.filter((c) => c.is_active),
    [challenges]
  );

  const pausedChallenges = React.useMemo(
    () => challenges.filter((c) => !c.is_active),
    [challenges]
  );

  // Handlers
  const handleCreateNew = () => {
    router.push('/dashboard/challenges/new');
  };

  const handleEdit = (challenge: Challenge) => {
    router.push(`/dashboard/challenges/${challenge.id}/edit`);
  };

  const handleToggleStatus = async (challenge: Challenge) => {
    await toggleChallengeStatus(challenge.id);
  };

  const handleDelete = (challenge: Challenge) => {
    setChallengeToDelete(challenge);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (challenge: Challenge) => {
    setDeleteLoading(true);
    try {
      // Delete challenge
      await updateChallenge(challenge.id, { is_active: false });
      // Close modal
      setDeleteModalOpen(false);
      setChallengeToDelete(null);
      // Refresh list
      await fetchChallenges();
    } catch (err) {
      console.error('Error deleting challenge:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewAnalytics = (challenge: Challenge) => {
    // TODO: Navigate to analytics page when implemented
    console.log('View analytics for:', challenge.name);
  };

  const handleCloseDeleteModal = () => {
    if (!deleteLoading) {
      setDeleteModalOpen(false);
      setChallengeToDelete(null);
    }
  };

  // Show loading skeleton
  if (loading && challenges.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Retos y Desafíos"
          subtitle="Gestiona los retos de fidelización para tus clientes"
          actions={
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Crear Reto
            </Button>
          }
        />
        <ChallengesSkeleton count={3} />
      </div>
    );
  }

  // Show error state
  if (error && challenges.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Retos y Desafíos"
          subtitle="Gestiona los retos de fidelización para tus clientes"
          actions={
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Crear Reto
            </Button>
          }
        />
        <EmptyState
          title="Error al cargar retos"
          description={error || 'Error desconocido'}
          icon="error"
          action={{
            label: 'Reintentar',
            onClick: () => fetchChallenges(),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Retos y Desafíos"
        subtitle="Gestiona los retos de fidelización para tus clientes"
        actions={
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Crear Reto
          </Button>
        }
      />

      {/* Active Challenges Section */}
      <section aria-labelledby="active-challenges-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="active-challenges-heading"
            className="text-xl font-semibold text-neutral-900"
          >
            RETOS ACTIVOS ({activeChallenges.length})
          </h2>
        </div>

        {activeChallenges.length === 0 ? (
          <EmptyState
            title="No tienes retos activos"
            description="Los retos incentivan a tus clientes a comprar más frecuentemente. Crea tu primer reto para empezar a aumentar las visitas."
            icon="challenge"
            action={{
              label: 'Crear primer reto',
              onClick: handleCreateNew,
            }}
            secondaryAction={{
              label: 'Ver plantillas',
              onClick: handleCreateNew,
            }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                completedCount={0} // TODO: Add real completion stats
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onViewAnalytics={handleViewAnalytics}
              />
            ))}
          </div>
        )}
      </section>

      {/* Paused Challenges Section */}
      {pausedChallenges.length > 0 && (
        <section aria-labelledby="paused-challenges-heading">
          <button
            onClick={() => setShowPaused(!showPaused)}
            className="mb-4 flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-neutral-50"
            aria-expanded={showPaused}
            aria-controls="paused-challenges-content"
          >
            <h2
              id="paused-challenges-heading"
              className="text-xl font-semibold text-neutral-900"
            >
              RETOS PAUSADOS ({pausedChallenges.length})
            </h2>
            {showPaused ? (
              <ChevronUp className="h-5 w-5 text-neutral-600" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-5 w-5 text-neutral-600" aria-hidden="true" />
            )}
          </button>

          {showPaused && (
            <div
              id="paused-challenges-content"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {pausedChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  completedCount={0} // TODO: Add real completion stats
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  onViewAnalytics={handleViewAnalytics}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteChallengeModal
        challenge={challengeToDelete}
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
