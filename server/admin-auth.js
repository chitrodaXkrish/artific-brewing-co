import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE = 'artific_admin_session'
const SESSION_SECONDS = 8 * 60 * 60

export async function readJson(request) {
  if (request.body && typeof request.body === 'object') return request.body
  let raw = ''
  for await (const chunk of request) {
    raw += chunk
    if (raw.length > 24_000) throw new Error('Request too large')
  }
  return JSON.parse(raw || '{}')
}

export function sendJson(response, status, data, headers = {}) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  for (const [name, value] of Object.entries(headers)) response.setHeader(name, value)
  response.end(JSON.stringify(data))
}

function equalSecret(left, right) {
  const a = Buffer.from(String(left))
  const b = Buffer.from(String(right))
  return a.length === b.length && timingSafeEqual(a, b)
}

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

export function issueSession(email) {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('Admin session secret is not configured.')
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + SESSION_SECONDS * 1000 })).toString('base64url')
  const token = `${payload}.${sign(payload, secret)}`
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${SESSION_SECONDS}${secure}`
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0${secure}`
}

export function verifySession(request) {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) return false
  const cookieHeader = request.headers?.cookie || ''
  const token = cookieHeader.split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1)
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !equalSecret(signature, sign(payload, secret))) return false
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return session.email === process.env.ADMIN_EMAIL?.toLowerCase() && Number(session.exp) > Date.now()
  } catch {
    return false
  }
}

export default async function adminLogin(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return sendJson(response, 503, { error: 'Admin sign-in is not configured.' })
  }
  let payload
  try {
    payload = await readJson(request)
  } catch {
    return sendJson(response, 400, { error: 'Enter a valid email and password.' })
  }

  const email = String(payload.email || '').trim().toLowerCase()
  const password = String(payload.password || '')
  if (!equalSecret(email, process.env.ADMIN_EMAIL.toLowerCase()) || !equalSecret(password, process.env.ADMIN_PASSWORD)) {
    return sendJson(response, 401, { error: 'Email or password is incorrect.' })
  }

  return sendJson(response, 200, { ok: true }, { 'Set-Cookie': issueSession(email), 'Cache-Control': 'no-store' })
}
