import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  SunIcon, 
  MoonIcon, 
  ShieldCheckIcon, 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  Squares2X2Icon,
  PlusCircleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon, end: true },
    ...(isAuthenticated ? [{ name: 'Dashboard', path: '/dashboard', icon: Squares2X2Icon }] : []),
    ...(isAuthenticated && user?.role?.toLowerCase() !== 'admin' ? [{ name: 'Report Issue', path: '/report-issue', icon: PlusCircleIcon }] : []),
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
      isActive
        ? 'bg-civic-600 text-white shadow-lg shadow-civic-500/30'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
    }`;

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <nav className="sticky top-0 z-[100] w-full px-4 pt-4 pb-0 pointer-events-none">
      <div className="max-w-7xl mx-auto glass-card border-white/40 dark:border-slate-800/50 pointer-events-auto overflow-visible">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 md:gap-3 active:scale-95 transition-transform">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-civic-600 to-indigo-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <ShieldCheckIcon className="w-5 h-5 md:w-6 md:h-6 text-white -rotate-3" />
              </div>
              <span className="font-bold text-xl md:text-2xl tracking-tighter bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                CivicFix
              </span>
            </NavLink>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink key={link.path} to={link.path} className={linkClass} end={link.end}>
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </NavLink>
              ))}

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <NavLink 
                    to="/profile" 
                    className={({ isActive }) => 
                      `flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all duration-300 ${
                        isActive 
                          ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl' 
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} className="w-7 h-7 rounded-full ring-2 ring-civic-500/20" alt="" />
                    ) : (
                      <UserCircleIcon className="w-7 h-7 opacity-70" />
                    )}
                    <span className="text-sm font-bold max-w-[100px] truncate">{user?.name}</span>
                  </NavLink>
                  
                  <button onClick={toggleTheme} className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    {isDark ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-slate-600" />}
                  </button>

                  <button onClick={handleLogout} className="p-2.5 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={toggleTheme} className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 mr-2 transition-all">
                    {isDark ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-slate-600" />}
                  </button>
                  <NavLink to="/login" className="px-5 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    Login
                  </NavLink>
                  <NavLink to="/signup" className="btn-primary !py-2 !px-4 !text-sm">
                    Join Now
                  </NavLink>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                {isDark ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-slate-600" />}
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
              >
                {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 p-4 space-y-2 animate-fade-in origin-top">
            {navLinks.map((link) => (
              <NavLink 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 p-3.5 md:p-4 rounded-xl md:rounded-2xl transition-all ${isActive ? 'bg-civic-50 text-civic-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <link.icon className="w-5 h-5 opacity-70" />
                <span className="font-bold text-sm">{link.name}</span>
              </NavLink>
            ))}
            
            {isAuthenticated ? (
              <>
                <NavLink 
                  to="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-4 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span className="font-bold">My Profile</span>
                </NavLink>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="font-bold">Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <NavLink to="/login" onClick={() => setIsMenuOpen(false)} className="btn-secondary !py-3">Login</NavLink>
                <NavLink to="/signup" onClick={() => setIsMenuOpen(false)} className="btn-primary !py-3">Sign Up</NavLink>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
