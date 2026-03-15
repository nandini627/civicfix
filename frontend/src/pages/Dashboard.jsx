import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheckIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen py-12 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Welcome banner */}
        <div className="card p-8 mb-8 bg-gradient-to-br from-civic-600 to-indigo-600 border-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-civic-100 text-sm">Welcome back 👋</p>
                <h1 className="text-2xl font-bold text-white">{user?.name || 'Citizen'}</h1>
                <p className="text-civic-200 text-sm">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Coming Soon placeholder */}
        <div className="card p-12 text-center">
          <div className="inline-flex w-16 h-16 bg-civic-100 dark:bg-civic-900 rounded-2xl items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-9 h-9 text-civic-600 dark:text-civic-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Dashboard Coming Soon
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            You are successfully logged in! The full issue reporting dashboard will be built next.
            Stay tuned — report civic problems, track resolutions, and more.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { label: 'Issues Reported', val: '—' },
              { label: 'In Progress', val: '—' },
              { label: 'Resolved', val: '—' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-civic-600 dark:text-civic-400">{stat.val}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
