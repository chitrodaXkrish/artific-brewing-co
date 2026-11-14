import { formatMoney } from '../lib/money'

const PRODUCTS = [
  {
    id: 'desi-coffee',
    name: 'Desi Coffee',
    img: '/product/desi-coffee.png',
    prices: { 1: 79, 4: 299, 12: 899 },
    badge: 'Classic',
    note: 'A familiar favourite, reimagined with smooth coffee character and a balanced, refreshing finish.',
  },
  {
    id: 'noir-americano',
    name: 'Noir Americano',
    img: '/product/noir-americano.png',
    prices: { 1: 79, 4: 299, 12: 899 },
    badge: 'Bold & smooth',
    note: 'A crisp, chilled take on the Americano, with a clean coffee profile and a bold, refreshing finish.',
  },
  {
    id: 'mocha-amaro',
    name: 'Mocha Amaro',
    img: '/product/mocha-amaro.png',
    prices: { 1: 119, 4: 399, 12: 1129 },
    badge: 'Coffee & chocolate',
    note: 'Coffee and chocolate notes come together in a rounded, layered drink with a smooth, satisfying finish.',
  },
  {
    id: 'vanilla-aurea',
    name: 'Vanilla Aurea',
    img: '/product/vanilla-aurea.png',
    prices: { 1: 99, 4: 349, 12: 999 },
    badge: 'Soft vanilla',
    note: 'Smooth coffee meets gentle vanilla notes for an aromatic cup with a balanced, softly sweet finish.',
  },
]

export default function Shop({ id, onAddToBag }) {
  return (
    <section className="shop" id={id}>
      <div className="section-heading shop__content">
        <div>
          <p className="eyebrow">Find your everyday</p>
          <h2 className="shop__title">Good things<br /><em>in the fridge.</em></h2>
        </div>
        <div className="shop__preorder-banner">PRE-ORDERS ONLY</div>
      </div>
      <div className="shop__grid shop__content">
        {PRODUCTS.map(p => (
          <article className="product-card" key={p.id} id={`product-${p.id}`}>
            <div className={`product-card__image product-card__image--${p.id}`}>
              <img src={p.img} alt={`Artific ${p.name} cold brew can`} loading="lazy" />
            </div>
            <div className="product-card__details">
              <div><h3 className="product-card__name">{p.name}</h3><p className="product-card__sub">{p.note}</p></div>
              <span className="product-card__price-main">From {formatMoney(Math.min(...Object.values(p.prices)))}</span>
            </div>
            <div className="product-card__footer">
              <span className="product-card__price-per">Available in 1, 4 &amp; 12 pieces</span>
              <button
                className="btn-add"
                id={`add-${p.id}`}
                onClick={() => onAddToBag(p)}
                aria-label={`Add ${p.name} to bag`}
              >
                Add to bag <span aria-hidden="true">+</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
