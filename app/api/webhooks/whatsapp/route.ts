import { NextRequest, NextResponse } from 'next/server'
import {
  type EvolutionWebhookPayload,
  extractPhoneNumber,
  isUserMessage,
  extractMessageText,
} from '@/lib/types/evolution-api'
import { getOrCreateCustomer, updateCustomer, getCustomerByPhone } from '@/lib/supabase/customers'
import {
  sendWelcomeMessage,
  sendBusinessConfirmation,
  sendHelpMessage,
  EvolutionAPIClient,
  getEvolutionClient,
} from '@/lib/evolution-api/client'
import { parseCheckInMessage } from '@/lib/whatsapp-qr'
import { getOrCreateCustomerBusiness, getBusinessesByCustomer } from '@/lib/supabase/customer-businesses'
import { createServerClient } from '@/lib/supabase/server-client'
import { getActiveChallengesByBusiness, getActiveChallengesForBusinesses } from '@/lib/supabase/challenges'
import type { ActiveChallenge } from '@/lib/supabase/challenges-types'
import { createNotification } from '@/lib/supabase/notifications'

/**
 * Webhook para recibir mensajes de Evolution API
 * POST /api/webhooks/whatsapp
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar API Key (seguridad)
    const apiKey = request.headers.get('apikey')
    const expectedApiKey = process.env.EVOLUTION_API_KEY

    if (!expectedApiKey || apiKey !== expectedApiKey) {
      console.error('Invalid API key')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parsear el payload del webhook
    const payload: EvolutionWebhookPayload = await request.json()

    console.log('Webhook received:', {
      event: payload.event,
      instance: payload.instance,
      sender: payload.sender,
    })

    // 3. Validar que sea un evento de mensaje
    if (payload.event !== 'messages.upsert') {
      return NextResponse.json({
        message: 'Event ignored',
        event: payload.event,
      })
    }

    // 4. Validar que el mensaje no sea del bot (fromMe = false)
    if (payload.data.key.fromMe) {
      console.log('Message from bot, ignoring')
      return NextResponse.json({
        message: 'Message from bot, ignored',
      })
    }

    // 5. Validar que sea un mensaje de usuario individual (no grupo)
    const remoteJid = payload.data.key.remoteJid
    if (!isUserMessage(remoteJid)) {
      console.log('Not a user message, ignoring')
      return NextResponse.json({
        message: 'Not a user message, ignored',
      })
    }

    // 6. Extraer información del cliente
    const phone = extractPhoneNumber(remoteJid)
    const name = payload.data.pushName || 'Usuario'
    const messageText = extractMessageText(payload.data.message)

    console.log('Processing message:', {
      phone,
      name,
      message: messageText,
    })

    // 7. Obtener o crear el cliente en la base de datos
    const { customer, isNew } = await getOrCreateCustomer(phone, name)

    // 8. Enrutar mensaje al handler apropiado
    await routeMessage({
      phone,
      message: messageText || '',
      customerName: name,
      customer,
      isNew,
    })

    // 9. Responder con éxito
    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        total_points: customer.total_points,
      },
      isNew,
      message: 'Message processed successfully',
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Contexto del mensaje para handlers
 */
interface MessageContext {
  phone: string
  message: string
  customerName: string
  customer: any
  isNew: boolean
}

/**
 * Enruta el mensaje al handler apropiado según el contenido
 */
