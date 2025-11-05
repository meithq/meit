/**
 * WhatsApp Message Templates for MEIT Platform
 *
 * All message templates following WhatsApp Business best practices:
 * - Clear, concise messaging
 * - Proper formatting with emojis
 * - Personalized with customer/merchant data
 * - Rate-limited and time-restricted
 */

import type { Customer, Challenge, GiftCard, Branch } from '@/types/database'

// ============================================================================
// TYPES
// ============================================================================

export interface CheckinConfirmationData {
  customerName: string
  branchName: string
  merchantName: string
  totalPoints: number
  pointsEarned?: number
  challenges?: Challenge[]
}

export interface PointsEarnedData {
  customerName: string
  pointsEarned: number
  totalPoints: number
  pointsToNextReward: number
  transactionAmount?: number
  challengesCompleted?: string[]
}

export interface GiftCardGeneratedData {
  customerName: string
  code: string
  value: number
  expiresAt: string
  merchantName: string
}

export interface GiftCardRedeemedData {
  customerName: string
  code: string
  value: number
  remainingValue: number
  merchantName: string
}

export interface WelcomeMessageData {
  customerName: string
  merchantName: string
  branchName?: string
}

export interface ChallengeNotificationData {
  customerName: string
  challenges: Challenge[]
  merchantName: string
}

// ============================================================================
// FORMATTERS
// ============================================================================

/**
 * Format date to Spanish locale
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format currency in Venezuelan Bolívares
 */
function formatCurrency(amount: number): string {
  return `Bs. ${amount.toFixed(2)}`
}

/**
 * Format challenges list
 */
function formatChallengesList(challenges: Challenge[]): string {
  if (challenges.length === 0) {
    return 'No hay retos disponibles por el momento.'
  }

  return challenges
    .map((challenge, index) => {
      let description = `${index + 1}. *${challenge.name}* - ${challenge.points} puntos`

      if (challenge.description) {
        description += `\n   ${challenge.description}`
      }

      if (challenge.type === 'amount_min' && challenge.target_value) {
        description += `\n   💰 Compra mínima: ${formatCurrency(challenge.target_value)}`
      }

      return description
    })
    .join('\n\n')
}

// ============================================================================
// MESSAGE TEMPLATES
// ============================================================================

/**
 * Welcome message for new customer registration
 */
export function getWelcomeMessage(data: WelcomeMessageData): string {
  const { customerName, merchantName, branchName } = data

  return `¡Hola ${customerName}! 👋

¡Bienvenido al programa de recompensas de *${merchantName}*!${branchName ? ` Has escaneado el código QR de *${branchName}*.` : ''}

🎁 *¿Cómo funciona?*
1️⃣ Cada vez que visites, escanea el código QR
2️⃣ Completa los retos del día para ganar puntos
3️⃣ Acumula puntos y obtén gift cards automáticamente

*¡Empezamos!* Ya estás registrado y listo para comenzar a acumular puntos.

Responde *AYUDA* si tienes dudas o *STOP* para darte de baja.`
}

/**
 * Check-in confirmation with available challenges
 */
export function getCheckinConfirmation(data: CheckinConfirmationData): string {
  const { customerName, branchName, merchantName, totalPoints, pointsEarned, challenges } = data

  let message = `✅ *Check-in exitoso* en ${branchName}\n\n`

  if (pointsEarned && pointsEarned > 0) {
    message += `🎉 ¡Has ganado ${pointsEarned} puntos!\n`
  }

  message += `👤 Hola ${customerName}\n`
  message += `⭐ Puntos totales: *${totalPoints} puntos*\n\n`

  if (challenges && challenges.length > 0) {
    message += `🎯 *Retos disponibles hoy:*\n\n`
    message += formatChallengesList(challenges)
    message += `\n\n💡 ¡Completa los retos durante tu visita para ganar más puntos!`
  } else {
    message += `No hay retos activos en este momento, pero igual ganarás puntos por tu compra. 😊`
  }

  return message
}

