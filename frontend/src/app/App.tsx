import {
  Bell, BookOpen, Box, Coins, Crown, Gift, Home, MessageCircle, Search,
  Settings, Shirt, ShoppingBag, Sparkles, Star, Sword, Trophy, UserRound,
  Users, WandSparkles, Wind,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Gender = 'male' | 'female';
type Category = 'Рекомендуем' | 'Одежда' | 'Причёски' | 'Оружие' | 'Аксессуары' | 'Крылья' | 'Питомцы' | 'Эмоции';

type Product = {
  id: number;
  name: string;
  price: number;
  category: Category;
  gender: Gender | 'unisex';
  symbol: string;
  accent: string;
};

const products: Product[] = [
  { id: 1, name: 'Ночной охотник', price: 1280, category: 'Одежда', gender: 'male', symbol: '✦', accent: 'blue' },
  { id: 2, name: 'Ледяной странник', price: 1100, category: 'Одежда', gender: 'unisex', symbol: '❄', accent: 'ice' },
  { id: 3, name: 'Лунный клинок', price: 1450, category: 'Оружие', gender: 'unisex', symbol: '⚔', accent: 'steel' },
  { id: 4, name: 'Крылья рассвета', price: 1300, category: 'Крылья', gender: 'unisex', symbol: '翼', accent: 'sky' },
  { id: 5, name: 'Теневой котёнок', price: 800, category: 'Питомцы', gender: 'unisex', symbol: '🐈', accent: 'pet' },
  { id: 6, name: 'Городская куртка', price: 890, category: 'Одежда', gender: 'female', symbol: '✧', accent: 'cyan' },
];

const sideItems = [
  [Home, 'Главная'], [UserRound, 'Персонаж'], [Box, 'Инвентарь'], [ShoppingBag, 'Магазин'],
  [BookOpen, 'Квесты'], [Trophy, 'Достижения'], [Crown, 'Гильдия'], [Users, 'Друзья'], [Settings, 'Настройки'],
] as const;

const categories: Array<[Category, typeof Star]> = [
  ['Рекомендуем', Star], ['Одежда', Shirt], ['Причёски', WandSparkles], ['Оружие', Sword],
  ['Аксессуары', Crown], ['Крылья', Wind], ['Питомцы', Sparkles], ['Эмоции', MessageCircle],
];

export function App() {
  const [gender, setGender] = useState<Gender>('male');
  const [category, setCategory] = useState<Category>('Рекомендуем');
  const [crowns, setCrowns] = useState(2450);
  const [selected, setSelected] = useState<Product>(products[0]);

  const visibleProducts = useMemo(() => products.filter((item) => {
    const genderMatch = item.gender === gender || item.gender === 'unisex';
    const categoryMatch = category === 'Рекомендуем' || item.category === category;
    return genderMatch && categoryMatch;
  }), [gender, category]);

  const buy = () => {
    if (crowns < selected.price) return;
    setCrowns((value) => value - selected.price);
  };

  return (
    <main className="game-shell">
      <header className="profile-header">
        <div className="burger">☰</div>
        <div className="profile-avatar"><span>42</span></div>
        <div className="profile-copy">
          <strong>PlayerOne</strong>
          <div className="stat"><span>HP</span><i><b style={{ width: '88%' }} /></i><em>1250 / 1250</em></div>
          <div className="stat"><span>MP</span><i><b style={{ width: '72%' }} /></i><em>620 / 620</em></div>
          <div className="stat"><span>EXP</span><i><b style={{ width: '65%' }} /></i><em>65%</em></div>
        </div>
        <div className="header-actions">
          <div className="currency"><Coins size={18} /><strong>135 420</strong><button>+</button></div>
          <div className="currency primary"><Crown size={18} /><strong>{crowns.toLocaleString('ru-RU')}</strong><button>+</button></div>
          <button className="icon-button"><Bell size={21} /></button>
          <button className="icon-button"><Settings size={21} /></button>
        </div>
      </header>

      <div className="dashboard-grid">
        <aside className="side-menu panel">
          {sideItems.map(([Icon, label]) => <button key={label} className={label === 'Магазин' ? 'active' : ''}><Icon size={21} /><span>{label}</span></button>)}
        </aside>

        <section className="event-banner panel">
          <div><span>ВРЕМЕННОЕ СОБЫТИЕ</span><h3>ЗАТМЕНИЕ НАД ГОРОДОМ</h3><p>Собери новый образ и получи редкий аксессуар.</p></div>
          <div className="event-monster">✦</div>
        </section>

        <section className="shop panel">
          <div className="shop-title"><div><span>МАГАЗИН</span><p>Выбери своего героя</p></div><ShoppingBag /></div>
          <div className="gender-tabs">
            <button className={gender === 'male' ? 'active' : ''} onClick={() => setGender('male')}>♂ ПАРЕНЬ</button>
            <button className={gender === 'female' ? 'active' : ''} onClick={() => setGender('female')}>♀ ДЕВУШКА</button>
          </div>
          <div className="character-stage">
            <button className={`character-card male ${gender === 'male' ? 'chosen' : ''}`} onClick={() => setGender('male')}>
              <div className="anime-character"><div className="hair"/><div className="face"/><div className="coat"/><div className="blade"/></div>
              <span>КАЭЛ</span><small>Стиль: техно-мечник</small>
            </button>
            <button className={`character-card female ${gender === 'female' ? 'chosen' : ''}`} onClick={() => setGender('female')}>
              <div className="anime-character"><div className="hair"/><div className="face"/><div className="coat"/></div>
              <span>МИРА</span><small>Стиль: ночной следопыт</small>
            </button>
          </div>
        </section>

        <aside className="categories-panel panel">
          <h3>КАТЕГОРИИ <Crown size={20}/></h3>
          {categories.map(([name, Icon]) => <button key={name} className={category === name ? 'active' : ''} onClick={() => setCategory(name)}><Icon size={19}/>{name}</button>)}
        </aside>

        <section className="daily panel">
          <span>ЕЖЕДНЕВНЫЙ БОНУС</span>
          <div className="bonus-hero">✦</div>
          <p>Входите каждый день и получайте кроны.</p>
          <button><Gift size={16}/> ПОЛУЧИТЬ</button>
        </section>

        <section className="recommended panel">
          <div className="strip-title"><h3>РЕКОМЕНДУЕМ</h3><span>{visibleProducts.length} предметов</span></div>
          <div className="products-row">
            {visibleProducts.map((item) => (
              <button key={item.id} className={`item-card ${item.accent} ${selected.id === item.id ? 'selected' : ''}`} onClick={() => setSelected(item)}>
                <div className="item-art">{item.symbol}</div><span>{item.name}</span><strong><Crown size={14}/>{item.price}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="chat panel">
          <h3><MessageCircle size={18}/> МИРОВОЙ ЧАТ</h3>
          <p><b>ShadowX:</b> Кто пойдёт на рейд?</p><p><b>Luna:</b> Ищу пати на данж 25+</p><p><b>VoidKing:</b> Продам редкий плащ</p>
          <div className="chat-input">Напишите сообщение… <span>➤</span></div>
        </section>

        <section className="starter panel">
          <h3>НАБОР НОВИЧКА</h3><div className="starter-chest">♛</div><p>1000 крон<br/>Уникальный костюм<br/>Опыт +50%</p><button>199 ₽</button>
        </section>

        <section className="topup panel">
          <h3>ПОПОЛНЕНИЕ</h3><div className="topup-grid">{[300,980,1980,3280,6480,12960].map((amount) => <button key={amount}><Crown/><b>{amount}</b><span>{Math.round(amount / 4)} ₽</span></button>)}</div>
        </section>
      </div>

      <aside className="purchase-dock"><div><small>Выбрано</small><strong>{selected.name}</strong></div><button onClick={buy} disabled={crowns < selected.price}>{crowns < selected.price ? 'Не хватает крон' : `Купить · ${selected.price}`}</button></aside>

      <nav className="bottom-nav"><button><Home/><span>Главная</span></button><button><UserRound/><span>Персонаж</span></button><button><Search/><span>Исследование</span></button><button><MessageCircle/><span>Чат</span></button><button className="active"><ShoppingBag/><span>Магазин</span></button><button><Box/><span>Меню</span></button></nav>
    </main>
  );
}
