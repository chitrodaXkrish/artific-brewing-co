function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase server credentials are not configured.')
  return { url, key }
}

export async function supabaseRequest(table, { method = 'GET', query = {}, body, prefer } = {}) {
  const { url, key } = supabaseConfig()
  const params = new URLSearchParams(query)
  const endpoint = `${url}/rest/v1/${table}${params.size ? `?${params}` : ''}`
  const headers = {
    apikey: key,
    'Content-Type': 'application/json',
  }
  if (!key.startsWith('sb_secret_') && !key.startsWith('sb_publishable_')) {
    headers.Authorization = `Bearer ${key}`
  }
  if (prefer) headers.Prefer = prefer
  const response = await fetch(endpoint, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    console.error(`Supabase ${method} ${table} failed with status:`, response.status)
    throw new Error('Could not access the store database.')
  }
  return result
}
