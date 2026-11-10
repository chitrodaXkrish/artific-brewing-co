import { useState, useEffect } from 'react'

const STEPS = ['Bag', 'Delivery', 'Payment', 'Review']

function StepBag({ cart, onRemove }) {
  const total = cart.reduce((s, c) => s + c.total, 0)
  if (cart.length === 0) return (
    <div className="empty-cart">
      <div className="empty-cart__icon">🛍️</div>
      <div className="empty-cart__title">Your bag is empty</div>
      <div className="empty-cart__sub">Add some No Caff to get started.</div>
    </div>
  )
  return (
    <>
      {cart.map(item => (
        <div className="cart-item" key={item.cartKey}>
          <img className="cart-item__img" src={item.img} alt={item.name} />
          <div className="cart-item__info">
            <div className="cart-item__name">{item.name}</div>
            <div className="cart-item__variant">{item.pack}-Pack · {item.subscribe ? 'Subscribe & Save' : 'One-time'}</div>
            <div className="cart-item__footer">
              <span className="cart-item__price">${item.total.toFixed(2)}</span>
              <span className="cart-item__remove" onClick={() => onRemove(item.cartKey)}>Remove</span>
            </div>
          </div>
        </div>
      ))}
      <div className="cart-total">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </>
  )
}

function StepDelivery({ form, setForm, shipping, setShipping }) {
  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="first-name">First Name</label>
          <input className="form-input" id="first-name" value={form.first} onChange={update('first')} placeholder="Jane" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="last-name">Last Name</label>
          <input className="form-input" id="last-name" value={form.last} onChange={update('last')} placeholder="Doe" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="email">Email</label>
        <input className="form-input" id="email" type="email" value={form.email} onChange={update('email')} placeholder="you@email.com" />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="address">Address</label>
        <input className="form-input" id="address" value={form.address} onChange={update('address')} placeholder="123 Corner Store Lane" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="city">City</label>
          <input className="form-input" id="city" value={form.city} onChange={update('city')} placeholder="Melbourne" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="postcode">Postcode</label>
          <input className="form-input" id="postcode" value={form.postcode} onChange={update('postcode')} placeholder="3000" />
        </div>
      </div>
      <div className="shipping-options">
        {[
          { id: 'standard', name: 'Standard Shipping', eta: '3–5 business days', price: 'Free' },
          { id: 'express', name: 'Express Shipping', eta: '1–2 business days', price: '$9.99' },
        ].map(opt => (
          <label key={opt.id} className={`shipping-option${shipping === opt.id ? ' active' : ''}`}>
            <input type="radio" name="shipping" value={opt.id} checked={shipping === opt.id} onChange={() => setShipping(opt.id)} />
            <div className="shipping-option__label">
              <div className="shipping-option__name">{opt.name}</div>
              <div className="shipping-option__eta">{opt.eta}</div>
            </div>
            <span className="shipping-option__price">{opt.price}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function StepPayment({ payTab, setPayTab, promo, setPromo }) {
  return (
    <div>
      <div className="payment-tabs">
        {['Card', 'Apple Pay', 'PayPal'].map(t => (
          <button key={t} className={`payment-tab${payTab === t ? ' active' : ''}`} onClick={() => setPayTab(t)} id={`pay-tab-${t.toLowerCase().replace(' ', '-')}`}>{t}</button>
        ))}
      </div>
      {payTab === 'Card' && (
        <>
          <div className="form-group">
            <label className="form-label" htmlFor="card-number">Card Number</label>
            <input className="form-input" id="card-number" placeholder="4242 4242 4242 4242" maxLength={19} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="card-expiry">Expiry</label>
              <input className="form-input" id="card-expiry" placeholder="MM/YY" maxLength={5} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="card-cvc">CVC</label>
              <input className="form-input" id="card-cvc" placeholder="123" maxLength={4} />
            </div>
          </div>
        </>
      )}
      {payTab !== 'Card' && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
          {payTab} flow would open here in production.
        </div>
      )}
      <div className="promo-row">
        <input className="promo-input" placeholder="Promo code" value={promo} onChange={e => setPromo(e.target.value)} id="promo-code-input" />
        <button className="promo-btn" id="apply-promo-btn">Apply</button>
      </div>
    </div>
  )
}

function StepReview({ cart, shipping }) {
  const subtotal = cart.reduce((s, c) => s + c.total, 0)
  const shippingCost = shipping === 'express' ? 9.99 : 0
  const total = subtotal + shippingCost
  return (
    <div className="confirmation">
      <div className="confirmation__icon">✓</div>
      <div className="confirmation__title">Order Placed!</div>
      <p className="confirmation__sub">
        We're getting your No Caff ready.<br />
        You'll get a confirmation at your email.
      </p>
      <div className="order-summary-card" style={{ marginTop: 24, textAlign: 'left' }}>
        {cart.map(item => (
          <div className="order-summary-card__row" key={item.cartKey}>
            <span>{item.name} {item.pack}-Pack ×{item.qty}</span>
            <span>${item.total.toFixed(2)}</span>
          </div>
        ))}
        <div className="order-summary-card__row">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
        </div>
        <div className="order-summary-card__row order-summary-card__total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <div className="tracker">
        <div className="tracker__dots">
          {['📦', '🚚', '✅'].map((emoji, i) => (
            <>
              {i > 0 && <div key={`line-${i}`} className={`tracker__line${i === 1 ? ' done' : ''}`} />}
              <div key={emoji} className={`tracker__dot${i === 0 ? ' active' : ''}`}>{emoji}</div>
            </>
          ))}
        </div>
        <div className="tracker__label-row" style={{ marginTop: 8 }}>
          {['Order Placed', 'Out for Delivery', 'Delivered'].map(l => (
            <div key={l} className="tracker__lbl">{l}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CartDrawer({ cart, onClose, onRemove }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ first: '', last: '', email: '', address: '', city: '', postcode: '' })
  const [shipping, setShipping] = useState('standard')
  const [payTab, setPayTab] = useState('Card')
  const [promo, setPromo] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const canProceed = step === 0 ? cart.length > 0 : true

  const btnLabel = ['Proceed to Delivery', 'Proceed to Payment', 'Place Order', 'Close'][step]
  const handleNext = () => {
    if (step === 3) { onClose(); return }
    setStep(s => s + 1)
  }

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag">
        <div className="cart-drawer__header">
          <button className="cart-drawer__close" onClick={onClose} aria-label="Close bag" id="cart-close-btn">✕</button>
          <div className="cart-drawer__steps">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`cart-step${i === step ? ' active' : i < step ? ' done' : ''}`}
                onClick={() => i < step && setStep(i)}
                id={`cart-step-${s.toLowerCase()}`}
              >
                {i < step ? '✓ ' : ''}{s}
              </div>
            ))}
          </div>
        </div>

        <div className="cart-drawer__body">
          {step === 0 && <StepBag cart={cart} onRemove={onRemove} />}
          {step === 1 && <StepDelivery form={form} setForm={setForm} shipping={shipping} setShipping={setShipping} />}
          {step === 2 && <StepPayment payTab={payTab} setPayTab={setPayTab} promo={promo} setPromo={setPromo} />}
          {step === 3 && <StepReview cart={cart} shipping={shipping} />}
        </div>

        <div className="cart-drawer__footer">
          <button
            className="btn-primary"
            id="cart-proceed-btn"
            onClick={handleNext}
            disabled={!canProceed}
            style={{ opacity: canProceed ? 1 : 0.4 }}
          >
            {btnLabel}
          </button>
          {step > 0 && step < 3 && (
            <button className="btn-secondary" id="cart-back-btn" onClick={() => setStep(s => s - 1)}>← Back</button>
          )}
        </div>
      </aside>
    </>
  )
}
