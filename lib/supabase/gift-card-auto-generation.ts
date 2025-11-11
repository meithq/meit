import { createClient } from './client'
import { getGiftCardSettings } from './gift-card-settings'
import { getCustomerBusiness } from './customer-businesses'
import { createGiftCard, countActiveGiftCards } from './gift-cards'
import { updateCustomerBusiness } from './customer-businesses'
import { createNotification } from './notifications'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface GiftCardGenerationResult {
  generated: boolean
  giftCard?: any
  message: string
}

/**
 * Verifica si el cliente tiene suficientes puntos y genera automáticamente gift cards
 * Esta función se debe llamar cada vez que se asignan puntos a un cliente
 */
export async function checkAndGenerateGiftCards(
  customerId: string,
  businessSettingsId: number,
  supabaseClient?: SupabaseClient
): Promise<GiftCardGenerationResult[]> {
  const supabase = supabaseClient || createClient()
  const results: GiftCardGenerationResult[] = []

  try {
    console.log('🎁 Checking if customer qualifies for gift cards...', {
      customerId,
      businessSettingsId,
    })

    // 1. Obtener configuración de gift cards
    const settings = await getGiftCardSettings()

    if (!settings) {
      console.log('⚠️ No gift card settings found')
      return [{
        generated: false,
        message: 'No gift card settings configured'
      }]
    }

    const {
      points_required = 100,
      card_value = 5,
      expiration_days = 30,
      max_active_cards = 5,
    } = settings

    console.log('📋 Gift card settings:', {
      points_required,
      card_value,
      expiration_days,
      max_active_cards,
    })

    // 2. Obtener puntos actuales del cliente
    const customerBusiness = await getCustomerBusiness(
      customerId,
      businessSettingsId,
      supabase
    )

    if (!customerBusiness) {
      console.log('⚠️ Customer business relationship not found')
      return [{
        generated: false,
        message: 'Customer not found in business'
      }]
    }

    const currentPoints = customerBusiness.total_points || 0
    console.log(`💰 Customer has ${currentPoints} points`)

    // 3. Verificar si tiene suficientes puntos
    if (currentPoints < points_required) {
      console.log(`⏸️ Not enough points (need ${points_required}, has ${currentPoints})`)
      return [{
        generated: false,
        message: `Need ${points_required - currentPoints} more points`
      }]
    }

    // 4. Verificar cuántas gift cards activas tiene el cliente
    const activeCardsCount = await countActiveGiftCards(
      customerId,
      businessSettingsId,
      supabase
    )

    console.log(`📊 Customer has ${activeCardsCount} active gift cards (max: ${max_active_cards})`)

    if (activeCardsCount >= max_active_cards) {
      console.log('🚫 Customer has reached max active gift cards limit')
      return [{
        generated: false,
        message: `Maximum ${max_active_cards} active gift cards reached`
      }]
    }

    // 5. Calcular cuántas gift cards se pueden generar
    const possibleCards = Math.floor(currentPoints / points_required)
    const cardsToGenerate = Math.min(
      possibleCards,
      max_active_cards - activeCardsCount
    )

    console.log(`🎯 Can generate ${cardsToGenerate} gift cards`)

    if (cardsToGenerate === 0) {
      return [{
        generated: false,
        message: 'No gift cards can be generated'
      }]
    }

    // 6. Generar las gift cards
    for (let i = 0; i < cardsToGenerate; i++) {
      try {
        console.log(`🎁 Generating gift card ${i + 1} of ${cardsToGenerate}...`)

        // Crear la gift card
        const giftCard = await createGiftCard({
          customer_id: customerId,
          business_settings_id: businessSettingsId,
          value: card_value,
          points_used: points_required,
          expiration_days: expiration_days,
        }, supabase)

        console.log(`✅ Gift card created: ${giftCard.code}`)

        // Restar los puntos usados
        const newPoints = currentPoints - (points_required * (i + 1))
        await updateCustomerBusiness(
          customerId,
          businessSettingsId,
          { total_points: newPoints },
          supabase
        )

        console.log(`💰 Points updated: ${newPoints}`)

        // Registrar en el historial la resta de puntos por gift card
        try {
          const { createPointsAudit, getCurrentUser } = await import('./points-audit')
          const { getBusinesses } = await import('./businesses')
          const currentUser = await getCurrentUser()

          if (currentUser) {
            // Obtener business_id desde business_settings
            const businesses = await getBusinesses()
            const business = businesses.find(b => b.business_settings_id === businessSettingsId)

            await createPointsAudit({
              operator_id: currentUser.id,
              admin_id: currentUser.id, // El mismo usuario que aprobó los puntos
              customer_id: customerId,
              business_id: business?.id || null, // Puede ser null si no hay business específico
              points_assigned: -points_required, // Negativo para indicar resta
              challenge_id: null,
              notes: `Gift card generada: ${giftCard.code} ($${card_value} USD)`
            })
            console.log(`📝 Points audit created for gift card redemption`)
          }
        } catch (auditError) {
          console.error('⚠️ Error creating points audit (non-critical):', auditError)
        }

        // Crear notificación para el cliente (no detener el proceso si falla)
        try {
          await createNotification({
            business_settings_id: businessSettingsId,
            customer_id: customerId,
            type: 'gift_card_generated',
            title: '🎁 ¡Gift Card Generada!',
            message: `Has canjeado ${points_required} puntos por una gift card de $${card_value} USD. Código: ${giftCard.code}`,
            metadata: {
              gift_card_id: giftCard.id,
              gift_card_code: giftCard.code,
              gift_card_value: card_value,
              points_used: points_required,
            },
          }, supabase)
          console.log('📧 Notification created')
        } catch (notificationError) {
          console.error('⚠️ Error creating notification (non-critical):', notificationError)
          console.error('Notification error details:', notificationError instanceof Error ? notificationError.message : notificationError)
          // No lanzar el error, solo registrarlo
        }

        results.push({
          generated: true,
          giftCard: giftCard,
          message: `Gift card ${giftCard.code} generated successfully`
        })

      } catch (error) {
        console.error(`❌ Error generating gift card ${i + 1}:`, error)
        results.push({
          generated: false,
          message: `Error generating gift card: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
        // Continuar con las siguientes gift cards si falla una
      }
    }

    return results

  } catch (error) {
    console.error('❌ Error in checkAndGenerateGiftCards:', error)
    return [{
      generated: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }]
  }
}

/**
 * Función helper para obtener el resumen de gift cards disponibles para un cliente
 */
export async function getGiftCardEligibilitySummary(
  customerId: string,
  businessSettingsId: number,
  supabaseClient?: SupabaseClient
): Promise<{
  currentPoints: number
  pointsRequired: number
  pointsNeeded: number
  canGenerate: boolean
  possibleCards: number
  activeCards: number
  maxActiveCards: number
}> {
  const supabase = supabaseClient || createClient()

  // Obtener configuración
  const settings = await getGiftCardSettings()
  const points_required = settings?.points_required || 100
  const max_active_cards = settings?.max_active_cards || 5

  // Obtener puntos del cliente
  const customerBusiness = await getCustomerBusiness(
    customerId,
    businessSettingsId,
    supabase
  )
  const currentPoints = customerBusiness?.total_points || 0

  // Contar gift cards activas
  const activeCards = await countActiveGiftCards(
    customerId,
    businessSettingsId,
    supabase
  )

  // Calcular cuántas puede generar
  const possibleCards = Math.floor(currentPoints / points_required)
  const canGenerate = currentPoints >= points_required && activeCards < max_active_cards
  const pointsNeeded = Math.max(0, points_required - currentPoints)

  return {
    currentPoints,
    pointsRequired: points_required,
    pointsNeeded,
    canGenerate,
    possibleCards: Math.min(possibleCards, max_active_cards - activeCards),
    activeCards,
    maxActiveCards: max_active_cards,
  }
}
