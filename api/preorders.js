import { readJson, sendJson } from '../server/admin-auth.js'
import { supabaseRequest } from '../server/supabase.js'

const text = (value, max = 200) => String(value || '').trim().slice(0, max)
const PRODUCT_NAMES = { original: 'Original', 'dark-chocolate': 'Dark Chocolate', 'vanilla-oat': 'Vanilla Oat' }
const PACK_PRICES = { 4: 9.99, 12: 29, 24: 54 }

export default async function createPreorder(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }
  try {
    const payload = await readJson(request)
    const customer = payload.customer || {}
    const shipping = payload.shipping || {}
    const email = text(customer.email, 254).toLowerCase()
    const rawItems = Array.isArray(payload.items) ? payload.items.slice(0, 20) : []
    if (rawItems.some(item => !PRODUCT_NAMES[text(item.productId, 80)] || !PACK_PRICES[Number(item.pack)])) {
      return sendJson(response, 400, { error: 'One of the selected products is unavailable.' })
    }
    const items = rawItems.map(item => {
      const productId = text(item.productId, 80)
      const pack = Number(item.pack)
      const quantity = Math.max(1, Math.min(100, Number(item.quantity) || 1))
      const subscribe = Boolean(item.subscribe)
      const unitPrice = PACK_PRICES[pack]
      const discountedPrice = subscribe ? unitPrice * 0.85 : unitPrice
      return {
        productId,
        name: PRODUCT_NAMES[productId],
        pack,
        quantity,
        unitPrice: Number(discountedPrice.toFixed(2)),
        subscribe,
        lineTotal: Number((discountedPrice * quantity).toFixed(2)),
      }
    })
    if (!text(customer.firstName, 80) || !text(customer.lastName, 80) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !text(shipping.address, 250) || !text(shipping.city, 100) || !text(shipping.postalCode, 32) || !items.length) {
      return sendJson(response, 400, { error: 'Please complete your contact, shipping, and order details.' })
    }

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
    const shippingFee = shipping.method === 'express' ? 9.99 : 0
    const row = await supabaseRequest('preorders', {
      method: 'POST',
      body: {
        customer_name: `${text(customer.firstName, 80)} ${text(customer.lastName, 80)}`,
        customer_email: email,
        customer_phone: text(customer.phone, 40) || null,
        items,
        shipping: {
          address: text(shipping.address, 250),
          city: text(shipping.city, 100),
          region: text(shipping.region, 100),
          postalCode: text(shipping.postalCode, 32),
          country: text(shipping.country, 80),
          method: shipping.method === 'express' ? 'Express' : 'Standard',
        },
        payment_method: text(payload.paymentMethod, 40) || 'Pending',
        payment_status: 'not_collected',
        status: 'pre-order',
        subtotal,
        shipping_fee: shippingFee,
        tax: 0,
        total: subtotal + shippingFee,
        currency: 'INR',
      },
      prefer: 'return=representation',
    })
    return sendJson(response, 201, { ok: true, id: row?.[0]?.id || null })
  } catch (error) {
    return sendJson(response, 503, { error: error.message || 'Could not record the pre-order. Please try again.' })
  }
}
