'use client';

import { Check, X, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PosActionsProps {
  onAssign: () => void;
  onCancel: () => void;
  onClear: () => void;
  canAssign: boolean;
  isSubmitting: boolean;
}

/**
 * Action buttons for POS interface
 * Handles assign points, cancel, and clear operations
 */
export function PosActions({
  onAssign,
  onCancel,
  onClear,
  canAssign,
  isSubmitting,
}: PosActionsProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter to assign points
    if (e.ctrlKey && e.key === 'Enter' && canAssign && !isSubmitting) {
      e.preventDefault();
      onAssign();
    }
    // Esc to cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className="flex flex-col sm:flex-row gap-3"
      onKeyDown={handleKeyDown}
      role="group"
      aria-label="Acciones de punto de venta"
    >
      {/* Assign Points Button - Primary Action */}
      <Button
        onClick={onAssign}
        disabled={!canAssign || isSubmitting}
        loading={isSubmitting}
        variant="primary"
        size="lg"
        fullWidth
        className="min-h-[56px] text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Asignar puntos al cliente (Ctrl+Enter)"
      >
        {isSubmitting ? (
          'Procesando...'
        ) : (
          <>
            <Check className="h-5 w-5" aria-hidden="true" />
            Asignar Puntos
          </>
        )}
      </Button>

      {/* Secondary Actions */}
      <div className="flex gap-3 sm:w-auto">
        {/* Clear Button */}
        <Button
          onClick={onClear}
          disabled={isSubmitting}
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-none min-h-[56px]"
          aria-label="Limpiar cliente actual"
          title="Mantiene el monto y limpia el cliente"
        >
          <Eraser className="h-5 w-5" aria-hidden="true" />
          <span className="sm:inline hidden">Limpiar</span>
        </Button>

        {/* Cancel Button */}
        <Button
          onClick={onCancel}
          disabled={isSubmitting}
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-none min-h-[56px]"
          aria-label="Cancelar operación (Esc)"
        >
          <X className="h-5 w-5" aria-hidden="true" />
          <span className="sm:inline hidden">Cancelar</span>
        </Button>
      </div>
    </div>
  );
}
