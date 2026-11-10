export default function About() {
  return (
    <section className="about" id="about">
      <div className="about__intro">
        <p className="eyebrow">A small note from us</p>
        <h2>We believe the best things happen when you <em>take your time.</em></h2>
        <a className="text-link" href="#find-us">Get to know our coffee <span aria-hidden="true">↗</span></a>
      </div>
      <div className="about__story">
        <figure className="about__image">
          <img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=85" alt="A welcoming neighborhood café with morning light" loading="lazy" />
          <figcaption>Good coffee makes a good pause.</figcaption>
        </figure>
        <div className="about__copy">
          <p className="eyebrow">Artific, in a nutshell</p>
          <p className="about__lead">We make thoughtful coffee for everyday life. No fuss, no rush: just great beans, careful brewing, and a little more space in your day.</p>
          <p>Our cold brew starts with specialty Arabica, a patient steep, and a lot of tasting. The result is a clean, quietly complex cup that feels right at home on your morning walk or your afternoon off.</p>
          <a className="text-link" href="#journal">Read our story <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="about__metrics" aria-label="Our coffee at a glance">
        <div><strong>12<span>+</span></strong><p>hours, steeped slow</p></div>
        <div><strong>03</strong><p>carefully chosen ingredients</p></div>
        <div><strong>01</strong><p>very good reason to pause</p></div>
      </div>
    </section>
  )
}
