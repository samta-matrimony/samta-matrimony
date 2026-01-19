import React, { useState, useEffect, useCallback } from 'react';
import { User, Briefcase, Home as HomeIcon, Smile, Camera, CheckCircle2, ChevronRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { UserProfile } from '../types';

// Placeholder for AI bio generation - implement your own
const generateSmartBio = async (profileData: Partial<UserProfile>): Promise<string> => {
  // TODO: Implement actual Gemini AI integration
  return `${profileData.name || 'I'} believe in finding balance between tradition and modernity. Looking for someone who shares similar values and interests.`;
};

const MyProfile: React.FC = () => {
  const { user, updateUser, isLoading } = useAuth();
  const analytics = useAnalytics();

  const [formData, setFormData] = useState<Partial<UserProfile> | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'family' | 'lifestyle'>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data from user
  useEffect(() => {
    if (user && user.uid) {
      setFormData({ ...user });
    } else if (!isLoading && !user) {
      setError('User data not available');
    }
  }, [user, isLoading]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!formData) return;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  }, [formData]);

  const validateFormData = useCallback((): boolean => {
    if (!formData) {
      setError('Form data not loaded');
      return false;
    }

    if (!formData.name?.trim()) {
      setError('Name is required');
      return false;
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 18 || Number(formData.age) > 100)) {
      setError('Age must be between 18 and 100');
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }

    if (formData.bio && formData.bio.length > 500) {
      setError('Bio cannot exceed 500 characters');
      return false;
    }

    return true;
  }, [formData]);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);

    if (!validateFormData()) {
      return;
    }

    if (!formData) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      updateUser(formData);
      setSaveSuccess(true);
      analytics?.track?.('profile_update_success', { section: activeTab });

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save profile';
      setError(errorMsg);
      analytics?.track?.('profile_update_error', { section: activeTab, error: errorMsg });
      console.error('Profile save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [formData, validateFormData, updateUser, analytics, activeTab]);

  const handleSmartBio = useCallback(async () => {
    if (!formData) return;

    if (user?.role === 'admin') {
      setError('AI Smart Bio generation is not available for administrative accounts');
      return;
    }

    setIsGeneratingBio(true);
    setError(null);
    try {
      analytics?.track?.('ai_bio_generate_profile_edit');
      const bio = await generateSmartBio(formData);
      setFormData(prev => prev ? { ...prev, bio } : null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate bio';
      setError(errorMsg);
      console.error('Bio generation error:', err);
    } finally {
      setIsGeneratingBio(false);
    }
  }, [formData, user?.role, analytics]);

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-4 font-bold text-sm uppercase tracking-widest transition-all relative whitespace-nowrap ${
        activeTab === id ? 'text-[#800000]' : 'text-slate-400 hover:text-slate-600'
      }`}
      aria-selected={activeTab === id}
      role="tab"
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
      {activeTab === id && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#800000] rounded-full"></div>}
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-[#800000]" size={32} />
      </div>
    );
  }

  if (!user || !formData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <AlertCircle className="text-red-500 mr-2" size={24} />
        <p className="text-slate-600">Unable to load profile data</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-black text-[#800000]">Edit My Profile</h1>
          <p className="text-slate-500 mt-1">Keep your profile updated for better matching results</p>
        </div>

        {saveSuccess && (
          <div className="bg-green-50 text-green-600 px-6 py-3 rounded-2xl flex items-center gap-3 border border-green-100 animate-in slide-in-from-top-2">
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm">Changes saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl flex items-center gap-3 border border-red-100 animate-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        {/* Header/Photo Section */}
        <div className="p-8 md:p-12 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group cursor-pointer">
            <div className="w-40 h-40 rounded-[48px] overflow-hidden border-4 border-white shadow-2xl relative bg-slate-100">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <Camera className="text-slate-400" size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={32} />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-lg text-[#800000] border border-slate-50">
              <Camera size={20} />
            </div>
          </div>

          <div className="flex-grow space-y-4 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-black text-slate-800">{formData.name || 'Profile'}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Profile ID: SMP{formData.id || 'XXXX'}00
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-[#80000010] text-[#800000] rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 size={12} /> {formData.isVerified ? 'Verified' : 'Verification Pending'}
              </span>
              <span className="px-3 py-1 bg-yellow-400/10 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                {formData.subscription?.plan || 'Free'} Plan
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          className="flex border-b border-slate-50 overflow-x-auto whitespace-nowrap px-4 bg-white sticky top-0 z-10"
          role="tablist"
        >
          <TabButton id="personal" label="Personal" icon={User} />
          <TabButton id="professional" label="Professional" icon={Briefcase} />
          <TabButton id="family" label="Family" icon={HomeIcon} />
          <TabButton id="lifestyle" label="Lifestyle & Bio" icon={Smile} />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-8 md:p-12 space-y-10">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  disabled={isSaving}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all disabled:opacity-50"
                  aria-label="Full Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  disabled={isSaving}
                  min="18"
                  max="100"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all disabled:opacity-50"
                  aria-label="Age"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all disabled:opacity-50"
                  aria-label="City"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Height
                </label>
                <input
                  type="text"
                  name="height"
                  value={formData.height || ''}
                  onChange={handleChange}
                  disabled={isSaving}
                  placeholder="e.g. 5'7"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all disabled:opacity-50"
                  aria-label="Height"
                />
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education || ''}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all disabled:opacity-50"
                  aria-label="Education"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation || ''}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all disabled:opacity-50"
                  aria-label="Occupation"
                />
              </div>
            </div>
          )}

          {activeTab === 'family' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4">
              <div className="col-span-full space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Family Background
                </label>
                <textarea
                  name="familyBackground"
                  value={formData.familyBackground || ''}
                  onChange={handleChange}
                  disabled={isSaving}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all resize-none disabled:opacity-50"
                  aria-label="Family Background"
                />
              </div>
            </div>
          )}

          {activeTab === 'lifestyle' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="bg-[#80000005] border border-[#80000015] rounded-3xl p-8 relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-black text-[#800000] mb-1">Your Story</h3>
                    <p className="text-xs text-slate-500">Tell about yourself in 500 characters or less</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSmartBio}
                    disabled={isGeneratingBio || isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#800000] text-white rounded-xl text-xs font-black hover:bg-[#600000] disabled:opacity-50 transition-all"
                    aria-label="Generate smart bio with AI"
                  >
                    {isGeneratingBio ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        AI Assist
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleChange}
                  disabled={isSaving}
                  rows={6}
                  maxLength={500}
                  placeholder="Tell your story..."
                  className="w-full bg-white border border-slate-100 rounded-2xl p-6 text-sm outline-none focus:border-[#800000] transition-all resize-none shadow-sm italic text-slate-600 leading-relaxed disabled:opacity-50"
                  aria-label="Bio"
                />
                <div className="mt-2 text-xs text-slate-400">
                  {(formData.bio || '').length}/500 characters
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-grow bg-[#800000] text-white py-5 rounded-3xl font-black shadow-xl hover:bg-[#600000] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                const sections: (typeof activeTab)[] = ['personal', 'professional', 'family', 'lifestyle'];
                const next = sections[(sections.indexOf(activeTab) + 1) % sections.length];
                setActiveTab(next);
              }}
              className="bg-white border-2 border-slate-100 text-slate-600 px-8 py-5 rounded-3xl font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              Next Section <ChevronRight size={18} />
            </button>
          </div>
        </form>
      </div>

      <div className="mt-12 bg-slate-900 rounded-[40px] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
            <Sparkles size={12} fill="currentColor" /> Premium Feature
          </div>
          <h3 className="text-2xl font-serif font-black">Want to reach 3x more matches?</h3>
          <p className="text-white/60 max-w-sm">
            Upgrading your profile gives you priority in search results and specialized AI matching.
          </p>
        </div>
        <button className="bg-[#FFD700] text-[#800000] px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-white transition-all whitespace-nowrap">
          Upgrade Profile Now
        </button>
      </div>
    </div>
  );
};

export default MyProfile;
