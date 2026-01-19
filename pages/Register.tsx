import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Heart, User, Sparkles, Mail, Lock, Phone, ArrowRight, ChevronLeft, Briefcase, MapPin, Globe, CheckSquare, Square, AlertCircle, Info, LogIn, Send, Loader2 } from 'lucide-react';
import { generateSmartBio } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../contexts/AnalyticsContext';

interface RegisterFormData {
  email: string;
  password: string;
  mobileNumber: string;
  profileFor: string;
  gender: 'Female' | 'Male' | 'Other';
  name: string;
  dob: string;
  religion: string;
  motherTongue: string;
  occupation: string;
  city: string;
  district: string;
  state: string;
  bio: string;
  declarationAccepted: boolean;
  declarationTimestamp: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { track } = useAnalytics();
  
  const [isLoginMode, setIsLoginMode] = useState(location.state?.mode === 'login');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    mobileNumber: '',
    profileFor: 'Self',
    gender: 'Female' as const,
    name: '',
    dob: '',
    religion: 'Hindu' as const,
    motherTongue: 'Hindi' as const,
    occupation: '',
    city: '',
    district: '',
    state: '',
    bio: '',
    declarationAccepted: false,
    declarationTimestamp: ''
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const shouldBeLogin = location.state?.mode === 'login';
    setIsLoginMode(shouldBeLogin);
    setIsResetMode(false);
    setResetSuccess(false);
    setStep(1);
    setError('');
    setErrorCode('');
    track(shouldBeLogin ? 'login_page_view' : 'registration_start');
  }, [location.state, track]);

  const validateStepOne = () => {
    if (!formData.email || !formData.password || !formData.name || !formData.mobileNumber) {
      setError("Please fill in all basic details");
      return false;
    }
    
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      setError("Please enter a valid 10-digit Indian mobile number starting with 6-9");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStepOne()) {
      return;
    }
    setError('');
    setStep(prev => prev + 1);
    track('registration_step_complete', { step });
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setIsResetMode(false);
    setResetSuccess(false);
    setStep(1);
    setError('');
    setErrorCode('');
    navigate('/register', { state: { mode: !isLoginMode ? 'login' : 'register' }, replace: true });
  };

  const handleRegistration = async () => {
    if (!formData.declarationAccepted) {
      setError("Please accept the declaration to continue.");
      return;
    }
    setIsVerifying(true);
    setError('');
    setErrorCode('');
    try {
      // For production, implement proper Firebase registration
      // For now, simulate registration and redirect to login
      setError("Registration feature coming soon. Please use login to continue.");
      setErrorCode('REGISTRATION_DISABLED');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode('');
    try {
      await login(formData.email, formData.password);
      track('login_success', { email: formData.email });
    } catch (err: any) {
      setError(err.message || 'Login failed');
      track('login_failure', { email: formData.email });
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Please enter your email address.");
      return;
    }
    setError('');
    // For production, implement Firebase password reset
    setError("Password reset feature coming soon. Contact support@samta.com");
  };

  const handleGenerateAIBio = async () => {
    setIsGeneratingBio(true);
    setError('');
    try {
      const generatedBio = await generateSmartBio({
        name: formData.name,
        gender: formData.gender as 'Female' | 'Male' | 'Other',
        religion: formData.religion as any, // Religion options from form validated in select
        occupation: formData.occupation,
        motherTongue: formData.motherTongue as any, // MotherTongue options from form validated in select
      });
      
      setFormData(prev => ({ ...prev, bio: generatedBio }));
      track('ai_bio_generated_registration');
    } catch (err) {
      setError("Failed to generate AI bio. Please try typing manually.");
    } finally {
      setIsGeneratingBio(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 animate-in fade-in duration-700">
      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px] border border-slate-100 relative">
        <div className="md:w-5/12 bg-[#800000] p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-50px] left-[-50px] w-80 h-80 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] border-8 border-white rounded-full"></div>
          </div>
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-10 group">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-[#FFD700]">
                <Heart fill="currentColor" size={24} />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight">Samta</span>
            </Link>
            <h2 className="text-4xl font-serif font-bold leading-tight mb-6">
              {isResetMode ? "Secure Your Account Access" : isLoginMode ? "Welcome Back to Your Journey" : "Find Your Soulmate Today"}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><ShieldCheck size={16} className="text-[#FFD700]" /></div>
                <span className="text-sm font-medium">100% Verified Profiles</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Lock size={16} className="text-[#FFD700]" /></div>
                <span className="text-sm font-medium">Enhanced Privacy Controls</span>
              </div>
            </div>
          </div>
          <div className="relative z-10 text-[10px] font-bold uppercase tracking-widest text-white/40">&copy; {new Date().getFullYear()} Samta Matrimony</div>
        </div>

        <div className="md:w-7/12 p-8 md:p-16 flex flex-col">
          <div className="flex justify-end mb-8">
            <button onClick={toggleMode} className="text-xs font-black uppercase tracking-widest text-[#800000] hover:underline">
              {isLoginMode ? "New to Samta? Register Here" : "Already have an account? Login"}
            </button>
          </div>
          <div className="flex-grow flex flex-col justify-center">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex flex-col gap-3 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} /> {error}
                </div>
                {errorCode === 'ACCOUNT_EXISTS' && (
                  <button 
                    onClick={toggleMode}
                    className="ml-7 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#800000] hover:underline"
                  >
                    <LogIn size={14} /> Log In Instead
                  </button>
                )}
              </div>
            )}

            {isResetMode ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <button 
                  onClick={() => setIsResetMode(false)}
                  className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-[#800000] mb-6"
                >
                  <ChevronLeft size={16} /> Back to Login
                </button>
                
                {resetSuccess ? (
                  <div className="space-y-6 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-inner">
                      <Send size={32} />
                    </div>
                    <h3 className="text-3xl font-serif font-black text-slate-800">Check Your Email</h3>
                    <p className="text-slate-500 leading-relaxed max-w-sm mx-auto">
                      Password reset link has been sent to your registered email. Please check your inbox and follow the instructions.
                    </p>
                    <button 
                      onClick={() => {
                        setIsResetMode(false);
                        setResetSuccess(false);
                      }}
                      className="w-full bg-[#800000] text-white py-4 rounded-2xl font-black shadow-xl hover:bg-[#600000] transition-all"
                    >
                      Return to Login
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-3xl font-serif font-black text-slate-800">Forgot Password?</h3>
                      <p className="text-slate-500 mt-2">Enter your registered email and we'll send you a link to reset your password.</p>
                    </div>
                    <form onSubmit={handleResetRequest} className="space-y-6">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="email" 
                          required 
                          placeholder="Email Address" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={authLoading} 
                        className="w-full bg-[#800000] text-white py-4 rounded-2xl font-black shadow-xl hover:bg-[#600000] transition-all flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>Send Reset Link <ArrowRight size={20} /></>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : isLoginMode ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-3xl font-serif font-black text-slate-800 mb-8">Login</h3>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="email" required placeholder="Email Address" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="password" required placeholder="Password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-xs font-black text-[#800000] uppercase tracking-widest hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" disabled={authLoading} className="w-full bg-[#800000] text-white py-4 rounded-2xl font-black shadow-xl shadow-maroon-100 hover:bg-[#600000] transition-all flex items-center justify-center gap-2">
                    {authLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <>Enter Dashboard <ArrowRight size={20} /></>}
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-3xl font-serif font-black text-slate-800">The First Step</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Full Name" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                      <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="email" placeholder="Email Address" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                      <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="password" placeholder="Password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400 border-r border-slate-200 pr-3 h-5"><Phone size={18} /><span className="text-xs font-bold">+91</span></div>
                        <input type="tel" maxLength={10} placeholder="Mobile Number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-24 pr-4 text-sm focus:border-[#800000] outline-none transition-all" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value.replace(/\D/g, '')})} />
                      </div>
                    </div>
                    <button onClick={handleNext} className="w-full bg-[#800000] text-white py-4 rounded-2xl font-black shadow-xl shadow-maroon-100 hover:bg-[#600000] transition-all flex items-center justify-center gap-2">
                      Continue Registration <ArrowRight size={20} />
                    </button>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-6">
                    <button onClick={handleBack} className="flex items-center gap-1 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-[#800000] mb-4"><ChevronLeft size={16} /> Back</button>
                    <h3 className="text-3xl font-serif font-black text-slate-800">Your Identity</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Profile For</label><select className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm outline-none focus:border-[#800000]" value={formData.profileFor} onChange={e => setFormData({...formData, profileFor: e.target.value})}><option>Self</option><option>Son</option><option>Daughter</option><option>Brother</option><option>Sister</option></select></div>
                      <div><div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Gender</label><select className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm outline-none focus:border-[#800000]" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as 'Female' | 'Male' | 'Other'})}><option>Female</option><option>Male</option><option>Other</option></select></div></div>
                      <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Religion</label><select className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm outline-none focus:border-[#800000]" value={formData.religion} onChange={e => setFormData({...formData, religion: e.target.value})}><option>Hindu</option><option>Muslim</option><option>Christian</option><option>Sikh</option></select></div>
                      <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mother Tongue</label><select className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm outline-none focus:border-[#800000]" value={formData.motherTongue} onChange={e => setFormData({...formData, motherTongue: e.target.value})}><option>Hindi</option><option>Marathi</option><option>Bengali</option><option>Tamil</option></select></div>
                      <div className="col-span-2 relative"><Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Occupation" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} /></div>
                    </div>
                    <button onClick={handleNext} className="w-full bg-[#800000] text-white py-4 rounded-2xl font-black shadow-xl shadow-maroon-100 hover:bg-[#600000] transition-all flex items-center justify-center gap-2">Continue <ArrowRight size={20} /></button>
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <button onClick={handleBack} className="flex items-center gap-1 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-[#800000] mb-4"><ChevronLeft size={16} /> Back</button>
                    <h3 className="text-3xl font-serif font-black text-slate-800">Your Bio</h3>
                    <div className="bg-[#80000005] border border-[#80000015] rounded-3xl p-6 space-y-4">
                      <textarea 
                        rows={6} 
                        placeholder="Tell us about your values, background, and what you seek in a life partner..." 
                        className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm focus:border-[#800000] outline-none transition-all resize-none shadow-sm" 
                        value={formData.bio} 
                        onChange={e => setFormData({...formData, bio: e.target.value})} 
                      />
                      
                      <button 
                        type="button"
                        onClick={handleGenerateAIBio}
                        disabled={isGeneratingBio}
                        className="flex items-center gap-2 text-xs font-black text-[#800000] uppercase tracking-widest hover:text-[#600000] transition-all disabled:opacity-50"
                      >
                        {isGeneratingBio ? (
                          <><Loader2 size={16} className="animate-spin" /> Generating your bio...</>
                        ) : (
                          <><Sparkles size={16} className="text-[#FFD700]" fill="currentColor" /> Generate AI Bio</>
                        )}
                      </button>

                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Note: You can further edit your bio manually after generation.
                      </p>
                    </div>
                    <button onClick={handleNext} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-2">Final Declaration <ArrowRight size={20} /></button>
                  </div>
                )}
                {step === 4 && (
                  <div className="space-y-6">
                    <button onClick={handleBack} className="flex items-center gap-1 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-[#800000] mb-4"><ChevronLeft size={16} /> Back</button>
                    <h3 className="text-3xl font-serif font-black text-slate-800">Declaration</h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 space-y-6">
                      <p className="text-sm text-slate-600 italic">I confirm that all information provided is true and I am eligible for matrimonial registration under Indian law.</p>
                      <button onClick={() => setFormData({...formData, declarationAccepted: !formData.declarationAccepted})} className="w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl">
                        <div className={`shrink-0 ${formData.declarationAccepted ? 'text-[#800000]' : 'text-slate-300'}`}>{formData.declarationAccepted ? <CheckSquare size={24} fill="currentColor" className="text-white" /> : <Square size={24} />}</div>
                        <div className="text-left"><p className="text-sm font-bold text-slate-800">I accept terms and declaration</p></div>
                      </button>
                    </div>
                    <button onClick={handleRegistration} disabled={isVerifying || !formData.declarationAccepted} className={`w-full py-5 rounded-3xl font-black shadow-2xl transition-all flex items-center justify-center gap-2 ${formData.declarationAccepted ? 'bg-[#800000] text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {isVerifying ? "Verifying..." : "Complete Registration"}
                    </button>
                  </div>
                )}
                
                <div className="mt-8 flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Info size={18} className="text-[#800000] shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Samta Matrimony helps you find your soulmate but does not guarantee a successful match or marriage. Users are solely responsible for verifying the authenticity and background of any profile they interact with.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;