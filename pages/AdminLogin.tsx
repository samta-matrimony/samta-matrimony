import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, ChevronLeft, AlertCircle, RefreshCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../contexts/AnalyticsContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const analytics = useAnalytics();

  if (!auth) {
    return <div className="min-h-screen flex items-center justify-center">Error: Authentication service unavailable</div>;
  }

  const { login, isAuthenticated, user, isLoading: authLoading } = auth;
  const { track } = analytics || {};

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!formData.email?.trim() || !formData.password) {
      setError('Email and password are required');
      setIsSubmitting(false);
      return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const userProfile = await login(formData.email, formData.password);

      if (userProfile?.role === 'admin') {
        track?.('admin_login_success', { email: formData.email });
        navigate('/admin');
      } else {
        setError('Unauthorized. This portal is for administrators only.');
        track?.('admin_login_unauthorized', { email: formData.email });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      
      // Handle Firebase-specific errors
      let errorMsg = 'Login failed. Please try again.';
      
      if (err?.code === 'auth/user-not-found') {
        errorMsg = 'Admin account not found.';
      } else if (err?.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password.';
      } else if (err?.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email format.';
      } else if (err?.code === 'auth/user-disabled') {
        errorMsg = 'This account has been disabled.';
      } else if (err?.code === 'auth/too-many-requests') {
        errorMsg = 'Too many login attempts. Try again later.';
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      track?.('admin_login_failure', { email: formData.email, error: errorMsg });
      console.error('Admin login error:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#800000] rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 font-bold transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Return to Platform
        </Link>

        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white/10">
          <div className="bg-gradient-to-br from-[#800000] to-black p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={100} />
            </div>

            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/20">
              <ShieldCheck size={32} className="text-[#FFD700]" fill="currentColor" />
            </div>

            <h2 className="text-3xl font-serif font-black text-white">
              Admin Control
            </h2>
            <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mt-2">
              Secure Authentication Portal
            </p>
          </div>

          <div className="p-10">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="admin@samta.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all font-medium"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      disabled={isSubmitting || authLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      disabled={isSubmitting || authLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting || authLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Access Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 opacity-30 grayscale">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Security Grade</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;