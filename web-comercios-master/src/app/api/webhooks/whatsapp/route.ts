/**
 * WhatsApp Webhook Handler
 *
 * Receives incoming messages from Evolution API and processes them.
 * Handles customer registration, check-ins, commands, and automated responses.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { EvolutionAPIClient, formatPhoneForWhatsApp } from '@/lib/evolution-api'
import {
  getWelcomeMessage,
  getHelpMessage,
  getOptOutMessage,
  getErrorMessage,
} from '@/lib/whatsapp-templates'
import type { Customer, Branch } from '@/types/database'

// ============================================================================
// TYPES
// ============================================================================

interface WebhookPayload {
  event: string
  instance: string
  data: {
    key: {
      remoteJid: string
      fromMe: boolean
      id: string
    }
    message?: {
      conversation?: string
      extendedTextMessage?: {
        text: string
      }
    }
    messageTimestamp: number
    pushName?: string
  }
}

interface MessageContext {
  phone: string
  cleanPhone: string
  message: string
  customerName?: string
  messageId: string
}

interface MerchantData {
  id: string
  name: string
}

interface BranchWithMerchant extends Branch {
  merchants: MerchantData
  merchant_name?: string
  merchant_id_val?: string
}

interface CustomerMerchantRelationship {
  points_balance: number
  merchants: {
    name: string
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract QR code from message (format: "Hola! Quiero registrarme en BRANCH_CODE")
 */
function extractBranchCodeFromMessage(message: string): string | null {
  // Try to find branch code patterns - return full match, not captured group
  const patterns = [
    /(BRANCH_[A-Z0-9]{8})/i, // BRANCH_12345678
    /(QR[_:-]?[A-Z0-9]{6,})/i, // QR_CODE or QR:CODE
    /código[:\s]+([A-Z0-9]{6,})/i, // código: ABC123 (captures group for this case)
  ]

  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match) {
      return match[1].toUpperCase() // Return full code in uppercase
    }
  }

  return null
}

/**
 * Get or create customer by phone
 */
