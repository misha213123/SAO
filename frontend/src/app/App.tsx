import {
  Backpack, Bell, Castle, ChevronRight, Coins, Crown, Flame, Footprints,
  HeartPulse, Home, LockKeyhole, Map, Menu, MessageCircle, Settings, Shield,
  ShoppingBag, Sparkles, Sword, Trophy, UserRound, Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type View = 'home' | 'explore' | 'shop' | 'profile';

type Floor = {
  id: number;
  name: string;
  subtitle: string;
  boss: string;
  unlocked: boolean;
  tone: string;
};

const floors: Floor[] = [
  { id: 1, name: 'Луга Начала', subtitle: 'Дикие кабаны · Ур. 1–3', boss: 'Вожак клыков', unlocked: true, tone: 'meadow' },
  { id: 2, name: 'Туманный лес', subtitle: 'Лесные волки · Ур. 4–7', boss: 'Серый хищник', unlocked: false, tone: 'forest' },
  { id: 3, name: 'Каменный каньон', subtitle: 'Пещерные големы · Ур. 8–12', boss: 'Каменный страж', unlocked: false, tone: 'canyon' },
  { id: 4, name: 'Озёрный край', subtitle: 'Водные духи · Ур. 13–17', boss: 'Хозяйка глубин', unlocked: false, tone: 'lake' },
  { id: 5, name: 'Город фонарей', subtitle: 'Теневые разбойники · Ур. 18–22', boss: 'Алый дуэлянт', unlocked: false, tone: 'city' },
];

const shopItems = [
  { icon: '🗡️', name: 'Клинок новичка', price: 80 },
  { icon: '🧥', name: 'Куртка разведчика', price: 120 },
  { icon: '🥾', name: 'Сапоги тропы', price: 95 },
  { icon: '🧪', name: 'Малое зелье', price: 35 },
];

export function App() {
  const [view, setView] = useState<View>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [enemyHp, setEnemyHp] = useState(30);
  const [playerHp, setPlayerHp] = useState(100);
  const [stamina, setStamina] = useState(100);
  const [col, setCol] = useState(0);
  const [crowns] = useState(0);
  const [battleLog, setBattleLog] = useState('Первый враг уже заметил вас. Приготовьтесь к бою.');
  const [battleWon, setBattleWon] = useState(false);

  const hpPercent = useMemo(() => `${Math.max(0, playerHp)}%`, [playerHp]);
  const enemyPercent = useMemo(() => `${Math.max(0, (enemyHp / 30) * 100)}%`, [enemyHp]);

  const attack = () => {
    if (battleWon || playerHp <= 0) return;
    const playerDamage = 10 + Math.floor(Math.random() * 6);
    const nextEnemyHp = Math.max(0, enemyHp - playerDamage);
    setEnemyHp(nextEnemyHp);

    if (nextEnemyHp === 0) {
      setBattleWon(true);
      setCol(25);
      setBattleLog(`Дикий кабан побеждён. Вы получили 25 Коллов и 20 опыта.`);
      return;
    }

    const enemyDamage = 5 + Math.floor(Math.random() * 4);
    setPlayerHp((value) => Math.max(0, value - enemyDamage));
    setStamina((value) => Math.max(0, value - 4));
    setBattleLog(`Вы нанесли ${playerDamage} урона. Кабан ответил и нанёс ${enemyDamage} урона.`);
  };

  const resetBattle = () => {
    setEnemyHp(30);
    setPlayerHp(100);
    setStamina(100);
    setCol(0);
    setBattleWon(false);
    setBattleLog('Первый враг уже заметил вас. Приготовьтесь к бою.');
  };

  return (
    <main className="mmo-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="game-hud">
        <button className="hud-menu" onClick={() => setMenuOpen(true)} aria-label="Открыть меню"><Menu /></button>
        <div className="hero-avatar"><div className="avatar-hair" /><span>1</span></div>
        <div className="hero-stats">
          <strong>PlayerOne</strong>
          <div className="mini-stat"><span>HP</span><i><b style={{ width: hpPercent }} /></i><em>{playerHp}/100</em></div>
          <div className="mini-stat stamina"><span>EN</span><i><b style={{ width: `${stamina}%` }} /></i><em>{stamina}/100</em></div>
          <div className="mini-stat exp"><span>EXP</span><i><b style={{ width: '0%' }} /></i><em>0%</em></div>
        </div>
        <div className="wallets">
          <div className="wallet"><Coins size={17}/><strong>{col}</strong><small>Коллы</small></div>
          <div className="wallet crowns"><Crown size={17}/><strong>{crowns}</strong><small>Кроны</small></div>
          <button className="hud-icon"><Bell size={19}/></button>
          <button className="hud-icon"><Settings size={19}/></button>
        </div>
      </header>

      {menuOpen && (
        <div className="menu-backdrop" onClick={() => setMenuOpen(false)}>
          <aside className="drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-brand"><Sparkles/><div><strong>AETHER TOWER</strong><span>MMORPG MINI APP</span></div></div>
            {[['Главная', Home, 'home'], ['Исследование', Map, 'explore'], ['Персонаж', UserRound, 'profile'], ['Инвентарь', Backpack, 'profile'], ['Магазин', ShoppingBag, 'shop'], ['Достижения', Trophy, 'profile']].map(([label, Icon, target]) => (
              <button key={label as string} onClick={() => { setView(target as View); setMenuOpen(false); }}><Icon size={20}/>{label as string}</button>
            ))}
          </aside>
        </div>
      )}

      <section className="screen-content">
        {view === 'home' && (
          <>
            <section className="event-hero game-panel">
              <div className="event-copy"><span>ВРЕМЕННОЕ СОБЫТИЕ</span><h1>ЗАТМЕНИЕ НАД БАШНЕЙ</h1><p>Первые врата открыты. Пройди обучение и получи стартовый клинок.</p><button onClick={() => setView('explore')}>Начать путь <ChevronRight size={18}/></button></div>
              <div className="eclipse-art"><div className="moon"/><div className="tower"/><div className="rays"/></div>
            </section>

            <div className="home-grid">
              <section className="city-card game-panel">
                <div className="panel-title"><div><span>ГЛАВНЫЙ ГОРОД</span><h2>Площадь Первого Света</h2></div><Castle/></div>
                <div className="city-art"><div className="city-tower t1"/><div className="city-tower t2"/><div className="city-tower t3"/><div className="city-road"/></div>
                <div className="city-actions">
                  <button><Sword/>Кузница</button><button><ShoppingBag/>Магазин</button><button><Shield/>Гильдия</button><button><MessageCircle/>Чат</button>
                </div>
              </section>

              <section className="progress-card game-panel">
                <div className="panel-title"><div><span>ПРОГРЕСС</span><h2>Начало пути</h2></div><Footprints/></div>
                <div className="quest-step done"><i>1</i><div><strong>Создать героя</strong><span>Выполнено</span></div></div>
                <div className="quest-step active"><i>2</i><div><strong>Выйти на 1 этаж</strong><span>Доступно сейчас</span></div></div>
                <div className="quest-step"><i>3</i><div><strong>Победить кабана</strong><span>Награда: 25 Коллов</span></div></div>
                <button className="primary-action" onClick={() => setView('explore')}>Перейти на этаж</button>
              </section>
            </div>

            <section className="floors-preview game-panel">
              <div className="panel-title"><div><span>БАШНЯ</span><h2>Доступные этажи</h2></div><Map/></div>
              <div className="floor-scroll">
                {floors.map((floor) => <FloorCard key={floor.id} floor={floor} onOpen={() => floor.unlocked && setView('explore')} />)}
              </div>
            </section>
          </>
        )}

        {view === 'explore' && (
          <section className="battle-layout">
            <section className="battle-stage game-panel">
              <div className="battle-topline"><span>ЭТАЖ 1 · ЛУГА НАЧАЛА</span><small>Первая встреча</small></div>
              <div className="battle-scene">
                <div className="scene-sky"><span/><span/><span/></div>
                <div className="scene-hills h1"/><div className="scene-hills h2"/>
                <div className="player-fighter"><div className="fighter-head"/><div className="fighter-body"/><div className="fighter-sword"/></div>
                <div className={`boar ${battleWon ? 'defeated' : ''}`}><div className="boar-body"/><div className="boar-head"/><div className="boar-leg l1"/><div className="boar-leg l2"/><div className="boar-tusk"/></div>
              </div>
              <div className="enemy-card">
                <div><span>ОБЫЧНЫЙ ВРАГ</span><h2>Дикий кабан</h2></div><strong>Ур. 1</strong>
                <div className="enemy-health"><i><b style={{ width: enemyPercent }}/></i><em>{enemyHp}/30 HP</em></div>
              </div>
            </section>

            <aside className="combat-panel game-panel">
              <div className="panel-title"><div><span>БОЙ</span><h2>{battleWon ? 'Победа' : 'Твой ход'}</h2></div><Sword/></div>
              <div className="combat-log">{battleLog}</div>
              <div className="combat-stats"><div><HeartPulse/><span>HP</span><strong>{playerHp}/100</strong></div><div><Zap/><span>Стамина</span><strong>{stamina}/100</strong></div></div>
              {!battleWon ? (
                <div className="combat-actions"><button className="attack" onClick={attack}><Sword/>Атаковать</button><button className="escape" onClick={() => setBattleLog('Вы отступили в город. Стамина не потрачена в демо-режиме.')}><Footprints/>Отступить</button></div>
              ) : (
                <div className="victory-box"><Sparkles/><strong>Награда получена</strong><span>25 Коллов · 20 опыта</span><button onClick={resetBattle}>Повторить бой</button></div>
              )}
            </aside>

            <section className="floor-list game-panel">
              <div className="panel-title"><div><span>КАРТА БАШНИ</span><h2>Этажи</h2></div><Map/></div>
              <div className="floor-scroll compact">{floors.map((floor) => <FloorCard key={floor.id} floor={floor} onOpen={() => undefined} />)}</div>
            </section>
          </section>
        )}

        {view === 'shop' && (
          <section className="shop-screen game-panel">
            <div className="panel-title"><div><span>МАГАЗИН ГОРОДА</span><h2>Снаряжение новичка</h2></div><ShoppingBag/></div>
            <p className="muted">Баланс начинается с нуля. Первые покупки станут доступны после победы на первом этаже.</p>
            <div className="shop-grid">{shopItems.map((item) => <article key={item.name} className="shop-item"><div>{item.icon}</div><strong>{item.name}</strong><span>{item.price} Коллов</span><button disabled={col < item.price}>{col < item.price ? 'Не хватает' : 'Купить'}</button></article>)}</div>
          </section>
        )}

        {view === 'profile' && (
          <section className="profile-screen">
            <section className="profile-hero-card game-panel"><div className="profile-anime"><div className="p-hair"/><div className="p-face"/><div className="p-coat"/><div className="p-sword"/></div><div><span>ПЕРСОНАЖ</span><h1>PlayerOne</h1><p>Уровень 1 · Новичок башни</p><div className="profile-badges"><b>Сила 12</b><b>Этаж 1</b><b>Без гильдии</b></div></div></section>
            <section className="equipment game-panel"><div className="panel-title"><div><span>ЭКИПИРОВКА</span><h2>Пустые слоты</h2></div><Shield/></div><div className="equipment-grid">{['Оружие','Доспех','Перчатки','Шлем','Ботинки','Кольцо'].map((slot) => <div key={slot}><LockKeyhole/><span>{slot}</span></div>)}</div></section>
          </section>
        )}
      </section>

      <nav className="mobile-nav">
        <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><Home/><span>Главная</span></button>
        <button className={view === 'explore' ? 'active' : ''} onClick={() => setView('explore')}><Map/><span>Этажи</span></button>
        <button className={view === 'profile' ? 'active' : ''} onClick={() => setView('profile')}><UserRound/><span>Герой</span></button>
        <button className={view === 'shop' ? 'active' : ''} onClick={() => setView('shop')}><ShoppingBag/><span>Магазин</span></button>
      </nav>
    </main>
  );
}

function FloorCard({ floor, onOpen }: { floor: Floor; onOpen: () => void }) {
  return (
    <button className={`floor-card ${floor.tone} ${floor.unlocked ? '' : 'locked'}`} onClick={onOpen}>
      <div className="floor-art"><span>{floor.id}</span>{!floor.unlocked && <LockKeyhole/>}</div>
      <div className="floor-copy"><small>ЭТАЖ {floor.id}</small><strong>{floor.name}</strong><span>{floor.subtitle}</span><em>Босс: {floor.boss}</em></div>
    </button>
  );
}
