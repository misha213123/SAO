import {
  Beer, Coins, Crown, Footprints, Hammer, HeartPulse, Home, Map, Menu,
  Shield, ShoppingBag, Sparkles, Sword, UserRound, Zap,
} from 'lucide-react';
import { PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  FLOORS, SHOP_ITEMS, SavedGame, ShopItem, applyExperience, calculateEnemyDamage,
  calculatePlayerDamage, createEnemy, getItem, loadGame, repairCost, saveGame,
  tavernRestCost, totalDefense, totalPower, xpRequired,
} from '../game/gameEngine';

type View = 'home' | 'explore' | 'tavern' | 'shop' | 'profile';
type ActionType = 'attack' | 'skill' | 'guard' | 'potion';
type TrailPoint = { x: number; y: number; id: number };

export function App() {
  const [view, setView] = useState<View>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [game, setGame] = useState<SavedGame>(() => loadGame());
  const [attacking, setAttacking] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [guarding, setGuarding] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const lastSwipeHit = useRef(0);
  const swipeCombo = useRef(0);
  const trailId = useRef(0);
  const spawnTimer = useRef<number | null>(null);

  const { player, enemy, battleWon, gameOver } = game;
  const currentFloor = FLOORS.find((floor) => floor.id === player.selectedFloor) ?? FLOORS[0];
  const currentWins = player.floorWins[player.selectedFloor] ?? 0;
  const currentCycle = player.floorCycles[player.selectedFloor] ?? 0;
  const requiredXp = xpRequired(player.level);
  const restPrice = tavernRestCost(player);
  const repairPrice = repairCost(player);
  const equippedWeapon = getItem(player.equippedWeapon);
  const equippedArmor = getItem(player.equippedArmor);

  useEffect(() => saveGame(game), [game]);

  useEffect(() => {
    if (!battleWon) return;

    if (spawnTimer.current !== null) window.clearTimeout(spawnTimer.current);
    spawnTimer.current = window.setTimeout(() => {
      setGame((value) => {
        if (!value.battleWon) return value;
        const floorId = value.player.selectedFloor;
        const wins = value.player.floorWins[floorId] ?? 0;
        const cycle = value.player.floorCycles[floorId] ?? 0;
        const nextEnemy = createEnemy(floorId, wins, cycle);
        const intro = nextEnemy.kind === 'boss'
          ? `БОСС ЭТАЖА — ${nextEnemy.name}. Цикл ${cycle + 1}.`
          : nextEnemy.kind === 'miniboss'
            ? `МИНИ-БОСС — ${nextEnemy.name}. Приготовься.`
            : nextEnemy.kind === 'elite'
              ? `Элитный враг ${nextEnemy.name} вступает в бой.`
              : `${nextEnemy.name} появляется перед героем.`;
        return { ...value, enemy: nextEnemy, battleWon: false, gameOver: false, log: intro };
      });
      swipeCombo.current = 0;
      spawnTimer.current = null;
    }, 120);

    return () => {
      if (spawnTimer.current !== null) {
        window.clearTimeout(spawnTimer.current);
        spawnTimer.current = null;
      }
    };
  }, [battleWon]);

  useEffect(() => {
    if (!trail.length) return;
    const timer = window.setTimeout(() => setTrail((points) => points.slice(-8)), 130);
    return () => window.clearTimeout(timer);
  }, [trail]);

  const hpPercent = useMemo(() => `${Math.max(0, (player.hp / player.maxHp) * 100)}%`, [player.hp, player.maxHp]);
  const staminaPercent = useMemo(() => `${Math.max(0, (player.stamina / player.maxStamina) * 100)}%`, [player.stamina, player.maxStamina]);
  const xpPercent = useMemo(() => `${Math.min(100, (player.xp / requiredXp) * 100)}%`, [player.xp, requiredXp]);
  const enemyPercent = useMemo(() => `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`, [enemy.hp, enemy.maxHp]);

  const rewardVictory = (value: SavedGame, nextPlayer: typeof player, hitText: string): SavedGame => {
    const xpResult = applyExperience(nextPlayer, value.enemy.xp);
    const wonBoss = value.enemy.kind === 'boss';
    const floorId = xpResult.player.selectedFloor;
    const oldWins = xpResult.player.floorWins[floorId] ?? 0;
    const oldCycle = xpResult.player.floorCycles[floorId] ?? 0;
    const nextWins = wonBoss ? 0 : oldWins + 1;
    const nextCycle = wonBoss ? oldCycle + 1 : oldCycle;
    const unlockedFloor = wonBoss ? Math.min(FLOORS.length, floorId + 1) : xpResult.player.highestFloor;
    const defeatedBosses = wonBoss && !xpResult.player.defeatedBosses.includes(floorId)
      ? [...xpResult.player.defeatedBosses, floorId]
      : xpResult.player.defeatedBosses;
    const rewardedPlayer = {
      ...xpResult.player,
      col: xpResult.player.col + value.enemy.col,
      crowns: xpResult.player.crowns + (wonBoss ? 1 : 0),
      highestFloor: Math.max(xpResult.player.highestFloor, unlockedFloor),
      floorWins: { ...xpResult.player.floorWins, [floorId]: nextWins },
      floorCycles: { ...xpResult.player.floorCycles, [floorId]: nextCycle },
      defeatedBosses,
      totalKills: xpResult.player.totalKills + 1,
    };
    const levelText = xpResult.levelsGained ? ` Новый уровень: ${rewardedPlayer.level}!` : '';
    const bossText = wonBoss ? ` Цикл ${nextCycle} завершён. +1 Крона.` : '';
    const unlockText = wonBoss && unlockedFloor > floorId ? ` Открыт этаж ${unlockedFloor}.` : '';
    return {
      ...value,
      player: rewardedPlayer,
      enemy: { ...value.enemy, hp: 0 },
      battleWon: true,
      log: `${hitText} ${value.enemy.name} побеждён. +${value.enemy.xp} XP, +${value.enemy.col} Коллов.${levelText}${bossText}${unlockText}`,
    };
  };

  const enemyTurn = (wasGuarding: boolean) => {
    setGame((value) => {
      if (value.enemy.hp <= 0 || value.battleWon) return value;
      const raw = calculateEnemyDamage(value.player, value.enemy);
      const damage = wasGuarding || guarding ? Math.max(1, Math.floor(raw * 0.42)) : raw;
      const nextHp = Math.max(0, value.player.hp - damage);
      const armorLoss = value.enemy.kind === 'boss' ? 3 : value.enemy.kind === 'miniboss' ? 2 : 1;
      const nextPlayer = { ...value.player, hp: nextHp, armorDurability: Math.max(0, value.player.armorDurability - armorLoss) };
      if (nextHp === 0) {
        const lost = Math.floor(value.player.col * 0.1);
        return { ...value, player: { ...nextPlayer, col: Math.max(0, value.player.col - lost) }, gameOver: true, log: `${value.enemy.name} победил. Потеряно ${lost} Коллов.` };
      }
      return { ...value, player: nextPlayer, log: `${value.log} Ответный удар: ${damage}.` };
    });
    setGuarding(false);
  };

  const strike = (multiplier: number, staminaCost: number, durabilityLoss: number, retaliate: boolean) => {
    if (battleWon || gameOver || attacking || player.weaponDurability <= 0) return;
    if (player.stamina < staminaCost) {
      setGame((value) => ({ ...value, log: 'Недостаточно энергии для этого удара.' }));
      return;
    }
    setAttacking(true);
    setHitFlash(true);
    navigator.vibrate?.(12);

    let killed = false;
    setGame((value) => {
      if (value.battleWon || value.enemy.hp <= 0) return value;
      const result = calculatePlayerDamage(value.player, value.enemy, multiplier);
      const nextEnemyHp = Math.max(0, value.enemy.hp - result.damage);
      const nextPlayer = {
        ...value.player,
        stamina: Math.max(0, value.player.stamina - staminaCost),
        weaponDurability: Math.max(0, value.player.weaponDurability - durabilityLoss),
      };
      const hitText = `${result.critical ? 'КРИТ! ' : ''}Клинок наносит ${result.damage} урона.`;
      killed = nextEnemyHp === 0;
      if (killed) return rewardVictory(value, nextPlayer, hitText);
      return { ...value, player: nextPlayer, enemy: { ...value.enemy, hp: nextEnemyHp }, log: hitText };
    });

    window.setTimeout(() => setHitFlash(false), 130);
    window.setTimeout(() => {
      setAttacking(false);
      if (retaliate && !killed) enemyTurn(false);
    }, 105);
  };

  const performAction = (action: ActionType) => {
    if (action === 'attack') return strike(1, 3, 1, true);
    if (action === 'skill') return strike(1.9, 18, 2, true);
    if (action === 'potion') {
      if (player.potions <= 0) {
        setGame((value) => ({ ...value, log: 'Зелья закончились. Купи новое в лавке.' }));
        return;
      }
      const healed = Math.min(45, player.maxHp - player.hp);
      setGame((value) => ({ ...value, player: { ...value.player, hp: value.player.hp + healed, potions: value.player.potions - 1 }, log: `Ты восстановил ${healed} HP.` }));
      window.setTimeout(() => enemyTurn(false), 350);
      return;
    }
    setGuarding(true);
    setGame((value) => ({ ...value, player: { ...value.player, stamina: Math.min(value.player.maxStamina, value.player.stamina + 10) }, log: 'Защитная стойка: следующий удар ослаблен.' }));
    window.setTimeout(() => enemyTurn(true), 350);
  };

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (battleWon || gameOver) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setSwiping(true);
    lastPoint.current = { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
    addTrailPoint(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
  };

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!swiping || !lastPoint.current || battleWon || gameOver) return;
    const point = { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
    const distance = Math.hypot(point.x - lastPoint.current.x, point.y - lastPoint.current.y);
    if (distance < 9) return;
    addTrailPoint(point.x, point.y);
    const now = performance.now();
    if (now - lastSwipeHit.current > 115) {
      lastSwipeHit.current = now;
      swipeCombo.current += 1;
      const retaliate = swipeCombo.current % 5 === 0;
      strike(0.72, 0, retaliate ? 1 : 0, retaliate);
    }
    lastPoint.current = point;
  };

  const pointerUp = () => {
    setSwiping(false);
    lastPoint.current = null;
    window.setTimeout(() => setTrail([]), 120);
  };

  const addTrailPoint = (x: number, y: number) => {
    trailId.current += 1;
    setTrail((points) => [...points.slice(-12), { x, y, id: trailId.current }]);
  };

  const selectFloor = (floorId: number) => {
    if (floorId > player.highestFloor) return;
    setGame((value) => {
      const wins = value.player.floorWins[floorId] ?? 0;
      const cycle = value.player.floorCycles[floorId] ?? 0;
      return {
        ...value,
        player: { ...value.player, selectedFloor: floorId },
        enemy: createEnemy(floorId, wins, cycle),
        battleWon: false,
        gameOver: false,
        log: `Ты вошёл в локацию «${FLOORS[floorId - 1].name}». Цикл ${cycle + 1}.`,
      };
    });
    setView('explore');
  };

  const rest = () => {
    if (player.col < restPrice) return;
    setGame((value) => ({ ...value, player: { ...value.player, col: value.player.col - restPrice, hp: value.player.maxHp, stamina: value.player.maxStamina }, gameOver: false, log: 'Силы полностью восстановлены.' }));
  };

  const repair = () => {
    if (player.col < repairPrice) return;
    setGame((value) => ({ ...value, player: { ...value.player, col: value.player.col - repairPrice, weaponDurability: value.player.maxWeaponDurability, armorDurability: value.player.maxArmorDurability }, log: 'Оружие и доспехи полностью починены.' }));
  };

  const buyOrEquip = (item: ShopItem) => {
    const owned = player.inventory.includes(item.id);
    if (item.slot === 'consumable') {
      if (player.col < item.price) return;
      setGame((value) => ({ ...value, player: { ...value.player, col: value.player.col - item.price, potions: value.player.potions + 1 }, log: `Куплено: ${item.name}.` }));
      return;
    }
    if (!owned) {
      if (player.col < item.price) return;
      setGame((value) => ({
        ...value,
        player: {
          ...value.player,
          col: value.player.col - item.price,
          inventory: [...value.player.inventory, item.id],
          equippedWeapon: item.slot === 'weapon' ? item.id : value.player.equippedWeapon,
          equippedArmor: item.slot === 'armor' ? item.id : value.player.equippedArmor,
        },
        log: `${item.name} куплен и сразу надет.`,
      }));
      return;
    }
    setGame((value) => ({
      ...value,
      player: {
        ...value.player,
        equippedWeapon: item.slot === 'weapon' ? item.id : value.player.equippedWeapon,
        equippedArmor: item.slot === 'armor' ? item.id : value.player.equippedArmor,
      },
      log: `${item.name} экипирован.`,
    }));
  };

  const resetProgress = () => {
    localStorage.removeItem('aether-tower-save-v1');
    window.location.reload();
  };

  const enemyLabel = enemy.kind === 'boss' ? 'БОСС ЭТАЖА' : enemy.kind === 'miniboss' ? 'МИНИ-БОСС' : enemy.kind === 'elite' ? 'ЭЛИТНЫЙ ВРАГ' : 'ОБЫЧНЫЙ ВРАГ';
  const enemyIcon = enemy.kind === 'boss' ? '👹' : enemy.kind === 'miniboss' ? '🦹' : enemy.kind === 'elite' ? '🐺' : '🐗';

  return (
    <main className="mmo-shell cinematic-shell upgraded-game swipe-game">
      <header className="game-hud cinematic-hud">
        <button className="hud-menu" onClick={() => setMenuOpen(true)}><Menu /></button>
        <div className="hero-avatar back-avatar"><span>{player.level}</span></div>
        <div className="hero-stats"><strong>PlayerOne</strong><div className="mini-stat"><span>HP</span><i><b style={{ width: hpPercent }} /></i><em>{player.hp}/{player.maxHp}</em></div><div className="mini-stat stamina"><span>EN</span><i><b style={{ width: staminaPercent }} /></i><em>{player.stamina}/{player.maxStamina}</em></div><div className="mini-stat exp"><span>EXP</span><i><b style={{ width: xpPercent }} /></i><em>{player.xp}/{requiredXp}</em></div></div>
        <div className="wallets"><div className="wallet"><Coins /><strong>{player.col}</strong><small>Коллы</small></div><div className="wallet crowns"><Crown /><strong>{player.crowns}</strong><small>Кроны</small></div></div>
      </header>

      {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)}><aside className="drawer" onClick={(event) => event.stopPropagation()}><strong className="drawer-title">AETHER TOWER</strong><button onClick={() => { setView('home'); setMenuOpen(false); }}><Home />Главная</button><button onClick={() => { setView('explore'); setMenuOpen(false); }}><Map />Этажи</button><button onClick={() => { setView('tavern'); setMenuOpen(false); }}><Beer />Таверна</button><button onClick={() => { setView('profile'); setMenuOpen(false); }}><UserRound />Герой</button><button onClick={() => { setView('shop'); setMenuOpen(false); }}><ShoppingBag />Магазин</button><button onClick={resetProgress}>Сбросить прогресс</button></aside></div>}

      <section className="screen-content">
        {view === 'home' && <><section className="event-hero game-panel city-home"><div className="event-copy"><span>БЕСКОНЕЧНАЯ БАШНЯ</span><h1>{currentFloor.name}</h1><p>Цикл {currentCycle + 1} · Волна {currentWins + 1}/{currentFloor.encountersToBoss + 1}. Мини-босс на волне {currentFloor.minibossAt + 1}, затем босс.</p><button onClick={() => setView('explore')}>Продолжить поход</button></div><div className="home-city-sky"><i /><i /><i /><i /></div></section><section className="game-panel quick-actions"><button onClick={() => setView('explore')}><Sword />В бой</button><button onClick={() => setView('tavern')}><Beer />Таверна</button><button onClick={() => setView('shop')}><ShoppingBag />Лавка</button></section><section className="game-panel floor-list"><div className="panel-title"><div><span>КАРТА БАШНИ</span><h2>Локации</h2></div><Map /></div><div className="floor-scroll compact">{FLOORS.map((floor) => <FloorCard key={floor.id} floor={floor} unlocked={floor.id <= player.highestFloor} onOpen={() => selectFloor(floor.id)} />)}</div></section></>}

        {view === 'explore' && <section className="battle-layout cinematic-battle-layout">
          <section className={`battle-stage game-panel swipe-battle-stage ${hitFlash ? 'enemy-hit' : ''}`}>
            <div className="battle-topline"><span>ЭТАЖ {player.selectedFloor} · {currentFloor.name}</span><small>ЦИКЛ {currentCycle + 1} · ВОЛНА {Math.min(currentWins + 1, currentFloor.encountersToBoss + 1)}/{currentFloor.encountersToBoss + 1}</small></div>
            <div className={`battle-scene swipe-city-scene floor-${player.selectedFloor}`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}>
              <div className="city-sky"><span className="moon" /><span className="cloud c1" /><span className="cloud c2" /></div>
              <div className="city-backdrop"><i /><i /><i /><i /><i /><i /></div>
              <div className="city-street"><i /><i /><i /></div>
              <div key={enemy.id} className={`rear-enemy ${enemy.kind} ${battleWon ? 'defeated' : ''}`}><div className="enemy-shadow" /><div className="enemy-body"><span>{enemyIcon}</span></div></div>
              <div className={`back-hero ${attacking ? 'slashing' : ''} armor-${player.equippedArmor ?? 'starter'} weapon-${player.equippedWeapon ?? 'starter'}`}><div className="back-hair" /><div className="back-head" /><div className="back-cape" /><div className="back-torso"><i className="armor-mark" /></div><div className="back-arm left" /><div className="back-arm right" /><div className="back-leg left" /><div className="back-leg right" /><div className="equipped-sword" /></div>
              <svg className="swipe-trail" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><polyline points={trail.map((point) => `${point.x},${point.y}`).join(' ')} /></svg>
              {trail.slice(-5).map((point) => <i key={point.id} className="trail-spark" style={{ left: point.x, top: point.y }} />)}
              <div className="swipe-hint">ПРОВЕДИ МЕЧОМ ПО ЭКРАНУ</div><div className="scene-vignette" />
            </div>
            <div className="enemy-card cinematic-enemy-card"><div><span>{enemyLabel}</span><h2>{enemy.name}</h2><small>{enemy.description}</small></div><strong>Ур. {enemy.level}</strong><div className="enemy-health"><i><b style={{ width: enemyPercent }} /></i><em>{enemy.hp}/{enemy.maxHp}</em></div></div>
          </section>
          <aside className="combat-panel game-panel cinematic-combat-panel"><div className="combat-log cinematic-log">{game.log}</div><div className="combat-stats"><div><HeartPulse /><span>HP</span><strong>{player.hp}/{player.maxHp}</strong></div><div><Zap /><span>Энергия</span><strong>{player.stamina}/{player.maxStamina}</strong></div><div><Sword /><span>Сила</span><strong>{totalPower(player)}</strong></div><div><Shield /><span>Защита</span><strong>{totalDefense(player)}</strong></div></div>{!gameOver && <div className="combat-actions swipe-actions"><button onClick={() => performAction('skill')}><Zap />Рывок</button><button onClick={() => performAction('guard')}><Shield />Защита</button><button onClick={() => performAction('potion')}>🧪 {player.potions}</button></div>}{battleWon && <div className="auto-next"><Sparkles /> Новый враг появляется…</div>}{gameOver && <button className="return-tavern" onClick={() => setView('tavern')}><Beer />В таверну</button>}<button className="leave-floor" onClick={() => setView('tavern')}><Footprints />Покинуть этаж</button></aside>
        </section>}

        {view === 'tavern' && <section className="tavern-screen"><section className="game-panel tavern-hero"><div><span>БЕЗОПАСНАЯ ЗОНА</span><h1>Таверна «Синий Фонарь»</h1><p>Восстанови силы и почини снаряжение.</p></div><div className="tavern-fire">🔥</div></section><section className="game-panel service-card"><Beer /><div><h3>Комната путника</h3><p>Полное восстановление HP и энергии.</p></div><strong>{restPrice} Коллов</strong><button disabled={player.col < restPrice || restPrice === 0} onClick={rest}>{restPrice === 0 ? 'Силы полны' : 'Отдохнуть'}</button></section><section className="game-panel service-card"><Hammer /><div><h3>Кузнец</h3><p>Ремонт оружия и брони.</p></div><strong>{repairPrice} Коллов</strong><button disabled={player.col < repairPrice || repairPrice === 0} onClick={repair}>{repairPrice === 0 ? 'Всё исправно' : 'Починить'}</button></section><button className="primary-action tavern-exit" onClick={() => setView('explore')}>Вернуться на этаж</button></section>}

        {view === 'shop' && <section className="shop-screen game-panel equipment-shop"><div className="panel-title"><div><span>ОРУЖЕЙНАЯ ЛАВКА</span><h2>Предметы и экипировка</h2></div><ShoppingBag /></div><div className="equipped-summary"><div><Sword /><span>Оружие</span><strong>{equippedWeapon?.name ?? 'Стартовый клинок'}</strong></div><div><Shield /><span>Броня</span><strong>{equippedArmor?.name ?? 'Одежда новичка'}</strong></div></div><div className="shop-grid equipment-grid-shop">{SHOP_ITEMS.map((item) => { const owned = player.inventory.includes(item.id); const equipped = player.equippedWeapon === item.id || player.equippedArmor === item.id; return <article key={item.id} className={`shop-item gear-card tone-${item.tone} ${equipped ? 'equipped' : ''}`}><div className="gear-icon">{item.icon}</div><small>{item.slot === 'weapon' ? 'ОРУЖИЕ' : item.slot === 'armor' ? 'БРОНЯ' : 'РАСХОДНИК'}</small><strong>{item.name}</strong><p>{item.description}</p><span>{item.powerBonus ? `+${item.powerBonus} сила` : item.defenseBonus ? `+${item.defenseBonus} защита` : `${item.price} Коллов`}</span><button disabled={!owned && player.col < item.price} onClick={() => buyOrEquip(item)}>{equipped ? 'Надето' : owned ? 'Надеть' : `Купить · ${item.price}`}</button></article>; })}</div></section>}

        {view === 'profile' && <section className="profile-screen"><section className="profile-hero-card game-panel back-profile"><div className={`profile-back-hero armor-${player.equippedArmor ?? 'starter'} weapon-${player.equippedWeapon ?? 'starter'}`}><div className="back-hair" /><div className="back-head" /><div className="back-cape" /><div className="back-torso" /><div className="equipped-sword" /></div><div><span>ПЕРСОНАЖ</span><h1>PlayerOne</h1><p>Уровень {player.level} · Открыт этаж {player.highestFloor}</p><div className="profile-badges"><b>Сила {totalPower(player)}</b><b>Защита {totalDefense(player)}</b><b>Крит {Math.round(player.critChance * 100)}%</b></div><p>Всего убийств: {player.totalKills}<br />Цикл текущего этажа: {currentCycle + 1}<br />Оружие: {equippedWeapon?.name ?? 'Стартовый клинок'}<br />Броня: {equippedArmor?.name ?? 'Одежда новичка'}</p></div></section></section>}
      </section>

      <nav className="mobile-nav cinematic-nav five-nav"><button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><Home /><span>Главная</span></button><button className={view === 'explore' ? 'active' : ''} onClick={() => setView('explore')}><Map /><span>Этажи</span></button><button className={view === 'tavern' ? 'active' : ''} onClick={() => setView('tavern')}><Beer /><span>Таверна</span></button><button className={view === 'profile' ? 'active' : ''} onClick={() => setView('profile')}><UserRound /><span>Герой</span></button><button className={view === 'shop' ? 'active' : ''} onClick={() => setView('shop')}><ShoppingBag /><span>Лавка</span></button></nav>
    </main>
  );
}

function FloorCard({ floor, unlocked, onOpen }: { floor: (typeof FLOORS)[number]; unlocked: boolean; onOpen: () => void }) {
  return <button className={`floor-card ${unlocked ? '' : 'locked'}`} onClick={onOpen}><div className="floor-art"><span>{floor.id}</span>{!unlocked && '🔒'}</div><div className="floor-copy"><small>ЭТАЖ {floor.id}</small><strong>{floor.name}</strong><span>{floor.subtitle}</span><em>Мини-босс: волна {floor.minibossAt + 1}<br />Босс: {floor.bossName}</em></div></button>;
}
