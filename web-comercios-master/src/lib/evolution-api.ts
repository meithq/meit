/**
 * Evolution API Client for WhatsApp Business Integration
 *
 * Provides methods to interact with Evolution API for sending WhatsApp messages,
 * managing instances, and handling webhooks.
 *
 * Documentation: https://doc.evolution-api.com/
 */

// ============================================================================
// TYPES
// ============================================================================

export interface EvolutionAPIConfig {
  baseUrl: string
  apiKey: string
  instanceName: string
}

export interface SendTextMessageParams {
  phone: string
  message: string
}

export interface SendTextMessageResponse {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  message: {
    conversation: string
  }
  messageTimestamp: number
  status: string
}

export interface WebhookConfig {
  url: string
  events: string[]
  webhookByEvents: boolean
}

export interface InstanceInfo {
  instance: {
    instanceName: string
    owner: string
    state: 'open' | 'close' | 'connecting'
  }
  qrcode?: {
    base64: string
    code: string
  }
}

export interface IncomingMessage {
  key: {
    remoteJid: string // Customer phone with @s.whatsapp.net
    fromMe: boolean
    id: string
  }
  message: {
    conversation?: string
    extendedTextMessage?: {
      text: string
    }
  }
  messageTimestamp: number
  pushName?: string // Customer name from WhatsApp
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class EvolutionAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: unknown
  ) {
    super(message)
    this.name = 'EvolutionAPIError'
  }
}

// ============================================================================
// CLIENT CLASS
// ============================================================================

export class EvolutionAPIClient {
  private config: EvolutionAPIConfig

  constructor(config: EvolutionAPIConfig) {
    this.config = config
  }

