import { readJson, sendJson } from '../server/admin-auth.js'
import { supabaseRequest } from '../server/supabase.js'

export default async function addWaitlistEntry(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }
  try {
    const payload = await readJson(request)
    const email = String(payload.email || '').trim().toLowerCase().slice(0, 254)
    const name = String(payload.name || '').trim().slice(0, 120) || null
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(response, 400, { error: 'Enter a valid email address.' })

    await supabaseRequest('waitlist_entries', {
      method: 'POST',
      query: { on_conflict: 'email' },
      body: { email, name, source: 'website' },
      prefer: 'resolution=ignore-duplicates,return=minimal',
    })
    return sendJson(response, 200, { ok: true })
  } catch (error) {
    return sendJson(response, 503, { error: error.message || 'Could not join the waitlist.' })
  }
}
