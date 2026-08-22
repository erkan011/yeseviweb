import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Dashboard',
  '/boxes': 'Kutu Yönetimi',
  '/staff': 'Personel Yönetimi',
  '/subscription': 'Abonelik & Finans',
};

const Navbar = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Sayfa';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-surface-200 flex items-center justify-between px-6">
      {/* Left - Page Title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold text-surface-800">{title}</h1>
          <p className="text-xs text-surface-400">Yesevi Gaziantep Derneği</p>
        </div>
      </div>

      {/* Right - User Info & Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-surface-200" />

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            EY
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-surface-700">Elif Yıldız</p>
            <p className="text-xs text-surface-400">Yönetici</p>
          </div>
          <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
