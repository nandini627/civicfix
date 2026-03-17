import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const InputWrapper = ({ label, name, type = 'text', icon: Icon, rightIcon, value, onChange, errors, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field pl-10 ${rightIcon ? 'pr-10' : ''} ${
          errors[name] ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''
        }`}
      />
      {rightIcon && (
        <button
          type="button"
          onClick={rightIcon.toggle}
          className="absolute inset-y-0 right-3 flex items-center"
        >
          {rightIcon.show ? (
            <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
          ) : (
            <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
          )}
        </button>
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

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const nameRef = useRef(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'citizen' });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';

    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';

    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError(''); // Clear previous errors
    try {
      const { data } = await axios.post('/api/auth/signup', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });
      console.log('Signup success. Updating auth state...');
      await login(data.user, data.token);
      
      // Give state a moment to propagate before nav if needed, 
      // but usually navigate is fine. Let's redirect...
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Signup error details:', err.response || err);
      const message = err.response?.data?.message || 'Connection error. Please ensure the server is running.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 animate-fade-in">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-civic-400 opacity-10 dark:opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400 opacity-10 dark:opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-civic-600 rounded-2xl items-center justify-center shadow-lg mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Join CivicFix and help improve your city
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {apiError && (
            <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <InputWrapper
              label="Full Name"
              name="name"
              icon={UserIcon}
              value={form.name}
              onChange={handleChange}
              errors={errors}
              placeholder="John Doe"
            />
            <InputWrapper
              label="Email Address"
              name="email"
              type="email"
              icon={EnvelopeIcon}
              value={form.email}
              onChange={handleChange}
              errors={errors}
              placeholder="john@example.com"
            />
            <InputWrapper
              label="Password"
              name="password"
              type={showPwd ? 'text' : 'password'}
              icon={LockClosedIcon}
              value={form.password}
              onChange={handleChange}
              errors={errors}
              placeholder="Minimum 6 characters"
              rightIcon={{ toggle: () => setShowPwd(p => !p), show: showPwd }}
            />
            <InputWrapper
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              icon={LockClosedIcon}
              value={form.confirmPassword}
              onChange={handleChange}
              errors={errors}
              placeholder="Re-enter your password"
              rightIcon={{ toggle: () => setShowConfirm(p => !p), show: showConfirm }}
            />

            {/* Role Selection */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                I am signing up as:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, role: 'citizen' }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    form.role === 'citizen'
                      ? 'bg-civic-50 dark:bg-civic-900/20 border-civic-500 text-civic-700 dark:text-civic-300'
                      : 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <UserIcon className={`w-6 h-6 ${form.role === 'citizen' ? 'text-civic-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-bold">Citizen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, role: 'admin' }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    form.role === 'admin'
                      ? 'bg-civic-50 dark:bg-civic-900/20 border-civic-500 text-civic-700 dark:text-civic-300'
                      : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <ShieldCheckIcon className={`w-6 h-6 ${form.role === 'admin' ? 'text-civic-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-bold">Authority</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="signup-submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-gray-900 text-gray-400">Already have an account?</span>
            </div>
          </div>

          <p className="text-center">
            <Link
              to="/login"
              className="text-civic-600 dark:text-civic-400 font-medium hover:underline text-sm"
            >
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
