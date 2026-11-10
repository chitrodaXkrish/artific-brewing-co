const STOCKISTS = [
  { name: 'Corner Store Co.', city: 'Melbourne, VIC' },
  { name: 'The Good Press', city: 'Fitzroy, VIC' },
  { name: 'Everyday Needs', city: 'Richmond, VIC' },
  { name: 'The Pharmacy Café', city: 'Collingwood, VIC' },
  { name: 'Morning People', city: 'Brunswick, VIC' },
  { name: 'Standard Goods', city: 'Sydney, NSW' },
]

export default function FindUs() {
  return (
    <section className="find-us" id="find-us">
      <div className="find-us__top">
        <div><p className="eyebrow">Behind the bottle</p><h2>Slow brew.<br /><em>Bright days.</em></h2></div>
        <p>Our coffee gets the time it deserves. We steep it cold, draw out the soft sweetness, and keep the finish clean. Simple by design, lovely by nature.</p>
      </div>
      <div className="find-us__feature">
        <img src="https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1800&q=85" alt="Fresh coffee beans beside a hand-brewed cup" loading="lazy" />
        <div className="find-us__feature-note"><span>01 — The method</span><strong>Time is our<br />secret ingredient.</strong><a href="#shop">Try the cold brew <span aria-hidden="true">↗</span></a></div>
      </div>
      <div className="find-us__bottom">
        <div><p className="eyebrow">Come say hello</p><h3>Find Artific<br />near you.</h3></div>
        <div className="stockists" role="list">
          {STOCKISTS.slice(0, 4).map((s, i) => (
            <a className="stockist-item" key={i} href="#shop" role="listitem">
              <span><strong>{s.name}</strong><small>{s.city}</small></span><span className="stockist-item__arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
