import { readJson, sendJson } from '../server/admin-auth.js'
import { supabaseRequest } from '../server/supabase.js'

const ALLOWED_EVENTS = new Set(['page_view', 'product_view', 'add_to_cart', 'checkout_start', 'shipping_info', 'waitlist_signup', 'preorder_created'])

export default async function recordAnalyticsEvent(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }
  try {
    const payload = await readJson(request)
    const eventName = String(payload.eventName || '')
    const visitorId = String(payload.visitorId || '').slice(0, 80)
    const sessionId = String(payload.sessionId || '').slice(0, 80)
    if (!ALLOWED_EVENTS.has(eventName) || !visitorId || !sessionId) return sendJson(response, 400, { error: 'Invalid analytics event.' })

    const rawProperties = payload.properties && typeof payload.properties === 'object' ? payload.properties : {}
    const properties = {
      productId: String(rawProperties.productId || '').slice(0, 80),
      productName: String(rawProperties.productName || '').slice(0, 120),
      quantity: Math.max(0, Math.min(1000, Number(rawProperties.quantity) || 0)),
      pack: Math.max(0, Math.min(100, Number(rawProperties.pack) || 0)),
      value: Math.max(0, Math.min(100000, Number(rawProperties.value) || 0)),
      items: Math.max(0, Math.min(100, Number(rawProperties.items) || 0)),
    }
    await supabaseRequest('analytics_events', {
      method: 'POST',
      body: {
        event_name: eventName,
        visitor_id: visitorId,
        session_id: sessionId,
        page_path: String(payload.pagePath || '/').slice(0, 300),
        referrer: String(payload.referrer || '').slice(0, 500) || null,
        source: String(payload.source || 'Direct / unknown').slice(0, 120),
        device: ['mobile', 'tablet', 'desktop'].includes(payload.device) ? payload.device : 'desktop',
        properties,
      },
      prefer: 'return=minimal',
    })
    return sendJson(response, 202, { ok: true })
  } catch (error) {
    return sendJson(response, 503, { error: error.message || 'Could not record analytics.' })
  }
}
