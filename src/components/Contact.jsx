import { useState } from 'react'

const CONTACT_EMAIL = 'contact@artificbrewingco.shop'
const CONTACT_PHONE = '+91 730 448 1839'

export default function Contact() {
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const fields = new FormData(form)
    setSending(true)
    setStatus(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.get('name'),
          email: fields.get('email'),
          message: fields.get('message'),
          website: fields.get('website'),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'We couldn’t send your message. Please try again.')

      form.reset()
      setStatus({ type: 'success', message: 'Thanks for reaching out. Your message has been sent.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'We couldn’t send your message. Please try again.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="contact-page">
      <div className="contact-page__inner">
        <header className="contact-page__intro">
          <p className="eyebrow">We’d love to hear from you</p>
          <h1>Let’s talk<br /><em>good coffee.</em></h1>
          <p>Questions, collaborations, or just want to say hello? Send us a note or reach us directly.</p>
        </header>
        <div className="contact-page__content">
          <form className="contact-form" onSubmit={handleSubmit}>
            <label className="contact-form__trap" aria-hidden="true">
              Leave this field empty
              <input name="website" type="text" tabIndex="-1" autoComplete="off" />
            </label>
            <label>
              Your name
              <input name="name" type="text" autoComplete="name" required />
            </label>
            <label>
              Email address
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Your message
              <textarea name="message" rows="5" required />
            </label>
            <button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send a note'} <span aria-hidden="true">↗</span></button>
            {status && <p className={`contact-form__status contact-form__status--${status.type}`} role="status">{status.message}</p>}
          </form>
          <aside className="contact-details" aria-label="Contact information">
            <p className="eyebrow">Reach us directly</p>
            <a href={`tel:${CONTACT_PHONE.replaceAll(' ', '')}`}>{CONTACT_PHONE}</a>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </aside>
        </div>
      </div>
    </section>
  )
}
