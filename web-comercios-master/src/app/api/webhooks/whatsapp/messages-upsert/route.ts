/**
 * WhatsApp Webhook Handler - Messages Upsert Event
 *
 * This endpoint handles messages when Evolution API has "Webhook by Events" enabled.
 * It forwards all requests to the main webhook handler.
 */

// Re-export the handlers from the parent route
export { POST, GET } from '../route'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
