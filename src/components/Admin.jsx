import { useCallback, useEffect, useMemo, useState } from 'react'

const EMPTY_DATA = { waitlist: [], orders: [], analytics: { overview: {}, sources: [], pages: [], products: [], devices: [] } }
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '◫' },
  { id: 'waitlist', label: 'Waitlist', icon: '✳' },
  { id: 'orders', label: 'Pre-orders', icon: '▤' },
  { id: 'analytics', label: 'Analytics', icon: '⌁' },
]

const money = (value = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)
const date = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'

function exportCsv(filename, rows) {
  const cell = value => {
    const raw = String(value ?? '')
    const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw
    return `"${safe.replaceAll('"', '""')}"`
  }
  const csv = rows.map(row => row.map(cell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Sign-in failed.')
      onLogin()
    } catch (err) {
      setError(err.message || 'Could not sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <img src="/logo.png" alt="Artific Brewing Co." />
        <p className="admin-kicker">STORE MANAGEMENT</p>
        <h1>Welcome back.</h1>
        <p className="admin-login__intro">Sign in to manage customers, pre-orders, and store performance.</p>
        <label>Email address<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<span aria-hidden="true">↗</span></button>
      </form>
    </main>
  )
}

function Metric({ label, value, note, icon }) {
  return <article className="admin-metric"><div className="admin-metric__top"><span>{label}</span><span aria-hidden="true">{icon}</span></div><strong>{value}</strong>{note && <small>{note}</small>}</article>
}

function Empty({ title, copy }) {
  return <div className="admin-empty"><span aria-hidden="true">✳</span><strong>{title}</strong><p>{copy}</p></div>
}

function Waitlist({ entries, search }) {
  const filtered = entries.filter(entry => `${entry.name || ''} ${entry.email || ''} ${entry.phone || ''}`.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="admin-table-wrap">
      <table className="admin-table"><thead><tr><th>Customer</th><th>Joined</th><th>Source</th><th>Status</th></tr></thead>
        <tbody>{filtered.map((entry, index) => <tr key={entry.id || entry.email || index}><td><strong>{entry.name || entry.email}</strong><small>{entry.email}{entry.phone ? ` · ${entry.phone}` : ''}</small></td><td>{date(entry.createdAt)}</td><td>{entry.source || 'Website'}</td><td><span className="admin-pill">{entry.status || 'Waiting'}</span></td></tr>)}</tbody>
      </table>
      {!filtered.length && <Empty title={search ? 'No matching entries' : 'No waitlist entries yet'} copy={search ? 'Try another name or email.' : 'New website signups will appear here.'} />}
    </div>
  )
}

function Orders({ orders, search }) {
  const filtered = orders.filter(order => {
    const customer = order.customer || {}
    return `${order.id || ''} ${customer.name || ''} ${customer.email || ''} ${customer.phone || ''}`.toLowerCase().includes(search.toLowerCase())
  })
  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-table--orders"><thead><tr><th>Order</th><th>Customer</th><th>Products</th><th>Ship to</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>{filtered.map((order, index) => {
          const customer = order.customer || {}
          const shipping = order.shipping || {}
          const address = [shipping.address, shipping.city, shipping.region, shipping.postalCode, shipping.country].filter(Boolean).join(', ')
          return <tr key={order.id || index}>
            <td><strong>#{String(order.id || index + 1).slice(-8)}</strong><small>{date(order.createdAt)}</small></td>
            <td><strong>{customer.name || '—'}</strong><small>{customer.email || '—'}{customer.phone ? ` · ${customer.phone}` : ''}</small></td>
            <td>{(order.items || []).map(item => `${item.name} · ${item.pack || item.variant || ''} ${Number(item.pack) === 1 ? 'Piece' : 'Pieces'}${item.quantity ? ` × ${item.quantity}` : ''}`).join('; ') || '—'}</td>
            <td><strong>{shipping.method || 'Standard'}</strong><small>{address || 'Address unavailable'}</small></td>
            <td><strong>{money(order.total)}</strong><small>{order.payment?.method || 'Pre-order'}</small></td>
            <td><span className={`admin-pill admin-pill--${String(order.status || 'pending').toLowerCase()}`}>{order.status || 'Pending'}</span></td>
          </tr>
        })}</tbody>
      </table>
      {!filtered.length && <Empty title={search ? 'No matching orders' : 'No pre-orders yet'} copy={search ? 'Try another order number or customer.' : 'New pre-orders will appear here.'} />}
    </div>
  )
}

