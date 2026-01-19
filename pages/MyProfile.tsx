import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Home as HomeIcon, 
  Smile, 
  Camera, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { generateSmartBio } from '../services/geminiService';
import { Religion, MotherTongue, MaritalStatus, UserProfile } from '../types';

const MyProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { track } = useAnalytics();
  
  const [formData, setFormData] = useState<Partial<UserProfile>>(user || {});
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'family' | 'lifestyle'>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    updateUser(formData);
    setIsSaving(false);
    setSaveSuccess(true);
    track('profile_update_success', { section: activeTab });
    
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSmartBio = async () => {
    if (user?.role === 'admin') {
      alert("AI Smart Bio generation is disabled for administrative accounts.");
      return;
    }
    
    setIsGeneratingBio(true);
    track('ai_bio_generate_profile_edit');
    const bio = await generateSmartBio(formData);
    setFormData(prev => ({ ...prev, bio }));
    setIsGeneratingBio(false);
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-4 font-bold text-sm uppercase tracking-widest transition-all relative ${
        activeTab === id ? 'text-[#800000]' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
      {activeTab === id && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#800000] rounded-full"></div>}
    </button>
  );

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
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        {/* Header/Photo Section */}
        <div className="p-8 md:p-12 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group cursor-pointer">
            <div className="w-40 h-40 rounded-[48px] overflow-hidden border-4 border-white shadow-2xl relative">
              <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Profile" />
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
              <h2 className="text-3xl font-black text-slate-800">{formData.name}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Profile ID: SMP{formData.id}00</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
               <span className="px-3 py-1 bg-[#80000010] text-[#800000] rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                 <ShieldCheck size={12} /> {formData.isVerified ? 'Verified' : 'Verification Pending'}
               </span>
               <span className="px-3 py-1 bg-yellow-400/10 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                 {formData.subscription?.plan || 'Free'} Plan
               </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-50 overflow-x-auto whitespace-nowrap px-4 bg-white sticky top-0 z-10">
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" name="name" value={formData.name || ''} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Religion</label>
                <select name="religion" value={formData.religion || 'Hindu'} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all">
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Jain">Jain</option>
                  <option value="Parsi">Parsi</option>
                  <option value="Jewish">Jewish</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mother Tongue</label>
                <select name="motherTongue" value={formData.motherTongue || 'Hindi'} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all">
                  <option>Hindi</option>
                  <option>Bengali</option>
                  <option>Marathi</option>
                  <option>Telugu</option>
                  <option>Tamil</option>
                  <option>Punjabi</option>
                  <option>Urdu</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marital Status</label>
                <select name="maritalStatus" value={formData.maritalStatus || 'Never Married'} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all">
                  <option>Never Married</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                  <option>Awaiting Divorce</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                <input type="text" name="city" value={formData.city || ''} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">District</label>
                <input type="text" name="district" value={formData.district || ''} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                <input type="text" name="state" value={formData.state || ''} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Height</label>
                <input type="text" name="height" value={formData.height || ''} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all"
                  placeholder="e.g. 5'7"
                />
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Education</label>
                <input type="text" name="education" value={formData.education || ''} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">College/University</label>
                <input type="text" name="college" value={formData.college || ''} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Occupation</label>
                <input type="text" name="occupation" value={formData.occupation || ''} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Annual Income</label>
                <select name="income" value={formData.income || ''} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all">
                  <option>0-5 LPA</option>
                  <option>5-10 LPA</option>
                  <option>10-20 LPA</option>
                  <option>20-50 LPA</option>
                  <option>50 LPA+</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'family' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Family Type</label>
                <select name="familyType" value={formData.familyType || 'Nuclear'} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all">
                  <option>Nuclear</option>
                  <option>Joint</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Family Values</label>
                <select name="familyValues" value={formData.familyValues || 'Moderate'} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all">
                  <option>Traditional</option>
                  <option>Moderate</option>
                  <option>Liberal</option>
                </select>
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Family Details</label>
                <textarea 
                  name="familyBackground" value={formData.familyBackground || ''} onChange={handleChange}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000] transition-all resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'lifestyle' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="bg-[#80000005] border border-[#80000015] rounded-3xl p-8 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-slate-800 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#800000]" /> About Me
                  </h4>
                  {user?.role !== 'admin' ? (
                    <button 
                      type="button"
                      onClick={handleSmartBio}
                      disabled={isGeneratingBio}
                      className="text-[10px] font-black text-white bg-[#800000] px-4 py-2 rounded-full hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isGeneratingBio ? "Thinking..." : "Regenerate AI Bio"}
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">AI Tools Disabled for Admin</span>
                  )}
                </div>
                <textarea 
                  name="bio" value={formData.bio || ''} onChange={handleChange}
                  rows={6}
                  placeholder="Tell your story..."
                  className="w-full bg-white border border-slate-100 rounded-2xl p-6 text-sm outline-none focus:border-[#800000] transition-all resize-none shadow-sm italic text-slate-600 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <button 
              type="submit"
              disabled={isSaving}
              className="flex-grow bg-[#800000] text-white py-5 rounded-3xl font-black shadow-xl shadow-maroon-100 hover:bg-[#600000] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save size={20} /> Save All Changes</>}
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
            <p className="text-white/60 max-w-sm">Upgrading your profile gives you priority in search results and specialized AI matching.</p>
         </div>
         <button className="bg-[#FFD700] text-[#800000] px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-white transition-all">
            Upgrade Profile Now
         </button>
      </div>
    </div>
  );
};

export default MyProfile;