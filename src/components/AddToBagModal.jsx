import { useState, useEffect } from 'react'
import { formatMoney } from '../lib/money'

const PACKS = [1, 4, 12]

export default function AddToBagModal({ product, onClose, onAdd }) {
  const [packIdx, setPackIdx] = useState(1)
  const [qty, setQty] = useState(1)

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const packSize = PACKS[packIdx]
  const unitPrice = product.prices[packSize]
  const total = (unitPrice * qty).toFixed(2)

  const handleAdd = () => {
    onAdd({
      id: product.id,
      name: product.name,
      img: product.img,
      pack: packSize,
      qty,
      price: unitPrice,
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
            <div className="modal__product-sub">Coffee</div>
          </div>
        </div>

        <div className="modal__label">Pack Size</div>
        <div className="modal__pack-options">
          {PACKS.map((size, i) => (
            <button
              key={size}
              className={`pack-option${packIdx === i ? ' active' : ''}`}
              onClick={() => setPackIdx(i)}
              id={`pack-${size}`}
              aria-pressed={packIdx === i}
            >
              <div className="pack-option__size">{size}</div>
              <div className="pack-option__label">Pieces</div>
              <div className="pack-option__price">{formatMoney(product.prices[size])}</div>
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
