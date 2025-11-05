'use client'

import { useState } from 'react'
import { Modal, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatPoints } from '@/lib/formatters'
import { Plus, Minus } from 'lucide-react'

interface AdjustPointsModalProps {
  open: boolean
  onClose: () => void
  customerName: string
  currentPoints: number
  onSave: (points: number, reason: string) => Promise<boolean>
}

/**
 * Adjust Points Modal Component
 *
 * Modal dialog for manually adjusting customer points (admin only)
 * Allows adding or subtracting points with a mandatory reason
 */
export function AdjustPointsModal({
  open,
  onClose,
  customerName,
  currentPoints,
  onSave,
}: AdjustPointsModalProps) {
  const [mode, setMode] = useState<'add' | 'subtract'>('add')
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReset = () => {
    setMode('add')
    setPoints('')
    setReason('')
    setError(null)
  }

  const handleClose = () => {
    if (loading) return
    handleReset()
    onClose()
  }

  const calculateNewTotal = () => {
    const pointsValue = parseInt(points) || 0
    const adjustment = mode === 'add' ? pointsValue : -pointsValue
    return Math.max(0, currentPoints + adjustment)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    const pointsValue = parseInt(points)

    if (!points || isNaN(pointsValue) || pointsValue <= 0) {
      setError('Ingresa una cantidad válida de puntos')
      return
    }

    if (pointsValue > 10000) {
      setError('La cantidad máxima es 10,000 puntos')
      return
    }

    if (!reason.trim()) {
      setError('La razón es requerida')
      return
    }

    if (reason.trim().length < 10) {
      setError('La razón debe tener al menos 10 caracteres')
      return
    }

    // Check if subtracting would result in negative points
    const finalAdjustment = mode === 'add' ? pointsValue : -pointsValue
    if (currentPoints + finalAdjustment < 0) {
      setError('No puedes restar más puntos de los que tiene el cliente')
      return
    }

    setLoading(true)

    try {
      const success = await onSave(finalAdjustment, reason.trim())

      if (success) {
        handleReset()
        onClose()
      } else {
        setError('Error al ajustar los puntos')
      }
    } catch (err) {
      console.error('Error adjusting points:', err)
      setError('Error al ajustar los puntos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Ajustar puntos"
      description={`Ajusta manualmente los puntos de ${customerName}`}
      size="md"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Current points display */}
          <div className="rounded-lg bg-primary-50 border border-primary-200 p-4">
            <p className="text-sm font-medium text-neutral-600 mb-1">
              Puntos actuales
            </p>
            <p className="text-2xl font-bold text-primary-600">
              {formatPoints(currentPoints)}
            </p>
          </div>

          {/* Mode selector */}
          <div>
            <Label>Acción</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={mode === 'add' ? 'primary' : 'outline'}
                onClick={() => setMode('add')}
                disabled={loading}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
              <Button
                type="button"
                variant={mode === 'subtract' ? 'primary' : 'outline'}
                onClick={() => setMode('subtract')}
                disabled={loading}
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-2" />
                Restar
              </Button>
            </div>
          </div>

          {/* Points input */}
          <div>
            <Label htmlFor="points" required>
              Cantidad de puntos
            </Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="Ej: 100"
              disabled={loading}
              required
              min="1"
              max="10000"
              step="1"
            />
          </div>

          {/* New total preview */}
          {points && !isNaN(parseInt(points)) && (
            <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">
                  Nuevo total:
                </span>
                <span className={`text-lg font-bold ${
                  mode === 'add' ? 'text-accent-green' : 'text-orange-600'
                }`}>
                  {formatPoints(calculateNewTotal())}
                </span>
              </div>
            </div>
          )}

          {/* Reason textarea */}
          <div>
            <Label htmlFor="reason" required>
              Razón del ajuste
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe la razón del ajuste de puntos (mínimo 10 caracteres)"
              disabled={loading}
              required
              minLength={10}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-neutral-500 mt-1">
              {reason.length}/500 caracteres
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="rounded-md bg-red-50 border border-red-200 p-3"
              role="alert"
            >
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Warning for subtract */}
          {mode === 'subtract' && (
            <div
              className="rounded-md bg-orange-50 border border-orange-200 p-3"
              role="alert"
            >
              <p className="text-sm text-orange-800">
                Los puntos restados no se pueden recuperar. Asegúrate de ingresar la cantidad correcta.
              </p>
            </div>
          )}
        </div>

        <ModalFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            variant={mode === 'add' ? 'primary' : 'danger'}
          >
            {mode === 'add' ? 'Agregar puntos' : 'Restar puntos'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
