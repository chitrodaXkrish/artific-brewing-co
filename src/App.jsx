import { useState, useCallback } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Community from './components/Community'
import Shop from './components/Shop'
import OriginsStackSection from './components/OriginsStackSection'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AddToBagModal from './components/AddToBagModal'
import CartDrawer from './components/CartDrawer'
import ShutterIntro from './components/ShutterIntro'
import './index.css'

export default function App() {
  const [cart, setCart] = useState([])
  const [modal, setModal] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)

  const openModal = useCallback((product) => setModal({ product }), [])
  const closeModal = useCallback(() => setModal(null), [])

  const addToCart = useCallback((item) => {
    setCart(prev => {
      const key = `${item.id}-${item.pack}`
      const existing = prev.find(c => `${c.id}-${c.pack}` === key)
      if (existing) {
        return prev.map(c => `${c.id}-${c.pack}` === key ? { ...c, qty: c.qty + item.qty } : c)
      }
      return [...prev, { ...item, cartKey: key }]
    })
    closeModal()
    setCartOpen(true)
  }, [closeModal])

  const removeFromCart = useCallback((cartKey) => {
    setCart(prev => prev.filter(c => c.cartKey !== cartKey))
  }, [])

  const itemCount = cart.reduce((sum, c) => sum + c.qty, 0)
  const isContactPage = window.location.pathname.replace(/\/+$/, '') === '/contact'

  return (
    <>
      <ShutterIntro />
      <Nav itemCount={itemCount} openCart={() => setCartOpen(true)} />
      <main>
        {isContactPage ? <Contact /> : (
          <>
            <div className="hero-shop-stage">
              <Hero />
              <Community />
              <Shop id="shop" onAddToBag={openModal} />
            </div>
            <OriginsStackSection />
          </>
        )}
        <Footer />
      </main>
      {modal && (
        <AddToBagModal
          product={modal.product}
          onClose={closeModal}
          onAdd={addToCart}
        />
      )}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
        />
      )}
    </>
  )
}
