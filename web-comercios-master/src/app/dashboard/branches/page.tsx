'use client'

import { useState, useEffect } from 'react'
import { Plus, QrCode, MapPin, MoreVertical, Edit, Trash2, Power } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { QRGenerator } from '@/components/qr/qr-generator'
import { useBranches } from '@/hooks/use-branches'
import { useAuthStore } from '@/store/auth-store'
import type { Branch } from '@/types/database'

/**
 * Branches Management Page
 *
 * Features:
 * - List all branches
 * - Create new branch
 * - View and download QR codes
 * - Toggle branch active status
 * - Edit and delete branches (admin only)
 */
export default function BranchesPage() {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  })

  const {
    branches,
    loading,
    error,
    fetchBranches,
    createBranch,
    toggleBranchStatus,
    deleteBranch,
  } = useBranches()

  const merchantName = useAuthStore((state) => state.merchant?.name) || 'Mi Negocio'
  const userRole = useAuthStore((state) => state.user?.role)
  const isAdmin = userRole === 'admin'

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      return
    }

    const newBranch = await createBranch({
      name: formData.name,
      address: formData.address || undefined,
    })

    if (newBranch) {
      setFormData({ name: '', address: '' })
      setShowCreateForm(false)
    }
  }

  const handleToggleStatus = async (branch: Branch) => {
    await toggleBranchStatus(branch.id, !branch.is_active)
    await fetchBranches()
  }

  const handleDelete = async (branchId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta sucursal? Esta acción no se puede deshacer.')) {
      return
    }

    const success = await deleteBranch(branchId)
    if (success) {
      await fetchBranches()
    }
  }

  const handleShowQR = (branch: Branch) => {
    setSelectedBranch(branch)
    setShowQRModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Sucursales"
        subtitle="Gestiona tus sucursales y códigos QR para check-in"
        actions={
          isAdmin ? (
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nueva Sucursal
            </Button>
          ) : undefined
        }
      />

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-700">
          <p className="font-medium">Error al cargar sucursales</p>
          <p>{error}</p>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && isAdmin && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Nueva Sucursal</h3>

          <form onSubmit={handleCreateBranch} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre de la sucursal *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
                placeholder="Ej: Sucursal Centro"
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-1">
                Dirección (opcional)
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
                placeholder="Ej: Av. Principal, Local 123"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Sucursal'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setFormData({ name: '', address: '' })
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && branches.length === 0 && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {/* Empty State */}
      {!loading && branches.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-neutral-300 p-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No hay sucursales registradas
          </h3>
          <p className="text-sm text-neutral-600 mb-4">
            Crea tu primera sucursal para generar códigos QR y comenzar a recibir clientes.
          </p>
          {isAdmin && (
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Primera Sucursal
            </Button>
          )}
        </div>
      )}

      {/* Branches List */}
      {branches.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={`rounded-lg border ${
                branch.is_active
                  ? 'border-neutral-200 bg-white'
                  : 'border-neutral-200 bg-neutral-50'
              } p-6 space-y-4`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900">{branch.name}</h3>
                  {branch.address && (
                    <p className="text-sm text-neutral-600 mt-1 flex items-start gap-1">
                      <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      {branch.address}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    branch.is_active
                      ? 'bg-success-100 text-success-700'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {branch.is_active ? 'Activa' : 'Inactiva'}
                </div>
              </div>

              {/* QR Code */}
              <div className="text-xs text-neutral-600 font-mono bg-neutral-100 px-3 py-2 rounded">
                {branch.qr_code}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleShowQR(branch)}
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Ver QR
                </Button>

                {isAdmin && (
                  <>
                    <Button
                      onClick={() => handleToggleStatus(branch)}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      title={branch.is_active ? 'Desactivar' : 'Activar'}
                    >
                      <Power className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={() => handleDelete(branch.id)}
                      size="sm"
                      variant="outline"
                      className="gap-2 text-error-600 hover:bg-error-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && selectedBranch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="relative max-w-lg w-full mx-4 bg-white rounded-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
              aria-label="Cerrar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Content */}
            <h2 className="text-xl font-semibold mb-2">Código QR</h2>
            <p className="text-sm text-neutral-600 mb-6">{selectedBranch.name}</p>

            <QRGenerator branch={selectedBranch} merchantName={merchantName} />
          </div>
        </div>
      )}
    </div>
  )
}
