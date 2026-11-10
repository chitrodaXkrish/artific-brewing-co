const STORIES = [
  {
    category: 'A better break',
    title: 'The art of stepping away for five minutes',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85',
    alt: 'A ceramic cup of coffee on a sunlit table',
  },
  {
    category: 'In good company',
    title: 'A few of our favourite neighborhood corners',
    image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=85',
    alt: 'The warm interior of an independent coffee shop',
  },
  {
    category: 'The slow notes',
    title: 'Why a longer steep makes a softer cup',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=85',
    alt: 'Coffee being prepared by hand at a café',
  },
]

export default function Journal() {
  return (
    <section className="journal" id="journal">
      <div className="section-heading journal__heading">
        <div>
          <p className="eyebrow">A little more to savour</p>
          <h2>Notes from<br /><em>around here.</em></h2>
        </div>
        <a className="text-link" href="#about">All our stories <span aria-hidden="true">↗</span></a>
      </div>
      <div className="journal__grid">
        {STORIES.map(story => (
          <article className="journal-card" key={story.title}>
            <a href="#about" className="journal-card__image" aria-label={`Read: ${story.title}`}>
              <img src={story.image} alt={story.alt} loading="lazy" />
              <span aria-hidden="true">↗</span>
            </a>
            <p className="eyebrow">{story.category}</p>
            <h3>{story.title}</h3>
          </article>
        ))}
      </div>
    </section>
  )
}
