import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/authService';

// SVG icon components
const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  box: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  credit: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  organization: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
};

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/boxes', label: 'Kutu Yönetimi', icon: 'box' },
  { to: '/staff', label: 'Personel', icon: 'users' },
  { to: '/subscription', label: 'Abonelik', icon: 'credit' },
];

const superAdminItems = [
  { to: '/organizations', label: 'Kurumlar (Sistem)', icon: 'organization' },
];

const NavItem = ({ item, isActive }) => (
  <NavLink
    to={item.to}
    className={`
      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
      transition-all duration-200 group
      ${isActive
        ? 'bg-primary-600/20 text-primary-400'
        : 'text-surface-300 hover:bg-white/5 hover:text-white'
      }
    `}
  >
    <span className={`transition-colors duration-200 ${isActive ? 'text-primary-400' : 'text-surface-400 group-hover:text-white'}`}>
      {icons[item.icon]}
    </span>
    {item.label}
    {isActive && (
      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
    )}
  </NavLink>
);

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isSuperAdmin = user?.rol === 'super_admin';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış hatası:', error);
      navigate('/login');
    }
  };

  const getIsActive = (itemTo) => {
    if (itemTo === '/') return location.pathname === '/';
    return location.pathname.startsWith(itemTo);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 w-64 h-screen flex flex-col bg-surface-900 text-white transition-transform duration-300">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">YeseviWeb</h2>
          <p className="text-xs text-surface-400">
            {isSuperAdmin ? 'Süper Yönetici' : 'Yönetim Paneli'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Super Admin Section */}
        {isSuperAdmin && (
          <>
            <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-amber-400/80">
              ⚡ Sistem Yönetimi
            </p>
            {superAdminItems.map((item) => (
              <NavItem key={item.to} item={item} isActive={getIsActive(item.to)} />
            ))}
            <div className="my-3 border-b border-white/10" />
          </>
        )}

        <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-surface-500">
          Ana Menü
        </p>
        {navItems.map((item) => (
          <NavItem key={item.to} item={item} isActive={getIsActive(item.to)} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 cursor-pointer"
        >
          {icons.logout}
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
