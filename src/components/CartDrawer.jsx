import { useState, useEffect } from 'react'
import { track } from '../lib/analytics'
import { formatMoney } from '../lib/money'

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
              <span className="cart-item__price">{formatMoney(item.total)}</span>
              <span className="cart-item__remove" onClick={() => onRemove(item.cartKey)}>Remove</span>
            </div>
          </div>
        </div>
      ))}
      <div className="cart-total">
        <span>Total</span>
        <span>{formatMoney(total)}</span>
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
          <input className="form-input" id="first-name" value={form.first} onChange={update('first')} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="last-name">Last Name</label>
          <input className="form-input" id="last-name" value={form.last} onChange={update('last')} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="email">Email</label>
        <input className="form-input" id="email" type="email" value={form.email} onChange={update('email')} required />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="phone">Phone</label>
        <div className="phone-input">
          <span className="phone-input__prefix" aria-hidden="true">+91</span>
          <input
            className="form-input"
            id="phone"
            type="tel"
            autoComplete="tel-national"
            inputMode="numeric"
            pattern="[0-9]{10}"
            minLength={10}
            maxLength={10}
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
            aria-describedby="phone-hint"
            required
          />
        </div>
        <span className="phone-input__hint" id="phone-hint">Enter your 10-digit mobile number</span>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="address">Address</label>
        <input className="form-input" id="address" autoComplete="street-address" value={form.address} onChange={update('address')} placeholder="Street address and apartment" required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="city">City</label>
          <input className="form-input" id="city" autoComplete="address-level2" value={form.city} onChange={update('city')} placeholder="City" required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="region">State / region</label>
          <input className="form-input" id="region" autoComplete="address-level1" value={form.region} onChange={update('region')} placeholder="State or region" required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="postcode">Postcode</label>
          <input className="form-input" id="postcode" autoComplete="postal-code" value={form.postcode} onChange={update('postcode')} placeholder="Postcode" required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="country">Country</label>
          <input className="form-input" id="country" autoComplete="country-name" value={form.country} onChange={update('country')} placeholder="Country" required />
        </div>
      </div>
      <div className="shipping-options">
        {[
          { id: 'standard', name: 'Standard Shipping', eta: '3–5 business days', price: 'Free' },
          { id: 'express', name: 'Express Shipping', eta: '1–2 business days', price: formatMoney(9.99) },
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

function StepPayment() {
  return (
    <div className="preorder-payment-note">
      <p className="eyebrow">Payment comes later</p>
      <p>Your pre-order request will be sent to our team. We’ll contact you to confirm availability and arrange payment. No card details are collected here.</p>
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
      <div className="confirmation__title">Pre-order received!</div>
      <p className="confirmation__sub">
        Our team will confirm your request<br />
        and follow up by email.
      </p>
      <div className="order-summary-card" style={{ marginTop: 24, textAlign: 'left' }}>
        {cart.map(item => (
          <div className="order-summary-card__row" key={item.cartKey}>
            <span>{item.name} {item.pack}-Pack ×{item.qty}</span>
            <span>{formatMoney(item.total)}</span>
          </div>
        ))}
        <div className="order-summary-card__row">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? 'Free' : formatMoney(shippingCost)}</span>
        </div>
        <div className="order-summary-card__row order-summary-card__total">
          <span>Total</span>
          <span>{formatMoney(total)}</span>
        </div>
      </div>
      <p className="preorder-followup">No payment has been collected. We’ll reach out before preparing or shipping your order.</p>
    </div>
  )
}

export default function CartDrawer({ cart, onClose, onRemove, onPlaceOrder, onClearCart }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ first: '', last: '', email: '', phone: '', address: '', city: '', region: '', postcode: '', country: 'India' })
  const [shipping, setShipping] = useState('standard')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const deliveryComplete = Boolean(form.first.trim() && form.last.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && /^\d{10}$/.test(form.phone) && form.address.trim() && form.city.trim() && form.region.trim() && form.postcode.trim() && form.country.trim())
  const canProceed = step === 0 ? cart.length > 0 : step === 1 ? deliveryComplete : true

  const btnLabel = ['Proceed to Delivery', 'Proceed to Payment', submitting ? 'Sending…' : 'Submit Pre-order', 'Close'][step]
  const handleNext = async () => {
    if (step === 3) { onClearCart?.(); onClose(); return }
    if (step === 0) track('checkout_start', { items: cart.length })
    if (step === 1) track('shipping_info', { method: shipping })
    if (step < 2) { setStep(s => s + 1); return }

    setSubmitting(true)
    setSubmitError('')
    try {
      await onPlaceOrder({
        customer: { firstName: form.first, lastName: form.last, email: form.email, phone: `+91${form.phone}` },
        shipping: { address: form.address, city: form.city, region: form.region, postalCode: form.postcode, country: form.country, method: shipping },
        paymentMethod: 'To be arranged',
      })
      setStep(3)
    } catch (error) {
      setSubmitError(error.message || 'Could not save your pre-order. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
          {step === 2 && <StepPayment />}
          {step === 3 && <StepReview cart={cart} shipping={shipping} />}
          {submitError && <p className="preorder-error" role="alert">{submitError}</p>}
        </div>

        <div className="cart-drawer__footer">
          <button
            className="btn-primary"
            id="cart-proceed-btn"
            onClick={handleNext}
            disabled={!canProceed || submitting}
            style={{ opacity: canProceed && !submitting ? 1 : 0.4 }}
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
