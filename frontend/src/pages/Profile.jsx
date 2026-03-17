import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  UserCircleIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CameraIcon,
  ArrowRightIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import IssueCard from '../components/IssueCard';

const Profile = () => {
  const { user: authUser, token, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await axios.put('/api/users/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfileData(prev => ({ ...prev, user: { ...prev.user, avatar: data.avatar } }));
      updateUser({ avatar: data.avatar });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateIssue = (updatedIssue) => {
    setProfileData(prev => ({
      ...prev,
      issues: prev.issues.map(issue => 
        issue._id === updatedIssue._id ? updatedIssue : issue
      )
    }));
  };

  const handleDeleteIssue = (id) => {
    setProfileData(prev => ({
      ...prev,
      issues: prev.issues.filter(issue => issue._id !== id),
      stats: { ...prev.stats, total: prev.stats.total - 1 }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-civic-500/20 border-t-civic-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-civic-500 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="mt-8 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-sm leading-none">Accessing Dossier...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md mx-auto glass-card p-12 text-center border-rose-500/20">
          <ExclamationCircleIcon className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Access Denied</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  const { stats, issues, user: profileUser } = profileData;

  const statCards = [
    { label: 'Total Operations', val: stats.total, icon: ShieldCheckIcon, color: 'text-civic-500', bg: 'bg-civic-500/10', border: 'border-civic-500/20' },
    { label: 'Successful', val: stats.resolved, icon: CheckCircleIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Pending', val: stats.pending, icon: ClockIcon, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Active', val: stats.inProgress, icon: ArrowPathIcon, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-civic-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative space-y-12">
        {/* Profile Hero Header */}
        <div className="glass-card shadow-2xl relative overflow-hidden border-slate-200/50 dark:border-slate-800/50">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-8 md:p-12 relative">
             {/* Decorative abstract elements */}
             <div className="absolute inset-0 bg-dot-pattern opacity-10" />
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-civic-500/20 rounded-full blur-3xl" />
             
             <div className="relative flex flex-col md:flex-row items-center gap-10">
              <div className="relative group shrink-0">
                <div className="w-28 h-28 md:w-40 md:h-40 bg-white/5 p-1 md:p-1.5 rounded-3xl md:rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                  <div className="w-full h-full bg-slate-800 rounded-2xl md:rounded-[2rem] flex items-center justify-center overflow-hidden border-2 border-white/10 group-hover:border-civic-500/50 transition-colors">
                    {profileUser.avatar ? (
                      <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircleIcon className="w-24 h-24 text-slate-600" />
                    )}
                    
                    {uploading && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-20">
                        <ArrowPathIcon className="w-10 h-10 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-10 h-10 md:w-14 md:h-14 bg-civic-600 hover:bg-civic-500 text-white border-4 md:border-8 border-slate-900 rounded-full z-20 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 group-hover:shadow-civic-500/20"
                >
                  <CameraIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>

              <div className="text-center md:text-left space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                    <span className="bg-civic-500/20 text-civic-400 text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-civic-500/30 backdrop-blur-md">
                      {profileUser.role} Dossier
                    </span>
                    <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-indigo-500/30 backdrop-blur-md">
                      Verified Operative
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tighter leading-none">
                    {profileUser.name}
                  </h1>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  <div className="flex items-center gap-4 text-slate-400 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:text-civic-400 transition-colors">
                      <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest leading-none mb-1">Secure Channel</p>
                        <p className="text-sm font-bold text-slate-200">{profileUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:text-indigo-400 transition-colors">
                      <IdentificationIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest leading-none mb-1">Operator ID</p>
                        <p className="text-sm font-bold text-slate-200">#CF-{profileUser._id.substring(18).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {statCards.map((stat, i) => (
            <div key={i} className={`glass-card p-6 md:p-8 flex flex-col gap-6 group hover:scale-[1.03] transition-all duration-300 border-b-4 ${stat.border} shadow-2xl shadow-slate-200/5 dark:shadow-none`}>
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <div className={`text-3xl md:text-5xl font-bold ${stat.color} tracking-tighter leading-none mb-1 md:mb-2`}>{stat.val}</div>
                <div className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Reports Section */}
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">Operational <span className="text-gradient">History</span></h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-tight">Complete ledger of your community intelligence contributions.</p>
            </div>
            <div className="flex items-center gap-4 px-8 h-12 glass-card rounded-2xl border-slate-200 dark:border-slate-800 shadow-lg">
               <ShieldCheckIcon className="w-5 h-5 text-civic-500" />
               <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                {issues.length} Intel Reports
               </span>
            </div>
          </div>

          {issues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {issues.map((issue, idx) => (
                <div key={issue._id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <IssueCard 
                    issue={issue} 
                    onStatusUpdate={handleUpdateIssue}
                    onDelete={handleDeleteIssue}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-24 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent flex flex-col items-center gap-8 animate-scale-in">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                <ShieldCheckIcon className="w-12 h-12 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">No Signals Tracked</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
                  Your operative history is empty. Deploy to the dashboard to report your first community signal.
                </p>
              </div>
              <Link to="/dashboard" className="btn-primary !h-14 !px-10 flex items-center gap-3 group">
                 <span className="font-bold text-xs uppercase tracking-widest">Deploy to Field</span>
                 <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
