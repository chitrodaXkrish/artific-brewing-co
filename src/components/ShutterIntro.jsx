import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function ShutterIntro() {
  const shutterRef = useRef(null)
  const [imageReady, setImageReady] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!visible) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [visible])

  useEffect(() => {
    if (!imageReady) return
    const shutter = shutterRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timeline = gsap.timeline({
      delay: reducedMotion ? 0.25 : 0.8,
      onComplete: () => setVisible(false),
    })

    if (reducedMotion) {
      timeline.to(shutter, { autoAlpha: 0, duration: 0.2 })
    } else {
      timeline.to(shutter, { yPercent: -100, duration: 1.15, ease: 'power3.inOut' })
    }

    return () => timeline.kill()
  }, [imageReady])

  if (!visible) return null

  return (
    <div className="shutter-intro" ref={shutterRef} aria-hidden="true">
      <img
        src="/shutter.png"
        alt=""
        fetchPriority="high"
        onLoad={() => setImageReady(true)}
        onError={() => setVisible(false)}
      />
    </div>
  )
}
