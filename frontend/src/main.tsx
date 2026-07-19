import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/global.css';
import './styles/characters.css';
import './styles/cinematic-battle.css';
import './styles/mobile-miniapp.css';
import './styles/progression.css';
import './styles/adventure-upgrade.css';
import './styles/tap-adventure.css';

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

function enhanceBattleScene(): void {
  const scene = document.querySelector<HTMLElement>('.battle-scene.real-art-scene');
  if (!scene || scene.dataset.tapReady === 'true') return;

  scene.dataset.tapReady = 'true';
  const cityLayer = document.createElement('div');
  cityLayer.className = 'city-layer';
  scene.prepend(cityLayer);

  scene.addEventListener('pointerdown', (event) => {
    const attackButton = document.querySelector<HTMLButtonElement>('.combat-actions .attack');
    if (!attackButton || attackButton.disabled) return;

    const burst = document.createElement('span');
    burst.className = 'tap-burst';
    burst.style.left = `${event.clientX}px`;
    burst.style.top = `${event.clientY}px`;
    document.body.appendChild(burst);
    window.setTimeout(() => burst.remove(), 450);

    webApp?.HapticFeedback?.impactOccurred?.('light');
    attackButton.click();
  });
}

const observer = new MutationObserver(enhanceBattleScene);
observer.observe(document.body, { childList: true, subtree: true });
enhanceBattleScene();
