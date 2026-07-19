import React from 'react';
import ReactDOM, { createRoot, type Root } from 'react-dom/client';
import { App } from './app/App';
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

function mountVrmHeroes(): void {
  const battleHero = document.querySelector<HTMLElement>('.battle-scene .back-hero');
  if (battleHero && !vrmRoots.has(battleHero)) {
    battleHero.classList.add('vrm-host', 'vrm-battle-host');
    const root = createRoot(battleHero);
    root.render(<VrmHero modelUrl="/models/hero.vrm.glb" className="battle-vrm" />);
    vrmRoots.set(battleHero, root);
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
  root.render(
    <VrmHero
      modelUrl="/models/hero.vrm.glb"
      className="battle-vrm"
      attacking={battleHero.classList.contains('slashing')}
    />,
  );
}

const observer = new MutationObserver(() => {
  mountVrmHeroes();
  syncAttackAnimation();
});
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class'],
});
mountVrmHeroes();
