import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, CalendarIcon, UserIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const IssueCard = ({ issue, onStatusUpdate, onDelete }) => {
  const { user, token } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  };

  const statusOptions = ['Pending', 'In Progress', 'Resolved'];

  const handleStatusChange = async (newStatus) => {
    if (newStatus === issue.status) return;
    setUpdating(true);
    try {
      const { data } = await axios.put(
        `/api/issues/${issue._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onStatusUpdate) onStatusUpdate(data);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Only admins can do this.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) return;
    
    setDeleting(true);
    try {
      await axios.delete(
        `/api/issues/${issue._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onDelete) onDelete(issue._id);
    } catch (err) {
      console.error('Failed to delete issue:', err);
      alert(err.response?.data?.message || 'Failed to delete issue.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isAdmin = user?.role === 'admin';
  const isReporter = user?.id === issue.reportedBy?._id || user?._id === issue.reportedBy?._id || user?.id === issue.reportedBy;

  return (
    <div className="card border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full bg-white dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden relative">
      <Link to={`/issues/${issue._id}`} className="absolute inset-0 z-0" aria-label="View Issue Details" />
      
      {/* Image Display */}
      {issue.imageUrl && (
        <div className="relative h-48 overflow-hidden group/img">
          <img 
            src={issue.imageUrl} 
            alt={issue.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1 relative z-10 pointer-events-none">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-civic-600 transition-colors">
              {issue.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400 text-pretty">
              <MapPinIcon className="w-4 h-4 shrink-0" />
              {issue.location}
            </div>
          </div>
          
          <div className="flex items-center gap-2 pointer-events-auto">
            {isAdmin ? (
              <div className="relative group/status">
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                  className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer outline-none appearance-none pr-8 transition-all ${statusColors[issue.status] || statusColors['Pending']} ${updating ? 'opacity-50 animate-pulse' : ''}`}
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">{opt}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  {updating ? (
                    <ArrowPathIcon className="w-3 h-3 animate-spin" />
                  ) : (
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                  )}
                </div>
              </div>
            ) : (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${statusColors[issue.status] || statusColors['Pending']}`}>
                {issue.status}
              </span>
            )}

            {(isAdmin || isReporter) && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                title="Delete Issue"
              >
                {deleting ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <TrashIcon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
          {issue.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 overflow-hidden">
            <UserIcon className="w-4 h-4 text-civic-500 shrink-0" />
            <span className="truncate">By <span className="font-semibold text-gray-700 dark:text-gray-200">{issue.reportedBy?.name || 'Anonymous'}</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 shrink-0">
            <CalendarIcon className="w-4 h-4" />
            {formatDate(issue.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
