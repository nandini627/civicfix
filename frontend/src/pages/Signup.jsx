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
  ArrowRightIcon,
  ArrowPathIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const InputWrapper = ({ label, name, type = 'text', icon: Icon, rightIcon, value, onChange, errors, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
        <Icon className="w-5 h-5 text-slate-400 group-focus-within:text-civic-500 transition-colors" />
      </div>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field !h-14 !pl-16 !rounded-2xl !bg-slate-50 dark:!bg-slate-950/50 !border-slate-100 dark:!border-slate-800 focus:!border-civic-500 transition-all font-bold text-slate-700 dark:text-slate-200 ${
          errors[name] ? '!border-rose-500' : ''
        } ${rightIcon ? '!pr-16' : ''}`}
      />
      {rightIcon && (
        <button
          type="button"
          onClick={rightIcon.toggle}
          className="absolute inset-y-0 right-6 flex items-center text-slate-400 hover:text-civic-500 transition-colors"
        >
          {rightIcon.show ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
    {errors[name] && (
      <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 ml-1 uppercase tracking-wider">
        <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
        {errors[name]}
      </p>
    )}
  </div>
);

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

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
    setApiError('');
    try {

      const { data } = await axios.post('/api/auth/signup', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });
      await login(data.user, data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Connection error. Please ensure the server is running.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-civic-500/10 blur-[120px] rounded-full pointer-events-none animate-float" />
      <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative w-full max-w-2xl animate-scale-in">
        {/* Branding */}
        <div className="text-center mb-10 space-y-4">
           <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-16 h-16 bg-gradient-to-br from-civic-600 to-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-civic-500/20 group-hover:scale-110 transition-transform duration-500">
               <ShieldCheckIcon className="w-9 h-9 text-white" />
            </div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase italic">
              Civic<span className="text-civic-600">Fix</span>
            </span>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase">
              Join the <span className="text-gradient">Network</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-tight">
              Enlist as a community operative today
            </p>
          </div>
        </div>

        {/* Signup Card */}
        <div className="glass-card p-1 shadow-2xl">
          <div className="p-8 md:p-12 space-y-10">
            {apiError && (
              <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 animate-slide-up">
                <ExclamationCircleIcon className="w-6 h-6 text-rose-500 shrink-0" />
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputWrapper
                  label="Operative Name"
                  name="name"
                  icon={IdentificationIcon}
                  value={form.name}
                  onChange={handleChange}
                  errors={errors}
                  placeholder="John Doe"
                />
                <InputWrapper
                  label="Secure Email"
                  name="email"
                  type="email"
                  icon={EnvelopeIcon}
                  value={form.email}
                  onChange={handleChange}
                  errors={errors}
                  placeholder="john@intel.com"
                />
                <InputWrapper
                  label="Primary Cipher"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  icon={LockClosedIcon}
                  value={form.password}
                  onChange={handleChange}
                  errors={errors}
                  placeholder="••••••••"
                  rightIcon={{ toggle: () => setShowPwd(p => !p), show: showPwd }}
                />
                <InputWrapper
                  label="Verify Cipher"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  icon={LockClosedIcon}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  errors={errors}
                  placeholder="••••••••"
                  rightIcon={{ toggle: () => setShowConfirm(p => !p), show: showConfirm }}
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-4">
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-1">Assigned Deployment Role</p>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, role: 'citizen' }))}
                    className={`flex items-center justify-center gap-2 md:gap-3 h-14 md:h-16 rounded-xl md:rounded-2xl border-2 transition-all duration-300 ${
                      form.role === 'citizen'
                        ? 'bg-civic-500/10 border-civic-500 text-civic-600 dark:text-civic-400 shadow-xl shadow-civic-500/10'
                        : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Citizen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, role: 'admin' }))}
                    className={`flex items-center justify-center gap-2 md:gap-3 h-14 md:h-16 rounded-xl md:rounded-2xl border-2 transition-all duration-300 ${
                      form.role === 'admin'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10'
                        : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Authority</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="signup-submit"
                disabled={loading}
                className="btn-primary !h-16 !rounded-2xl w-full flex items-center justify-center gap-3 shadow-2xl shadow-civic-500/20 active:scale-95 transition-all"
              >
                {loading ? (
                  <ArrowPathIcon className="w-7 h-7 animate-spin" />
                ) : (
                  <>
                    <span className="font-bold text-xs uppercase tracking-[0.3em]">Establish Presence</span>
                    <ArrowRightIcon className="w-6 h-6" />
                  </>
                )}
              </button>
            </form>

            <div className="space-y-6">
               <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full font-bold uppercase tracking-widest text-slate-400">
                    Existing operative?
                  </span>
                </div>
              </div>

              <p className="text-center italic">
                <Link
                  to="/login"
                  className="text-civic-600 dark:text-civic-400 font-bold uppercase tracking-widest text-xs hover:text-civic-500 transition-colors inline-flex items-center gap-2 group"
                >
                  Authorize Access
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
