import {
  Backpack, Bell, Castle, ChevronRight, Coins, Crown, Footprints, HeartPulse,
  Home, LockKeyhole, Map, Menu, MessageCircle, Settings, Shield, ShoppingBag,
  Sparkles, Sword, Trophy, UserRound, Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BattleHero } from '../components/battle/BattleHero';
import {
  FLOORS, SavedGame, applyExperience, calculateEnemyDamage, calculatePlayerDamage,
  createEnemy, loadGame, saveGame, xpRequired,
} from '../game/gameEngine';

 type View = 'home' | 'explore' | 'shop' | 'profile';
 type ActionType = 'attack' | 'skill' | 'guard';

const shopItems = [
  { icon: '🗡️', name: 'Клинок новичка', price: 80, power: 3 },
  { icon: '🧥', name: 'Куртка разведчика', price: 120, power: 2 },
  { icon: '🥾', name: 'Сапоги тропы', price: 95, power: 1 },
  { icon: '🧪', name: 'Малое зелье', price: 35, power: 0 },
];

export function App() {
  const [view, setView] = useState<View>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [game, setGame] = useState<SavedGame>(() => loadGame());
  const [attacking, setAttacking] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [guarding, setGuarding] = useState(false);

  const { player, enemy, battleWon, gameOver } = game;
  const currentFloor = FLOORS.find((floor) => floor.id === player.selectedFloor) ?? FLOORS[0];
  const currentWins = player.floorWins[player.selectedFloor] ?? 0;
  const requiredXp = xpRequired(player.level);

  useEffect(() => saveGame(game), [game]);

  const hpPercent = useMemo(() => `${Math.max(0, (player.hp / player.maxHp) * 100)}%`, [player.hp, player.maxHp]);
  const staminaPercent = useMemo(() => `${Math.max(0, (player.stamina / player.maxStamina) * 100)}%`, [player.stamina, player.maxStamina]);
  const xpPercent = useMemo(() => `${Math.min(100, (player.xp / requiredXp) * 100)}%`, [player.xp, requiredXp]);
  const enemyPercent = useMemo(() => `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`, [enemy.hp, enemy.maxHp]);

  const performAction = (action: ActionType) => {
    if (battleWon || gameOver || attacking) return;
    if (action === 'skill' && player.stamina < 18) {
      setGame((value) => ({ ...value, log: 'Недостаточно энергии для навыка «Рывок клинка».' }));
      return;
    }

    if (action === 'guard') {
      const restored = Math.min(player.maxStamina, player.stamina + 8);
      setGuarding(true);
      setGame((value) => ({
        ...value,
        player: { ...value.player, stamina: restored },
        log: 'Ты принял защитную стойку. Следующий удар врага будет ослаблен.',
      }));
      window.setTimeout(() => enemyTurn(true), 420);
      return;
    }

    setAttacking(true);
    const staminaCost = action === 'skill' ? 18 : 4;
    const multiplier = action === 'skill' ? 1.75 : 1;

    window.setTimeout(() => {
      setGame((value) => {
        const result = calculatePlayerDamage(value.player, value.enemy, multiplier);
        const nextEnemyHp = Math.max(0, value.enemy.hp - result.damage);
        const nextPlayer = { ...value.player, stamina: Math.max(0, value.player.stamina - staminaCost) };
        const hitText = `${result.critical ? 'Критический удар! ' : ''}Ты нанёс ${result.damage} урона.`;

        if (nextEnemyHp === 0) {
          const xpResult = applyExperience(nextPlayer, value.enemy.xp);
          const wonBoss = value.enemy.kind === 'boss';
          const nextFloorWins = {
            ...xpResult.player.floorWins,
            [xpResult.player.selectedFloor]: wonBoss ? 0 : (xpResult.player.floorWins[xpResult.player.selectedFloor] ?? 0) + 1,
          };
          const unlockedFloor = wonBoss ? Math.min(FLOORS.length, xpResult.player.selectedFloor + 1) : xpResult.player.highestFloor;
          const defeatedBosses = wonBoss && !xpResult.player.defeatedBosses.includes(xpResult.player.selectedFloor)
            ? [...xpResult.player.defeatedBosses, xpResult.player.selectedFloor]
            : xpResult.player.defeatedBosses;

          const rewardedPlayer = {
            ...xpResult.player,
            col: xpResult.player.col + value.enemy.col,
            highestFloor: Math.max(xpResult.player.highestFloor, unlockedFloor),
            floorWins: nextFloorWins,
            defeatedBosses,
          };

          const levelText = xpResult.levelsGained > 0 ? ` Новый уровень: ${rewardedPlayer.level}!` : '';
          const unlockText = wonBoss && unlockedFloor > value.player.selectedFloor ? ` Открыт этаж ${unlockedFloor}.` : '';
          return {
            ...value,
            player: rewardedPlayer,
            enemy: { ...value.enemy, hp: 0 },
            battleWon: true,
            log: `${hitText} ${value.enemy.name} побеждён. +${value.enemy.xp} XP, +${value.enemy.col} Коллов.${levelText}${unlockText}`,
          };
        }

        return {
          ...value,
          player: nextPlayer,
          enemy: { ...value.enemy, hp: nextEnemyHp },
          log: hitText,
        };
      });

      setHitFlash(true);
      window.setTimeout(() => setHitFlash(false), 260);
      window.setTimeout(() => enemyTurn(false), 480);
    }, 380);
  };

  const enemyTurn = (wasGuarding: boolean) => {
    setGame((value) => {
      if (value.enemy.hp <= 0 || value.battleWon) return value;
      const rawDamage = calculateEnemyDamage(value.player, value.enemy);
      const damage = wasGuarding || guarding ? Math.max(1, Math.floor(rawDamage * 0.42)) : rawDamage;
      const nextHp = Math.max(0, value.player.hp - damage);
      const bossPhase = value.enemy.kind === 'boss' && value.enemy.hp <= value.enemy.maxHp * 0.35
        ? ' Босс входит в ярость!'
        : '';

      if (nextHp === 0) {
        const lostCol = Math.floor(value.player.col * 0.1);
        return {
          ...value,
          player: { ...value.player, hp: 0, col: Math.max(0, value.player.col - lostCol) },
          gameOver: true,
          log: `${value.enemy.name} нанёс ${damage} урона. Ты пал в бою и потерял ${lostCol} Коллов.`,
        };
      }

      return {
        ...value,
        player: { ...value.player, hp: nextHp },
        log: `${value.log} ${value.enemy.name} отвечает: ${damage} урона.${bossPhase}`,
      };
    });
    setGuarding(false);
    setAttacking(false);
  };

  const continueFloor = () => {
    setGame((value) => {
      const wins = value.player.floorWins[value.player.selectedFloor] ?? 0;
      return {
        ...value,
        enemy: createEnemy(value.player.selectedFloor, wins),
        battleWon: false,
        gameOver: false,
        log: wins >= currentFloor.encountersToBoss
          ? `Врата босса открылись. ${currentFloor.bossName} выходит на арену.`
          : `Новый противник преградил путь. Побед до босса: ${wins}/${currentFloor.encountersToBoss}.`,
      };
    });
  };

  const selectFloor = (floorId: number) => {
    if (floorId > player.highestFloor) return;
    setGame((value) => {
      const wins = value.player.floorWins[floorId] ?? 0;
      return {
        ...value,
        player: { ...value.player, selectedFloor: floorId, hp: value.player.maxHp, stamina: value.player.maxStamina },
        enemy: createEnemy(floorId, wins),
        battleWon: false,
        gameOver: false,
        log: `Ты вошёл на этаж ${floorId}. Приготовься к первой встрече.`,
      };
    });
    setView('explore');
  };

  const recoverAfterDefeat = () => {
    setGame((value) => ({
      ...value,
      player: { ...value.player, hp: value.player.maxHp, stamina: value.player.maxStamina },
      enemy: createEnemy(value.player.selectedFloor, value.player.floorWins[value.player.selectedFloor] ?? 0),
      battleWon: false,
      gameOver: false,
      log: 'Ты восстановился в безопасной зоне и снова готов к бою.',
    }));
  };

  const resetProgress = () => {
    localStorage.removeItem('aether-tower-save-v1');
    window.location.reload();
  };

  return (
    <main className="mmo-shell cinematic-shell">
      <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
      <div className="floating-particles" aria-hidden="true">{Array.from({ length: 18 }).map((_, i) => <i key={i}/>)}</div>

      <header className="game-hud cinematic-hud">
        <button className="hud-menu" onClick={() => setMenuOpen(true)} aria-label="Открыть меню"><Menu/></button>
        <div className="hero-avatar cinematic-avatar"><span>{player.level}</span></div>
        <div className="hero-stats">
          <strong>PlayerOne</strong>
          <div className="mini-stat"><span>HP</span><i><b style={{ width: hpPercent }}/></i><em>{player.hp}/{player.maxHp}</em></div>
          <div className="mini-stat stamina"><span>EN</span><i><b style={{ width: staminaPercent }}/></i><em>{player.stamina}/{player.maxStamina}</em></div>
          <div className="mini-stat exp"><span>EXP</span><i><b style={{ width: xpPercent }}/></i><em>{player.xp}/{requiredXp}</em></div>
        </div>
        <div className="wallets"><div className="wallet"><Coins size={17}/><strong>{player.col}</strong><small>Коллы</small></div><div className="wallet crowns"><Crown size={17}/><strong>{player.crowns}</strong><small>Кроны</small></div><button className="hud-icon"><Bell size={19}/></button><button className="hud-icon"><Settings size={19}/></button></div>
      </header>

      {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)}><aside className="drawer" onClick={(e) => e.stopPropagation()}><div className="drawer-brand"><Sparkles/><div><strong>AETHER TOWER</strong><span>MMORPG MINI APP</span></div></div>{[['Главная', Home, 'home'], ['Исследование', Map, 'explore'], ['Персонаж', UserRound, 'profile'], ['Инвентарь', Backpack, 'profile'], ['Магазин', ShoppingBag, 'shop'], ['Достижения', Trophy, 'profile']].map(([label, Icon, target]) => <button key={label as string} onClick={() => { setView(target as View); setMenuOpen(false); }}><Icon size={20}/>{label as string}</button>)}<button onClick={resetProgress}><Settings size={20}/>Сбросить прогресс</button></aside></div>}

      <section className="screen-content">
        {view === 'home' && <>
          <section className="event-hero game-panel cinematic-event"><div className="event-copy"><span>ГЛАВА {player.highestFloor}</span><h1>{currentFloor.name.toUpperCase()}</h1><p>Побеждай врагов, получай опыт и открой путь к боссу этажа.</p><button onClick={() => setView('explore')}>Продолжить путь <ChevronRight size={18}/></button></div><div className="eclipse-art"><div className="moon"/><div className="tower"/><div className="rays"/></div></section>
          <div className="home-grid"><section className="city-card game-panel"><div className="panel-title"><div><span>ГЛАВНЫЙ ГОРОД</span><h2>Площадь Первого Света</h2></div><Castle/></div><div className="city-art"><div className="city-tower t1"/><div className="city-tower t2"/><div className="city-tower t3"/><div className="city-road"/></div><div className="city-actions"><button><Sword/>Кузница</button><button onClick={() => setView('shop')}><ShoppingBag/>Магазин</button><button><Shield/>Гильдия</button><button><MessageCircle/>Чат</button></div></section><section className="progress-card game-panel"><div className="panel-title"><div><span>ТЕКУЩИЙ КОНТРАКТ</span><h2>Путь к боссу</h2></div><Footprints/></div><div className="quest-step done"><i>1</i><div><strong>Достичь этажа</strong><span>Этаж {player.selectedFloor} открыт</span></div></div><div className="quest-step active"><i>2</i><div><strong>Победить врагов</strong><span>{currentWins}/{currentFloor.encountersToBoss}</span></div></div><div className="quest-step"><i>3</i><div><strong>Победить босса</strong><span>{player.defeatedBosses.includes(player.selectedFloor) ? 'Выполнено' : currentFloor.bossName}</span></div></div><button className="primary-action" onClick={() => setView('explore')}>Продолжить бой</button></section></div>
          <section className="floors-preview game-panel"><div className="panel-title"><div><span>КАРТА БАШНИ</span><h2>Этажи</h2></div><Map/></div><div className="floor-scroll">{FLOORS.map((floor) => <FloorCard key={floor.id} floor={floor} unlocked={floor.id <= player.highestFloor} selected={floor.id === player.selectedFloor} wins={player.floorWins[floor.id] ?? 0} onOpen={() => selectFloor(floor.id)}/>)}</div></section>
        </>}

        {view === 'explore' && <section className="battle-layout cinematic-battle-layout">
          <section className={`battle-stage game-panel cinematic-battle-stage ${hitFlash ? 'enemy-hit' : ''}`}>
            <div className="battle-topline"><span>ЭТАЖ {currentFloor.id} · {currentFloor.name.toUpperCase()}</span><small>{enemy.kind === 'boss' ? 'БОСС ЭТАЖА' : `Путь к боссу ${currentWins}/${currentFloor.encountersToBoss}`}</small></div>
            <div className="battle-scene cinematic-scene"><div className="aurora"/><div className="far-mountains"/><div className="mid-mountains"/><div className="ground-fog"/><div className="hero-platform"><BattleHero attacking={attacking} defeated={gameOver}/></div><div className={`cinematic-boar ${battleWon ? 'defeated' : ''} ${enemy.kind === 'boss' ? 'boss-enemy' : ''}`}><div className="boar-aura"/><div className="boar-ear e1"/><div className="boar-ear e2"/><div className="boar-body"/><div className="boar-head"/><div className="boar-eye"/><div className="boar-leg l1"/><div className="boar-leg l2"/><div className="boar-tusk t1"/><div className="boar-tusk t2"/></div><div className="slash-trail"/><div className="scene-vignette"/></div>
            <div className="enemy-card cinematic-enemy-card"><div><span>{enemy.kind === 'boss' ? 'БОСС ЭТАЖА' : enemy.kind === 'elite' ? 'ЭЛИТНЫЙ ВРАГ' : 'ОБЫЧНЫЙ ВРАГ'}</span><h2>{enemy.name}</h2><small>{enemy.description}</small></div><strong>Ур. {enemy.level}</strong><div className="enemy-health"><i><b style={{ width: enemyPercent }}/></i><em>{enemy.hp}/{enemy.maxHp} HP</em></div></div>
          </section>

          <aside className="combat-panel game-panel cinematic-combat-panel"><div className="panel-title"><div><span>БОЕВАЯ СИСТЕМА</span><h2>{gameOver ? 'Поражение' : battleWon ? 'Победа' : attacking ? 'Удар!' : 'Твой ход'}</h2></div><Sword/></div><div className="combat-log cinematic-log">{game.log}</div><div className="combat-stats"><div><HeartPulse/><span>HP</span><strong>{player.hp}/{player.maxHp}</strong></div><div><Zap/><span>Энергия</span><strong>{player.stamina}/{player.maxStamina}</strong></div></div>
            {!battleWon && !gameOver && <div className="combat-actions expanded-actions"><button className="attack cinematic-attack" onClick={() => performAction('attack')} disabled={attacking}><Sword/>Обычная атака</button><button className="skill-action" onClick={() => performAction('skill')} disabled={attacking || player.stamina < 18}><Zap/>Рывок · 18 EN</button><button className="guard-action" onClick={() => performAction('guard')} disabled={attacking}><Shield/>Защита</button></div>}
            {battleWon && <div className="victory-box cinematic-victory"><Sparkles/><strong>{enemy.kind === 'boss' ? 'Этаж покорён' : 'Враг повержен'}</strong><span>+{enemy.xp} XP · +{enemy.col} Коллов</span><button onClick={continueFloor}>{enemy.kind === 'boss' ? 'Продолжить восхождение' : 'Следующий враг'}</button></div>}
            {gameOver && <div className="victory-box defeat-box"><HeartPulse/><strong>Возвращение в город</strong><span>HP и энергия будут восстановлены</span><button onClick={recoverAfterDefeat}>Восстановиться</button></div>}
          </aside>

          <section className="floor-list game-panel"><div className="panel-title"><div><span>КАРТА БАШНИ</span><h2>Выбор этажа</h2></div><Map/></div><div className="floor-scroll compact">{FLOORS.map((floor) => <FloorCard key={floor.id} floor={floor} unlocked={floor.id <= player.highestFloor} selected={floor.id === player.selectedFloor} wins={player.floorWins[floor.id] ?? 0} onOpen={() => selectFloor(floor.id)}/>)}</div></section>
        </section>}

        {view === 'shop' && <section className="shop-screen game-panel"><div className="panel-title"><div><span>МАГАЗИН ГОРОДА</span><h2>Снаряжение новичка</h2></div><ShoppingBag/></div><p className="muted">Зарабатывай Коллы в боях. Покупки экипировки подключим следующим этапом.</p><div className="shop-grid">{shopItems.map((item) => <article key={item.name} className="shop-item"><div>{item.icon}</div><strong>{item.name}</strong><span>{item.price} Коллов</span><button disabled={player.col < item.price}>{player.col < item.price ? 'Не хватает' : 'Купить'}</button></article>)}</div></section>}

        {view === 'profile' && <section className="profile-screen"><section className="profile-hero-card game-panel"><div className="profile-art-wrap"><BattleHero/></div><div><span>ПЕРСОНАЖ</span><h1>PlayerOne</h1><p>Уровень {player.level} · Мечник башни</p><div className="profile-badges"><b>Сила {player.power}</b><b>Защита {player.defense}</b><b>Этаж {player.highestFloor}</b></div><div className="profile-progress"><span>Опыт до уровня {player.level + 1}</span><strong>{player.xp}/{requiredXp} XP</strong></div></div></section><section className="equipment game-panel"><div className="panel-title"><div><span>ЭКИПИРОВКА</span><h2>Пустые слоты</h2></div><Shield/></div><div className="equipment-grid">{['Оружие','Доспех','Перчатки','Шлем','Ботинки','Кольцо'].map((slot) => <div key={slot}><LockKeyhole/><span>{slot}</span></div>)}</div></section></section>}
      </section>

      <nav className="mobile-nav cinematic-nav"><button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><Home/><span>Главная</span></button><button className={view === 'explore' ? 'active' : ''} onClick={() => setView('explore')}><Map/><span>Этажи</span></button><button className={view === 'profile' ? 'active' : ''} onClick={() => setView('profile')}><UserRound/><span>Герой</span></button><button className={view === 'shop' ? 'active' : ''} onClick={() => setView('shop')}><ShoppingBag/><span>Магазин</span></button></nav>
    </main>
  );
}

function FloorCard({ floor, unlocked, selected, wins, onOpen }: { floor: typeof FLOORS[number]; unlocked: boolean; selected: boolean; wins: number; onOpen: () => void }) {
  return <button className={`floor-card floor-${floor.id} ${unlocked ? '' : 'locked'} ${selected ? 'selected-floor' : ''}`} onClick={onOpen}><div className="floor-art"><span>{floor.id}</span>{!unlocked && <LockKeyhole/>}</div><div className="floor-copy"><small>ЭТАЖ {floor.id}</small><strong>{floor.name}</strong><span>{floor.subtitle}</span><em>{unlocked ? `Прогресс: ${wins}/${floor.encountersToBoss}` : 'Заблокировано'}</em></div></button>;
}