async function routeMessage(context: MessageContext): Promise<void> {
  const lowerMessage = context.message.toLowerCase().trim()

  // Detectar check-in primero (prioridad máxima)
  const checkInInfo = parseCheckInMessage(context.message)
  if (checkInInfo.isCheckIn && checkInInfo.businessName && checkInInfo.branchName) {
    await handleCheckIn(context, checkInInfo)
    return
  }

  // Comandos del cliente
  if (lowerMessage === 'puntos' || lowerMessage === 'points') {
    await handlePointsQuery(context)
    return
  }

  if (lowerMessage === 'retos' || lowerMessage === 'challenges') {
    await handleChallengesQuery(context)
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

  // Si es nuevo cliente, enviar bienvenida primero
  if (context.isNew) {
    await sendWelcomeMessage(context.phone, context.customerName)
    return
  }

  // Parsear información de negocio y sucursal (solo si tiene formato específico)
  const businessInfo = parseBusinessMessage(context.message)
  if (businessInfo.branchName) {
    // Solo si tiene separador " - " considerarlo como info de negocio
    await handleBusinessInfo(context, businessInfo)
    return
  }

  // Mensaje desconocido - enviar ayuda
  await handleHelpCommand(context)
}

/**
 * Handler para consulta de puntos
 */
async function handlePointsQuery(context: MessageContext): Promise<void> {
  try {
    // Usar server client para bypasear RLS
    const supabase = createServerClient()

    // Obtener todos los negocios donde está registrado el cliente
    const businessRelationships = await getBusinessesByCustomer(context.customer.id, supabase)

    if (!businessRelationships || businessRelationships.length === 0) {
      const message = `⭐ *Balance de Puntos*

Hola ${context.customerName},

Aún no tienes puntos registrados en ningún negocio.

Comienza a acumular puntos visitando nuestras sucursales y escaneando el código QR. 🎁`

      const client = getEvolutionClient()
      await client.sendTextMessage({
        phone: context.phone,
        message,
      })
      return
    }

    // Calcular totales generales
    const totalPointsAllBusinesses = businessRelationships.reduce(
      (sum, rel) => sum + (rel.total_points || 0),
      0
    )
    const totalVisitsAllBusinesses = businessRelationships.reduce(
      (sum, rel) => sum + (rel.visits_count || 0),
      0
    )

    // Construir mensaje con desglose por negocio
    let message = `⭐ *Balance de Puntos*

Hola ${context.customerName}, aquí está tu resumen:

📊 *Total general:* ${totalPointsAllBusinesses} puntos
🏪 *Visitas totales:* ${totalVisitsAllBusinesses} visitas
🏢 *Negocios registrados:* ${businessRelationships.length}

━━━━━━━━━━━━━━━━
*Desglose por negocio:*
`

    businessRelationships.forEach((rel, index) => {
      message += `\n${index + 1}. *${rel.business_name || 'Negocio'}*`
      message += `\n   📍 ${rel.business_address || 'N/A'}`
      message += `\n   ⭐ ${rel.total_points || 0} puntos`
      message += `\n   🏪 ${rel.visits_count || 0} visitas`
      if (index < businessRelationships.length - 1) {
        message += '\n'
      }
    })

    message += `\n━━━━━━━━━━━━━━━━

¡Sigue acumulando puntos para canjear por gift cards! 🎁`

    const client = getEvolutionClient()
    await client.sendTextMessage({
      phone: context.phone,
      message,
    })

    console.log(`✅ Points query responded for ${context.phone}`)
  } catch (error) {
    console.error('Error handling points query:', error)
  }
}

/**
 * Handler para comando de ayuda
 */
async function handleHelpCommand(context: MessageContext): Promise<void> {
  try {
    await sendHelpMessage(context.phone)
    console.log(`✅ Help message sent to ${context.phone}`)
  } catch (error) {
    console.error('Error handling help command:', error)
  }
}

/**
 * Handler para opt-out (darse de baja)
 */
async function handleOptOut(context: MessageContext): Promise<void> {
  try {
    // Desactivar cliente y marcar opt-out de marketing
    await updateCustomer(context.phone, {
      is_active: false,
      opt_in_marketing: false,
      blocked_reason: `Opted out on ${new Date().toISOString()}`,
    })

    const message = `✅ Has sido dado de baja del programa.

Ya no recibirás mensajes automáticos de nuestra parte.

Si cambias de opinión, simplemente envíanos un mensaje y te reactivaremos. ¡Gracias por participar!`

    const client = getEvolutionClient()
    await client.sendTextMessage({
      phone: context.phone,
      message,
    })

    console.log(`✅ Customer ${context.phone} opted out`)
  } catch (error) {
    console.error('Error handling opt-out:', error)
  }
}

/**
 * Handler para consulta de retos disponibles
 */
async function handleChallengesQuery(context: MessageContext): Promise<void> {
  try {
    // Usar server client para bypasear RLS
    const supabase = createServerClient()

    // Obtener todos los negocios donde está registrado el cliente
    const businessRelationships = await getBusinessesByCustomer(context.customer.id, supabase)

    if (!businessRelationships || businessRelationships.length === 0) {
      const message = `🎯 *Retos Disponibles*

Hola ${context.customerName},

Aún no has hecho check-in en ningún negocio.

Para ver los retos disponibles, primero debes visitar un negocio y escanear el código QR para hacer check-in. 📱

Una vez registrado, podrás ver todos los retos disponibles y ganar puntos extra. 🎁`

      const client = getEvolutionClient()
      await client.sendTextMessage({
        phone: context.phone,
        message,
      })
      return
    }

    // Obtener IDs de todas las sucursales donde el cliente está registrado
    const branchIds = businessRelationships
      .map(rel => rel.business_id)
      .filter((id): id is number => id !== null && id !== undefined)

    if (branchIds.length === 0) {
      const message = `🎯 *Retos Disponibles*

No pudimos encontrar información de tus sucursales registradas.

Por favor intenta hacer check-in nuevamente. 📱`

      const client = getEvolutionClient()
      await client.sendTextMessage({
        phone: context.phone,
        message,
      })
      return
    }

    // Obtener todos los retos activos para estos negocios
    const challengesMap = await getActiveChallengesForBusinesses(branchIds, supabase)

    // Si no hay retos en ningún negocio
    if (challengesMap.size === 0) {
      const message = `🎯 *Retos Disponibles*

Hola ${context.customerName},

Actualmente no hay retos activos en los negocios donde estás registrado.

¡Estate atento! Los negocios publican nuevos retos regularmente. 🎁

Envía *PUNTOS* para ver tu balance actual.`

      const client = getEvolutionClient()
      await client.sendTextMessage({
        phone: context.phone,
        message,
      })
      return
    }

    // Construir mensaje con retos agrupados por negocio
    let message = `🎯 *Retos Disponibles*\n\nHola ${context.customerName}, estos son los retos activos en tus negocios:\n\n`

    let hasAnyChallenges = false

    businessRelationships.forEach((rel, index) => {
      if (!rel.business_id) return

      const challenges = challengesMap.get(rel.business_id)

      if (challenges && challenges.length > 0) {
        hasAnyChallenges = true

        message += `━━━━━━━━━━━━━━━━\n`
        message += `🏢 *${rel.business_name || 'Negocio'}*\n`
        message += `📍 ${rel.business_address || 'N/A'}\n\n`

        challenges.forEach((challenge, cIndex) => {
          message += `${cIndex + 1}. *${challenge.name}*\n`

          if (challenge.description) {
            message += `   📝 ${challenge.description}\n`
          }

          message += `   ⭐ Puntos: ${challenge.points}\n`

          if (cIndex < challenges.length - 1) {
            message += '\n'
          }
        })

        message += '\n'
      }
    })

    if (!hasAnyChallenges) {
      message = `🎯 *Retos Disponibles*

Hola ${context.customerName},

Actualmente no hay retos activos en los negocios donde estás registrado.

¡Estate atento! Los negocios publican nuevos retos regularmente. 🎁`
    } else {
      message += `━━━━━━━━━━━━━━━━\n`
      message += `💡 Completa estos retos para ganar más puntos.\n\n`
      message += `Envía *PUNTOS* para ver tu balance actual.`
    }

    const client = getEvolutionClient()
    await client.sendTextMessage({
      phone: context.phone,
      message,
    })

    console.log(`✅ Challenges query responded for ${context.phone}`)
  } catch (error) {
    console.error('Error handling challenges query:', error)

    // Enviar mensaje de error
    try {
      const client = getEvolutionClient()
      await client.sendTextMessage({
        phone: context.phone,
        message: '❌ Hubo un error al obtener los retos. Por favor intenta nuevamente más tarde.',
      })
    } catch (msgError) {
      console.error('Error sending error message:', msgError)
    }
  }
}

/**
 * Formatea un array de retos en un mensaje legible de WhatsApp
 */
function formatChallengesMessage(businessName: string, challenges: ActiveChallenge[]): string {
  if (challenges.length === 0) {
    return ''
  }

  const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

  let message = `🎯 *Retos Disponibles en ${businessName}*\n\n`

  challenges.forEach((challenge, index) => {
    const emoji = index < 10 ? emojiNumbers[index] : `${index + 1}.`

    message += `${emoji} *${challenge.name}*\n`

    if (challenge.description) {
      message += `   📝 ${challenge.description}\n`
    }

    message += `   ⭐ Puntos: ${challenge.points}\n`

    // Agregar separador entre retos excepto el último
    if (index < challenges.length - 1) {
      message += '\n'
    }
  })

  message += `\n━━━━━━━━━━━━━━━━\n`
  message += `💡 Completa estos retos para ganar más puntos.`

  return message
}

/**
 * Handler para check-in en sucursal
 */
async function handleCheckIn(
  context: MessageContext,
  checkInInfo: {
    businessName: string
    branchName: string
    businessId?: string
    branchId?: string
  }
): Promise<void> {
  try {
    const { businessName, branchName } = checkInInfo

    console.log(`🏪 Check-in detected for ${context.phone}:`, {
      businessName,
      branchName,
    })

    // Usar server client para bypasear RLS
    const supabase = createServerClient()

    // 1. Buscar el negocio PADRE en business_settings por nombre
    console.log(`🔍 Buscando negocio con nombre: "${businessName}"`)

    const { data: businessSettings, error: businessSettingsError } = await supabase
      .from('business_settings')
      .select('id, name')
      .ilike('name', businessName)
      .single()

    if (businessSettingsError || !businessSettings) {
      console.error('❌ Business settings not found:', businessSettingsError)
      console.error('❌ Nombre buscado:', businessName)
      console.error('❌ Error details:', businessSettingsError?.message, businessSettingsError?.code)

      // Intentar listar todos los business_settings para debug
      const { data: allBusinessSettings } = await supabase
        .from('business_settings')
        .select('id, name')
      console.log('📋 Todos los negocios en la DB:', allBusinessSettings)

      // Enviar mensaje de error al cliente
      const client = getEvolutionClient()
      await client.sendTextMessage({
        phone: context.phone,
        message: `❌ *Negocio no encontrado*

Lo sentimos, no pudimos encontrar el negocio "${businessName}" en nuestro sistema.

Por favor verifica el nombre del negocio y vuelve a intentar, o contacta con el personal.`,
      })
      return
    }

    console.log('✅ Business settings found:', businessSettings)

    // 2. Buscar la SUCURSAL específica que pertenece a este negocio
    const { data: branch, error: branchError } = await supabase
      .from('businesses')
      .select('id, name, address')
      .eq('business_settings_id', businessSettings.id)
      .ilike('name', branchName)
      .single()

    if (branchError || !branch) {
      console.warn('⚠️ Branch not found, using business_settings_id only:', branchError)
      // Continuar sin sucursal específica, pero advertir
    } else {
      console.log('✅ Branch found:', branch)
    }

    // 3. Crear o actualizar la relación customer-business con 10 puntos
    const POINTS_PER_CHECKIN = 10
    const { relationship, isNew: isNewRelationship } = await getOrCreateCustomerBusiness(
      context.customer.id,
      businessSettings.id,
      POINTS_PER_CHECKIN,
      branch?.id,
      supabase  // Pasar el server client para bypasear RLS
    )

    console.log(`✅ Customer-Business relationship ${isNewRelationship ? 'created' : 'updated'}:`, {
      customer_id: context.customer.id,
      business_settings_id: businessSettings.id,
      branch_id: branch?.id,
      total_points: relationship.total_points,
      visits_count: relationship.visits_count,
    })

    // 4. Crear notificaciones
    try {
      // Notificación de check-in
      await createNotification({
        business_settings_id: businessSettings.id,
        type: 'checkin',
        title: 'Nuevo check-in',
        message: `${context.customerName} ha hecho check-in en ${branchName}`,
        metadata: {
          customer_id: context.customer.id,
          customer_name: context.customerName,
          customer_phone: context.phone,
          branch_id: branch?.id,
          branch_name: branchName,
          points: POINTS_PER_CHECKIN
        },
        priority: 'normal'
      }, supabase)

      // Si es nuevo cliente, crear notificación adicional
      if (isNewRelationship) {
        await createNotification({
          business_settings_id: businessSettings.id,
          type: 'new_customer',
          title: '¡Nuevo cliente!',
          message: `${context.customerName} se ha registrado por primera vez`,
          metadata: {
            customer_id: context.customer.id,
            customer_name: context.customerName,
            customer_phone: context.phone,
            branch_id: branch?.id,
            branch_name: branchName
          },
          priority: 'high'
        }, supabase)
      }

      console.log('✅ Notifications created successfully')
    } catch (notifError) {
      console.error('⚠️ Error creating notifications:', notifError)
      // No bloquear el check-in si falla la notificación
    }

    // 5. Enviar mensaje de confirmación con puntos del negocio específico
    const message = `✅ *Check-in exitoso*

¡Bienvenido a *${businessName}*!
📍 Sucursal: ${branchName}

${isNewRelationship ? `🎉 ¡Es tu primera visita a este negocio! Has sido registrado.\n\n` : ''}🎁 *Puntos ganados:* ${POINTS_PER_CHECKIN} puntos
⭐ *Total de puntos en ${businessName}:* ${relationship.total_points || 0} puntos
🏪 *Visitas a ${businessName}:* ${relationship.visits_count || 0} visitas

¡Gracias por visitarnos! Sigue acumulando puntos para obtener recompensas.

Envía *PUNTOS* para ver tu balance completo.`

    const client = getEvolutionClient()
    await client.sendTextMessage({
      phone: context.phone,
      message,
    })

    console.log(`✅ Check-in processed for ${context.phone} at ${businessName} - ${branchName}`)

    // 5. Enviar mensaje automático con retos disponibles (si existen)
    if (branch?.id) {
      try {
        const challenges = await getActiveChallengesByBusiness(branch.id, supabase)

        if (challenges.length > 0) {
          const challengesMessage = formatChallengesMessage(businessName, challenges)

          await client.sendTextMessage({
            phone: context.phone,
            message: challengesMessage,
          })

          console.log(`✅ Challenges message sent to ${context.phone} (${challenges.length} challenges)`)
        } else {
          console.log(`ℹ️ No active challenges found for branch ${branch.id}`)
        }
      } catch (challengeError) {
        // No interrumpir el flujo si hay error al enviar retos
        console.error('Error sending challenges message:', challengeError)
      }
    }
  } catch (error) {
    console.error('Error handling check-in:', error)

    // Enviar mensaje de error al cliente
    try {
      const client = getEvolutionClient()
      await client.sendTextMessage({
        phone: context.phone,
        message: '❌ Hubo un error al procesar tu check-in. Por favor intenta nuevamente o contacta con el personal.',
      })
    } catch (msgError) {
      console.error('Error sending error message:', msgError)
    }
  }
}

/**
 * Handler para información de negocio y sucursal
 */
async function handleBusinessInfo(
  context: MessageContext,
  businessInfo: { businessName: string | null; branchName: string | null }
): Promise<void> {
  try {
    // Simplemente enviar confirmación
    // La información se puede guardar en otra tabla si es necesario
    if (businessInfo.businessName) {
      await sendBusinessConfirmation(
        context.phone,
        businessInfo.businessName,
        businessInfo.branchName || undefined
      )
    }

    console.log(`✅ Business info processed for ${context.phone}`)
  } catch (error) {
    console.error('Error handling business info:', error)
  }
}

/**
 * Parsea el mensaje para extraer información del negocio y sucursal
 * Solo considera válido si tiene el formato "Negocio - Sucursal"
 */
function parseBusinessMessage(message: string): {
  businessName: string | null
  branchName: string | null
} {
  if (!message || !message.trim()) {
    return { businessName: null, branchName: null }
  }

  // Buscar patrón: "Negocio - Sucursal" (debe tener el separador " - ")
  const separatorMatch = message.match(/^(.+?)\s*-\s*(.+)$/)

  if (separatorMatch) {
    return {
      businessName: separatorMatch[1].trim(),
      branchName: separatorMatch[2].trim(),
    }
  }

  // Si no tiene separador, no es información de negocio
  return {
    businessName: null,
    branchName: null,
  }
}

/**
 * GET endpoint para verificar que la API está funcionando
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'WhatsApp webhook endpoint is running',
    timestamp: new Date().toISOString(),
  })
}
