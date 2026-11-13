import { useState } from 'react'
import { track } from '../lib/analytics'

export default function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const joinWaitlist = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not join the waitlist.')
      track('waitlist_signup')
      setJoined(true)
    } catch (err) {
      setError(err.message || 'Could not join the waitlist. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="waitlist-section" id="waitlist" aria-labelledby="waitlist-title">
      <div className="waitlist-section__inner">
        <p className="eyebrow">Something good is brewing</p>
        <h2 id="waitlist-title">A new way to<br /><em>experience coffee.</em></h2>
        <p className="waitlist-section__copy">Get on the list and be among the first to experience Artific.</p>
        {joined ? (
          <p className="waitlist-section__status" role="status">You’re in the queue. We’ll be in touch.</p>
        ) : (
          <form className="waitlist-section__form" onSubmit={joinWaitlist}>
            <label className="sr-only" htmlFor="waitlist-email">Email address</label>
            <input
              id="waitlist-email"
              type="email"
              autoComplete="email"
              placeholder="Your email address"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
            <button type="submit" disabled={busy}>{busy ? 'ADDING YOU…' : 'GET IN THE QUEUE'} <span aria-hidden="true">↗</span></button>
          </form>
        )}
        {error && <p className="waitlist-section__error" role="alert">{error}</p>}
      </div>
    </section>
  )
}
