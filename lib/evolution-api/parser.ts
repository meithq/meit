import type { EvolutionWebhookMessage, ParsedWhatsAppMessage } from '@/lib/types/evolution-api'

/**
 * Extrae el texto del mensaje desde el webhook de Evolution API
 */
export function extractMessageText(webhookData: EvolutionWebhookMessage): string | null {
  const { message } = webhookData.data

  if (!message) return null

  // Mensaje de texto simple
  if (message.conversation) {
    return message.conversation
  }

  // Mensaje de texto extendido (respuestas, etc)
  if (message.extendedTextMessage?.text) {
    return message.extendedTextMessage.text
  }

  return null
}

/**
 * Limpia el número de teléfono para guardarlo en la BD
 * Elimina caracteres especiales y deja solo números
 */
export function cleanPhoneNumber(remoteJid: string): string {
  // remoteJid viene en formato: 5491112345678@s.whatsapp.net
  return remoteJid.replace(/@.*$/, '').replace(/\D/g, '')
}

/**
 * Parsea el mensaje para extraer información del negocio y sucursal
 * Formato esperado: "Nombre del Negocio - Sucursal X"
 * O cualquier otro formato que definas
 */
export function parseBusinessInfo(message: string): {
  businessName?: string
  branchName?: string
} {
  // Ejemplo: "Café Central - Sucursal Norte"
  const match = message.match(/^(.+?)\s*-\s*(.+)$/)

  if (match) {
    return {
      businessName: match[1].trim(),
      branchName: match[2].trim(),
    }
  }

  // Si no coincide con el formato, retorna el mensaje completo como businessName
  return {
    businessName: message.trim(),
    branchName: undefined,
  }
}

/**
 * Procesa el webhook de Evolution API y extrae la información relevante
 */
export function parseEvolutionWebhook(
  webhookData: EvolutionWebhookMessage
): ParsedWhatsAppMessage | null {
  // Solo procesamos mensajes entrantes (fromMe: false)
  if (webhookData.data.key.fromMe) {
    return null
  }

  const messageText = extractMessageText(webhookData)
  if (!messageText) {
    return null
  }

  const phone = cleanPhoneNumber(webhookData.data.key.remoteJid)
  const name = webhookData.data.pushName || 'Usuario WhatsApp'
  const { businessName, branchName } = parseBusinessInfo(messageText)

  return {
    phone,
    name,
    message: messageText,
    businessName,
    branchName,
  }
}
