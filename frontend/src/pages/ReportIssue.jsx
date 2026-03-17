import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  TagIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const InputWrapper = ({ label, name, type = 'text', icon: Icon, value, onChange, errors, placeholder, isTextArea = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <div className={`absolute ${isTextArea ? 'top-3' : 'inset-y-0'} left-3 flex items-center pointer-events-none`}>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      {isTextArea ? (
        <textarea
          name={name}
          id={name}
          rows="4"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field pl-10 resize-none ${
            errors[name] ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''
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
          className={`input-field pl-10 ${
            errors[name] ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''
          }`}
        />
      )}
    </div>
    {errors[name] && (
      <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
        <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
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

  const [form, setForm] = useState({ title: '', description: '', location: '', category: 'Other' });
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
    
    if (!form.category) errs.category = 'Category is required';

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
      if (file.size > 5 * 1024 * 1024) {
        setApiError('Image size should be less than 5MB.');
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
      if (image) {
        formData.append('image', image);
      }

      await axios.post(
        '/api/issues',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 animate-fade-in relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-civic-400/10 dark:bg-civic-400/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-400/5 rounded-full blur-3xl" />

      <div className="max-w-2xl mx-auto relative">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Report a Civic Issue
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
            Help us make your neighborhood better by reporting problems directly to authorities.
          </p>
        </div>

        <div className="card p-8 sm:p-10">
          {success ? (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Report Submitted!</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Thank you for your contribution. We'll start tracking this issue immediately.
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <>
              {apiError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <InputWrapper
                  label="What is the problem?"
                  name="title"
                  icon={TagIcon}
                  value={form.title}
                  onChange={handleChange}
                  errors={errors}
                  placeholder="e.g., Pothole on High Street, Broken Streetlight"
                />

                <InputWrapper
                  label="Provide more details"
                  name="description"
                  icon={ChatBubbleLeftRightIcon}
                  isTextArea={true}
                  value={form.description}
                  onChange={handleChange}
                  errors={errors}
                  placeholder="Describe the issue in detail so authorities can understand it better..."
                />

                <InputWrapper
                  label="Location"
                  name="location"
                  icon={MapPinIcon}
                  value={form.location}
                  onChange={handleChange}
                  errors={errors}
                  placeholder="e.g., Near City Park, Intersection of Broadway"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Issue Category
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <TagIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className={`input-field pl-10 appearance-none ${
                        errors.category ? 'border-red-400 focus:ring-red-400' : ''
                      }`}
                    >
                      <option value="Pothole">Pothole</option>
                      <option value="Garbage">Garbage / Waste</option>
                      <option value="Street Light">Street Light Issue</option>
                      <option value="Water Leak">Water / Sewage Leak</option>
                      <option value="Broken Sidewalk">Broken Sidewalk</option>
                      <option value="Park Maintenance">Park Maintenance</option>
                      <option value="Other">Other Category</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Image Upload Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Upload an Image (Optional)
                  </label>
                  {!preview ? (
                    <div 
                      onClick={() => fileInputRef.current.click()}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-civic-500 dark:hover:border-civic-400 transition-all group"
                    >
                      <PhotoIcon className="w-10 h-10 text-gray-400 group-hover:text-civic-500 transition-colors" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden group border border-gray-200 dark:border-gray-700">
                      <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-gray-900/50 hover:bg-gray-900/80 text-white rounded-full backdrop-blur-sm transition-all"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting Report...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
