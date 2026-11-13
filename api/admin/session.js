import { sendJson, verifySession } from '../../server/admin-auth.js'

export default function adminSession(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }
  return verifySession(request)
    ? sendJson(response, 200, { ok: true }, { 'Cache-Control': 'no-store' })
    : sendJson(response, 401, { error: 'Sign in required.' })
}
