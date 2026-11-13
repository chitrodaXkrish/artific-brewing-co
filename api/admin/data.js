import { sendJson, verifySession } from '../../server/admin-auth.js'
import { supabaseRequest } from '../../server/supabase.js'

const rangeStart = (range) => {
  const days = { '7d': 7, '30d': 30, '90d': 90 }[range]
  if (!days) return null
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

const distinct = values => new Set(values.filter(Boolean)).size
const countBy = (items, getKey) => {
  const counts = new Map()
  items.forEach(item => {
    const key = getKey(item) || 'Direct / unknown'
    counts.set(key, (counts.get(key) || 0) + 1)
  })
  return [...counts].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

function buildAnalytics(events, orders, waitlist) {
  const visitorsBySession = new Map()
  const sessionsByVisitor = new Map()
  const sessionEvents = new Map()
  const devicesByVisitor = new Map()
  const pageViews = events.filter(event => event.event_name === 'page_view')

  for (const event of events) {
    if (!sessionEvents.has(event.session_id)) sessionEvents.set(event.session_id, [])
    sessionEvents.get(event.session_id).push(event)
    if (event.visitor_id) {
      visitorsBySession.set(event.session_id, event.visitor_id)
      if (!devicesByVisitor.has(event.visitor_id)) devicesByVisitor.set(event.visitor_id, event.device || 'desktop')
      if (!sessionsByVisitor.has(event.visitor_id)) sessionsByVisitor.set(event.visitor_id, new Set())
      sessionsByVisitor.get(event.visitor_id).add(event.session_id)
    }
  }

  const sessionLengths = [...sessionEvents.values()].map(session => {
    const times = session.map(event => new Date(event.created_at).getTime()).filter(Number.isFinite)
    return times.length > 1 ? Math.max(...times) - Math.min(...times) : 0
  })
  const sessionCount = distinct(pageViews.map(event => event.session_id))
  const visitorCount = distinct(events.map(event => event.visitor_id))
  const bounces = [...sessionEvents.entries()].filter(([sessionId, session]) => visitorsBySession.has(sessionId) && session.filter(event => event.event_name === 'page_view').length === 1).length
  const mobileVisitors = distinct(events.filter(event => event.device === 'mobile').map(event => event.visitor_id))
  const ordersRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const checkoutStarts = events.filter(event => event.event_name === 'checkout_start').length
  const addToCart = events.filter(event => event.event_name === 'add_to_cart').length
  const waitlistConversions = waitlist.length

  const sourceItems = pageViews.map(event => ({ source: event.source || 'Direct / unknown' }))
  const pageItems = pageViews.map(event => ({ path: event.page_path || '/' }))
  const productViews = events.filter(event => ['product_view', 'add_to_cart'].includes(event.event_name))
  const productItems = productViews.map(event => ({ product: event.properties?.productName || event.properties?.productId || 'Unknown product' }))
  const deviceItems = [...devicesByVisitor.values()].map(device => ({ device }))

  return {
    overview: {
      grossSales: ordersRevenue,
      orders: orders.length,
      averageOrderValue: orders.length ? ordersRevenue / orders.length : 0,
      revenuePerVisitor: visitorCount ? ordersRevenue / visitorCount : 0,
      waitlist: waitlistConversions,
      conversionRate: visitorCount ? (orders.length / visitorCount) * 100 : 0,
      checkoutConversionRate: checkoutStarts ? (orders.length / checkoutStarts) * 100 : 0,
      cartAbandonmentRate: checkoutStarts ? (Math.max(0, checkoutStarts - orders.length) / checkoutStarts) * 100 : 0,
      sessions: sessionCount,
      uniqueVisitors: visitorCount,
      pageViews: pageViews.length,
      bounceRate: sessionCount ? (bounces / sessionCount) * 100 : 0,
      averageSessionDuration: `${Math.floor((sessionLengths.reduce((sum, duration) => sum + duration, 0) / Math.max(1, sessionLengths.length)) / 60000)}m ${String(Math.floor((sessionLengths.reduce((sum, duration) => sum + duration, 0) / Math.max(1, sessionLengths.length)) / 1000) % 60).padStart(2, '0')}s`,
      addToCart,
      checkoutStarts,
      returningVisitors: [...sessionsByVisitor.values()].filter(sessions => sessions.size > 1).length,
      mobileShare: visitorCount ? (mobileVisitors / visitorCount) * 100 : 0,
      waitlistConversion: visitorCount ? (waitlistConversions / visitorCount) * 100 : 0,
    },
    sources: countBy(sourceItems, item => item.source),
    pages: countBy(pageItems, item => item.path),
    products: countBy(productItems, item => item.product),
    orderStatuses: countBy(orders, order => order.status),
    devices: countBy(deviceItems, item => item.device).map(item => ({ ...item, value: visitorCount ? Math.round((item.value / visitorCount) * 100) : 0 })),
  }
}

export default async function adminData(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }
  if (!verifySession(request)) return sendJson(response, 401, { error: 'Sign in required.' })

  try {
    const range = new URL(request.url, 'http://localhost').searchParams.get('range') || '30d'
    const start = rangeStart(range)
    const dateFilter = start ? { created_at: `gte.${start}` } : {}
    const [waitlistRows, orderRows, eventRows] = await Promise.all([
      supabaseRequest('waitlist_entries', { query: { select: '*', order: 'created_at.desc', limit: '1000', ...dateFilter } }),
      supabaseRequest('preorders', { query: { select: '*', order: 'created_at.desc', limit: '1000', ...dateFilter } }),
      supabaseRequest('analytics_events', { query: { select: '*', order: 'created_at.desc', limit: '10000', ...dateFilter } }),
    ])

    const waitlist = waitlistRows.map(entry => ({ ...entry, createdAt: entry.created_at, status: entry.status }))
    const orders = orderRows.map(order => ({
      id: order.id,
      createdAt: order.created_at,
      customer: { name: order.customer_name, email: order.customer_email, phone: order.customer_phone },
      items: order.items,
      shipping: order.shipping,
      payment: { method: order.payment_method, status: order.payment_status },
      total: order.total,
      status: order.status,
    }))

    return sendJson(response, 200, { waitlist, orders, analytics: buildAnalytics(eventRows, orderRows, waitlistRows) }, { 'Cache-Control': 'no-store' })
  } catch (error) {
    return sendJson(response, 503, { error: error.message || 'Could not load store data.' })
  }
}
