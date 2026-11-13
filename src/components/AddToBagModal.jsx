import { useState, useEffect } from 'react'
import { formatMoney } from '../lib/money'

const PACKS = [
  { size: 1, label: 'Pieces', priceNum: 2.50 },
  { size: 4, label: 'Pieces', priceNum: 9.99 },
  { size: 12, label: 'Pieces', priceNum: 29.00 },
]

export default function AddToBagModal({ product, onClose, onAdd }) {
  const [packIdx, setPackIdx] = useState(1)
  const [qty, setQty] = useState(1)

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const pack = PACKS[packIdx]
  const total = (pack.priceNum * qty).toFixed(2)

  const handleAdd = () => {
    onAdd({
      id: product.id,
      name: product.name,
      img: product.img,
      pack: pack.size,
      qty,
      price: pack.priceNum,
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
              <div className="pack-option__price">{formatMoney(p.priceNum)}</div>
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

        <button className="btn-atb" id="atb-confirm-btn" onClick={handleAdd}>
          Add to Bag · {formatMoney(total)}
        </button>
      </div>
    </div>
  )
}
