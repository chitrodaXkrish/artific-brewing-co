import { useState, useEffect } from 'react'

const PACKS = [
  { size: 4, label: 'Taster', price: '$9.99', priceNum: 9.99 },
  { size: 12, label: 'Regular', price: '$29.00', priceNum: 29.00 },
  { size: 24, label: 'Case', price: '$54.00', priceNum: 54.00 },
]

export default function AddToBagModal({ product, onClose, onAdd }) {
  const [packIdx, setPackIdx] = useState(1)
  const [qty, setQty] = useState(1)
  const [subscribe, setSubscribe] = useState(false)

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const pack = PACKS[packIdx]
  const total = (pack.priceNum * qty * (subscribe ? 0.85 : 1)).toFixed(2)

  const handleAdd = () => {
    onAdd({
      id: product.id,
      name: product.name,
      img: product.img,
      pack: pack.size,
      qty,
      price: pack.priceNum,
      subscribe,
      total: parseFloat(total),
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="Add to bag">
      <div className="modal">
        <div className="modal__handle" />
        <div className="modal__product">
          <img className="modal__product-img" src={product.img} alt={product.name} />
          <div>
            <div className="modal__product-name">{product.name}</div>
            <div className="modal__product-sub">Cold Brew · Decaf · 250ML</div>
          </div>
        </div>

        <div className="modal__label">Pack Size</div>
        <div className="modal__pack-options">
          {PACKS.map((p, i) => (
            <button
              key={p.size}
              className={`pack-option${packIdx === i ? ' active' : ''}`}
              onClick={() => setPackIdx(i)}
              id={`pack-${p.size}`}
              aria-pressed={packIdx === i}
            >
              <div className="pack-option__size">{p.size}</div>
              <div className="pack-option__label">{p.label}</div>
              <div className="pack-option__price">{p.price}</div>
            </button>
          ))}
        </div>

        <div className="modal__qty-row">
          <div className="modal__label" style={{ margin: 0 }}>Quantity</div>
          <div className="qty-stepper">
            <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity" id="qty-minus">−</button>
            <div className="qty-val" aria-live="polite">{qty}</div>
            <button className="qty-btn" onClick={() => setQty(q => q + 1)} aria-label="Increase quantity" id="qty-plus">+</button>
          </div>
        </div>

        <label className="modal__subscribe" htmlFor="subscribe-checkbox">
          <input
            type="checkbox"
            id="subscribe-checkbox"
            checked={subscribe}
            onChange={e => setSubscribe(e.target.checked)}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Subscribe &amp; Save</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Delivered every 4 weeks · Cancel anytime</div>
          </div>
          <div className="modal__subscribe-save">-15%</div>
        </label>

        <button className="btn-atb" id="atb-confirm-btn" onClick={handleAdd}>
          Add to Bag · ${total}
        </button>
      </div>
    </div>
  )
}
