import { clearSessionCookie, sendJson } from '../../server/admin-auth.js'

export default function adminLogout(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }
  return sendJson(response, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie(), 'Cache-Control': 'no-store' })
}
