import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const PRODUCTS = [
  {
    id: 'original',
    name: 'Original',
    sub: 'Cold Brew · Decaf',
    img: '/images/can-original.png',
    price: '$29.00',
    perCan: '12 cans · $2.42 each',
    badge: 'Bestseller',
    note: 'Bright, easy-drinking, always in season',
  },
  {
    id: 'dark-chocolate',
    name: 'Dark Chocolate',
    sub: 'Cold Brew · Decaf',
    img: '/images/can-dark-chocolate.png',
    price: '$29.00',
    perCan: '12 cans · $2.42 each',
    badge: 'Deep & smooth',
    note: 'A softer finish with a little sweetness',
  },
  {
    id: 'vanilla-oat',
    name: 'Vanilla Oat',
    sub: 'Cold Brew · Decaf',
    img: '/images/can-vanilla-oat.png',
    price: '$29.00',
    perCan: '12 cans · $2.42 each',
    badge: 'Oat milk',
    note: 'Creamy, balanced, and made to linger',
  },
]

export default function Shop({ id, onAddToBag }) {
  const cloudRef = useRef(null)

  useEffect(() => {
    const cloud = cloudRef.current
    if (!cloud || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const section = cloud.parentElement
    const setCloudY = gsap.quickTo(cloud, 'y', { duration: 0.35, ease: 'power2.out' })
    const updateCloudPosition = () => {
      const { top, height } = section.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, (window.innerHeight - top) / (window.innerHeight + height)))
      setCloudY(-progress * 72)
    }

    window.addEventListener('scroll', updateCloudPosition, { passive: true })
    window.addEventListener('resize', updateCloudPosition)
    updateCloudPosition()

    return () => {
      window.removeEventListener('scroll', updateCloudPosition)
      window.removeEventListener('resize', updateCloudPosition)
      gsap.killTweensOf(cloud)
    }
  }, [])

  return (
    <section className="shop" id={id}>
      <div className="shop__cloud" ref={cloudRef} aria-hidden="true">
        <img src="/images/cloud-overlay.png" alt="" />
      </div>
      <div className="section-heading shop__content">
        <div>
          <p className="eyebrow">Find your everyday</p>
          <h2 className="shop__title">Good things<br /><em>in the fridge.</em></h2>
        </div>
        <a className="text-link" href="#find-us">A little about our brew <span aria-hidden="true">↗</span></a>
      </div>
      <div className="shop__grid shop__content">
        {PRODUCTS.map(p => (
          <article className="product-card" key={p.id} id={`product-${p.id}`}>
            <div className={`product-card__image product-card__image--${p.id}`}>
              <span className="product-card__badge">{p.badge}</span>
              <img src={p.img} alt={`Artific ${p.name} cold brew can`} loading="lazy" />
            </div>
            <div className="product-card__details">
              <div><h3 className="product-card__name">{p.name}</h3><p className="product-card__sub">{p.note}</p></div>
              <span className="product-card__price-main">{p.price}</span>
            </div>
            <div className="product-card__footer">
              <span className="product-card__price-per">{p.perCan}</span>
              <button
                className="btn-add"
                id={`add-${p.id}`}
                onClick={() => onAddToBag(p)}
                aria-label={`Add ${p.name} to bag`}
              >
                Add to bag <span aria-hidden="true">+</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
