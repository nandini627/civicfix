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
  PlusIcon,
  TagIcon,
  ChartPieIcon,
  ListBulletIcon,
  ChevronRightIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import IssueCard from '../components/IssueCard';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterScope, setFilterScope] = useState('All'); // 'All' or 'Mine'
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIssues, setTotalIssues] = useState(0);
  const [statusCounts, setStatusCounts] = useState({ Pending: 0, 'In Progress': 0, Resolved: 0, Completed: 0, Rejected: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        let url = `/api/issues?page=${page}&limit=6&status=${filterStatus}`;
        if (filterPriority !== 'All') url += `&priority=${filterPriority}`;
        if (filterCategory !== 'All') url += `&category=${filterCategory}`;
        if (filterScope === 'Mine') url += `&reportedBy=${user?._id || user?.id}`;
        
        const { data } = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIssues(data.issues);
        setTotalPages(data.totalPages);
        setTotalIssues(data.totalIssues);
        if (data.statusCounts) setStatusCounts(data.statusCounts);
      } catch (err) {
        setError('Failed to load issues. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [page, filterStatus, filterPriority, filterCategory, filterScope]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Client-side search (for speed), but status filter is now server-side
  const filteredIssues = issues.filter(issue => {
    return issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           issue.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const stats = isAdmin ? [
    { label: 'Pending', val: statusCounts.Pending || 0, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'In Progress', val: statusCounts['In Progress'] || 0, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Completed', val: (statusCounts.Completed || 0) + (statusCounts.Resolved || 0), color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Rejected', val: statusCounts.Rejected || 0, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ] : [
    { label: 'Total Active', val: totalIssues, color: 'text-civic-600', bg: 'bg-civic-500/10' },
    { label: 'Recent Updates', val: issues.filter(i => new Date(i.updatedAt) > new Date(Date.now() - 86400000)).length, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    { label: 'Page', val: `${page}/${totalPages}`, color: 'text-purple-600', bg: 'bg-purple-500/10' },
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
    <div className="min-h-screen py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <section className="relative overflow-hidden glass-card !p-0 border-none shadow-2xl shadow-civic-500/10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-civic-600/20 to-transparent pointer-events-none md:block hidden" />
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="flex-1 p-6 md:p-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-900 dark:bg-white flex items-center justify-center shadow-2xl relative group">
                  {user?.avatar ? (
                    <img src={user.avatar} className="w-full h-full rounded-[2rem] object-cover" alt="" />
                  ) : (
                    <UserCircleIcon className="w-12 h-12 text-white dark:text-slate-900" />
                  )}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-lg" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                    {user?.name || 'Citizen'}
                  </h1>
                  <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {isAdmin ? 'System Administrator' : 'Active Community Member'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {!isAdmin && (
                  <button
                    onClick={() => navigate('/report-issue')}
                    className="btn-primary"
                  >
                    <PlusIcon className="w-5 h-5" />
                    New Report
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-secondary !bg-slate-50 dark:!bg-slate-800/50 !border-slate-200 dark:!border-slate-800"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="bg-slate-50/50 dark:bg-slate-950/20 md:w-[400px] border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/50 p-6 md:p-8 grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="glass dark:bg-slate-900/40 p-4 rounded-3xl border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-center items-center text-center">
                   <span className={`text-2xl font-bold ${stat.color} mb-1 tracking-tighter`}>{stat.val}</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Dashboard Content */}
        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-3">
                {isAdmin ? 'City Operations' : 'Recent Reports'}
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                  {totalIssues} TOTAL
                </span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm"> Manage and monitor your community issues in real-time. </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Search Bar */}
              <div className="relative group flex-1 sm:w-80">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-civic-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Find a report..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field !pl-12 !h-14 !text-sm !font-bold"
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary !h-14 !px-6 ${showFilters ? '!bg-slate-900 !text-white dark:!bg-white dark:!text-slate-900' : ''}`}
              >
                <FunnelIcon className="w-5 h-5" />
                Filters
              </button>

              {!isAdmin && (
                <div className="flex p-1.5 glass-card !rounded-2xl border-slate-200 dark:border-slate-800 h-14">
                  <button
                    onClick={() => setFilterScope('All')}
                    className={`flex-1 px-4 rounded-xl text-xs font-bold tracking-widest transition-all ${filterScope === 'All' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                  >
                    GLOBAL
                  </button>
                  <button
                    onClick={() => setFilterScope('Mine')}
                    className={`flex-1 px-4 rounded-xl text-xs font-bold tracking-widest transition-all ${filterScope === 'Mine' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                  >
                    MY REPORTS
                  </button>
                </div>
              )}

              <div className="flex p-1.5 glass-card !rounded-2xl border-slate-200 dark:border-slate-800 h-14 ml-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg border-none' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                  title="Grid View"
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 rounded-xl transition-all ${viewMode === 'map' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg border-none' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                  title="Map View"
                >
                  <GlobeAltIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="glass-card p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-scale-in">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 leading-none">Status State</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field !py-3 !text-sm font-bold appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 leading-none">Priority Label</label>
                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="input-field !py-3 !text-sm font-bold appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 leading-none">Issue Category</label>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input-field !py-3 !text-sm font-bold appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat"
                >
                  <option value="All">All Categories</option>
                  <option value="Pothole">Pothole</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Street Light">Street Light</option>
                  <option value="Water Leak">Water Leak</option>
                  <option value="Broken Sidewalk">Broken Sidewalk</option>
                  <option value="Park Maintenance">Park Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Issues Display */}
          {loading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-civic-500/20 border-t-civic-600 rounded-full animate-spin" />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest"> Fetching Reports... </p>
            </div>
          ) : viewMode === 'grid' ? (
            filteredIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                {filteredIssues.map((issue) => (
                  <IssueCard 
                    key={issue._id} 
                    issue={issue} 
                    onDelete={handleDeleteIssue}
                    onStatusUpdate={handleUpdateIssue}
                  />
                ))}
              </div>
            ) : (
              <div className="card-premium min-h-[400px] flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-8">
                  <ExclamationCircleIcon className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight"> No reports found </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 font-medium"> We couldn't find any issues matching your current filters. Try adjusting your search or filters. </p>
                <button 
                  onClick={() => {
                    setFilterStatus('All');
                    setFilterPriority('All');
                    setFilterCategory('All');
                    setSearchTerm('');
                  }}
                  className="btn-secondary"
                >
                  Clear all filters
                </button>
              </div>
            )
          ) : (
            /* Map View */
            <div className="h-[600px] w-full rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-2xl z-0 relative">
               <MapContainer
                center={issues.find(i => i.coordinates?.lat)?.coordinates || [20.5937, 78.9629]}
                zoom={issues.some(i => i.coordinates?.lat) ? 12 : 5}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {issues.map(issue => issue.coordinates?.lat && (
                  <Marker 
                    key={issue._id} 
                    position={[issue.coordinates.lat, issue.coordinates.lng]}
                  >
                    <Popup className="premium-popup">
                       <div className="p-2 min-w-[200px] space-y-3">
                         <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${issue.status === 'Resolved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{issue.status}</span>
                         </div>
                         <h4 className="font-bold text-slate-900 line-clamp-1">{issue.title}</h4>
                         <p className="text-xs text-slate-500 line-clamp-2">{issue.description}</p>
                         <button 
                           onClick={() => navigate(`/issues/${issue._id}`)}
                           className="w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-civic-600 transition-colors"
                         >
                           View Dossier
                         </button>
                       </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 py-12">
               <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="btn-secondary !p-3 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRightIcon className="w-5 h-5 rotate-180" />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-12 h-12 rounded-2xl text-sm font-bold transition-all ${page === i + 1 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl' : 'glass-card border-none hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

               <button 
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="btn-secondary !p-3 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
