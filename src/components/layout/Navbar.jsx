import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/boxes': 'Kutu Yönetimi',
  '/staff': 'Personel Yönetimi',
  '/subscription': 'Abonelik & Finans',
  '/organizations': 'Kurum Yönetimi',
};

const Navbar = ({ onMenuToggle }) => {
  const location = useLocation();
  const { user } = useAuth();
  const title = pageTitles[location.pathname] || 'Sayfa';

  // Format user name and initials
  const displayName = user?.isim || user?.displayName || user?.email || 'Kullanıcı';
  const getInitials = (name) => {
    if (!name) return 'K';
    if (name.includes('@')) return name.charAt(0).toUpperCase();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const initials = getInitials(displayName);

  // Format display role
  const getDisplayRole = (role) => {
    switch(role) {
      case 'super_admin': return 'Süper Yönetici';
      case 'admin': return 'Kurum Yöneticisi';
      case 'saha_gorevlisi': return 'Saha Personeli';
      default: return 'Personel';
    }
  };
  const displayRole = getDisplayRole(user?.rol);

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-surface-200 flex items-center justify-between px-3 sm:px-6">
      {/* Left - Hamburger + Page Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger Menu - only on mobile */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-surface-800">{title}</h1>
          <p className="text-[10px] sm:text-xs text-surface-400 hidden sm:block">Yesevi Gaziantep Derneği</p>
        </div>
      </div>

      {/* Right - User Info & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <button className="relative p-1.5 sm:p-2 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="hidden sm:block h-8 w-px bg-surface-200" />

        {/* User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-sm">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-surface-700 truncate max-w-[150px]">{displayName}</p>
            <p className="text-xs text-surface-400">{displayRole}</p>
          </div>
          <svg className="hidden sm:block w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
