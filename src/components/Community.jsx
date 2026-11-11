import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Community() {
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
    <section className="community" aria-labelledby="community-title">
      <div className="community__cloud" ref={cloudRef} aria-hidden="true">
        <img src="/images/cloud-overlay.png" alt="" />
      </div>
      <div className="community__inner">
        <div className="community__copy">
          <p className="eyebrow">A circle made over coffee</p>
          <h2 className="community__title" id="community-title">
            <span>MORE THAN A</span>
            <span>COFFEE KIND OF</span>
            <span className="community__title-highlight">COMMUNITY.</span>
          </h2>
          <p className="community__description">A growing circle of coffee lovers, makers, creators and curious minds, brought together by good brews, better conversations and a shared love for coffee.</p>
          <a className="community__link" href="#find-us">
            <span>Be part of the circle</span><span className="community__link-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="community__collage">
          <div className="community__paper" aria-hidden="true" />
          <figure className="community__photo">
            <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1400&q=85" alt="Friends sharing coffee and conversation around a table" loading="lazy" />
            <figcaption>Good brews. Better company.</figcaption>
          </figure>
          <div className="community__stamp" aria-hidden="true"><strong>ARTIFIC</strong><span>BREWING CO.</span><small>EST. 2022</small></div>
          <div className="community__tape" aria-hidden="true" />
          <p className="community__postmark" aria-hidden="true">A NOTE FROM YOUR COFFEE CIRCLE</p>
        </div>
      </div>
    </section>
  )
}
