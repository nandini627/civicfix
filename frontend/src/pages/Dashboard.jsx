import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import IssueCard from '../components/IssueCard';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIssues, setTotalIssues] = useState(0);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/issues?page=${page}&limit=6`);
        setIssues(data.issues);
        setTotalPages(data.totalPages);
        setTotalIssues(data.totalIssues);
      } catch (err) {
        setError('Failed to load issues. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Client-side filtering (for simplicity on the current page)
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || issue.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Reports', val: totalIssues, color: 'text-civic-600' },
    { label: 'Displaying', val: issues.length, color: 'text-indigo-600' },
    { label: 'Current Page', val: `${page}/${totalPages}`, color: 'text-amber-600' },
  ];

  const handleUpdateIssue = (updatedIssue) => {
    setIssues(prev => prev.map(issue => 
      issue._id === updatedIssue._id ? updatedIssue : issue
    ));
  };

  const handleDeleteIssue = (id) => {
    setIssues(prev => prev.filter(issue => issue._id !== id));
    setTotalIssues(prev => prev - 1);
  };

  return (
    <div className="min-h-screen py-12 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Welcome banner */}
        <div className="card p-8 mb-8 bg-gradient-to-br from-civic-600 to-indigo-600 border-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <UserCircleIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-civic-100 text-sm font-medium">Citizen Dashboard</p>
                <h1 className="text-3xl font-bold text-white tracking-tight">{user?.name || 'Citizen'}</h1>
                <p className="text-civic-200 text-sm">{user?.email}{user?.role === 'admin' && <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-[10px] uppercase font-bold tracking-widest tracking-tighter">Admin</span>}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/report-issue')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-civic-600 hover:bg-civic-50 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
              >
                <PlusIcon className="w-5 h-5" />
                Report New Issue
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all backdrop-blur-sm"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="card p-6 flex flex-col items-center text-center">
              <div className={`text-3xl font-extrabold ${stat.color} dark:brightness-125 mb-1`}>{stat.val}</div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Feed Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Civic Issues Feed
            <span className="text-sm font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">
              {filteredIssues.length} on this page
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 h-12"
              />
            </div>

            {/* Filter */}
            <div className="relative w-full sm:w-48">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field pl-10 h-12 appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-civic-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Crunching civic data...</p>
          </div>
        ) : error ? (
          <div className="card p-12 text-center border-red-100 dark:border-red-900/30">
            <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        ) : filteredIssues.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger-fade-in">
              {filteredIssues.map(issue => (
                <IssueCard 
                  key={issue._id} 
                  issue={issue} 
                  onStatusUpdate={handleUpdateIssue}
                  onDelete={handleDeleteIssue}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage(prev => prev - 1)}
                className="px-6 py-2 rounded-xl font-bold text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-civic-400 transition-all disabled:opacity-30 disabled:hover:border-transparent"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      page === i + 1
                        ? 'bg-civic-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-civic-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={page === totalPages || loading}
                onClick={() => setPage(prev => prev + 1)}
                className="px-6 py-2 rounded-xl font-bold text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-civic-400 transition-all disabled:opacity-30 disabled:hover:border-transparent"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="card p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No issues found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'All' 
                ? "We couldn't find any reports matching your filters on this page. Try adjusting your search."
                : "Great news! There are no civic issues reported in your area yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
