import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ChatBubbleBottomCenterIcon, 
  MapPinIcon, 
  CalendarIcon, 
  TrashIcon, 
  EllipsisVerticalIcon,
  TagIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  UserIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const statusConfig = {
  'Pending': { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: ClockIcon },
  'In Progress': { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: ArrowPathIcon },
  'Completed': { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircleIcon },
  'Resolved': { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircleIcon },
  'Rejected': { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: XCircleIcon },
};

const priorityConfig = {
  'Low': { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  'Medium': { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  'High': { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  'Critical': { color: 'text-rose-600', bg: 'bg-rose-600/10', border: 'border-rose-600/20' },
};

const IssueCard = ({ issue, onStatusUpdate, onDelete }) => {
  const { user, token } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const status = statusConfig[issue.status] || statusConfig['Pending'];
  const priority = priorityConfig[issue.priority] || priorityConfig['Medium'];

  const handleStatusChange = async (newStatus) => {
    if (newStatus === issue.status) return;
    setUpdating(true);
    try {
      const { data } = await axios.put(
        `/api/issues/${issue._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onStatusUpdate) onStatusUpdate(data);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this report permanently?')) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/issues/${issue._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onDelete) onDelete(issue._id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="group card-premium !p-0 flex flex-col h-full overflow-hidden animate-scale-in relative">
      <Link to={`/issues/${issue._id}`} className="absolute inset-0 z-0" aria-label="View Details" />
      
      <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {issue.imageUrl ? (
          <img src={issue.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
            <MapPinIcon className="w-12 h-12 mb-2 opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-widest">No Visual Attached</span>
          </div>
        )}
        
        <div className={`absolute top-4 left-4 tag ${priority.bg} ${priority.color} border backdrop-blur-md z-10`}>
          {issue.priority || 'Low'}
        </div>
        
        <div className={`absolute top-4 right-4 py-1.5 px-3 rounded-full flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md z-10 ${status.bg} ${status.color} ${status.border}`}>
          <status.icon className={`w-3 h-3 ${updating ? 'animate-spin' : ''}`} />
          {issue.status}
        </div>

        {issue.coordinates?.lat && (
          <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 dark:border-white/5 z-10 shadow-lg" title="GPS Coordinates Included">
            <GlobeAltIcon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <div className="p-5 md:p-6 flex flex-col flex-1 relative z-10">
        <div className="mb-4 pointer-events-none">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <TagIcon className="w-3 h-3" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none">{issue.category || 'General'}</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white group-hover:text-civic-600 transition-colors line-clamp-1 mb-1 md:mb-2">
            {issue.title}
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed h-[2.5rem] md:h-[3rem]">
            {issue.description}
          </p>
        </div>

        <div className="flex items-center gap-4 mb-6 pointer-events-none">
          <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
            <MapPinIcon className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold truncate">{issue.location || 'City Zone'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 ml-auto">
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold">{formatDate(issue.createdAt)}</span>
          </div>
        </div>

        {/* Authority Response Indicator */}
        {issue.officialResponse?.text && (
          <div className="mb-6 p-4 bg-civic-50/50 dark:bg-civic-950/30 rounded-2xl border border-civic-100/30 dark:border-civic-900/30 pointer-events-none transition-all group-hover:bg-civic-50/80 dark:group-hover:bg-civic-950/40">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-civic-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-civic-700 dark:text-civic-400">Official Directive</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2 font-medium leading-relaxed">
              "{issue.officialResponse.text}"
            </p>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-20">
          {isAdmin ? (
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1 group/select">
                <select
                  disabled={updating}
                  value={issue.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full input-field !py-2.5 !pl-3 !pr-8 !text-[10px] !font-bold !uppercase !tracking-widest appearance-none bg-slate-50 dark:bg-slate-950/50 !border-slate-100 dark:!border-slate-800 focus:!ring-civic-500/20 cursor-pointer transition-all"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-civic-500 transition-colors">
                  <ArrowPathIcon className={`w-3.5 h-3.5 ${updating ? 'animate-spin' : ''}`} />
                </div>
              </div>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20"
                title="Delete Report"
              >
                <TrashIcon className={`w-5 h-5 ${deleting ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>
                <div className="flex flex-col min-w-0">
                   <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400 leading-none mb-1">Reported By</span>
                   <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-none">
                     {issue.reportedBy?.name || 'Citizen'}
                   </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-civic-600 group-hover:text-civic-500 transition-all shrink-0">
                Details <EllipsisVerticalIcon className="w-4 h-4" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
