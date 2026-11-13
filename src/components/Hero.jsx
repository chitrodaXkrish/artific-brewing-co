export default function Hero() {
  return (
    <section
      className="hero__backdrop"
      id="home"
      aria-label="Artific Brewing Co."
    >
      <img className="hero__image" src="/hero-banner.png" alt="" fetchPriority="high" />
      <img className="hero__cloud" src="/images/cloud-overlay.png" alt="" aria-hidden="true" />
      <h1 className="hero__title"><span>SABR KE</span><em>GHOOT</em></h1>
      <a className="hero__cta" href="#waitlist">GET EARLY ACCESS <span aria-hidden="true">↗</span></a>
    </section>
  )
}
