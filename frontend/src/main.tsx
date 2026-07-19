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
import './styles/swipe-equipment.css';

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