async function getOrCreateCustomer(
  phone: string,
  name?: string
): Promise<Customer | null> {
  try {
    // Try to find existing customer
    const { data: existingCustomer, error: findError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .maybeSingle()

    if (findError) {
      console.error('Error finding customer:', findError)
      return null
    }

    if (existingCustomer) {
      return existingCustomer
    }

    // Create new customer
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert({
        phone,
        name: name || 'Cliente',
        total_points: 0,
        visits_count: 0,
        is_active: true,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating customer:', createError)
      return null
    }

    return newCustomer
  } catch (error) {
    console.error('Error in getOrCreateCustomer:', error)
    return null
  }
}

/**
 * Get branch by QR code with merchant data
 */
async function getBranchByQRCode(qrCode: string): Promise<(Branch & { merchant_name?: string; merchant_id_val?: string }) | null> {
  try {
    console.log('=== getBranchByQRCode DEBUG ===')
    console.log('Searching for QR code:', qrCode)

    const { data, error } = await supabase
      .from('branches')
      .select(`
        *,
        merchants!inner (
          id,
          name
        )
      `)
      .ilike('qr_code', qrCode)
      .eq('is_active', true)
      .single()

    console.log('Query result - data:', data)
    console.log('Query result - error:', error)

    if (error) {
      console.error('Error finding branch:', error)
      return null
    }

    // Extract merchant data from the join
    const branchData = data as BranchWithMerchant
    const merchants = branchData.merchants
    const result = {
      ...data,
      merchant_name: merchants?.name,
      merchant_id_val: merchants?.id || data.merchant_id
    } as Branch & { merchant_name?: string; merchant_id_val?: string }

    console.log('Returning branch:', result)
    return result
  } catch (error) {
    console.error('Error in getBranchByQRCode:', error)
    return null
  }
}

/**
 * Register customer-merchant relationship
 */
async function registerCustomerMerchant(
  customerId: string,
  merchantId: string
): Promise<boolean> {
  try {
    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('customer_merchants')
      .select('*')
      .eq('customer_id', customerId)
      .eq('merchant_id', merchantId)
      .maybeSingle()

    if (existing) {
      // Update last visit
      const { error: updateError } = await supabase
        .from('customer_merchants')
        .update({
          last_visit_at: new Date().toISOString(),
          is_active: true,
        })
        .eq('customer_id', customerId)
        .eq('merchant_id', merchantId)

      return !updateError
    }

    // Create new relationship
    const { error } = await supabase.from('customer_merchants').insert({
      customer_id: customerId,
      merchant_id: merchantId,
      first_visit_at: new Date().toISOString(),
      last_visit_at: new Date().toISOString(),
      visits_count: 0,
      points_balance: 0,
      is_active: true,
    })

    return !error
  } catch (error) {
    console.error('Error in registerCustomerMerchant:', error)
    return false
  }
}

/**
 * Send WhatsApp message
 */
async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  try {
    const client = new EvolutionAPIClient({
      baseUrl: process.env.EVOLUTION_API_URL || '',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'meit_merchant',
    })

    await client.sendTextMessage({
      phone,
      message,
    })

    // Log message in database
    await supabase.from('whatsapp_messages').insert({
      phone_number: phone,
      content: message,
      message_type: 'outbound',
      status: 'sent',
    })

    return true
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return false
  }
}

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

/**
 * Handle registration message (when customer scans QR)
 */
async function handleRegistrationMessage(context: MessageContext): Promise<void> {
  const { phone, message, customerName } = context

  // Extract branch code from message
  const branchCode = extractBranchCodeFromMessage(message)

  console.log('Extracted branch code:', branchCode)

  if (!branchCode) {
    // No valid QR code found - send help message
    await sendWhatsAppMessage(phone, getHelpMessage('Meit'))
    return
  }

  // Get branch info
  console.log('Searching for branch with code:', branchCode)
  const branch = await getBranchByQRCode(branchCode)

  if (!branch || !branch.merchant_id_val || !branch.merchant_name) {
    await sendWhatsAppMessage(phone, getErrorMessage('invalid_code'))
    return
  }

  // Get or create customer
  const customer = await getOrCreateCustomer(phone, customerName)

  if (!customer) {
    await sendWhatsAppMessage(phone, getErrorMessage('generic'))
    return
  }

  // Register customer-merchant relationship
  const registered = await registerCustomerMerchant(
    customer.id,
    branch.merchant_id_val
  )

  if (!registered) {
    await sendWhatsAppMessage(phone, getErrorMessage('generic'))
    return
  }

  // Send welcome message
  const welcomeMessage = getWelcomeMessage({
    customerName: customer.name || 'Cliente',
    merchantName: branch.merchant_name,
    branchName: branch.name,
  })

  await sendWhatsAppMessage(phone, welcomeMessage)

  // Log check-in
  await supabase.from('checkins').insert({
    customer_id: customer.id,
    merchant_id: branch.merchant_id_val,
    branch_id: branch.id,
    points_earned: 0,
    checkin_method: 'qr_code',
    created_at: new Date().toISOString(),
  })
}

/**
 * Handle "PUNTOS" command
 */
async function handlePointsQuery(context: MessageContext): Promise<void> {
  const { phone } = context

  const customer = await getOrCreateCustomer(phone)

  if (!customer) {
    await sendWhatsAppMessage(phone, getErrorMessage('generic'))
    return
  }

  // Get total points across all merchants
  const { data: relationships } = await supabase
    .from('customer_merchants')
    .select(`
      points_balance,
      merchants (
        name
      )
    `)
    .eq('customer_id', customer.id)
    .eq('is_active', true)

  if (!relationships || relationships.length === 0) {
    await sendWhatsAppMessage(
      phone,
      `👋 Hola ${customer.name}!\n\nAún no tienes puntos acumulados.\n\n¡Escanea el código QR en tu próxima visita para empezar a ganar puntos! 🎁`
    )
    return
  }

  // Cast relationships to our proper type
  const typedRelationships = relationships as unknown as CustomerMerchantRelationship[]

  let message = `⭐ *Balance de Puntos*\n\n`
  message += `Hola ${customer.name}, aquí están tus puntos:\n\n`

  typedRelationships.forEach((rel) => {
    message += `🏪 *${rel.merchants.name}*: ${rel.points_balance} puntos\n`
  })

  const totalPoints = typedRelationships.reduce(
    (sum, rel) => sum + rel.points_balance,
    0
  )

  message += `\n📊 *Total:* ${totalPoints} puntos\n\n`
  message += `¡Sigue visitando y acumulando! 🌟`

  await sendWhatsAppMessage(phone, message)
}

/**
 * Handle "AYUDA" command
 */
async function handleHelpCommand(context: MessageContext): Promise<void> {
  const { phone } = context

  await sendWhatsAppMessage(phone, getHelpMessage('Meit'))
}

/**
 * Handle "STOP" command (opt-out)
 */
async function handleOptOut(context: MessageContext): Promise<void> {
  const { phone } = context

  const customer = await getOrCreateCustomer(phone)

  if (!customer) {
    return
  }

  // Deactivate all customer-merchant relationships
  await supabase
    .from('customer_merchants')
    .update({ is_active: false })
    .eq('customer_id', customer.id)

  const message = getOptOutMessage(customer.name || 'Cliente', 'Meit')

  await sendWhatsAppMessage(phone, message)
}

/**
 * Route incoming message to appropriate handler
 */
async function routeMessage(context: MessageContext): Promise<void> {
  const lowerMessage = context.message.toLowerCase().trim()

  // Check for commands
  if (lowerMessage === 'puntos' || lowerMessage === 'points') {
    await handlePointsQuery(context)
    return
  }

  if (lowerMessage === 'ayuda' || lowerMessage === 'help') {
    await handleHelpCommand(context)
    return
  }

  if (lowerMessage === 'stop' || lowerMessage === 'baja') {
    await handleOptOut(context)
    return
  }

  // Check if message contains QR code (registration)
  if (lowerMessage.includes('registrarme') || lowerMessage.includes('branch_')) {
    await handleRegistrationMessage(context)
    return
  }

  // Default: unknown command - send help
  await handleHelpCommand(context)
}

// ============================================================================
// WEBHOOK ENDPOINT
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json()

    console.log('Received webhook:', JSON.stringify(payload, null, 2))

    // Verify it's a message event
    if (!payload.event || !payload.event.includes('message')) {
      return NextResponse.json({ received: true, ignored: 'not a message event' })
    }

    // Parse incoming message
    const parsedMessage = EvolutionAPIClient.parseIncomingMessage(payload)

    if (!parsedMessage) {
      return NextResponse.json({ received: true, ignored: 'invalid message format' })
    }

    // Check if message is from business (ignore own messages)
    if (payload.data.key.fromMe) {
      return NextResponse.json({ received: true, ignored: 'message from business' })
    }

    // Format phone number
    let cleanPhone: string
    try {
      cleanPhone = formatPhoneForWhatsApp(parsedMessage.phone)
    } catch {
      console.error('Invalid phone format:', parsedMessage.phone)
      return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 })
    }

    // Build message context
    const context: MessageContext = {
      phone: parsedMessage.phone,
      cleanPhone,
      message: parsedMessage.message,
      customerName: parsedMessage.customerName,
      messageId: parsedMessage.messageId,
    }

    // Log incoming message
    await supabase.from('whatsapp_messages').insert({
      phone_number: cleanPhone,
      content: parsedMessage.message,
      message_type: 'inbound',
      status: 'received',
    })

    // Route message to appropriate handler
    await routeMessage(context)

    return NextResponse.json({ success: true, processed: true })
  } catch (error) {
    console.error('Webhook error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'whatsapp-webhook',
    timestamp: new Date().toISOString(),
  })
}