  /**
   * Get base headers for Evolution API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'apikey': this.config.apiKey,
    }
  }

  /**
   * Make HTTP request to Evolution API
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new EvolutionAPIError(
          data.message || 'Evolution API request failed',
          response.status,
          data
        )
      }

      return data as T
    } catch (error) {
      if (error instanceof EvolutionAPIError) {
        throw error
      }

      throw new EvolutionAPIError(
        `Evolution API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        error
      )
    }
  }

  /**
   * Send text message to WhatsApp number
   */
  async sendTextMessage(params: SendTextMessageParams): Promise<SendTextMessageResponse> {
    const { phone, message } = params

    // Ensure phone is in correct format (remove spaces, dashes, +)
    let cleanPhone = phone.replace(/[\s\-()]/g, '')

    // Remove + if present
    if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1)
    }

    // Add @s.whatsapp.net suffix for remoteJid format
    const remoteJid = `${cleanPhone}@s.whatsapp.net`

    console.log('=== sendTextMessage DEBUG ===')
    console.log('Original phone:', phone)
    console.log('Clean phone:', cleanPhone)
    console.log('Remote JID:', remoteJid)
    console.log('Message:', message)
    console.log('Endpoint:', `/message/sendText/${this.config.instanceName}`)
    console.log('URL:', `${this.config.baseUrl}/message/sendText/${this.config.instanceName}`)

    return this.request<SendTextMessageResponse>(
      `/message/sendText/${this.config.instanceName}`,
      'POST',
      {
        number: remoteJid,
        text: message,
      }
    )
  }

  /**
   * Get instance connection status
   */
  async getInstanceInfo(): Promise<InstanceInfo> {
    return this.request<InstanceInfo>(`/instance/fetchInstances/${this.config.instanceName}`)
  }

  /**
   * Create new WhatsApp instance
   */
  async createInstance(webhookUrl: string): Promise<InstanceInfo> {
    return this.request<InstanceInfo>('/instance/create', 'POST', {
      instanceName: this.config.instanceName,
      token: this.config.apiKey,
      qrcode: true,
      webhook: {
        url: webhookUrl,
        webhookByEvents: true,
        events: [
          'messages.upsert',
          'messages.update',
          'connection.update',
        ],
      },
    })
  }

  /**
   * Configure webhook for instance
   */
  async setWebhook(webhookConfig: WebhookConfig): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/webhook/set/${this.config.instanceName}`,
      'POST',
      webhookConfig
    )
  }

  /**
   * Check if instance is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      const info = await this.getInstanceInfo()
      return info.instance.state === 'open'
    } catch (error) {
      console.error('Error checking connection:', error)
      return false
    }
  }

  /**
   * Get QR code for connecting WhatsApp
   */
  async getQRCode(): Promise<string | null> {
    try {
      const info = await this.getInstanceInfo()
      return info.qrcode?.base64 || null
    } catch (error) {
      console.error('Error fetching QR code:', error)
      return null
    }
  }

  /**
   * Parse incoming webhook message
   */
  static parseIncomingMessage(webhookData: unknown): {
    phone: string
    message: string
    customerName?: string
    messageId: string
  } | null {
    try {
      const data = webhookData as { data: IncomingMessage }

      // Validate data structure
      if (!data.data || !data.data.key || !data.data.message) {
        return null
      }

      if (data.data.key.fromMe) {
        // Ignore messages sent by business
        return null
      }

      const { key, message, pushName } = data.data

      // Extract phone number (remove @s.whatsapp.net)
      const phone = key.remoteJid.replace('@s.whatsapp.net', '')

      // Extract message text
      const messageText =
        message.conversation || message.extendedTextMessage?.text || ''

      if (!messageText.trim()) {
        return null
      }

      return {
        phone,
        message: messageText.trim(),
        customerName: pushName,
        messageId: key.id,
      }
    } catch (error) {
      console.error('Error parsing incoming message:', error)
      return null
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let evolutionClient: EvolutionAPIClient | null = null

/**
 * Get Evolution API client singleton
 */
export function getEvolutionClient(): EvolutionAPIClient {
  if (!evolutionClient) {
    const config: EvolutionAPIConfig = {
      baseUrl: process.env.EVOLUTION_API_URL || '',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'meit_merchant',
    }

    // Validate configuration
    if (!config.baseUrl || !config.apiKey) {
      throw new Error(
        'Evolution API configuration missing. Please set EVOLUTION_API_URL and EVOLUTION_API_KEY environment variables.'
      )
    }

    evolutionClient = new EvolutionAPIClient(config)
  }

  return evolutionClient
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate Venezuelan phone number format
 */
export function validateVenezuelanPhone(phone: string): boolean {
  // Venezuelan phone: +58XXXXXXXXXX (10 digits after +58)
  const phoneRegex = /^\+58[0-9]{10}$/
  return phoneRegex.test(phone)
}

/**
 * Format phone number to Evolution API format
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // Ensure it starts with +58 for Venezuela
  if (!cleaned.startsWith('+')) {
    cleaned = `+${cleaned}`
  }

  if (!cleaned.startsWith('+58')) {
    throw new Error('Only Venezuelan phone numbers (+58) are supported')
  }

  return cleaned
}

/**
 * Rate limiting helper for WhatsApp messages
 */
const messageSendTimestamps: Map<string, number[]> = new Map()

export function checkRateLimit(
  phone: string,
  maxMessages: number = 3,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const timestamps = messageSendTimestamps.get(phone) || []

  // Remove timestamps outside the window
  const validTimestamps = timestamps.filter((ts) => now - ts < windowMs)

  if (validTimestamps.length >= maxMessages) {
    const oldestTimestamp = validTimestamps[0]
    const retryAfter = oldestTimestamp + windowMs - now

    return {
      allowed: false,
      retryAfter: Math.ceil(retryAfter / 1000), // seconds
    }
  }

  // Add current timestamp
  validTimestamps.push(now)
  messageSendTimestamps.set(phone, validTimestamps)

  return { allowed: true }
}

/**
 * Sanitize message content
 */
export function sanitizeMessage(message: string): string {
  return message
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\s\-_.@áéíóúñÁÉÍÓÚÑ¡¿!?()]/g, '') // Keep alphanumeric + Spanish chars
    .trim()
    .substring(0, 1000) // Limit to 1000 characters
}
