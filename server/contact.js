const INBOX = 'contact@artificbrewingco.shop'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function readBody(request) {
  if (request.body && typeof request.body === 'object') return request.body

  let raw = ''
  for await (const chunk of request) {
    raw += chunk
    if (raw.length > 20_000) throw new Error('Request too large')
  }
  return JSON.parse(raw || '{}')
}

function respond(response, status, payload) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

export default async function handleContact(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return respond(response, 405, { error: 'Method not allowed.' })
  }

  let payload
  try {
    payload = await readBody(request)
  } catch {
    return respond(response, 400, { error: 'Please submit a valid contact form.' })
  }

  const name = String(payload.name || '').trim().slice(0, 120)
  const email = String(payload.email || '').trim().slice(0, 254)
  const message = String(payload.message || '').trim().slice(0, 6000)
  if (String(payload.website || '').trim()) return respond(response, 200, { ok: true })
  if (!name || !EMAIL_PATTERN.test(email) || !message) {
    return respond(response, 400, { error: 'Add your name, a valid email, and a message.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return respond(response, 503, { error: 'Contact email is temporarily unavailable.' })

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Artific Brewing Co. <contact@artificbrewingco.shop>',
        to: [INBOX],
        reply_to: email,
        subject: `Website contact from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    })

    if (!resendResponse.ok) {
      const providerError = await resendResponse.json().catch(() => ({}))
      console.error('Resend contact email rejected:', {
        status: resendResponse.status,
        code: providerError.name || providerError.code || 'unknown',
        message: providerError.message || 'No provider details returned.',
      })
      return respond(response, 502, { error: 'We couldn’t send your message. Please try again or contact us by phone.' })
    }

    return respond(response, 200, { ok: true })
  } catch (error) {
    console.error('Resend contact email request failed:', error.message)
    return respond(response, 502, { error: 'We couldn’t send your message. Please try again or contact us by phone.' })
  }
}