/**
 * Points earned notification after purchase
 */
export function getPointsEarnedMessage(data: PointsEarnedData): string {
  const {
    customerName,
    pointsEarned,
    totalPoints,
    pointsToNextReward,
    transactionAmount,
    challengesCompleted,
  } = data

  let message = `🎉 *¡Felicidades ${customerName}!*\n\n`

  message += `Has ganado *${pointsEarned} puntos*${transactionAmount ? ` por tu compra de ${formatCurrency(transactionAmount)}` : ''}.\n\n`

  if (challengesCompleted && challengesCompleted.length > 0) {
    message += `✅ *Retos completados:*\n`
    challengesCompleted.forEach((challenge) => {
      message += `   • ${challenge}\n`
    })
    message += `\n`
  }

  message += `⭐ *Total acumulado:* ${totalPoints} puntos\n\n`

  if (pointsToNextReward > 0) {
    message += `🎁 Te faltan *${pointsToNextReward} puntos* para tu próxima gift card.\n\n`
    message += `¡Sigue visitándonos! 🛍️`
  }

  return message
}

/**
 * Gift card generated notification
 */
export function getGiftCardGeneratedMessage(data: GiftCardGeneratedData): string {
  const { customerName, code, value, expiresAt, merchantName } = data

  return `🎉 *¡FELICIDADES ${customerName.toUpperCase()}!*

Has desbloqueado una Gift Card de *${formatCurrency(value)}* 🎁

🎫 *Código:* \`${code}\`
📅 *Válido hasta:* ${formatDate(expiresAt)}

💡 *¿Cómo usarlo?*
Muestra este código en tu próxima visita a ${merchantName} y el cajero lo aplicará a tu compra.

⚠️ *Importante:*
• La gift card es de un solo uso
• No se puede combinar con otras promociones
• Guarda este mensaje para mostrarlo en caja

¡Disfruta tu recompensa! 🎊`
}

/**
 * Gift card redeemed confirmation
 */
export function getGiftCardRedeemedMessage(data: GiftCardRedeemedData): string {
  const { customerName, code, value, remainingValue, merchantName } = data

  let message = `✅ *Gift Card aplicada exitosamente*\n\n`

  message += `Código: \`${code}\`\n`
  message += `Descuento: ${formatCurrency(value)}\n`

  if (remainingValue > 0) {
    message += `\n💰 Saldo restante: ${formatCurrency(remainingValue)}\n`
    message += `Podrás usarlo en tu próxima compra.`
  } else {
    message += `\n¡Gracias por usar tu gift card en ${merchantName}! 😊\n`
    message += `Sigue acumulando puntos para obtener más recompensas.`
  }

  return message
}

/**
 * Daily challenges notification (can be sent proactively)
 */
export function getChallengeNotification(data: ChallengeNotificationData): string {
  const { customerName, challenges, merchantName } = data

  if (challenges.length === 0) {
    return ''
  }

  return `🎯 *Retos del día en ${merchantName}*

Hola ${customerName}, tenemos nuevos retos para ti hoy:

${formatChallengesList(challenges)}

¡Visítanos y completa los retos para ganar puntos extra! 🌟`
}

/**
 * Gift card expiration reminder (sent 3 days before expiry)
 */
export function getGiftCardExpiringMessage(
  customerName: string,
  giftCards: Pick<GiftCard, 'code' | 'value' | 'expires_at'>[]
): string {
  if (giftCards.length === 0) {
    return ''
  }

  let message = `⚠️ *Recordatorio importante*\n\n`
  message += `Hola ${customerName}, tienes gift cards próximas a vencer:\n\n`

  giftCards.forEach((gc) => {
    if (gc.expires_at) {
      message += `🎫 Código: \`${gc.code}\`\n`
      message += `   Valor: ${formatCurrency(gc.value)}\n`
      message += `   Vence: ${formatDate(gc.expires_at)}\n\n`
    }
  })

  message += `¡No dejes que se pierdan! Úsalas en tu próxima visita. 🛍️`

  return message
}

