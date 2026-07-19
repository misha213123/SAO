import React from 'react';
import ReactDOM, { createRoot, type Root } from 'react-dom/client';
import { App } from './app/App';
import { EnemyModel3D } from './components/battle/EnemyModel3D';
import { VrmHero } from './components/character/VrmHero';
import './styles/global.css';
import './styles/characters.css';
import './styles/cinematic-battle.css';
import './styles/mobile-miniapp.css';
import './styles/progression.css';
import './styles/adventure-upgrade.css';
import './styles/tap-adventure.css';
import './styles/swipe-equipment.css';
import './styles/vrm-character.css';
import './styles/world-backgrounds.css';
import './styles/enemy-visuals.css';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready?: () => void;
        expand?: () => void;
        disableVerticalSwipes?: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        HapticFeedback?: {
          impactOccurred?: (style: 'light' | 'medium' | 'heavy') => void;
        };
      };
    };
  }
}

const webApp = window.Telegram?.WebApp;
webApp?.ready?.();
webApp?.expand?.();
webApp?.disableVerticalSwipes?.();
webApp?.setHeaderColor?.('#020a12');
webApp?.setBackgroundColor?.('#020a12');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

const vrmRoots = new WeakMap<Element, Root>();
const enemyRoots = new WeakMap<Element, Root>();
const enemyRenderKeys = new WeakMap<Element, string>();
let lastBattleHero: HTMLElement | null = null;
let lastAttacking = false;
let scheduled = false;

function mountVrmHeroes(): void {
  const battleHero = document.querySelector<HTMLElement>('.battle-scene .back-hero');
  if (battleHero && !vrmRoots.has(battleHero)) {
    battleHero.classList.add('vrm-host', 'vrm-battle-host');
    const root = createRoot(battleHero);
    root.render(<VrmHero modelUrl="/models/hero.vrm.glb" className="battle-vrm" />);
    vrmRoots.set(battleHero, root);
    lastBattleHero = battleHero;
    lastAttacking = false;
  }

  const profileHero = document.querySelector<HTMLElement>('.profile-back-hero');
  if (profileHero && !vrmRoots.has(profileHero)) {
    profileHero.classList.add('vrm-host', 'vrm-profile-host');
    const root = createRoot(profileHero);
    root.render(<VrmHero modelUrl="/models/hero.vrm.glb" className="profile-vrm" />);
    vrmRoots.set(profileHero, root);
  }
}

function syncAttackAnimation(): void {
  const battleHero = document.querySelector<HTMLElement>('.battle-scene .back-hero');
  if (!battleHero) return;
  const root = vrmRoots.get(battleHero);
  if (!root) return;

  const attacking = battleHero.classList.contains('slashing');
  if (battleHero === lastBattleHero && attacking === lastAttacking) return;

  lastBattleHero = battleHero;
  lastAttacking = attacking;
  root.render(
    <VrmHero
      modelUrl="/models/hero.vrm.glb"
      className="battle-vrm"
      attacking={attacking}
    />,
  );
}

function mountEnemyModels(): void {
  document.querySelectorAll<HTMLElement>('.battle-scene .rear-enemy').forEach((enemyHost) => {
    const body = enemyHost.querySelector<HTMLElement>('.enemy-body');
    if (!body) return;

    const scene = enemyHost.closest<HTMLElement>('.battle-scene');
    const floorClass = [...(scene?.classList ?? [])].find((name) => /^floor-\d+$/.test(name));
    const floorId = Number(floorClass?.replace('floor-', '') ?? 1);
    const enemyName = document.querySelector<HTMLElement>('.cinematic-enemy-card h2')?.textContent?.trim() || 'Неизвестный враг';
    const kind = enemyHost.classList.contains('boss')
      ? 'boss'
      : enemyHost.classList.contains('miniboss')
        ? 'miniboss'
        : enemyHost.classList.contains('elite')
          ? 'elite'
          : 'normal';
    const defeated = enemyHost.classList.contains('defeated');
    const hit = Boolean(enemyHost.closest('.enemy-hit'));
    const renderKey = `${floorId}|${kind}|${enemyName}|${defeated}|${hit}`;

    let root = enemyRoots.get(body);
    if (!root) {
      body.replaceChildren();
      root = createRoot(body);
      enemyRoots.set(body, root);
    }

    if (enemyRenderKeys.get(body) === renderKey) return;
    enemyRenderKeys.set(body, renderKey);

    root.render(
      <EnemyModel3D
        enemyId={`${floorId}-${kind}-${enemyName}`}
        enemyName={enemyName}
        floorId={floorId}
        kind={kind}
        defeated={defeated}
        hit={hit}
      />,
    );
  });
}

function schedule3DSync(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    mountVrmHeroes();
    syncAttackAnimation();
    mountEnemyModels();
  });
}

const observer = new MutationObserver(schedule3DSync);
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class'],
});
schedule3DSync();
