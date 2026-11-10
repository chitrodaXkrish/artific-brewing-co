export default function Hero() {
  return (
    <section
      className="hero__backdrop"
      id="home"
      aria-label="Artific Brewing Co."
    >
      <img className="hero__image" src="/hero-banner.png" alt="" fetchPriority="high" />
      <h1 className="hero__title"><span>SABR KE</span><em>GHOOT</em></h1>
    </section>
  )
}
