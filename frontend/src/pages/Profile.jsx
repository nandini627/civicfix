import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  UserCircleIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CameraIcon
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
      // Update local profile data
      setProfileData(prev => ({ ...prev, user: { ...prev.user, avatar: data.avatar } }));
      // Update global auth context
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
      <div className="min-h-screen py-24 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-civic-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-24 px-4 overflow-hidden">
        <div className="max-w-md mx-auto card p-12 text-center border-red-100 dark:border-red-900/30">
          <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Profile</h3>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const { stats, issues, user: profileUser } = profileData;

  const statCards = [
    { label: 'Total Reports', val: stats.total, icon: ShieldCheckIcon, color: 'text-civic-600', bg: 'bg-civic-50 dark:bg-civic-900/20' },
    { label: 'Resolved', val: stats.resolved, icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Pending', val: stats.pending, icon: ClockIcon, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'In Progress', val: stats.inProgress, icon: ArrowPathIcon, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ];

  return (
    <div className="min-h-screen py-12 px-4 animate-fade-in relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-civic-500/5 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -ml-48 -mb-48" />

      <div className="max-w-6xl mx-auto relative">
        {/* Profile Hero Header */}
        <div className="card p-8 mb-8 border-0 shadow-xl bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" className="text-white/20" />
            </svg>
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 bg-white/10 p-1 rounded-3xl backdrop-blur-md shadow-2xl relative z-10 transition-transform group-hover:scale-[1.02]">
                <div className="w-full h-full bg-civic-600 rounded-2xl flex items-center justify-center overflow-hidden">
                  {profileUser.avatar ? (
                    <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircleIcon className="w-20 h-20 text-white" />
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-civic-500 hover:bg-civic-600 border-4 border-gray-900 rounded-full z-20 shadow-lg flex items-center justify-center text-white transition-all hover:scale-110 disabled:opacity-50"
              >
                <CameraIcon className="w-5 h-5" />
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                {profileUser.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{profileUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-civic-300 bg-civic-400/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-civic-400/20">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">{profileUser.role} Account</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, i) => (
            <div key={i} className="card p-6 flex items-center gap-4 group hover:scale-[1.02] transition-all">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <div className={`text-3xl font-black ${stat.color} leading-none mb-1`}>{stat.val}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Reports Section */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">My Issues History</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">A timeline of every report you've contributed to CivicFix.</p>
          </div>
          <div className="text-sm font-bold text-civic-600 bg-civic-50 dark:bg-civic-900/30 px-4 py-2 rounded-xl border border-civic-100 dark:border-civic-900/50">
            {issues.length} Total Contributions
          </div>
        </div>

        {issues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger-fade-in">
            {issues.map(issue => (
              <IssueCard 
                key={issue._id} 
                issue={issue} 
                onStatusUpdate={handleUpdateIssue}
                onDelete={handleDeleteIssue}
              />
            ))}
          </div>
        ) : (
          <div className="card p-24 text-center border-dashed border-2 bg-transparent">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No reports yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              You haven't reported any civic issues yet. Start participating to help improve your neighborhood!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
