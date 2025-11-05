'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPhone } from '@/lib/formatters'
import type { Customer } from '@/types/database'

interface EditCustomerModalProps {
  open: boolean
  onClose: () => void
  customer: Customer
  onSave: (data: { name: string; email?: string }) => Promise<boolean>
}

/**
 * Edit Customer Modal Component
 *
 * Modal dialog for editing customer information (name and email)
 * Phone number is read-only as it's the unique identifier
 */
export function EditCustomerModal({
  open,
  onClose,
  customer,
  onSave,
}: EditCustomerModalProps) {
  const [name, setName] = useState(customer.name)
  const [email, setEmail] = useState(customer.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when customer changes
  useEffect(() => {
    setName(customer.name)
    setEmail(customer.email || '')
    setError(null)
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }

    if (email && !isValidEmail(email)) {
      setError('El email no es válido')
      return
    }

    setLoading(true)

    try {
      const success = await onSave({
        name: name.trim(),
        email: email.trim() || undefined,
      })

      if (success) {
        onClose()
      } else {
        setError('Error al actualizar el cliente')
      }
    } catch (err) {
      console.error('Error updating customer:', err)
      setError('Error al actualizar el cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (loading) return
    setName(customer.name)
    setEmail(customer.email || '')
    setError(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      title="Editar cliente"
      description="Actualiza la información del cliente"
      size="md"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Phone (read-only) */}
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="text"
              value={formatPhone(customer.phone)}
              disabled
              className="bg-neutral-50"
            />
            <p className="text-xs text-neutral-500 mt-1">
              El teléfono no se puede modificar
            </p>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name" required>
              Nombre
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo del cliente"
              disabled={loading}
              required
              minLength={2}
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              disabled={loading}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Opcional
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
        </div>

        <ModalFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Guardar cambios
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

// Helper function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
