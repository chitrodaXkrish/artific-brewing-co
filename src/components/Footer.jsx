import { useState } from 'react'

const now = new Date()

export default function Footer() {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)

  const handleJoin = (e) => {
    e.preventDefault()
    if (email.trim()) setJoined(true)
  }

  return (
    <footer className="footer" id="footer">
      <div className="footer__main">
        <div className="footer__signup">
          <p className="eyebrow">A good note, now and then</p>
          <h2>Make room<br /><em>for good things.</em></h2>
          <p>New batches, good reads, and the occasional reason to put the kettle on.</p>
          {joined ? <p className="footer__success" role="status">You're on the list. Talk soon.</p> : (
            <form className="footer__form" onSubmit={handleJoin}>
              <label className="sr-only" htmlFor="footer-email-input">Your email address</label>
              <input id="footer-email-input" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required />
              <button id="footer-join-btn" type="submit" aria-label="Join the mailing list">↗</button>
            </form>
          )}
        </div>
        <div className="footer__links">
          <div><h3>Explore</h3><a href="#shop">Shop all</a><a href="#about">Our story</a><a href="#find-us">The brew</a><a href="#journal">Journal</a></div>
          <div><h3>Say hello</h3><a href="mailto:hello@artificbrewing.co">Email us</a><a href="#find-us">Stockists</a><a href="#shop">Instagram ↗</a></div>
        </div>
      </div>
      <img className="footer__wordmark" src="/logo.svg" alt="Artific Brewing Co." loading="lazy" />
      <div className="footer__bottom"><span>© {now.getFullYear()} Artific Brewing Co.</span><span>Made slowly. Enjoyed often.</span><a href="#home">Back to top ↑</a></div>
    </footer>
  )
}
