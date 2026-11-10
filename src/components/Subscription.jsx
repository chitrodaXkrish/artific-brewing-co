const STEPS = [
  { number: '01', title: 'Choose your blend', copy: 'Pick the cold brew you look forward to.' },
  { number: '02', title: 'Make it a regular', copy: 'Select Subscribe & Save when you add a case.' },
  { number: '03', title: 'Settle into your ritual', copy: 'A fresh case arrives every four weeks. Change or cancel whenever.' },
]

export default function Subscription() {
  return (
    <section className="subscription" id="subscription">
      <div className="subscription__image">
        <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=85" alt="A freshly made coffee ready to enjoy" loading="lazy" />
        <span>One less thing to think about.</span>
      </div>
      <div className="subscription__content">
        <p className="eyebrow">A small routine, made easy</p>
        <h2>Your good thing,<br /><em>on repeat.</em></h2>
        <p className="subscription__intro">Keep the fridge ready for whenever you need a good pause. Subscribe to your favourite case and save 15% each time.</p>
        <div className="subscription__steps">
          {STEPS.map(step => (
            <div className="subscription__step" key={step.number}>
              <span>{step.number}</span>
              <div><h3>{step.title}</h3><p>{step.copy}</p></div>
            </div>
          ))}
        </div>
        <a className="button button--outline" href="#shop">Find your blend <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  )
}
