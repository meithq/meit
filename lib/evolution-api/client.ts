/**
 * Cliente para interactuar con Evolution API
 * Documentación: https://doc.evolution-api.com
 *
 * Basado en implementación de web-comercios-master
 */

export interface EvolutionAPIConfig {
  baseUrl: string
  apiKey: string
  instanceName: string
}

export interface SendMessageParams {
  phone: string // Formato: 5491112345678 (sin formato)
  message: string
}

export interface SendMessageResponse {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  message: {
    extendedTextMessage: {
      text: string
    }
  }
  messageTimestamp: string
  status: string
}

export interface IncomingMessage {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  pushName: string
  message?: {
    conversation?: string
    extendedTextMessage?: {
      text: string
    }
  }
}

export interface ParsedMessage {
  phone: string
  message: string
  customerName?: string
  messageId: string
}

/**
 * Cliente Singleton para Evolution API
 */
class EvolutionAPIClient {
  private config: EvolutionAPIConfig

  constructor(config: EvolutionAPIConfig) {
    this.config = config
  }

  /**
   * Limpia y formatea el número de teléfono
   */
  private formatPhone(phone: string): string {
    // Remover espacios, guiones, paréntesis
    let cleanPhone = phone.replace(/[\s\-()]/g, '')

    // Remover + inicial si existe
    if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1)
    }

    // Formato para Evolution API: número@s.whatsapp.net
    return `${cleanPhone}@s.whatsapp.net`
  }

  /**
   * Envía un mensaje de texto a través de Evolution API
   */
  async sendTextMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    const remoteJid = this.formatPhone(params.phone)

    const response = await fetch(
      `${this.config.baseUrl}/message/sendText/${this.config.instanceName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.config.apiKey,
        },
        body: JSON.stringify({
          number: remoteJid,
          text: params.message,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send message: ${error}`)
    }

    return response.json()
  }

  /**
   * Parsea un mensaje entrante del webhook
   */
  static parseIncomingMessage(webhookData: any): ParsedMessage | null {
    const data = webhookData as { data: IncomingMessage }

    // Ignorar mensajes enviados por nosotros
    if (data.data.key.fromMe) {
      return null
    }

    const { key, pushName, message } = data.data

    // Extraer número (remover @s.whatsapp.net)
    const phone = key.remoteJid.replace('@s.whatsapp.net', '')

    // Extraer texto del mensaje
    const messageText =
      message?.conversation || message?.extendedTextMessage?.text || ''

    return {
      phone,
      message: messageText.trim(),
      customerName: pushName || undefined,
      messageId: key.id,
    }
  }

  /**
   * Verifica el estado de la conexión de la instancia
   */
  async checkConnection(): Promise<{ state: string; statusReason?: string }> {
    const response = await fetch(
      `${this.config.baseUrl}/instance/connectionState/${this.config.instanceName}`,
      {
        headers: {
          apikey: this.config.apiKey,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to check connection state')
    }

    return response.json()
  }

  /**
   * Verifica si la instancia está conectada
   */
  async isConnected(): Promise<boolean> {
    try {
      const state = await this.checkConnection()
      return state.state === 'open'
    } catch {
      return false
    }
  }
}

// Singleton instance
let evolutionClient: EvolutionAPIClient | null = null

/**
 * Obtiene el cliente singleton de Evolution API
 */
export function getEvolutionClient(): EvolutionAPIClient {
  if (!evolutionClient) {
    const config: EvolutionAPIConfig = {
      baseUrl: process.env.EVOLUTION_API_URL || '',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'meit',
    }

    if (!config.baseUrl || !config.apiKey) {
      throw new Error('Evolution API not configured. Check EVOLUTION_API_URL and EVOLUTION_API_KEY')
    }

    evolutionClient = new EvolutionAPIClient(config)
  }

  return evolutionClient
}

/**
 * Envía un mensaje de bienvenida a un nuevo cliente
 */
export async function sendWelcomeMessage(
  phone: string,
  customerName: string
): Promise<void> {
  const welcomeText = `¡Hola ${customerName}! 👋

Bienvenido a nuestro programa de fidelidad.

🎁 Has sido registrado exitosamente
📱 Tu número: ${phone}
⭐ Puntos iniciales: 0

Cada vez que visites nuestras sucursales y realices un check-in, acumularás puntos que podrás canjear por gift cards y premios.

*Comandos disponibles:*
• PUNTOS - Ver tu balance
• RETOS - Ver retos disponibles
• AYUDA - Obtener ayuda

¿Tienes alguna pregunta? ¡Estamos para ayudarte!`

  try {
    const client = getEvolutionClient()
    await client.sendTextMessage({
      phone,
      message: welcomeText,
    })
    console.log(`✅ Welcome message sent to ${phone}`)
  } catch (error) {
    console.error(`❌ Failed to send welcome message to ${phone}:`, error)
    // No lanzamos el error para que no afecte el registro del cliente
  }
}

/**
 * Envía un mensaje de confirmación de negocio y sucursal
 */
export async function sendBusinessConfirmation(
  phone: string,
  businessName: string,
  branchName?: string
): Promise<void> {
  const text = branchName
    ? `✅ Información registrada:

🏢 Negocio: ${businessName}
📍 Sucursal: ${branchName}

¡Gracias por tu interés! Pronto recibirás más información.`
    : `✅ Información registrada:

🏢 Negocio: ${businessName}

¡Gracias por tu interés! Pronto recibirás más información.`

  try {
    const client = getEvolutionClient()
    await client.sendTextMessage({
      phone,
      message: text,
    })
    console.log(`✅ Business confirmation sent to ${phone}`)
  } catch (error) {
    console.error(`❌ Failed to send confirmation to ${phone}:`, error)
  }
}

/**
 * Envía mensaje de ayuda con comandos disponibles
 */
export async function sendHelpMessage(phone: string): Promise<void> {
  const helpText = `ℹ️ *Ayuda - Programa de Fidelidad*

*Comandos disponibles:*

📊 *PUNTOS* - Ver tu balance de puntos
🎯 *RETOS* - Ver retos disponibles
🆘 *AYUDA* - Ver este mensaje
🛑 *STOP* - Darse de baja del programa

*¿Cómo acumular puntos?*
1. Visita nuestras sucursales
2. Realiza un check-in
3. Completa retos para ganar puntos
4. Canjea por gift cards

¿Necesitas más ayuda? Escríbenos directamente.`

  try {
    const client = getEvolutionClient()
    await client.sendTextMessage({
      phone,
      message: helpText,
    })
    console.log(`✅ Help message sent to ${phone}`)
  } catch (error) {
    console.error(`❌ Failed to send help message to ${phone}:`, error)
  }
}
