import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  ArrowPathIcon,
  TrashIcon,
  ChevronLeftIcon,
  ExclamationCircleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  };

  const statusOptions = ['Pending', 'In Progress', 'Resolved'];

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/issues/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIssue(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load issue details.');
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id, token]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === issue.status) return;
    setUpdating(true);
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/issues/${issue._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIssue(data);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Only admins can do this.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) return;
    
    setDeleting(true);
    try {
      await axios.delete(
        `http://localhost:5000/api/issues/${issue._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete issue:', err);
      alert(err.response?.data?.message || 'Failed to delete issue.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-civic-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Loading issue details...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-2xl mx-auto card p-12 text-center">
          <ExclamationCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Error</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">{error || 'Issue not found.'}</p>
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 justify-center w-auto px-8">
            <ChevronLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isReporter = user?.id === issue.reportedBy?._id || user?._id === issue.reportedBy?._id || user?.id === issue.reportedBy;

  return (
    <div className="min-h-screen py-12 px-4 animate-fade-in bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-civic-600 dark:hover:text-civic-400 font-semibold transition-colors group">
            <div className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 group-hover:scale-110 transition-transform">
              <ChevronLeftIcon className="w-5 h-5" />
            </div>
            Back to Dashboard
          </Link>

          {(isAdmin || isReporter) && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {deleting ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <TrashIcon className="w-5 h-5" />}
              Delete Issue
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card overflow-hidden">
              {issue.imageUrl ? (
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-lg ${statusColors[issue.status] || statusColors['Pending']}`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center text-gray-400">
                  <ExclamationCircleIcon className="w-16 h-16 mb-2 opacity-20" />
                  <p className="font-medium text-sm">No photo evidence provided</p>
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statusColors[issue.status] || statusColors['Pending']}`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="p-8 sm:p-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                  {issue.title}
                </h1>
                
                <div className="prose dark:prose-invert max-w-none">
                  <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">Issue Description</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed whitespace-pre-wrap">
                    {issue.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="card p-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                Detailed Information
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 text-gray-600 dark:text-gray-400">
                  <div className="p-2.5 bg-civic-50 dark:bg-civic-900/20 text-civic-600 dark:text-civic-400 rounded-xl shrink-0">
                    <MapPinIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Location</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{issue.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-gray-600 dark:text-gray-400">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Reported By</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{issue.reportedBy?.name || 'Anonymous'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-gray-600 dark:text-gray-400">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Reported On</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatDate(issue.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="card p-8 border-civic-100 dark:border-civic-900/30">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  Admin Action Center
                </h3>
                
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Update Current Status</p>
                  <div className="relative">
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updating}
                      className="input-field appearance-none pr-10 font-bold"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      {updating ? <ArrowPathIcon className="w-5 h-5 animate-spin text-civic-600" /> : <ChevronLeftIcon className="w-5 h-5 -rotate-90 text-gray-400" />}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button 
                      onClick={() => alert('Email notification is automatically sent when you update the status above.')}
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all"
                    >
                      <EnvelopeIcon className="w-5 h-5" />
                      Notify Reporter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
