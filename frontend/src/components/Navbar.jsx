import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
// Navbar Function
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-civic-600 text-white shadow-sm'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-civic-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-civic-600 to-civic-400 bg-clip-text text-transparent">
              CivicFix
            </span>
          </NavLink>

          {/* Nav Links */}
          <div className="flex items-center gap-2">
            <NavLink to="/" className={linkClass} end>Home</NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
                <NavLink to="/report-issue" className={linkClass}>Report Issue</NavLink>
                <NavLink 
                  to="/profile" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                      isActive 
                        ? 'bg-civic-600 border-civic-500 text-white shadow-md' 
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-civic-400/30" 
                    />
                  ) : (
                    <div className="w-7 h-7 bg-civic-100 dark:bg-civic-800 flex items-center justify-center rounded-full">
                      <ShieldCheckIcon className="w-4 h-4 text-civic-600 dark:text-civic-400" />
                    </div>
                  )}
                  <span className="text-sm font-bold hidden sm:inline truncate max-w-[100px]">
                    {user?.name}
                  </span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>Login</NavLink>
                <NavLink
                  to="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-civic-600 hover:bg-civic-700 text-white shadow-sm transition-all"
                >
                  Sign Up
                </NavLink>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="ml-2 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {isDark ? (
                <SunIcon className="w-5 h-5 text-amber-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
