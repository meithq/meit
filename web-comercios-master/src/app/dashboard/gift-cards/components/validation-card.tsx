'use client'

import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGiftCardValidation } from '@/hooks/use-gift-card-validation'
import { useGiftCards } from '@/hooks/use-gift-cards'
import { toast } from 'sonner'

interface ValidationCardProps {
  onRedeemSuccess?: () => void
}

export function ValidationCard({ onRedeemSuccess }: ValidationCardProps) {
  const [code, setCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    validatedGiftCard,
    validating,
    error: validationError,
    validateCode,
    clearValidation,
    getDaysUntilExpiry,
    isExpiringSoon,
  } = useGiftCardValidation()

  const { redeemGiftCard } = useGiftCards('active')

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleValidate = async () => {
    if (!code.trim()) {
      toast.error('Por favor ingrese un código')
      return
    }

    const result = await validateCode(code)

    if (result.valid) {
      toast.success('Gift card válida')
      // Play success sound if available
      if (typeof window !== 'undefined' && 'Audio' in window) {
        try {
          const audio = new Audio('/sounds/success.mp3')
          audio.play().catch(() => {
            // Silent fail if audio not available
          })
        } catch {
          // Silent fail
        }
      }
      setShowConfirm(true)
    } else {
      toast.error(result.error || 'Código de gift card no válido')
    }
  }

  const handleRedeem = async () => {
    if (!validatedGiftCard) return

    setRedeeming(true)
    const success = await redeemGiftCard(validatedGiftCard.id)

    if (success) {
      toast.success('Gift card redimida exitosamente')
      // Play success sound
      if (typeof window !== 'undefined' && 'Audio' in window) {
        try {
          const audio = new Audio('/sounds/success.mp3')
          audio.play().catch(() => {
            // Silent fail
          })
        } catch {
          // Silent fail
        }
      }

      // Clear form
      setCode('')
      clearValidation()
      setShowConfirm(false)

      // Callback
      onRedeemSuccess?.()

      // Focus input for next scan
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      toast.error('Error al redimir gift card')
    }

    setRedeeming(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
    clearValidation()
    setCode('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !validating && code.trim()) {
      handleValidate()
    }
  }

  const daysUntilExpiry = validatedGiftCard?.expires_at
    ? getDaysUntilExpiry(validatedGiftCard.expires_at)
    : null

  return (
    <Card className="border-2 border-primary-600 bg-gradient-to-br from-primary-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-700">
          <CheckCircle className="h-6 w-6" />
          Validar Gift Card
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Escanea o ingresa el código"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            maxLength={8}
            disabled={validating || showConfirm}
            className="font-mono text-lg"
            aria-label="Código de gift card"
          />
          <Button
            onClick={handleValidate}
            loading={validating}
            disabled={!code.trim() || validating || showConfirm}
            variant="primary"
          >
            Validar
          </Button>
        </div>

        {validationError && !validatedGiftCard && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium">{validationError}</p>
          </div>
        )}

        {validatedGiftCard && showConfirm && (
          <div className="animate-in slide-in-from-top-2 space-y-4 rounded-lg border-2 border-green-500 bg-green-50 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Cliente</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {validatedGiftCard.customer?.name || 'Sin asignar'}
                  </p>
                  {validatedGiftCard.customer?.phone && (
                    <p className="text-sm text-neutral-600">
                      {validatedGiftCard.customer.phone}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-neutral-600">Valor</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${validatedGiftCard.value.toFixed(2)} USD
                  </p>
                </div>

                {validatedGiftCard.expires_at && (
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Vence</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-neutral-900">
                        {format(new Date(validatedGiftCard.expires_at), 'PPP', { locale: es })}
                      </p>
                      {isExpiringSoon(validatedGiftCard.expires_at) && daysUntilExpiry !== null && (
                        <Badge variant="warning">
                          {daysUntilExpiry} {daysUntilExpiry === 1 ? 'día' : 'días'}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-neutral-600">Código</p>
                  <p className="font-mono text-sm text-neutral-900">
                    {validatedGiftCard.code}
                  </p>
                </div>
              </div>

              <Badge variant="success" className="flex-shrink-0">
                Válida
              </Badge>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleRedeem}
                loading={redeeming}
                disabled={redeeming}
              >
                Redimir Gift Card
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleCancel}
                disabled={redeeming}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-neutral-50 p-4">
          <p className="text-xs text-neutral-600">
            Escanea el código QR de la gift card o ingresa el código manualmente.
            Presiona Enter para validar.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
