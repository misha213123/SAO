import {
  Backpack, Beer, Coins, Crown, Footprints, Hammer, HeartPulse, Home, Map,
  Menu, Shield, ShoppingBag, Sparkles, Sword, UserRound, Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  FLOORS, SavedGame, applyExperience, calculateEnemyDamage, calculatePlayerDamage,
  createEnemy, loadGame, repairCost, saveGame, tavernRestCost, xpRequired,
} from '../game/gameEngine';

type View = 'home' | 'explore' | 'tavern' | 'shop' | 'profile';
type ActionType = 'attack' | 'skill' | 'guard' | 'potion';

const HERO_ART = 'https://cdn.pixabay.com/photo/2025/02/18/21/35/male-character-9416412_1280.png';

const shopItems = [
  { icon: '🧪', name: 'Малое зелье', price: 35, type: 'potion' },
  { icon: '🗡️', name: 'Точильный камень', price: 55, type: 'weapon' },
  { icon: '🛡️', name: 'Набор броника', price: 70, type: 'armor' },
];

export function App() {
  const [view, setView] = useState<View>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [game, setGame] = useState<SavedGame>(() => loadGame());
  const [attacking, setAttacking] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [guarding, setGuarding] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const { player, enemy, battleWon, gameOver } = game;
  const currentFloor = FLOORS.find((floor) => floor.id === player.selectedFloor) ?? FLOORS[0];
  const currentWins = player.floorWins[player.selectedFloor] ?? 0;
  const requiredXp = xpRequired(player.level);
  const restPrice = tavernRestCost(player);
  const repairPrice = repairCost(player);

  useEffect(() => saveGame(game), [game]);

  useEffect(() => {
    if (!battleWon || transitioning) return;
    setTransitioning(true);
    const timer = window.setTimeout(() => {
      setGame((value) => {
        const wins = value.player.floorWins[value.player.selectedFloor] ?? 0;
        const nextEnemy = createEnemy(value.player.selectedFloor, wins);
        return {
          ...value,
          enemy: nextEnemy,
          battleWon: false,
          gameOver: false,
          log: nextEnemy.kind === 'boss'
            ? `Врата дрожат. На арену выходит босс — ${nextEnemy.name}.`
            : `Из тумана появляется новый противник: ${nextEnemy.name}.`,
        };
      });
      setTransitioning(false);
    }, enemy.kind === 'boss' ? 1500 : 850);
    return () => window.clearTimeout(timer);
  }, [battleWon, enemy.kind, transitioning]);

  const hpPercent = useMemo(() => `${Math.max(0, (player.hp / player.maxHp) * 100)}%`, [player.hp, player.maxHp]);
  const staminaPercent = useMemo(() => `${Math.max(0, (player.stamina / player.maxStamina) * 100)}%`, [player.stamina, player.maxStamina]);
  const xpPercent = useMemo(() => `${Math.min(100, (player.xp / requiredXp) * 100)}%`, [player.xp, requiredXp]);
  const enemyPercent = useMemo(() => `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`, [enemy.hp, enemy.maxHp]);

  const performAction = (action: ActionType) => {
    if (battleWon || gameOver || attacking) return;

    if (action === 'potion') {
      if (player.potions <= 0) {
        setGame((value) => ({ ...value, log: 'Зелья закончились. Купи новое в городе.' }));
        return;
      }
      const healed = Math.min(45, player.maxHp - player.hp);
      setGame((value) => ({
        ...value,
        player: { ...value.player, hp: value.player.hp + healed, potions: value.player.potions - 1 },
        log: `Ты выпил зелье и восстановил ${healed} HP.`,
      }));
      window.setTimeout(() => enemyTurn(false), 350);
      return;
    }

    if (action === 'skill' && player.stamina < 18) {
      setGame((value) => ({ ...value, log: 'Недостаточно энергии для «Рывка клинка».' }));
      return;
    }

    if (action === 'guard') {
      setGuarding(true);
      setGame((value) => ({
        ...value,
        player: { ...value.player, stamina: Math.min(value.player.maxStamina, value.player.stamina + 10) },
        log: 'Защитная стойка: входящий урон уменьшен, энергия восстановлена.',
      }));
      window.setTimeout(() => enemyTurn(true), 420);
      return;
    }

    setAttacking(true);
    const staminaCost = action === 'skill' ? 18 : 4;
    const multiplier = action === 'skill' ? 1.8 : 1;

    window.setTimeout(() => {
      setGame((value) => {
        const result = calculatePlayerDamage(value.player, value.enemy, multiplier);
        const nextEnemyHp = Math.max(0, value.enemy.hp - result.damage);
        const nextPlayer = {
          ...value.player,
          stamina: Math.max(0, value.player.stamina - staminaCost),
          weaponDurability: Math.max(0, value.player.weaponDurability - (action === 'skill' ? 2 : 1)),
        };
        const hitText = `${result.critical ? 'КРИТ! ' : ''}Ты нанёс ${result.damage} урона.`;

        if (nextEnemyHp === 0) {
          const xpResult = applyExperience(nextPlayer, value.enemy.xp);
          const wonBoss = value.enemy.kind === 'boss';
          const floorId = xpResult.player.selectedFloor;
          const oldWins = xpResult.player.floorWins[floorId] ?? 0;
          const nextFloorWins = { ...xpResult.player.floorWins, [floorId]: wonBoss ? 0 : oldWins + 1 };
          const unlockedFloor = wonBoss ? Math.min(FLOORS.length, floorId + 1) : xpResult.player.highestFloor;
          const defeatedBosses = wonBoss && !xpResult.player.defeatedBosses.includes(floorId)
            ? [...xpResult.player.defeatedBosses, floorId]
            : xpResult.player.defeatedBosses;
          const rewardedPlayer = {
            ...xpResult.player,
            col: xpResult.player.col + value.enemy.col,
            highestFloor: Math.max(xpResult.player.highestFloor, unlockedFloor),
            floorWins: nextFloorWins,
            defeatedBosses,
          };
          const levelText = xpResult.levelsGained ? ` Новый уровень: ${rewardedPlayer.level}!` : '';
          const unlockText = wonBoss && unlockedFloor > floorId ? ` Открыт этаж ${unlockedFloor}.` : '';
          return {
            ...value,
            player: rewardedPlayer,
            enemy: { ...value.enemy, hp: 0 },
            battleWon: true,
            log: `${hitText} ${value.enemy.name} побеждён. +${value.enemy.xp} XP, +${value.enemy.col} Коллов.${levelText}${unlockText}`,
          };
        }

        return { ...value, player: nextPlayer, enemy: { ...value.enemy, hp: nextEnemyHp }, log: hitText };
      });
      setHitFlash(true);
      window.setTimeout(() => setHitFlash(false), 260);
      window.setTimeout(() => enemyTurn(false), 470);
    }, 360);
  };

  const enemyTurn = (wasGuarding: boolean) => {
    setGame((value) => {
      if (value.enemy.hp <= 0 || value.battleWon) return value;
      const raw = calculateEnemyDamage(value.player, value.enemy);
      const damage = wasGuarding || guarding ? Math.max(1, Math.floor(raw * 0.42)) : raw;
      const nextHp = Math.max(0, value.player.hp - damage);
      const armorLoss = value.enemy.kind === 'boss' ? 2 : 1;
      const nextPlayer = {
        ...value.player,
        hp: nextHp,
        armorDurability: Math.max(0, value.player.armorDurability - armorLoss),
      };
      if (nextHp === 0) {
        const lost = Math.floor(value.player.col * 0.1);
        return {
          ...value,
          player: { ...nextPlayer, col: Math.max(0, value.player.col - lost) },
          gameOver: true,
          log: `${value.enemy.name} победил. Потеряно ${lost} Коллов. Вернись в таверну.`,
        };
      }
      const rage = value.enemy.kind === 'boss' && value.enemy.hp <= value.enemy.maxHp * 0.35 ? ' Босс входит в ярость!' : '';
      return { ...value, player: nextPlayer, log: `${value.log} Ответный удар: ${damage}.${rage}` };
    });
    setGuarding(false);
    setAttacking(false);
  };

  const selectFloor = (floorId: number) => {
    if (floorId > player.highestFloor) return;
    setGame((value) => {
      const wins = value.player.floorWins[floorId] ?? 0;
      return {
        ...value,
        player: { ...value.player, selectedFloor: floorId },
        enemy: createEnemy(floorId, wins),
        battleWon: false,
        gameOver: false,
        log: `Ты вошёл на этаж ${floorId}. Цель: добраться до босса.`,
      };
    });
    setView('explore');
  };

  const rest = () => {
    if (player.col < restPrice) return;
    setGame((value) => ({
      ...value,
      player: { ...value.player, col: value.player.col - restPrice, hp: value.player.maxHp, stamina: value.player.maxStamina },
      gameOver: false,
      log: 'После отдыха силы полностью восстановлены.',
    }));
  };

  const repair = () => {
    if (player.col < repairPrice) return;
    setGame((value) => ({
      ...value,
      player: {
        ...value.player,
        col: value.player.col - repairPrice,
        weaponDurability: value.player.maxWeaponDurability,
        armorDurability: value.player.maxArmorDurability,
      },
      log: 'Кузнец полностью починил оружие и доспехи.',
    }));
  };

  const buyItem = (type: string, price: number) => {
    if (player.col < price) return;
    setGame((value) => {
      const next = { ...value.player, col: value.player.col - price };
      if (type === 'potion') next.potions += 1;
      if (type === 'weapon') next.weaponDurability = Math.min(next.maxWeaponDurability, next.weaponDurability + 20);
      if (type === 'armor') next.armorDurability = Math.min(next.maxArmorDurability, next.armorDurability + 25);
      return { ...value, player: next, log: 'Покупка добавлена в инвентарь.' };
    });
  };

  const resetProgress = () => {
    localStorage.removeItem('aether-tower-save-v1');
    window.location.reload();
  };

  return (
    <main className="mmo-shell cinematic-shell upgraded-game">
      <div className="floating-particles" aria-hidden="true">{Array.from({ length: 18 }).map((_, i) => <i key={i}/>)}</div>

      <header className="game-hud cinematic-hud">
        <button className="hud-menu" onClick={() => setMenuOpen(true)}><Menu/></button>
        <div className="hero-avatar real-avatar"><img src={HERO_ART} alt="Герой"/><span>{player.level}</span></div>
        <div className="hero-stats">
          <strong>PlayerOne</strong>
          <div className="mini-stat"><span>HP</span><i><b style={{ width: hpPercent }}/></i><em>{player.hp}/{player.maxHp}</em></div>
          <div className="mini-stat stamina"><span>EN</span><i><b style={{ width: staminaPercent }}/></i><em>{player.stamina}/{player.maxStamina}</em></div>
          <div className="mini-stat exp"><span>EXP</span><i><b style={{ width: xpPercent }}/></i><em>{player.xp}/{requiredXp}</em></div>
        </div>
        <div className="wallets"><div className="wallet"><Coins/><strong>{player.col}</strong><small>Коллы</small></div><div className="wallet crowns"><Crown/><strong>{player.crowns}</strong><small>Кроны</small></div></div>
      </header>

      {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)}><aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <strong className="drawer-title">AETHER TOWER</strong>
        <button onClick={() => { setView('home'); setMenuOpen(false); }}><Home/>Главная</button>
        <button onClick={() => { setView('explore'); setMenuOpen(false); }}><Map/>Этажи</button>
        <button onClick={() => { setView('tavern'); setMenuOpen(false); }}><Beer/>Таверна</button>
        <button onClick={() => { setView('profile'); setMenuOpen(false); }}><UserRound/>Герой</button>
        <button onClick={() => { setView('shop'); setMenuOpen(false); }}><ShoppingBag/>Магазин</button>
        <button onClick={resetProgress}>Сбросить прогресс</button>
      </aside></div>}

      <section className="screen-content">
        {view === 'home' && <>
          <section className="event-hero game-panel cinematic-event"><div className="event-copy"><span>ТЕКУЩАЯ ГЛАВА</span><h1>{currentFloor.name}</h1><p>Победы до босса: {currentWins}/{currentFloor.encountersToBoss}. Получай XP, следи за прочностью и возвращайся в город между походами.</p><button onClick={() => setView('explore')}>Продолжить поход</button></div></section>
          <section className="game-panel quick-actions"><button onClick={() => setView('explore')}><Sword/>В бой</button><button onClick={() => setView('tavern')}><Beer/>Таверна</button><button onClick={() => setView('shop')}><ShoppingBag/>Лавка</button></section>
          <section className="game-panel floor-list"><div className="panel-title"><div><span>КАРТА БАШНИ</span><h2>Открытые этажи</h2></div><Map/></div><div className="floor-scroll compact">{FLOORS.map((floor) => <FloorCard key={floor.id} floor={floor} unlocked={floor.id <= player.highestFloor} onOpen={() => selectFloor(floor.id)}/>)}</div></section>
        </>}

        {view === 'explore' && <section className="battle-layout cinematic-battle-layout">
          <section className={`battle-stage game-panel cinematic-battle-stage ${hitFlash ? 'enemy-hit' : ''}`}>
            <div className="battle-topline"><span>ЭТАЖ {player.selectedFloor} · {currentFloor.name}</span><small>{enemy.kind === 'boss' ? 'БОСС ЭТАЖА' : `${currentWins}/${currentFloor.encountersToBoss}`}</small></div>
            <div className="battle-scene real-art-scene">
              <div className="hero-art-photo"><img src={HERO_ART} alt="Аниме-герой"/></div>
              <div className={`enemy-orb ${enemy.kind} ${battleWon ? 'defeated' : ''}`}><span>{enemy.kind === 'boss' ? '👹' : enemy.kind === 'elite' ? '🐺' : '🐗'}</span></div>
              <div className="scene-vignette"/>
            </div>
            <div className="enemy-card cinematic-enemy-card"><div><span>{enemy.kind === 'boss' ? 'БОСС ЭТАЖА' : enemy.kind === 'elite' ? 'ЭЛИТНЫЙ ВРАГ' : 'ОБЫЧНЫЙ ВРАГ'}</span><h2>{enemy.name}</h2><small>{enemy.description}</small></div><strong>Ур. {enemy.level}</strong><div className="enemy-health"><i><b style={{ width: enemyPercent }}/></i><em>{enemy.hp}/{enemy.maxHp}</em></div></div>
          </section>
          <aside className="combat-panel game-panel cinematic-combat-panel"><div className="panel-title"><div><span>БОЕВАЯ СИСТЕМА</span><h2>{battleWon ? 'Победа' : gameOver ? 'Поражение' : 'Твой ход'}</h2></div><Sword/></div><div className="combat-log cinematic-log">{game.log}</div><div className="combat-stats"><div><HeartPulse/><span>HP</span><strong>{player.hp}/{player.maxHp}</strong></div><div><Zap/><span>Энергия</span><strong>{player.stamina}/{player.maxStamina}</strong></div><div><Sword/><span>Клинок</span><strong>{player.weaponDurability}/{player.maxWeaponDurability}</strong></div><div><Shield/><span>Броня</span><strong>{player.armorDurability}/{player.maxArmorDurability}</strong></div></div>
            {!gameOver && <div className="combat-actions four-actions"><button className="attack" onClick={() => performAction('attack')}><Sword/>Атака</button><button onClick={() => performAction('skill')}><Zap/>Рывок</button><button onClick={() => performAction('guard')}><Shield/>Защита</button><button onClick={() => performAction('potion')}>🧪 Зелье {player.potions}</button></div>}
            {battleWon && <div className="auto-next"><Sparkles/> Следующий враг появляется автоматически…</div>}
            {gameOver && <button className="return-tavern" onClick={() => setView('tavern')}><Beer/>Вернуться в таверну</button>}
            <button className="leave-floor" onClick={() => setView('tavern')}><Footprints/>Покинуть этаж</button>
          </aside>
        </section>}

        {view === 'tavern' && <section className="tavern-screen">
          <section className="game-panel tavern-hero"><div><span>БЕЗОПАСНАЯ ЗОНА</span><h1>Таверна «Синий Фонарь»</h1><p>Отдохни, восстанови силы и подготовь снаряжение к следующему походу.</p></div><div className="tavern-fire">🔥</div></section>
          <section className="game-panel service-card"><Beer/><div><h3>Комната путника</h3><p>Полностью восстанавливает HP и энергию.</p></div><strong>{restPrice} Коллов</strong><button disabled={player.col < restPrice || restPrice === 0} onClick={rest}>{restPrice === 0 ? 'Силы полны' : 'Отдохнуть'}</button></section>
          <section className="game-panel service-card"><Hammer/><div><h3>Кузнец таверны</h3><p>Чинит оружие и доспехи до максимума.</p></div><strong>{repairPrice} Коллов</strong><button disabled={player.col < repairPrice || repairPrice === 0} onClick={repair}>{repairPrice === 0 ? 'Всё исправно' : 'Починить'}</button></section>
          <button className="primary-action tavern-exit" onClick={() => setView('explore')}>Вернуться на этаж</button>
        </section>}

        {view === 'shop' && <section className="shop-screen game-panel"><div className="panel-title"><div><span>ЛАВКА ПУТНИКА</span><h2>Расходники</h2></div><ShoppingBag/></div><div className="shop-grid">{shopItems.map((item) => <article key={item.name} className="shop-item"><div>{item.icon}</div><strong>{item.name}</strong><span>{item.price} Коллов</span><button disabled={player.col < item.price} onClick={() => buyItem(item.type, item.price)}>{player.col < item.price ? 'Не хватает' : 'Купить'}</button></article>)}</div></section>}

        {view === 'profile' && <section className="profile-screen"><section className="profile-hero-card game-panel real-profile"><div className="profile-real-art"><img src={HERO_ART} alt="Герой PlayerOne"/></div><div><span>ПЕРСОНАЖ</span><h1>PlayerOne</h1><p>Уровень {player.level} · Этаж {player.highestFloor}</p><div className="profile-badges"><b>Сила {player.power}</b><b>Защита {player.defense}</b><b>Крит {Math.round(player.critChance * 100)}%</b></div><small>Character art: Pixabay / pendleburyannette</small></div></section></section>}
      </section>

      <nav className="mobile-nav cinematic-nav five-nav"><button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><Home/><span>Главная</span></button><button className={view === 'explore' ? 'active' : ''} onClick={() => setView('explore')}><Map/><span>Этажи</span></button><button className={view === 'tavern' ? 'active' : ''} onClick={() => setView('tavern')}><Beer/><span>Таверна</span></button><button className={view === 'profile' ? 'active' : ''} onClick={() => setView('profile')}><UserRound/><span>Герой</span></button><button className={view === 'shop' ? 'active' : ''} onClick={() => setView('shop')}><ShoppingBag/><span>Лавка</span></button></nav>
    </main>
  );
}

function FloorCard({ floor, unlocked, onOpen }: { floor: (typeof FLOORS)[number]; unlocked: boolean; onOpen: () => void }) {
  return <button className={`floor-card ${unlocked ? '' : 'locked'}`} onClick={onOpen}><div className="floor-art"><span>{floor.id}</span>{!unlocked && '🔒'}</div><div className="floor-copy"><small>ЭТАЖ {floor.id}</small><strong>{floor.name}</strong><span>{floor.subtitle}</span><em>Босс: {floor.bossName}</em></div></button>;
}
