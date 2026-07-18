import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Gift, Swords } from 'lucide-react';

export function HomePage() {
  return (
    <section className="page home-page">
      <header className="topbar">
        <div className="avatar">A</div>
        <div><strong>PlayerOne</strong><small>Уровень 1</small></div>
        <div className="currency">◉ 2 450 крон</div>
      </header>

      <article className="hero-card">
        <span className="eyebrow">НОВАЯ ГЛАВА</span>
        <h1>Создай своего аниме-героя</h1>
        <p>Выбирай образ, собирай коллекцию и открывай новые стили.</p>
        <Link to="/shop" className="primary-button"><ShoppingBag size={19}/> Открыть магазин</Link>
        <div className="hero-figure" aria-hidden="true">✦</div>
      </article>

      <div className="quick-grid">
        <Link to="/character" className="quick-card"><Sparkles/><span>Мой герой</span></Link>
        <Link to="/shop" className="quick-card"><Gift/><span>Новинки</span></Link>
        <button className="quick-card" type="button"><Swords/><span>Испытания</span></button>
      </div>

      <section className="section-block">
        <div className="section-heading"><h2>Популярное сегодня</h2><Link to="/shop">Все</Link></div>
        <div className="story-row">
          <div className="story-card steel">NEON<br/>ACADEMY</div>
          <div className="story-card blue">SKY<br/>DISTRICT</div>
          <div className="story-card cyan">NIGHT<br/>FRONTIER</div>
        </div>
      </section>
    </section>
  );
}