/**
 * Help message with available commands
 */
export function getHelpMessage(merchantName: string): string {
  return `ℹ️ *Ayuda - ${merchantName}*

*Comandos disponibles:*

📊 *PUNTOS* - Ver tu balance de puntos
🎁 *GIFTCARDS* - Ver tus gift cards disponibles
🎯 *RETOS* - Ver retos activos
📍 *SUCURSALES* - Ver nuestras sucursales
🆘 *AYUDA* - Ver este mensaje
🛑 *STOP* - Darse de baja del programa

*¿Cómo acumular puntos?*
1. Escanea el código QR al entrar
2. Completa tus retos durante la visita
3. Gana puntos por cada compra
4. Obtén gift cards automáticamente

¿Necesitas más ayuda? Escríbenos directamente. 😊`
}

/**
 * Opt-out confirmation message
 */
export function getOptOutMessage(customerName: string, merchantName: string): string {
  return `👋 *${customerName}*, lamentamos que te vayas.

Has sido dado de baja del programa de recompensas de ${merchantName}.

Ya no recibirás notificaciones automáticas, pero tus puntos actuales se mantendrán guardados.

*¿Cambias de opinión?*
Puedes volver a registrarte en cualquier momento escaneando el código QR en nuestro local.

¡Gracias por ser parte de nuestro programa! 💜`
}

/**
 * Error message for invalid operations
 */
export function getErrorMessage(errorType: 'invalid_code' | 'expired_code' | 'generic'): string {
  switch (errorType) {
    case 'invalid_code':
      return `❌ *Código inválido*\n\nEl código de gift card que ingresaste no es válido. Por favor verifica e intenta de nuevo.\n\n¿Necesitas ayuda? Escribe *AYUDA*.`

    case 'expired_code':
      return `❌ *Código expirado*\n\nEsta gift card ha expirado y ya no puede ser usada.\n\n¡Pero no te preocupes! Sigue acumulando puntos para obtener nuevas recompensas. 🎁`

    case 'generic':
    default:
      return `❌ *Error*\n\nHubo un problema al procesar tu solicitud. Por favor intenta de nuevo en unos momentos.\n\nSi el problema persiste, contacta con el personal del local. 🙏`
  }
}

// ============================================================================
// MESSAGE VALIDATION
// ============================================================================

/**
 * Check if message exceeds WhatsApp character limit
 */
export function validateMessageLength(message: string): {
  valid: boolean
  length: number
  maxLength: number
} {
  const maxLength = 4096 // WhatsApp's character limit
  const length = message.length

  return {
    valid: length <= maxLength,
    length,
    maxLength,
  }
}

/**
 * Truncate message if it exceeds character limit
 */
export function truncateMessage(message: string, maxLength: number = 4000): string {
  if (message.length <= maxLength) {
    return message
  }

  return message.substring(0, maxLength - 50) + '\n\n...(mensaje truncado)'
}

// ============================================================================
// TIME-BASED RESTRICTIONS
// ============================================================================

/**
 * Check if current time is within allowed messaging hours (9am - 9pm)
 */
export function isWithinMessagingHours(): boolean {
  const now = new Date()
  const hour = now.getHours()
  return hour >= 9 && hour < 21 // 9am to 9pm
}

/**
 * Get next available messaging time
 */
export function getNextMessagingTime(): Date {
  const now = new Date()
  const hour = now.getHours()

  if (hour >= 21 || hour < 9) {
    // Set to 9am next day or today
    const nextTime = new Date(now)
    nextTime.setHours(9, 0, 0, 0)

    if (hour >= 21) {
      nextTime.setDate(nextTime.getDate() + 1)
    }

    return nextTime
  }

  return now
}
