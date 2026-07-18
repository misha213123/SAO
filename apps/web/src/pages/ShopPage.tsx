import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { products } from '../data/products';
import type { CharacterGender, ProductCategory } from '../types/shop';

const categories: Array<{id: ProductCategory | 'all'; label: string}> = [
  { id: 'all', label: 'Все' }, { id: 'outfit', label: 'Одежда' }, { id: 'hair', label: 'Волосы' },
  { id: 'accessory', label: 'Аксессуары' }, { id: 'weapon', label: 'Оружие' }, { id: 'pet', label: 'Питомцы' }, { id: 'effect', label: 'Эффекты' },
];

export function ShopPage() {
  const [gender, setGender] = useState<CharacterGender>('boy');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const filtered = useMemo(() => products.filter((p) => (p.gender === gender || p.gender === 'unisex') && (category === 'all' || p.category === category)), [gender, category]);

  return (
    <section className="page shop-page">
      <header className="shop-header">
        <div><span className="eyebrow">STYLE MARKET</span><h1>Магазин</h1></div>
        <div className="currency">◉ 2 450 крон</div>
      </header>
      <div className="gender-switch compact">
        <button className={gender === 'boy' ? 'selected' : ''} onClick={() => setGender('boy')}>♂ Парень</button>
        <button className={gender === 'girl' ? 'selected' : ''} onClick={() => setGender('girl')}>♀ Девушка</button>
      </div>
      <div className="search-row"><Search size={18}/><input placeholder="Найти предмет"/><button type="button" aria-label="Фильтры"><SlidersHorizontal size={18}/></button></div>
      <div className="category-scroll">
        {categories.map((item) => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)}>{item.label}</button>)}
      </div>
      <div className="product-grid">
        {filtered.map((product) => (
          <article className="product-card" key={product.id} style={{'--product-accent': product.accent} as React.CSSProperties}>
            <div className="product-art"><span>{product.emoji}</span><small>{product.rarity}</small></div>
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <button type="button">◉ {product.price} крон</button>
          </article>
        ))}
      </div>
    </section>
  );
}
