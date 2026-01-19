import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, ChevronLeft, AlertCircle, RefreshCcw, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { auth } from '../firebase';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, adminRecovery, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { track } = useAnalytics();
  
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    recoveryKey: '',
    newPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isRecoveryMode) {
        await adminRecovery(formData.email, formData.recoveryKey, formData.newPassword);
        setSuccess("Password reset successful. You can now login with your new credentials.");
        setIsRecoveryMode(false);
        track('admin_recovery_success', { email: formData.email });
      } else {
        // Authenticate using AuthContext
        const userProfile = await login(formData.email, formData.password);

        if (userProfile.role === 'admin') {
          track('admin_login_success', { email: formData.email });
          navigate('/admin');
        } else {
          setError("Unauthorized. This portal is for system administrators only.");
          track('admin_login_unauthorized_attempt', { email: formData.email });
        }
      }
    } catch (err: any) {
      setError(err.message || "Operation failed.");
      track(isRecoveryMode ? 'admin_recovery_failure' : 'admin_login_failure', { email: formData.email });
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
              {isRecoveryMode ? 'Admin Recovery' : 'Admin Control'}
            </h2>
            <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mt-2">
              {isRecoveryMode ? 'Reset Administrative Access' : 'Secure Authentication Portal'}
            </p>
          </div>

          <div className="p-10">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 flex gap-3 animate-in slide-in-from-top-2">
                <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                <p className="text-emerald-700 text-sm font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isRecoveryMode ? (
                /* LOGIN FORM */
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Admin ID / Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        required
                        placeholder="admin@samta.com" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all font-medium"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Password</label>
                      <button 
                        type="button" 
                        onClick={() => setIsRecoveryMode(true)}
                        className="text-[10px] font-black text-[#800000] uppercase hover:underline"
                      >
                        Forgot Access?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={authLoading}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
                  >
                    {authLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>Access Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              ) : (
                /* RECOVERY FORM */
                <div className="space-y-4">
                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Admin Email</label>
                    <input 
                      type="email" required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm focus:border-[#800000] outline-none"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Master Recovery Key</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" required
                        placeholder="SAMTA-ADMIN-..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none"
                        value={formData.recoveryKey}
                        onChange={e => setFormData({...formData, recoveryKey: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">New Secure Password</label>
                    <input 
                      type="password" required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm focus:border-[#800000] outline-none"
                      value={formData.newPassword}
                      onChange={e => setFormData({...formData, newPassword: e.target.value})}
                    />
                  </div>
                  
                  <button 
                    type="submit" disabled={authLoading}
                    className="w-full bg-[#800000] text-white py-4 rounded-2xl font-black shadow-xl hover:bg-[#600000] flex items-center justify-center gap-2"
                  >
                    {authLoading ? 'Verifying...' : <><RefreshCcw size={18} /> Reset Admin Access</>}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setIsRecoveryMode(false)}
                    className="w-full text-slate-400 text-xs font-bold py-2 hover:text-[#800000]"
                  >
                    Back to Login
                  </button>
                </div>
              )}
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