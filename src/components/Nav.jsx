import { useState } from 'react'

export default function Nav({ itemCount, openCart }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <button className="nav__menu" onClick={() => setMenuOpen(open => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
        <span /> <span />
      </button>
      <a className="nav__logo" href="#home" aria-label="Artific Brewing Co. home">
        <img src="/logo.svg" alt="Artific Brewing Co." />
      </a>
      <nav className={`nav__links${menuOpen ? ' nav__links--open' : ''}`} aria-label="Main navigation">
        <a href="#shop" onClick={closeMenu}>Shop</a>
        <a href="#origins" onClick={closeMenu}>Our story</a>
      </nav>
      <button className="nav__bag" id="nav-bag-btn" onClick={openCart} aria-label={`Open bag, ${itemCount} items`}>
        Bag <span>{String(itemCount).padStart(2, '0')}</span>
      </button>
    </header>
  )
}
