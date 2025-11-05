/**
 * Utilidades para generar enlaces de WhatsApp QR para check-in
 */

// Número de WhatsApp de Evolution API (FIJO - NO CAMBIAR)
// Este es el único número que recibirá todos los mensajes de check-in
const WHATSAPP_NUMBER = '584126376341'

export interface GenerateWhatsAppLinkParams {
  businessName: string
  branchName: string
  businessId?: string
  branchId?: string
}

/**
 * Genera un enlace de WhatsApp con mensaje pre-rellenado para check-in
 *
 * @example
 * const link = generateWhatsAppCheckInLink({
 *   businessName: "Café Central",
 *   branchName: "Sucursal Norte",
 *   businessId: "123",
 *   branchId: "456"
 * })
 * // Resultado: https://wa.me/584126376341?text=Hola%20quiero%20hacer%20checkin%20en%20Caf%C3%A9%20Central%20-%20Sucursal%20Norte
 */
export function generateWhatsAppCheckInLink(params: GenerateWhatsAppLinkParams): string {
  const { businessName, branchName, businessId, branchId } = params

  // Mensaje pre-rellenado con formato de check-in
  const message = `Hola quiero hacer checkin en ${businessName} - ${branchName}`

  // Agregar IDs como metadata oculta (opcional, para debugging)
  const metadata = businessId && branchId ? ` [BID:${businessId}|BRID:${branchId}]` : ''
  const fullMessage = message + metadata

  // Codificar el mensaje para URL
  const encodedMessage = encodeURIComponent(fullMessage)

  // Generar enlace de WhatsApp
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
}

/**
 * Genera un enlace corto de WhatsApp (sin metadata)
 */
export function generateSimpleWhatsAppLink(businessName: string, branchName: string): string {
  const message = `Hola quiero hacer checkin en ${businessName} - ${branchName}`
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
}

/**
 * Parsea un mensaje de check-in para extraer negocio y sucursal
 *
 * @example
 * parseCheckInMessage("Hola quiero hacer checkin en Café Central - Sucursal Norte")
 * // Retorna: { businessName: "Café Central", branchName: "Sucursal Norte", isCheckIn: true }
 */
export function parseCheckInMessage(message: string): {
  isCheckIn: boolean
  businessName: string | null
  branchName: string | null
  businessId?: string
  branchId?: string
} {
  // Detectar patrón de check-in
  const checkInPattern = /hacer\s+check[-\s]?in\s+en\s+(.+?)\s*-\s*(.+?)(\s*\[BID:(\w+)\|BRID:(\w+)\])?$/i
  const match = message.match(checkInPattern)

  if (match) {
    return {
      isCheckIn: true,
      businessName: match[1].trim(),
      branchName: match[2].trim(),
      businessId: match[4] || undefined,
      branchId: match[5] || undefined,
    }
  }

  return {
    isCheckIn: false,
    businessName: null,
    branchName: null,
  }
}

/**
 * Valida que el número de WhatsApp esté configurado
 */
export function validateWhatsAppNumber(): boolean {
  return WHATSAPP_NUMBER && WHATSAPP_NUMBER.length > 0
}

/**
 * Obtiene el número de WhatsApp configurado
 */
export function getWhatsAppNumber(): string {
  return WHATSAPP_NUMBER
}
