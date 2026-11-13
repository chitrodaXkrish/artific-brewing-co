const pageViewsSent = new Set()

function getId(storage, key) {
  let id = storage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    storage.setItem(key, id)
  }
  return id
}

export function track(eventName, properties = {}) {
  try {
    const pageKey = `${window.location.pathname}${window.location.hash}`
    if (eventName === 'page_view') {
      if (pageViewsSent.has(pageKey)) return
      pageViewsSent.add(pageKey)
    }
    const visitorId = getId(localStorage, 'artific-visitor')
    const sessionId = getId(sessionStorage, 'artific-session')
    let referrer = ''
    try { referrer = document.referrer ? new URL(document.referrer).origin : '' } catch { referrer = '' }
    let source = 'Direct / unknown'
    const campaignSource = new URLSearchParams(window.location.search).get('utm_source')
    if (campaignSource) source = campaignSource.slice(0, 120)
    else if (referrer) {
      try { source = new URL(referrer).hostname.replace(/^www\./, '') } catch { source = 'Referral' }
    }
    const width = window.innerWidth
    const device = width < 760 ? 'mobile' : width < 1100 ? 'tablet' : 'desktop'
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        visitorId,
        sessionId,
        pagePath: pageKey,
        referrer,
        source,
        device,
        properties,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Analytics storage may be unavailable in private browsing; storefront remains usable.
  }
}
