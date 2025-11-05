'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { Challenge } from '@/types/database';

export interface DeleteChallengeModalProps {
  challenge: Challenge | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (challenge: Challenge) => Promise<void>;
  loading?: boolean;
}

export const DeleteChallengeModal = React.forwardRef<
  HTMLDivElement,
  DeleteChallengeModalProps
>(({ challenge, open, onClose, onConfirm, loading = false }, ref) => {
  const handleConfirm = async () => {
    if (!challenge) return;
    await onConfirm(challenge);
  };

  if (!challenge) return null;

  return (
    <Modal
      ref={ref}
      open={open}
      onClose={onClose}
      size="sm"
      title="Eliminar Reto"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-error-100 p-3">
            <AlertTriangle
              className="h-6 w-6 text-error-600"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center">
          <p className="text-sm text-neutral-700">
            ¿Estás seguro de que deseas eliminar el reto{' '}
            <span className="font-semibold text-neutral-900">
              &ldquo;{challenge.name}&rdquo;
            </span>
            ?
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Challenge Details */}
        <div className="rounded-lg bg-neutral-50 p-3">
          <div className="text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Puntos:</span>
              <span className="font-semibold text-neutral-900">
                {challenge.points}
              </span>
            </div>
            {challenge.description && (
              <div className="mt-2">
                <p className="text-neutral-600">Descripción:</p>
                <p className="mt-1 text-neutral-900">{challenge.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
          loading={loading}
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          Eliminar Reto
        </Button>
      </ModalFooter>
    </Modal>
  );
});

DeleteChallengeModal.displayName = 'DeleteChallengeModal';
