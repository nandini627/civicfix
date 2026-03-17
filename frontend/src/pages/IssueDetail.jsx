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
  EnvelopeIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  TagIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adminPhoto, setAdminPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [updateMainImage, setUpdateMainImage] = useState(false);

  const [replyMessage, setReplyMessage] = useState('');
  const [replyPhoto, setReplyPhoto] = useState(null);
  const [replying, setReplying] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const statusColors = {
    'Pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'In Progress': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    'Resolved': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'Completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'Rejected': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  };

  const statusOptions = ['Pending', 'In Progress', 'Completed', 'Rejected'];
  
  const priorityColors = {
    'Low': 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800',
    'Medium': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'Critical': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  };

  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const categoryOptions = ['Pothole', 'Garbage', 'Street Light', 'Water Leak', 'Broken Sidewalk', 'Park Maintenance', 'Other'];

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const { data } = await axios.get(`/api/issues/${id}`, {
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

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const formData = new FormData();
    formData.append('title', issue.title);
    formData.append('description', issue.description);
    formData.append('priority', issue.priority || 'Low');
    formData.append('location', issue.location || '');
    formData.append('category', issue.category || 'Other');
    if (updateMainImage) formData.append('updateMainImage', 'true');
    if (adminPhoto) formData.append('image', adminPhoto);

    try {
      const { data } = await axios.put(
        `/api/issues/${issue._id}`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      setIssue(data);
      setAdminPhoto(null);
      setPhotoPreview(null);
      alert('Issue updated successfully!');
    } catch (err) {
      console.error('Failed to update issue:', err);
      alert(err.response?.data?.message || 'Failed to update issue.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Issue deleted successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue.');
    } finally {
      setDeleting(false);
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault && e.preventDefault();
    const isAdminUser = user?.role?.toLowerCase() === 'admin';
    if (!replyMessage && !replyPhoto && !isAdminUser) return;
    
    setReplying(true);
    const formData = new FormData();
    if (replyMessage) formData.append('message', replyMessage);
    if (replyPhoto) formData.append('image', replyPhoto);
    if (isAdminUser) {
      formData.append('sendEmail', sendEmail);
      formData.append('status', issue.status);
    }

    try {
      const endpoint = isAdminUser ? `/api/issues/${id}/status` : `/api/issues/${id}/replies`;
      const method = isAdminUser ? 'patch' : 'post';
      
      const { data } = await axios[method](
        endpoint,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      setIssue(data);
      setReplyMessage('');
      setReplyPhoto(null);
    } catch (err) {
      console.error('Failed to post reply:', err);
      alert(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setReplying(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setIssue(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <p className="mt-8 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">Loading Intel...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen pt-32 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-2xl mx-auto glass-card p-12 text-center shadow-2xl">
          <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
            <ExclamationCircleIcon className="w-14 h-14 text-rose-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tighter uppercase italic">Offline</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-10 leading-relaxed">{error || 'Unable to retrieve issue dossiers.'}</p>
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-3 justify-center w-full sm:w-auto px-10 h-14">
            <ChevronLeftIcon className="w-6 h-6" />
            <span className="font-bold">Back to Grid</span>
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isReporter = user?.id === issue.reportedBy?._id || user?._id === issue.reportedBy?._id || user?.id === issue.reportedBy;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-civic-500/10 dark:bg-civic-500/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative">
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
          <Link to="/dashboard" className="inline-flex items-center gap-2 group text-slate-500 hover:text-civic-600 transition-colors">
            <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center group-hover:scale-110 group-hover:bg-civic-500/10 transition-all">
              <ChevronLeftIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] ml-2">Back to Dashboard</span>
          </Link>

          {(isAdmin || isReporter) && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-3 px-6 h-12 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              {deleting ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <TrashIcon className="w-5 h-5" />}
              Delete Dossier
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Visuals and Main Content */}
          <div className="lg:col-span-8 space-y-10">
            <div className="glass-card overflow-hidden shadow-2xl relative">
              {issue.imageUrl ? (
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900 group">
                  <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
                  
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-wrap gap-2 md:gap-3">
                    <span className={`px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] border backdrop-blur-xl shadow-2xl shadow-black/50 ${statusColors[issue.status] || statusColors['Pending']}`}>
                      {issue.status}
                    </span>
                    <span className={`px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] border backdrop-blur-xl shadow-2xl shadow-black/50 ${priorityColors[issue.priority] || priorityColors['Low']}`}>
                      {issue.priority || 'Low'} Priority
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-slate-200 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-400">
                  <PhotoIcon className="w-20 h-20 mb-4 opacity-10 animate-pulse" />
                  <p className="font-bold uppercase tracking-widest text-xs opacity-40">No Visual Intelligence</p>
                  <div className="absolute top-6 left-6">
                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] border ${statusColors[issue.status] || statusColors['Pending']}`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="p-6 md:p-12">
                <div className="flex flex-col gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-civic-500">
                       <TagIcon className="w-5 h-5" />
                       <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{issue.category || 'Environmental Alert'}</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tighter">
                      {issue.title}
                    </h1>
                  </div>
                  
                  <div className="pt-6 md:pt-8 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 md:mb-6 flex items-center gap-3">
                      <span className="w-6 md:w-8 h-[2px] bg-slate-200 dark:bg-slate-800" />
                      Issue Intelligence
                    </h3>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Discussion Section */}
            <div className="glass-card p-1 shadow-xl">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                   Discussion <span className="bg-civic-500/10 text-civic-600 dark:text-civic-400 text-xs px-3 py-1 rounded-full">{issue.replies?.length || 0}</span>
                </h3>
                <div className="flex items-center gap-2 text-slate-400">
                   <ClockIcon className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Real-time Feed</span>
                </div>
              </div>
              
              <div className="p-4 md:p-8 space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30">
                {issue.replies && issue.replies.length > 0 ? (
                  issue.replies.map((reply, idx) => (
                    <div key={idx} className={`flex gap-4 ${reply.senderRole === 'admin' ? 'flex-row-reverse' : ''} animate-slide-up`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 ${reply.senderRole === 'admin' ? 'border-civic-500/20 bg-civic-500/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800'} overflow-hidden shadow-lg`}>
                        {reply.sender?.avatar ? (
                           <img src={reply.sender.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : reply.senderRole === 'admin' ? (
                           <ShieldCheckIcon className="w-7 h-7 text-civic-600" />
                        ) : (
                           <UserIcon className="w-7 h-7 text-slate-400" />
                        )}
                      </div>
                      <div className={`flex flex-col max-w-[85%] ${reply.senderRole === 'admin' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center gap-3 mb-2 ${reply.senderRole === 'admin' ? 'flex-row-reverse' : ''}`}>
                           <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">{reply.sender?.name || 'Anonymous'}</p>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{formatDate(reply.createdAt)}</span>
                           {reply.senderRole === 'admin' && (
                             <span className="text-[9px] bg-civic-500 text-white font-bold px-2 py-0.5 rounded uppercase tracking-[0.2em]">Authority</span>
                           )}
                        </div>
                        <div className={`p-5 rounded-3xl shadow-sm border ${
                          reply.senderRole === 'admin' 
                            ? 'bg-civic-600 text-white border-civic-700 rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700 rounded-tl-none shadow-xl shadow-slate-200/50 dark:shadow-none'
                        }`}>
                          {reply.message && <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{reply.message}</p>}
                          {reply.imageUrl && (
                             <div className="mt-4 rounded-2xl overflow-hidden border border-black/10">
                                <img src={reply.imageUrl} alt="intelligence" className="max-w-full h-auto max-h-[400px] object-cover hover:scale-105 transition-transform" />
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                       <ChatBubbleLeftRightIcon className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No Signal Detected</p>
                    <p className="text-slate-500 text-sm font-medium">Start the discussion below to provide more intel.</p>
                  </div>
                )}
              </div>
              
              {/* Reply Input Box */}
              <div className="p-6 md:p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-6">
                  <div className="relative group">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder={isAdmin ? "Issue an official directive or update..." : "Provide additional intelligence..."}
                      className="input-field !h-28 md:!h-32 !py-4 md:!py-6 !px-6 md:!px-8 !rounded-2xl md:!rounded-[2.5rem] !bg-slate-50 dark:!bg-slate-950/50 !border-slate-100 dark:!border-slate-800 focus:!border-civic-500 transition-all font-medium text-sm md:text-base text-slate-700 dark:text-slate-200 resize-none shadow-inner"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
                     <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <label className="flex items-center justify-center gap-3 px-6 h-12 glass-card cursor-pointer group hover:bg-civic-500 transition-all rounded-2xl shadow-lg border-slate-100 dark:border-slate-800">
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                               if (e.target.files[0]) setReplyPhoto(e.target.files[0]);
                            }} />
                            <PhotoIcon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                              {replyPhoto ? replyPhoto.name.substring(0, 15) + '...' : 'Attach Visuals'}
                            </span>
                        </label>
                        
                        {isAdmin && (
                          <div className="flex items-center justify-between px-6 h-12 glass-card rounded-2xl border-slate-100 dark:border-slate-800">
                            <div className="relative flex items-center pr-4">
                              <select
                                value={issue.status}
                                onChange={(e) => handleFieldChange('status', e.target.value)}
                                className="appearance-none bg-transparent font-bold text-[10px] uppercase tracking-[0.2em] text-civic-600 dark:text-civic-400 pr-8 cursor-pointer"
                              >
                                {statusOptions.map(opt => (
                                  <option key={opt} value={opt} className="bg-white dark:bg-slate-900">{opt}</option>
                                ))}
                              </select>
                              <div className="absolute right-0 pointer-events-none text-civic-400">
                                <ArrowPathIcon className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <div className="relative">
                                <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="peer hidden" />
                                <div className="w-8 md:w-10 h-5 md:h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer-checked:bg-civic-500 transition-all" />
                                <div className="absolute left-1 top-1 w-3 md:w-4 h-3 md:h-4 bg-white rounded-full peer-checked:translate-x-3 md:peer-checked:translate-x-4 transition-all" />
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-civic-500">Email Citizen</span>
                            </label>
                          </div>
                        )}
                     </div>

                     <button 
                       type="button" 
                       onClick={handlePostReply} 
                       disabled={replying || (!replyMessage && !replyPhoto && !isAdmin)} 
                       className="btn-primary !h-14 sm:!px-10 !rounded-2xl flex items-center justify-center gap-4 group shadow-2xl shadow-civic-500/20 active:scale-95 transition-all"
                     >
                        {replying ? (
                          <ArrowPathIcon className="w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            <span className="font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">{isAdmin ? 'Update Response' : 'Transmit Signal'}</span>
                            <PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </>
                        )}
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Admin Grid */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-1 shadow-xl">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-civic-500" />
                  Dossier Intel
                </h3>
              </div>
              
              <div className="p-8 space-y-10">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-civic-500/10 flex items-center justify-center shrink-0 border border-civic-500/20 shadow-lg shadow-civic-500/5">
                    <MapPinIcon className="w-6 h-6 text-civic-500" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Geo Location</p>
                      <p className="font-bold text-slate-900 dark:text-white leading-tight">{issue.location || 'Undisclosed'}</p>
                    </div>
                    {issue.coordinates && issue.coordinates.lat && issue.coordinates.lng && (
                      <div className="h-48 w-full rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-inner z-0 mt-4">
                        <MapContainer
                          center={[issue.coordinates.lat, issue.coordinates.lng]}
                          zoom={14}
                          scrollWheelZoom={false}
                          className="h-full w-full"
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[issue.coordinates.lat, issue.coordinates.lng]} />
                        </MapContainer>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                    <UserIcon className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Intelligence Source</p>
                    <p className="font-bold text-slate-900 dark:text-white">{issue.reportedBy?.name || 'Anonymous Operative'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                    <CalendarIcon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">File Created</p>
                    <p className="font-bold text-slate-900 dark:text-white mb-0.5">{formatDate(issue.createdAt)}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                       <ClockIcon className="w-3 h-3" />
                       Updated {formatDate(issue.updatedAt || issue.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="glass-card p-1 border-civic-500/30 overflow-hidden shadow-2xl">
                <div className="p-8 bg-gradient-to-r from-civic-600 to-indigo-600 flex items-center justify-between rounded-t-[1.9rem]">
                  <h3 className="text-xs font-bold text-white uppercase tracking-[0.3em] flex items-center gap-3">
                    Authority Control
                  </h3>
                  {issue.reportedBy?.email && (
                    <a
                      href={`mailto:${issue.reportedBy.email}?subject=Regarding CivicFix Issue: ${issue.title}`}
                      className="w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-xl flex items-center justify-center backdrop-blur-md transition-all group shadow-xl"
                      title="Contact Citizen"
                    >
                      <EnvelopeIcon className="w-5 h-5 group-hover:scale-110" />
                    </a>
                  )}
                </div>
                
                <form onSubmit={handleAdminUpdate} className="p-8 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Asset Designation</p>
                      <input
                        type="text"
                        value={issue.title}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        className="input-field !h-12 !px-5 !text-xs font-bold !bg-slate-50 dark:!bg-slate-950 !border-slate-100 dark:!border-slate-800"
                        placeholder="Title"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Operational Summary</p>
                      <textarea
                        value={issue.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        className="input-field !h-32 !py-4 !px-5 !text-xs font-bold !bg-slate-50 dark:!bg-slate-950 !border-slate-100 dark:!border-slate-800 resize-none"
                        placeholder="Description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Threat Level</p>
                        <select
                          value={issue.priority || 'Low'}
                          onChange={(e) => handleFieldChange('priority', e.target.value)}
                          className="input-field !h-12 !px-4 !text-[10px] font-bold uppercase tracking-widest !bg-slate-50 dark:!bg-slate-950 !border-slate-100 dark:!border-slate-800"
                        >
                          {priorityOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Sector</p>
                        <select
                          value={issue.category || 'Other'}
                          onChange={(e) => handleFieldChange('category', e.target.value)}
                          className="input-field !h-12 !px-4 !text-[10px] font-bold uppercase tracking-widest !bg-slate-50 dark:!bg-slate-950 !border-slate-100 dark:!border-slate-800"
                        >
                          {categoryOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Visual Asset Update</p>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center justify-center gap-3 px-6 h-12 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-civic-500/5 hover:border-civic-500/50 transition-all group">
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setAdminPhoto(file);
                                setPhotoPreview(URL.createObjectURL(file));
                                setUpdateMainImage(true);
                              }
                            }} 
                          />
                          <PhotoIcon className="w-5 h-5 text-slate-400 group-hover:text-civic-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-civic-500">
                            {adminPhoto ? adminPhoto.name : 'Update Main Image'}
                          </span>
                        </label>
                        
                        {photoPreview && (
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => {
                                setAdminPhoto(null);
                                setPhotoPreview(null);
                                setUpdateMainImage(false);
                              }}
                              className="absolute top-2 right-2 w-8 h-8 bg-rose-500/80 hover:bg-rose-500 text-white rounded-lg flex items-center justify-center backdrop-blur-sm transition-all shadow-lg"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                  >
                    {updating ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheckIcon className="w-5 h-5" />
                        Update Database
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
