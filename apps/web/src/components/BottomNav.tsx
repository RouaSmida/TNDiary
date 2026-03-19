import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/add', label: 'Add', icon: '➕' },
  { to: '/expenses', label: 'List', icon: '📋' },
  { to: '/analytics', label: 'Analytics', icon: '📊' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 safe-bottom">
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs transition-colors ${
              isActive ? 'text-primary-600 font-semibold' : 'text-gray-500'
            }`
          }
        >
          <span className="text-xl leading-none">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