function Breakdown({ title, items = [], formatter = value => value }) {
  const max = Math.max(1, ...items.map(item => Number(item.value) || 0))
  return <section className="admin-breakdown"><h3>{title}</h3>{items.length ? items.slice(0, 6).map((item, index) => <div className="admin-breakdown__row" key={item.label || index}><div><span>{item.label || 'Other'}</span><strong>{formatter(item.value)}</strong></div><i><b style={{ width: `${Math.max(3, (Number(item.value) / max) * 100)}%` }} /></i></div>) : <p className="admin-muted">No data for this period.</p>}</section>
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [section, setSection] = useState('overview')
  const [range, setRange] = useState('30d')
  const [search, setSearch] = useState('')
  const [data, setData] = useState(EMPTY_DATA)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setError('')
    const response = await fetch(`/api/admin/data?range=${range}`, { credentials: 'same-origin' })
    if (response.status === 401) { setAuthenticated(false); return }
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Could not load store data.')
    setData({ ...EMPTY_DATA, ...result, analytics: { ...EMPTY_DATA.analytics, ...(result.analytics || {}) } })
    setAuthenticated(true)
  }, [range])

  useEffect(() => {
    let active = true
    fetch('/api/admin/session', { credentials: 'same-origin' })
      .then(async response => {
        if (!active) return
        setAuthenticated(response.ok)
      })
      .catch(err => { if (active) setError(err.message || 'Could not connect to admin services.') })
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (authenticated) loadData().catch(err => setError(err.message || 'Could not load store data.'))
  }, [authenticated, loadData])

  const overview = data.analytics?.overview || {}
  const metrics = useMemo(() => [
    ['Gross sales', money(overview.grossSales), 'Pre-orders in selected period', '↗'],
    ['Pre-orders', overview.orders ?? data.orders.length, 'Orders received', '▤'],
    ['Waitlist', overview.waitlist ?? data.waitlist.length, 'Customer signups', '✳'],
    ['Conversion rate', `${Number(overview.conversionRate || 0).toFixed(1)}%`, 'Visits to pre-orders', '⌁'],
  ], [overview, data.orders.length, data.waitlist.length])

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {})
    setAuthenticated(false)
    setData(EMPTY_DATA)
  }

  if (checking) return <main className="admin-login"><div className="admin-loading">Opening your workspace…</div></main>
  if (!authenticated) return <Login onLogin={() => setAuthenticated(true)} />

  const title = NAV_ITEMS.find(item => item.id === section)?.label || 'Overview'
  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/" aria-label="Artific storefront"><img src="/logo.png" alt="Artific" /></a>
        <p className="admin-kicker">STORE MANAGEMENT</p>
        <nav aria-label="Admin sections">{NAV_ITEMS.map(item => <button key={item.id} className={section === item.id ? 'is-active' : ''} onClick={() => { setSection(item.id); setSearch('') }}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}</nav>
        <div className="admin-sidebar__bottom"><span>Signed in as<br /><strong>admin@wearartific.in</strong></span><button onClick={logout}>Sign out ↗</button></div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar"><div><span>ARTIFIC / ADMIN</span><strong>{title}</strong></div><label>Period<select value={range} onChange={e => setRange(e.target.value)}><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option><option value="all">All time</option></select></label></header>
        <div className="admin-content">
          {error && <p className="admin-banner" role="alert">{error}</p>}
          {section === 'overview' && <>
            <div className="admin-page-heading"><div><p className="admin-kicker">YOUR STORE, AT A GLANCE</p><h1>Good morning.</h1><p>Here’s what’s happening with Artific.</p></div></div>
            <div className="admin-metrics">{metrics.map(([label, value, note, icon]) => <Metric key={label} label={label} value={value} note={note} icon={icon} />)}</div>
            <div className="admin-overview-grid"><section className="admin-panel"><div className="admin-panel__heading"><div><p className="admin-kicker">LATEST ACTIVITY</p><h2>Recent pre-orders</h2></div><button onClick={() => setSection('orders')}>View all ↗</button></div><Orders orders={data.orders.slice(0, 5)} search="" /></section><section className="admin-panel admin-panel--short"><div className="admin-panel__heading"><div><p className="admin-kicker">CUSTOMER LIST</p><h2>Waitlist</h2></div><button onClick={() => setSection('waitlist')}>View all ↗</button></div>{data.waitlist.length ? data.waitlist.slice(0, 6).map((entry, index) => <div className="admin-compact-row" key={entry.id || entry.email || index}><span className="admin-avatar">{String(entry.name || entry.email || '?').slice(0, 1).toUpperCase()}</span><div><strong>{entry.name || entry.email}</strong><small>{entry.email}</small></div><time>{date(entry.createdAt)}</time></div>) : <Empty title="Your list starts here" copy="New signups will show up as they arrive." />}</section></div>
          </>}
          {section === 'waitlist' && <><div className="admin-page-heading"><div><p className="admin-kicker">CUSTOMER COMMUNITY</p><h1>Waitlist</h1><p>{data.waitlist.length} customer signups</p></div><button className="admin-export" onClick={() => exportCsv('artific-waitlist.csv', [['Name', 'Email', 'Phone', 'Joined', 'Source'], ...data.waitlist.map(e => [e.name, e.email, e.phone, e.createdAt, e.source])])}>Export CSV ↗</button></div><section className="admin-panel"><div className="admin-panel__heading"><h2>All entries</h2><input className="admin-search" placeholder="Search name or email" value={search} onChange={e => setSearch(e.target.value)} /></div><Waitlist entries={data.waitlist} search={search} /></section></>}
          {section === 'orders' && <><div className="admin-page-heading"><div><p className="admin-kicker">CUSTOMER PURCHASES</p><h1>Pre-orders</h1><p>{data.orders.length} orders in your store</p></div><button className="admin-export" onClick={() => exportCsv('artific-preorders.csv', [['Order', 'Date', 'Customer', 'Email', 'Phone', 'Items', 'Shipping address', 'Shipping method', 'Total (INR)', 'Status'], ...data.orders.map(o => [o.id, o.createdAt, o.customer?.name, o.customer?.email, o.customer?.phone, (o.items || []).map(i => `${i.name} ${i.pack || ''} ${Number(i.pack) === 1 ? 'Piece' : 'Pieces'} x${i.quantity || 1}`).join('; '), Object.values(o.shipping || {}).join(', '), o.shipping?.method, money(o.total), o.status])])}>Export CSV ↗</button></div><section className="admin-panel"><div className="admin-panel__heading"><h2>All pre-orders</h2><input className="admin-search" placeholder="Search order or customer" value={search} onChange={e => setSearch(e.target.value)} /></div><Orders orders={data.orders} search={search} /></section></>}
          {section === 'analytics' && <><div className="admin-page-heading"><div><p className="admin-kicker">VISITORS & PERFORMANCE</p><h1>Analytics</h1><p>Store activity for the selected period.</p></div></div><div className="admin-metrics admin-metrics--analytics">{[
            ['Sessions', overview.sessions], ['Unique visitors', overview.uniqueVisitors], ['Page views', overview.pageViews], ['Bounce rate', `${Number(overview.bounceRate || 0).toFixed(1)}%`], ['Avg. session', overview.averageSessionDuration || '0m 00s'], ['Add to cart', overview.addToCart], ['Checkout starts', overview.checkoutStarts], ['Pre-orders', overview.orders ?? data.orders.length], ['Revenue', money(overview.grossSales)], ['Avg. order value', money(overview.averageOrderValue)], ['Revenue / visitor', money(overview.revenuePerVisitor)], ['Checkout conversion', `${Number(overview.checkoutConversionRate || 0).toFixed(1)}%`], ['Cart abandonment', `${Number(overview.cartAbandonmentRate || 0).toFixed(1)}%`], ['Returning visitors', overview.returningVisitors], ['Mobile share', `${Number(overview.mobileShare || 0).toFixed(1)}%`], ['Waitlist conversion', `${Number(overview.waitlistConversion || 0).toFixed(1)}%`],
          ].map(([label, value]) => <Metric key={label} label={label} value={value ?? '—'} icon="·" />)}</div><div className="admin-breakdown-grid"><Breakdown title="Traffic sources" items={data.analytics?.sources} formatter={value => `${value} visits`} /><Breakdown title="Top pages" items={data.analytics?.pages} formatter={value => `${value} views`} /><Breakdown title="Popular products" items={data.analytics?.products} formatter={value => `${value} views`} /><Breakdown title="Order status" items={data.analytics?.orderStatuses} formatter={value => `${value} orders`} /><Breakdown title="Devices" items={data.analytics?.devices} formatter={value => `${value}%`} /></div></>}
        </div>
      </div>
    </main>
  )
}
