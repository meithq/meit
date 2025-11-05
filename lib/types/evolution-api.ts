// Tipos para Evolution API Webhooks
// Documentación: https://doc.evolution-api.com/v1/en/get-started/introduction

export interface EvolutionWebhookPayload {
  event: string
  instance: string
  data: MessageUpsertData
  destination: string
  date_time: string
  sender: string
  server_url: string
  apikey: string
}

export interface MessageUpsertData {
  key: MessageKey
  pushName: string
  message?: MessageContent
  messageType: string
  messageTimestamp: number
  instanceId?: string
  source?: string
}

export interface MessageKey {
  remoteJid: string // Número del cliente en formato: 5491112345678@s.whatsapp.net
  fromMe: boolean
  id: string
  participant?: string
}

export interface MessageContent {
  conversation?: string
  extendedTextMessage?: {
    text: string
  }
  imageMessage?: {
    caption?: string
    url?: string
  }
  videoMessage?: {
    caption?: string
    url?: string
  }
}

// Tipos para la respuesta de creación de cliente
export interface WhatsAppClientData {
  phone: string // Solo número sin @s.whatsapp.net
  name: string
  message?: string
  timestamp: number
}

// Helper para extraer el número de teléfono limpio
export function extractPhoneNumber(remoteJid: string): string {
  // Formato: 5491112345678@s.whatsapp.net -> 5491112345678
  return remoteJid.split('@')[0]
}

// Helper para validar que es un mensaje de usuario (no grupo)
export function isUserMessage(remoteJid: string): boolean {
  return remoteJid.endsWith('@s.whatsapp.net')
}

// Helper para extraer el texto del mensaje
export function extractMessageText(message?: MessageContent): string | null {
  if (!message) return null

  if (message.conversation) {
    return message.conversation
  }

  if (message.extendedTextMessage?.text) {
    return message.extendedTextMessage.text
  }

  if (message.imageMessage?.caption) {
    return message.imageMessage.caption
  }

  if (message.videoMessage?.caption) {
    return message.videoMessage.caption
  }

  return null
}
