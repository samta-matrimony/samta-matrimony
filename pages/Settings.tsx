
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Lock, 
  Bell, 
  Eye, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  Key, 
  Trash2,
  CheckCircle2,
  Save,
  ArrowRight,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../contexts/AnalyticsContext';

const Settings: React.FC = () => {
  const auth = useAuth();
  const { track } = useAnalytics();

  if (!auth?.user) {
    return <div className="flex items-center justify-center h-screen">Please log in to access settings</div>;
  }

  const { user, logout } = auth;
  
  const [activeTab, setActiveTab] = useState<'privacy' | 'notifications' | 'account'>('privacy');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal states
  const [modalType, setModalType] = useState<'password' | 'phone' | 'delete' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  
  // Modal form states
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [phoneInput, setPhoneInput] = useState(user?.mobileNumber || '');

  // Simulated global settings state
  const [settings, setSettings] = useState({
    contactVisibility: 'Matches Only',
    photoVisibility: 'All Members',
    emailNotifications: true,
    interestAlerts: true,
    messageAlerts: true,
    marketingEmails: false,
    profileHide: false
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    await new Promise(resolve => setTimeout(resolve, 800));
    if (track) track('settings_update_success', { section: activeTab });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      setActionError("New passwords do not match.");
      return;
    }
    if (passData.new.length < 8) {
      setActionError("Password must be at least 8 characters");
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      // For production, implement Firebase password change
      setActionError('Password change feature coming soon. Contact support@samta.com');
      if (track) track('password_change_attempt');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(phoneInput)) {
      setActionError("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      // For production, implement Firebase phone update
      setActionError('Phone update feature coming soon. Contact support@samta.com');
      if (track) track('phone_update_attempt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setActionLoading(true);
    try {
      // For production, implement Firebase account deletion
      await logout();
      if (track) track('account_deletion');
      window.location.href = '/';
    } catch (err: any) {
      setActionError("Failed to delete account. Please contact support.");
      setActionLoading(false);
    }
  };

  const SidebarItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
        activeTab === id ? 'bg-[#800000] text-white shadow-xl shadow-maroon-100' : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button 
      onClick={onToggle}
      className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${active ? 'bg-green-500' : 'bg-slate-200'}`}
    >
      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      {/* Modal Overlay */}
      {modalType && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !actionLoading && setModalType(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-serif font-black text-slate-800">
                   {modalType === 'password' && 'Change Password'}
                   {modalType === 'phone' && 'Update Phone Number'}
                   {modalType === 'delete' && 'Delete Account'}
                 </h3>
                 <button onClick={() => !actionLoading && setModalType(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                   <X size={20} />
                 </button>
              </div>

              {actionError && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs flex items-center gap-2">
                   <AlertTriangle size={14} /> {actionError}
                </div>
              )}

              {modalType === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Current Password</label>
                    <input 
                      type="password" required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000]"
                      value={passData.old} onChange={e => setPassData({...passData, old: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">New Password (Min 6 chars)</label>
                    <input 
                      type="password" required minLength={6}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000]"
                      value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Confirm New Password</label>
                    <input 
                      type="password" required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#800000]"
                      value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit" disabled={actionLoading}
                    className="w-full bg-[#800000] text-white py-4 rounded-2xl font-black shadow-lg hover:bg-[#600000] disabled:opacity-50"
                  >
                    {actionLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}

              {modalType === 'phone' && (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">New Mobile Number (+91)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</span>
                      <input 
                        type="tel" required maxLength={10}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-14 text-sm outline-none focus:border-[#800000]"
                        value={phoneInput} onChange={e => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="10 digit number"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" disabled={actionLoading}
                    className="w-full bg-[#800000] text-white py-4 rounded-2xl font-black shadow-lg hover:bg-[#600000] disabled:opacity-50"
                  >
                    {actionLoading ? 'Verifying...' : 'Save Number'}
                  </button>
                </form>
              )}

              {modalType === 'delete' && (
                <div className="space-y-6">
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-4 text-red-600">
                    <AlertTriangle size={32} className="shrink-0" />
                    <p className="text-sm font-medium">This action is permanent. All your profile data, messages, and matches will be permanently removed.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleDeleteAccount} disabled={actionLoading}
                      className="w-full bg-red-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Delete My Account'}
                    </button>
                    <button 
                      onClick={() => setModalType(null)} disabled={actionLoading}
                      className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-black text-[#800000]">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account preferences and security</p>
        </div>
        
        {saveSuccess && (
          <div className="bg-green-50 text-green-600 px-6 py-3 rounded-2xl flex items-center gap-3 border border-green-100 animate-in slide-in-from-top-2">
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm">Settings updated!</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-72 space-y-2 shrink-0">
          <SidebarItem id="privacy" label="Privacy Controls" icon={ShieldCheck} />
          <SidebarItem id="notifications" label="Notifications" icon={Bell} />
          <SidebarItem id="account" label="Account Security" icon={Lock} />
        </aside>

        <div className="flex-grow bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 md:p-12">
          
          {activeTab === 'privacy' && (
            <div className="space-y-10 animate-in slide-in-from-right-4">
               <div>
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Eye size={20} className="text-[#800000]" /> Profile Visibility
                  </h3>
                  <div className="space-y-6">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div>
                           <p className="font-bold text-slate-800">Contact Number Visibility</p>
                           <p className="text-xs text-slate-400 mt-1">Control who can see your verified mobile number.</p>
                        </div>
                        <select 
                          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:border-[#800000]"
                          value={settings.contactVisibility}
                          onChange={(e) => setSettings({...settings, contactVisibility: e.target.value})}
                        >
                           <option>Matches Only</option>
                           <option>Paid Members</option>
                           <option>All Members</option>
                           <option>Private</option>
                        </select>
                     </div>
                     <div className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div>
                           <p className="font-bold text-slate-800">Hide My Profile</p>
                           <p className="text-xs text-slate-400 mt-1">Temp hide your profile from search results.</p>
                        </div>
                        <Toggle active={settings.profileHide} onToggle={() => handleToggle('profileHide')} />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-10 animate-in slide-in-from-right-4">
               <div>
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Bell size={20} className="text-[#800000]" /> Alert Preferences
                  </h3>
                  <div className="space-y-4">
                     {[
                       { key: 'interestAlerts', label: 'New Interests', desc: 'Notify me when someone expresses interest.' },
                       { key: 'messageAlerts', label: 'Chat Messages', desc: 'Alert me for new private messages.' },
                       { key: 'emailNotifications', label: 'Email Summaries', desc: 'Receive weekly match highlights via email.' }
                     ].map((pref) => (
                       <div key={pref.key} className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-[#80000020] transition-all">
                          <div>
                             <p className="font-bold text-slate-800">{pref.label}</p>
                             <p className="text-xs text-slate-400 mt-1">{pref.desc}</p>
                          </div>
                          <Toggle active={(settings as any)[pref.key]} onToggle={() => handleToggle(pref.key as any)} />
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-10 animate-in slide-in-from-right-4">
               <div>
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Key size={20} className="text-[#800000]" /> Security & Access
                  </h3>
                  <div className="space-y-6">
                     <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-3">
                           <Mail className="text-slate-400" size={18} />
                           <p className="text-sm font-bold text-slate-700">{user?.email}</p>
                           <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-black uppercase">Verified</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-50">
                           <div className="flex items-center gap-3">
                             <Smartphone className="text-slate-400" size={18} />
                             <p className="text-sm font-bold text-slate-700">{user?.mobileNumber || 'Not set'}</p>
                           </div>
                           <button onClick={() => setModalType('phone')} className="text-[10px] text-[#800000] font-black uppercase tracking-widest hover:underline">Change</button>
                        </div>
                     </div>

                     <button 
                       onClick={() => setModalType('password')}
                       className="w-full flex justify-between items-center p-6 bg-white border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all group"
                     >
                        <div className="text-left">
                           <p className="font-bold text-slate-800">Change Password</p>
                           <p className="text-xs text-slate-400 mt-1">Protect your account with a strong password.</p>
                        </div>
                        <ArrowRight size={20} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                     </button>

                     <button 
                       onClick={() => setModalType('delete')}
                       className="w-full flex justify-between items-center p-6 bg-red-50/30 border border-red-100 rounded-3xl hover:bg-red-50 transition-all group"
                     >
                        <div className="text-left">
                           <p className="font-bold text-red-600">Delete Account</p>
                           <p className="text-xs text-red-400 mt-1">Permanently remove your profile and data.</p>
                        </div>
                        <Trash2 size={20} className="text-red-400 group-hover:scale-110 transition-transform" />
                     </button>
                  </div>
               </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-50">
             <button 
               onClick={handleSaveGeneral}
               disabled={isSaving}
               className="w-full sm:w-auto bg-[#800000] text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-maroon-100 hover:bg-[#600000] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
             >
                {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save size={20} /> Save General Preferences</>}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
