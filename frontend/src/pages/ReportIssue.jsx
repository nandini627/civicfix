import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  TagIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PhotoIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const InputWrapper = ({ label, name, type = 'text', icon: Icon, value, onChange, errors, placeholder, isTextArea = false }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-400 px-1">
      {label}
    </label>
    <div className="relative group">
      <div className={`absolute ${isTextArea ? 'top-4' : 'inset-y-0'} left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-civic-500`}>
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      {isTextArea ? (
        <textarea
          name={name}
          id={name}
          rows="5"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field !pl-12 resize-none !py-4 ${
            errors[name] ? '!border-rose-500 focus:!ring-rose-500' : ''
          }`}
        />
      ) : (
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field !pl-12 !h-14 ${
            errors[name] ? '!border-rose-500 focus:!ring-rose-500' : ''
          }`}
        />
      )}
    </div>
    {errors[name] && (
      <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-500 px-1">
        <ExclamationCircleIcon className="w-3.5 h-3.5" />
        {errors[name]}
      </p>
    )}
  </div>
);

const ReportIssue = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.role?.toLowerCase() === 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [form, setForm] = useState({ title: '', description: '', location: '', category: 'Pothole' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length < 5) errs.title = 'Title must be at least 5 characters';
    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters';
    if (!form.location.trim()) errs.location = 'Location is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setApiError('Please select a valid image file.');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('location', form.location.trim());
      formData.append('category', form.category);
      if (image) formData.append('image', image);

      await axios.post('/api/issues', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 md:py-20 px-4 md:px-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-civic-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative">
        <Link to="/dashboard" className="inline-flex items-center gap-2 mb-8 text-slate-500 hover:text-civic-600 transition-colors group">
          <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center group-hover:scale-110 transition-transform">
             <ChevronLeftIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
        </Link>

        {success ? (
          <div className="glass-card p-12 text-center animate-scale-in">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-float">
              <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Report Received!</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
              Thank you for contributing to your community. We've notified the relevant authorities. Redirecting you shortly...
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">
                Report <span className="text-gradient">Issue</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl text-base md:text-lg"> Help us identify and fix problems in your neighborhood by providing accurate details below. </p>
            </div>

            <div className="glass-card p-6 md:p-12 shadow-2xl shadow-civic-500/5">
              {apiError && (
                <div className="mb-6 md:mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-shake">
                  <ExclamationCircleIcon className="w-5 md:w-6 h-5 md:h-6 text-rose-500 shrink-0" />
                  <p className="text-xs md:text-sm text-rose-600 dark:text-rose-400 font-bold">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <InputWrapper
                      label="Brief Title"
                      name="title"
                      icon={TagIcon}
                      value={form.title}
                      onChange={handleChange}
                      errors={errors}
                      placeholder="e.g., Deep pothole at Central Ave"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputWrapper
                      label="Detailed Description"
                      name="description"
                      icon={ChatBubbleLeftRightIcon}
                      isTextArea={true}
                      value={form.description}
                      onChange={handleChange}
                      errors={errors}
                      placeholder="Describe the issue size, duration, and any hazards it poses..."
                    />
                  </div>

                  <InputWrapper
                    label="Problem Location"
                    name="location"
                    icon={MapPinIcon}
                    value={form.location}
                    onChange={handleChange}
                    errors={errors}
                    placeholder="Physical address or landmark"
                  />

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-400 px-1">
                      Issue Category
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <TagIcon className="w-5 h-5 text-slate-400" />
                      </div>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="input-field !pl-12 !h-14 md:!h-16 appearance-none !font-bold text-xs md:text-sm bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat"
                      >
                        <option value="Pothole">Pothole</option>
                        <option value="Garbage">Garbage / Waste</option>
                        <option value="Street Light">Street Light</option>
                        <option value="Water Leak">Water Leak</option>
                        <option value="Broken Sidewalk">Broken Sidewalk</option>
                        <option value="Park Maintenance">Park Maintenance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-400 px-1 mb-2">
                      Visual Evidence
                    </label>
                    {!preview ? (
                      <div 
                        onClick={() => fileInputRef.current.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-civic-500 dark:hover:border-civic-500 transition-all group bg-slate-50/50 dark:bg-slate-900/40"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PhotoIcon className="w-8 h-8 text-slate-400 group-hover:text-civic-500 transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Upload Photograph</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">PNG or JPG up to 5MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative rounded-3xl overflow-hidden group aspect-video shadow-2xl">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button
                            type="button"
                            onClick={removeImage}
                            className="p-4 bg-rose-500 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                          >
                            <XMarkIcon className="w-8 h-8" />
                          </button>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary !h-16 w-full md:w-auto md:!px-12 text-lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="font-bold">Uploading...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-3 font-bold">
                        Submit Final Report
                        <ArrowRightIcon className="w-6 h-6" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIssue;
