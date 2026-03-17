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
  XMarkIcon
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
  const [adminPhoto, setAdminPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [updateMainImage, setUpdateMainImage] = useState(false);

  const [replyMessage, setReplyMessage] = useState('');
  const [replyPhoto, setReplyPhoto] = useState(null);
  const [replying, setReplying] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    'Completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  const statusOptions = ['Pending', 'In Progress', 'Completed', 'Rejected'];
  
  const priorityColors = {
    'Low': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800',
    'Medium': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'Critical': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
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
    // Do not include status updates here, as they are now handled via the Reply/Status board
    formData.append('title', issue.title);
    formData.append('description', issue.description);
    formData.append('priority', issue.priority || 'Low');
    formData.append('location', issue.location || '');
    formData.append('category', issue.category || 'Other');
    if (updateMainImage) {
      formData.append('updateMainImage', 'true');
    }
    if (adminPhoto) {
      formData.append('image', adminPhoto);
    }

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

  const isAdmin = user?.role?.toLowerCase() === 'admin';
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
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-lg ${statusColors[issue.status] || statusColors['Pending']}`}>
                      {issue.status}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-lg ${priorityColors[issue.priority] || priorityColors['Low']}`}>
                      {issue.priority || 'Low'} Priority
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
                
                <div className="prose dark:prose-invert max-w-none mb-10">
                  <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">Issue Description</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed whitespace-pre-wrap">
                    {issue.description}
                  </p>
                </div>

                {/* Reply Board / Chat Section */}
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Discussion & Updates</h3>
                  
                  <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2">
                    {issue.replies && issue.replies.length > 0 ? (
                      issue.replies.map((reply, idx) => (
                        <div key={idx} className={`flex gap-4 ${reply.senderRole === 'admin' ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            {reply.sender?.avatar ? (
                               <img src={reply.sender.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : reply.senderRole === 'admin' ? (
                               <ShieldCheckIcon className="w-6 h-6 text-civic-600" />
                            ) : (
                               <UserIcon className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <div className={`p-4 rounded-2xl w-full max-w-[85%] ${reply.senderRole === 'admin' ? 'bg-civic-50 dark:bg-civic-900/20 border border-civic-100 dark:border-civic-900/30 rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm'}`}>
                            <div className={`flex items-center gap-2 mb-2 ${reply.senderRole === 'admin' ? 'justify-end flex-row-reverse' : ''}`}>
                               <p className="text-sm font-bold text-gray-900 dark:text-white">{reply.sender?.name || 'User'}</p>
                               <span className="text-[10px] text-gray-500 dark:text-gray-400">{formatDate(reply.createdAt)}</span>
                            </div>
                            {reply.message && <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">{reply.message}</p>}
                            {reply.imageUrl && (
                               <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                  <img src={reply.imageUrl} alt="attached" className="max-w-full h-auto max-h-[300px] object-cover" />
                               </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center italic">No updates or comments yet. Be the first to start the discussion!</p>
                    )}
                  </div>
                  
                  {/* Reply Input Box */}
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder={isAdmin ? "Add an official update or comment..." : "Ask a question or provide more details..."}
                      className="input-field min-h-[80px] text-sm py-3 mb-3 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
                    />
                    
                    {isAdmin && (
                       <div className="mb-4">
                         <div className="relative">
                           <select
                             value={issue.status}
                             onChange={(e) => handleFieldChange('status', e.target.value)}
                             className="input-field appearance-none font-bold text-sm bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-civic-600 dark:text-civic-400 pr-10"
                           >
                             {statusOptions.map(opt => (
                               <option key={opt} value={opt}>{opt}</option>
                             ))}
                           </select>
                         </div>
                       </div>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-3">
                       <label className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-semibold text-gray-500 hover:text-civic-600 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                             if (e.target.files[0]) {
                               setReplyPhoto(e.target.files[0]);
                             }
                          }} />
                          <PencilSquareIcon className="w-5 h-5" />
                          <span className="truncate max-w-[150px]">{replyPhoto ? replyPhoto.name : 'Attach Image'}</span>
                       </label>
                       
                       {isAdmin && (
                         <label className="flex items-center gap-2 px-3 py-2 select-none cursor-pointer">
                           <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="rounded text-civic-600 focus:ring-civic-500 w-4 h-4" />
                           <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Email Citizen</span>
                         </label>
                       )}

                       <button type="button" onClick={handlePostReply} disabled={replying || (!replyMessage && !replyPhoto && !isAdmin)} className="btn-primary py-2 px-6 ml-auto flex items-center gap-2 text-sm">
                          {replying ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : (isAdmin ? 'Update Status & Reply' : 'Send Reply')}
                       </button>
                    </div>
                  </div>
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
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
                    <TagIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Category</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{issue.category || 'Other'}</p>
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

                <div className="flex items-start gap-4 text-gray-600 dark:text-gray-400">
                  <div className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl shrink-0">
                    <ArrowPathIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Last Updated</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatDate(issue.updatedAt || issue.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="card p-8 border-civic-100 dark:border-civic-900/30">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Civic Response Center
                  </h3>
                  {issue.reportedBy?.email && (
                    <a
                      href={`mailto:${issue.reportedBy.email}?subject=Regarding CivicFix Issue: ${issue.title}`}
                      className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-all group relative"
                      title="Contact Citizen via Email"
                    >
                      <EnvelopeIcon className="w-5 h-5" />
                      <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                        Email Reporter
                      </span>
                    </a>
                  )}
                </div>
                
                <form onSubmit={handleAdminUpdate} className="space-y-8">
                  {/* Subsection: Audit Details */}
                  <div className="space-y-5 p-4 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border border-gray-100 dark:border-gray-900/30">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-civic-500 mb-2">Audit Details</p>
                    
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Issue Title</p>
                      <input
                        type="text"
                        value={issue.title}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        className="input-field text-sm font-semibold"
                        placeholder="Enter issue title"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Issue Description</p>
                      <textarea
                        value={issue.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        className="input-field text-sm min-h-[80px] py-3"
                        placeholder="Enter issue description"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Location</p>
                      <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={issue.location}
                          onChange={(e) => handleFieldChange('location', e.target.value)}
                          className="input-field pl-9 text-sm"
                          placeholder="Enter location"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Category</p>
                        <div className="relative">
                          <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            value={issue.category || 'Other'}
                            onChange={(e) => handleFieldChange('category', e.target.value)}
                            className="input-field pl-9 appearance-none font-bold text-sm"
                          >
                            {categoryOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Priority</p>
                        <div className="relative">
                          <select
                            value={issue.priority || 'Low'}
                            onChange={(e) => handleFieldChange('priority', e.target.value)}
                            className="input-field appearance-none pr-10 font-bold text-sm"
                          >
                            {priorityOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={updating}
                        className="btn-primary w-full py-3 mt-4 text-sm flex items-center justify-center gap-2"
                      >
                        {updating ? (
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <PencilSquareIcon className="w-5 h-5" />
                            Update Issue Details
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
