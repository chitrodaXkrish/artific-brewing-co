const ORIGIN_CARDS = [
  {
    number: '01',
    label: 'ALTITUDE',
    headline: 'GROWN ABOVE THE ORDINARY.',
    highlight: '1,000–1,500 MASL',
    description: 'Cultivated in the elevated coffee-growing landscapes of Chikmagalur, where altitude and climate contribute to distinctive coffee characteristics.',
    tone: 'dark',
  },
  {
    number: '02',
    label: 'ORIGIN',
    headline: 'ROOTED IN THE WESTERN GHATS.',
    highlight: 'CHIKMAGALUR, INDIA',
    description: 'Sourced from the celebrated coffee-growing region of Chikmagalur, Karnataka, known for its lush plantations and rich coffee-growing heritage.',
    tone: 'light',
  },
  {
    number: '03',
    label: 'BEAN',
    headline: 'ONLY THE GOOD STUFF.',
    highlight: '100% ARABICA',
    description: 'Made with carefully selected Arabica coffee beans, chosen for their distinctive aroma, smooth character and flavour complexity.',
    tone: 'dark',
  },
  {
    number: '04',
    label: 'PROCESS',
    headline: 'GOOD COFFEE TAKES ITS TIME.',
    highlight: 'SLOW EXTRACTION',
    description: 'A deliberate brewing philosophy that respects the bean, the process and the time it takes to develop flavour.',
    tone: 'light',
  },
  {
    number: '05',
    label: 'PHILOSOPHY',
    headline: 'SABR KE GHOOT.',
    highlight: 'MADE WITH PATIENCE.',
    description: 'We believe the best things aren\'t rushed. Every cup reflects our appreciation for Indian coffee culture, thoughtful sourcing and the art of slowing down.',
    tone: 'dark',
  },
]

export default function OriginsStackSection() {
  return (
    <section className="origins" aria-labelledby="origins-title">
      <header className="origins__header">
        <div>
          <p className="eyebrow origins__eyebrow">A closer look at every cup</p>
          <h2 id="origins-title">OUR ORIGINS</h2>
        </div>
        <p className="origins__intro">Place, care and patience, in five field notes.</p>
      </header>
      <ol className="origins__deck">
        {ORIGIN_CARDS.map((card, index) => (
          <li
            className="origins__stack-item"
            key={card.number}
            style={{
              '--origins-stack-top': `${160 + index * 28}px`,
              '--origins-mobile-top': `${132 + index * 17}px`,
              zIndex: index + 1,
            }}
          >
            <article className={`origins-card origins-card--${card.tone}`}>
              <div className="origins-card__meta">
                <span className="origins-card__number">{card.number}</span>
                <span className="origins-card__label">{card.label}</span>
                <span className="origins-card__edition">ARTIFIC / ORIGINS</span>
              </div>
              <div className="origins-card__body">
                <h3 className="origins-card__headline">{card.headline}</h3>
                <div className="origins-card__detail">
                  <p className="origins-card__detail-label">THE DETAIL</p>
                  <strong>{card.highlight}</strong>
                  <p className="origins-card__description">{card.description}</p>
                </div>
              </div>
              <span className="origins-card__rule" aria-hidden="true" />
            </article>
          </li>
        ))}
      </ol>
      <p className="origins__note">Origin, altitude, varietal and process details are editable and should be verified before publishing.</p>
    </section>
  )
}
