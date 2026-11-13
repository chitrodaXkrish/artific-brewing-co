import { useState, useCallback, useEffect } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Community from './components/Community'
import Shop from './components/Shop'
import OriginsStackSection from './components/OriginsStackSection'
import WaitlistSection from './components/WaitlistSection'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AddToBagModal from './components/AddToBagModal'
import CartDrawer from './components/CartDrawer'
import ShutterIntro from './components/ShutterIntro'
import Admin from './components/Admin'
import { track } from './lib/analytics'
import './index.css'

export default function App() {
  const [cart, setCart] = useState([])
  const [modal, setModal] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)

  const openModal = useCallback((product) => {
    track('product_view', { productId: product.id, productName: product.name })
    setModal({ product })
  }, [])
  const closeModal = useCallback(() => setModal(null), [])

  const addToCart = useCallback((item) => {
    track('add_to_cart', { productId: item.id, productName: item.name, quantity: item.qty, pack: item.pack, value: item.total })
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
  const isAdminPage = window.location.pathname.replace(/\/+$/, '') === '/admin'

  useEffect(() => {
    if (!isAdminPage) track('page_view')
  }, [isAdminPage])

  const placePreorder = useCallback(async ({ customer, shipping, paymentMethod }) => {
    const items = cart.map(item => ({
      productId: item.id,
      name: item.name,
      pack: item.pack,
      quantity: item.qty,
      unitPrice: item.price,
      lineTotal: item.total,
    }))
    const response = await fetch('/api/preorders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, shipping, paymentMethod, items }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Could not save your pre-order.')
    track('preorder_created', { orderId: result.id, value: items.reduce((sum, item) => sum + item.lineTotal, 0) })
  }, [cart])

  if (isAdminPage) return <Admin />

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
            <WaitlistSection />
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
          onPlaceOrder={placePreorder}
          onClearCart={() => setCart([])}
        />
      )}
    </>
  )
}
