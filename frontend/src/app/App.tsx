import { Coins, Home, Search, Shirt, ShoppingBag, Sparkles, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

type Gender = 'male' | 'female';
type Category = 'Все' | 'Верх' | 'Низ' | 'Обувь' | 'Аксессуары';

type Product = {
  id: number;
  name: string;
  category: Exclude<Category, 'Все'>;
  price: number;
  gender: Gender | 'unisex';
  accent: string;
};

const products: Product[] = [
  { id: 1, name: 'Куртка «Северный ветер»', category: 'Верх', price: 840, gender: 'male', accent: 'linear-gradient(145deg,#1d4058,#0d1f2d)' },
  { id: 2, name: 'Пальто «Тихий город»', category: 'Верх', price: 1120, gender: 'unisex', accent: 'linear-gradient(145deg,#304b5e,#152635)' },
  { id: 3, name: 'Юбка «Небесная линия»', category: 'Низ', price: 620, gender: 'female', accent: 'linear-gradient(145deg,#426b80,#172c3b)' },
  { id: 4, name: 'Брюки «Ночной маршрут»', category: 'Низ', price: 720, gender: 'unisex', accent: 'linear-gradient(145deg,#263d4d,#0b1823)' },
  { id: 5, name: 'Ботинки «Пульс»', category: 'Обувь', price: 680, gender: 'unisex', accent: 'linear-gradient(145deg,#245776,#102637)' },
  { id: 6, name: 'Наушники «Эхо»', category: 'Аксессуары', price: 430, gender: 'unisex', accent: 'linear-gradient(145deg,#31718c,#102938)' },
];

export function App() {
  const [gender, setGender] = useState<Gender>('male');
  const [category, setCategory] = useState<Category>('Все');
  const [crowns, setCrowns] = useState(2450);
  const [selected, setSelected] = useState<Product | null>(products[0]);

  const visibleProducts = useMemo(
    () => products.filter((item) => (item.gender === gender || item.gender === 'unisex') && (category === 'Все' || item.category === category)),
    [gender, category],
  );

  const buy = () => {
    if (!selected || crowns < selected.price) return;
    setCrowns((value) => value - selected.price);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ANIME WARDROBE</p>
          <h1>Собери своего героя</h1>
        </div>
        <div className="wallet"><Coins size={18} /><strong>{crowns.toLocaleString('ru-RU')}</strong><span>крон</span></div>
      </header>

      <section className="hero-card">
        <div className="hero-copy">
          <span className="status"><Sparkles size={15} /> новая коллекция</span>
          <h2>Город после заката</h2>
          <p>Современная anime-fashion эстетика: спокойные цвета, techwear и лёгкие фэнтези-детали.</p>
        </div>
        <div className={`avatar-preview ${gender}`}>
          <div className="avatar-head" />
          <div className="avatar-body" />
          <div className="avatar-coat" />
        </div>
      </section>

      <section className="shop-section">
        <div className="section-heading">
          <div><p className="eyebrow">МАГАЗИН</p><h2>Выбери персонажа</h2></div>
          <ShoppingBag size={24} />
        </div>

        <div className="gender-switch" aria-label="Выбор персонажа">
          <button className={gender === 'male' ? 'active' : ''} onClick={() => setGender('male')}><UserRound size={18} />Парень</button>
          <button className={gender === 'female' ? 'active' : ''} onClick={() => setGender('female')}><UserRound size={18} />Девушка</button>
        </div>

        <div className="categories">
          {(['Все', 'Верх', 'Низ', 'Обувь', 'Аксессуары'] as Category[]).map((item) => (
            <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>

        <div className="product-grid">
          {visibleProducts.map((item) => (
            <button key={item.id} className={`product-card ${selected?.id === item.id ? 'selected' : ''}`} onClick={() => setSelected(item)}>
              <div className="product-art" style={{ background: item.accent }}><Shirt size={42} /></div>
              <span>{item.category}</span>
              <h3>{item.name}</h3>
              <strong><Coins size={15} /> {item.price} крон</strong>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <aside className="purchase-bar">
          <div><span>Выбрано</span><strong>{selected.name}</strong></div>
          <button onClick={buy} disabled={crowns < selected.price}>{crowns < selected.price ? 'Не хватает крон' : `Купить · ${selected.price}`}</button>
        </aside>
      )}

      <nav className="bottom-nav">
        <button><Home /><span>Главная</span></button>
        <button className="active"><ShoppingBag /><span>Магазин</span></button>
        <button><Search /><span>Каталог</span></button>
        <button><UserRound /><span>Профиль</span></button>
      </nav>
    </main>
  );
}
