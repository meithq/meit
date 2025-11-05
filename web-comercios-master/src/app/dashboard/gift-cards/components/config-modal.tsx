'use client'

import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import { giftCardConfigSchema } from '@/lib/validations'

interface ConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface GiftCardConfig {
  points_required: number
  value: number
  expiration_days: number
  max_active_per_customer: number
}

const DEFAULT_CONFIG: GiftCardConfig = {
  points_required: 100,
  value: 5,
  expiration_days: 30,
  max_active_per_customer: 5,
}

export function ConfigModal({ open, onOpenChange }: ConfigModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<GiftCardConfig>(DEFAULT_CONFIG)
  const merchantId = useAuthStore((state) => state.merchantId)

  // Load current configuration
  useEffect(() => {
    if (open && merchantId) {
      loadConfig()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, merchantId])

  const loadConfig = async () => {
    if (!merchantId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('gift_card_config')
        .eq('id', merchantId)
        .single()

      if (error) throw error

      if (data?.gift_card_config) {
        setConfig(data.gift_card_config as GiftCardConfig)
      } else {
        setConfig(DEFAULT_CONFIG)
      }
    } catch (err) {
      console.error('Error loading config:', err)
      toast.error('Error al cargar la configuración')
      setConfig(DEFAULT_CONFIG)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!merchantId) {
      toast.error('No se encontró el comercio')
      return
    }

    // Validate configuration
    try {
      giftCardConfigSchema.parse(config)
    } catch {
      toast.error('Por favor verifica los valores ingresados')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('merchants')
        .update({ gift_card_config: config })
        .eq('id', merchantId)

      if (error) throw error

      toast.success('Configuración guardada exitosamente')
      onOpenChange(false)
    } catch (err) {
      console.error('Error saving config:', err)
      toast.error('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
    toast.info('Valores restaurados a predeterminados')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary-600" />
            <DialogTitle>Configuración de Gift Cards</DialogTitle>
          </div>
          <DialogDescription>
            Personaliza los parámetros de generación y vencimiento de gift cards
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Points Required */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="points-required">
                  Puntos requeridos para generar gift card
                </Label>
                <span className="text-lg font-semibold text-primary-600">
                  {config.points_required}
                </span>
              </div>
              <Slider
                id="points-required"
                min={50}
                max={500}
                step={10}
                value={[config.points_required]}
                onValueChange={([value]) =>
                  setConfig({ ...config, points_required: value })
                }
                aria-label="Puntos requeridos"
              />
              <p className="text-xs text-neutral-500">
                Rango: 50 - 500 puntos
              </p>
            </div>

            {/* Gift Card Value */}
            <div className="space-y-2">
              <Label htmlFor="value">Valor de gift card (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                  $
                </span>
                <Input
                  id="value"
                  type="number"
                  min={2}
                  max={25}
                  step={0.5}
                  value={config.value}
                  onChange={(e) =>
                    setConfig({ ...config, value: parseFloat(e.target.value) || 0 })
                  }
                  className="pl-7"
                  aria-label="Valor de gift card"
                />
              </div>
              <p className="text-xs text-neutral-500">
                Rango: $2 - $25 USD
              </p>
            </div>

            {/* Expiration Days */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="expiration-days">
                  Días de vencimiento
                </Label>
                <span className="text-lg font-semibold text-primary-600">
                  {config.expiration_days}
                </span>
              </div>
              <Slider
                id="expiration-days"
                min={7}
                max={90}
                step={1}
                value={[config.expiration_days]}
                onValueChange={([value]) =>
                  setConfig({ ...config, expiration_days: value })
                }
                aria-label="Días de vencimiento"
              />
              <p className="text-xs text-neutral-500">
                Rango: 7 - 90 días
              </p>
            </div>

            {/* Max Active per Customer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="max-active">
                  Máximo de gift cards activas por cliente
                </Label>
                <span className="text-lg font-semibold text-primary-600">
                  {config.max_active_per_customer}
                </span>
              </div>
              <Slider
                id="max-active"
                min={1}
                max={10}
                step={1}
                value={[config.max_active_per_customer]}
                onValueChange={([value]) =>
                  setConfig({ ...config, max_active_per_customer: value })
                }
                aria-label="Máximo de gift cards activas"
              />
              <p className="text-xs text-neutral-500">
                Rango: 1 - 10 gift cards
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                <strong>Nota:</strong> Los cambios se aplicarán a las nuevas gift
                cards generadas. Las gift cards existentes mantendrán su configuración
                original.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={loading || saving}
          >
            Restaurar predeterminados
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={loading || saving}
          >
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
