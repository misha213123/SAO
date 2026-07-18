import { Home, ShoppingBag, UserRound, Compass, Menu } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const nav = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/character', label: 'Персонаж', icon: UserRound },
  { to: '/shop', label: 'Магазин', icon: ShoppingBag },
  { to: '/explore', label: 'Мир', icon: Compass },
  { to: '/menu', label: 'Меню', icon: Menu },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <main className="app-content"><Outlet /></main>
      <nav className="bottom-nav" aria-label="Основная навигация">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={22} strokeWidth={2.2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
