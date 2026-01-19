
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  MessageSquare, 
  ChevronLeft,
  Share2,
  Zap,
  Lock,
  CheckCircle2,
  Info,
  Users,
  Home as HomeIcon,
  Smile,
  Target,
  Clock,
  Check,
  AlertTriangle
} from 'lucide-react';
import { MOCK_PROFILES } from '../services/mockData';
import { getMatchmakingInsights } from '../services/geminiService';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useInteractions } from '../contexts/InteractionContext';
import AdSlot from '../components/AdSlot';

const ProfileView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user: loggedInUser } = useAuth();
  const { getInterestWithUser, sendInterest } = useInteractions();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string>('');
  const [isSendingInterest, setIsSendingInterest] = useState(false);

  useEffect(() => {
    const found = MOCK_PROFILES.find(p => p.id === id);
    if (found) {
      setProfile(found);
      setActivePhoto(found.photoUrl);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  const generateInsights = async () => {
    if (!profile || !loggedInUser || profile.isDemo) return;
    setLoadingInsights(true);
    const result = await getMatchmakingInsights(loggedInUser as UserProfile, profile);
    setInsights(result);
    setLoadingInsights(false);
  };

  const handleSendInterest = async () => {
    if (profile?.isDemo) return;
    if (!isAuthenticated) {
      navigate('/register', { state: { mode: 'login' } });
      return;
    }
    if (!profile) return;
    
    setIsSendingInterest(true);
    try {
      await sendInterest(profile.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSendingInterest(false);
    }
  };

  if (!profile) return null;

  const interest = getInterestWithUser(profile.id);
  const isPending = interest?.status === 'pending';
  const isAccepted = interest?.status === 'accepted';
  const isSentByMe = interest?.senderId === loggedInUser?.id;

  const DetailSection = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
    <div className="bg-white rounded-3xl shadow-sm border uborder-slate-100 p-8 space-y-6 overflow-hidden relative">
      <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#800000]">
          <Icon size={20} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
        {children}
      </div>
    </div>
  );

  const DetailItem = ({ label, value }: { label: string, value: string | undefined }) => (
    <div className="flex justify-between items-start text-sm group">
      <span className="text-slate-400 font-medium group-hover:text-slate-500 transition-colors">{label}</span>
      <span className="text-slate-800 font-bold text-right max-w-[60%]">{value || 'Not Specified'}</span>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-inter">
      {/* Demo Profile Alert Bar */}
      {profile.isDemo && (
        <div className="bg-[#800000] text-white py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold shadow-lg animate-in fade-in slide-in-from-top-4">
          <AlertTriangle size={18} />
          This is a Demo Profile for UI preview purposes. Messaging and interests are disabled.
        </div>
      )}

      {/* Sticky Quick View Bar (Mobile) */}
      <div className="md:hidden sticky top-16 z-40 bg-white border-b border-slate-100 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img src={profile.photoUrl} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
          <div>
            <p className="font-bold text-sm">{profile.name}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{profile.age} Yrs • {profile.city}</p>
          </div>
        </div>
        <button 
          onClick={handleSendInterest}
          disabled={profile.isDemo}
          className={`px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-all ${
            profile.isDemo ? 'bg-slate-100 text-slate-400' :
            isAccepted ? 'bg-green-50 text-white' : 
            interest ? 'bg-slate-200 text-slate-500' : 
            'bg-[#800000] text-white'
          }`}
        >
          {profile.isDemo ? 'Demo Mode' : isAccepted ? 'Accepted' : interest ? 'Sent' : 'Interest'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-[#800000] font-bold group transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-[#800000] transition-all">
              <ChevronLeft size={18} />
            </div>
            Back to Discovery
          </button>
          <div className="flex gap-3">
             <button className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-[#800000] transition-all">
               <Share2 size={18} />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Photos & Main Info */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Main Profile Header Section */}
            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row p-6 md:p-10 gap-10">
                
                {/* Photo Gallery Column */}
                <div className="w-full md:w-[320px] shrink-0 space-y-4">
                  <div className="aspect-[4/5] rounded-[32px] overflow-hidden relative shadow-2xl">
                    <img src={activePhoto} alt={profile.name} className="w-full h-full object-cover transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-6 left-6 flex items-center gap-2 text-white">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-xs font-bold uppercase tracking-widest">{profile.lastActive}</span>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {(profile.additionalPhotos?.length ?? 0) > 0 && (
                    <div className="flex gap-3 px-2">
                      <button 
                        onClick={() => setActivePhoto(profile.photoUrl)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activePhoto === profile.photoUrl ? 'border-[#800000] scale-105' : 'border-slate-100 opacity-60'}`}
                      >
                        <img src={profile.photoUrl} className="w-full h-full object-cover" alt="" />
                      </button>
                      {profile.additionalPhotos?.map((p, i) => (
                        <button 
                          key={i}
                          onClick={() => setActivePhoto(p)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activePhoto === p ? 'border-[#800000] scale-105' : 'border-slate-100 opacity-60'}`}
                        >
                          <img src={p} className="w-full h-full object-cover" alt="" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button 
                      onClick={handleSendInterest}
                      disabled={profile.isDemo || isSendingInterest || (interest && (isSentByMe || isAccepted))}
                      className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-xl ${
                        profile.isDemo ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                        isAccepted ? 'bg-green-50 text-white' : 
                        interest ? 'bg-slate-100 text-slate-400' : 
                        'bg-[#800000] text-white hover:bg-[#600000] shadow-maroon-100'
                      }`}
                    >
                      {profile.isDemo ? (
                        'Demo Mode'
                      ) : isSendingInterest ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : isAccepted ? (
                        <><Check size={20} /> Connected</>
                      ) : isPending ? (
                        <><Clock size={20} /> {isSentByMe ? 'Sent' : 'Pending'}</>
                      ) : (
                        <><Heart size={20} fill="currentColor" /> Interest</>
                      )}
                    </button>
                    
                    <button 
                      disabled={profile.isDemo || !isAccepted}
                      onClick={() => navigate(`/messages/${profile.id}`)}
                      className={`flex items-center justify-center gap-2 py-4 border-2 rounded-2xl font-bold transition-all ${
                        profile.isDemo ? 'border-slate-100 text-slate-200 cursor-not-allowed' :
                        isAccepted 
                          ? 'border-[#800000] text-[#800000] hover:bg-[#80000005]' 
                          : 'border-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <MessageSquare size={20} /> {isAccepted ? 'Chat' : 'Private'}
                    </button>
                  </div>
                </div>

                {/* Info Column */}
                <div className="flex-grow space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#800000] font-black text-xs uppercase tracking-widest">
                          {profile.isDemo ? 'DEMO PROFILE ID' : `Profile ID: SMP${profile.id}00`}
                        </span>
                        {profile.isVerified && <ShieldCheck size={16} className="text-blue-600" />}
                      </div>
                      <h1 className="text-4xl font-serif font-black text-slate-900 leading-tight">
                        {profile.name}
                      </h1>
                      <p className="text-slate-500 font-medium text-lg">{profile.age} Yrs • {profile.height} • {profile.city}, {profile.district}, {profile.state}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[32px]">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Profession</p>
                      <p className="font-bold text-slate-800 flex items-center gap-2 truncate">
                        <Briefcase size={14} className="text-[#800000]" /> {profile.occupation}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Education</p>
                      <p className="font-bold text-slate-800 flex items-center gap-2 truncate">
                        <GraduationCap size={14} className="text-[#800000]" /> {profile.education}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Religion & Caste</p>
                      <p className="font-bold text-slate-800 flex items-center gap-2 truncate">
                        <Users size={14} className="text-[#800000]" /> {profile.religion}, {profile.caste}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Marital Status</p>
                      <p className="font-bold text-slate-800 flex items-center gap-2 truncate">
                        <Smile size={14} className="text-[#800000]" /> {profile.maritalStatus}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-black text-slate-900 flex items-center gap-2 text-lg">
                      <div className="w-1.5 h-6 bg-[#800000] rounded-full"></div>
                      About {profile.name.split(' ')[0]}
                    </h3>
                    <div className="relative">
                      <p className="text-slate-600 leading-relaxed text-lg font-light italic bg-[#FFD70008] p-6 rounded-2xl border border-[#FFD70020]">
                        "{profile.bio}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Compatibility (Gemini) */}
            <div className="bg-gradient-to-br from-[#800000] via-[#500000] to-black rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:scale-125 transition-transform duration-1000">
                <Zap size={200} fill="white" />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 shrink-0 bg-white/10 backdrop-blur-2xl rounded-[32px] flex items-center justify-center border border-white/20 shadow-2xl">
                  <Zap size={40} className="text-[#FFD700] animate-pulse" fill="#FFD700" />
                </div>
                
                <div className="space-y-4 flex-grow text-center md:text-left">
                  <div>
                    <h3 className="text-2xl font-serif font-black">AI Match Insight</h3>
                    <p className="text-[#FFD700] text-xs font-black uppercase tracking-[0.2em]">Compatibility Analysis</p>
                  </div>

                  {profile.isDemo ? (
                    <div className="bg-white/5 backdrop-blur-3xl rounded-[32px] p-8 border border-white/10">
                      <p className="text-sm font-medium text-white/60">
                        Match Insights are disabled for Demo Profiles.
                      </p>
                    </div>
                  ) : !insights ? (
                    <button 
                      onClick={generateInsights}
                      disabled={loadingInsights}
                      className="bg-[#FFD700] text-[#800000] px-8 py-4 rounded-[20px] font-black hover:bg-white transition-all shadow-xl flex items-center gap-3 active:scale-95 disabled:opacity-50 mx-auto md:mx-0"
                    >
                      {loadingInsights ? 'Calculating...' : 'Generate Analysis'}
                    </button>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-3xl rounded-[32px] p-8 border border-white/10">
                      <p className="text-lg leading-relaxed font-light text-white/90 italic">
                        {insights}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DetailSection title="Personal & Professional" icon={Info}>
              <DetailItem label="Full Name" value={profile.name} />
              <DetailItem label="Mother Tongue" value={profile.motherTongue} />
              <DetailItem label="Education" value={profile.education} />
              <DetailItem label="Occupation" value={profile.occupation} />
            </DetailSection>

            <DetailSection title="Location Details" icon={MapPin}>
              <DetailItem label="City" value={profile.city} />
              <DetailItem label="District" value={profile.district} />
              <DetailItem label="State" value={profile.state} />
              <DetailItem label="Country" value={profile.country} />
            </DetailSection>

            <DetailSection title="Family Details" icon={HomeIcon}>
              <DetailItem label="Family Type" value={profile.familyType} />
              <DetailItem label="Family Status" value={profile.familyStatus} />
              <DetailItem label="Native Place" value={profile.city} />
              <div className="col-span-full pt-4 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Descriptive Details</p>
                <p className="text-sm text-slate-600 leading-relaxed italic">"{profile.familyBackground}"</p>
              </div>
            </DetailSection>

            <DetailSection title="Partner Preferences" icon={Target}>
              <DetailItem label="Age Range" value={profile.partnerPreferences?.ageRange} />
              <DetailItem label="Preferred Location" value={profile.partnerPreferences?.location} />
            </DetailSection>

          </div>

          {/* RIGHT SIDEBAR: Contact & Trust */}
          <div className="lg:col-span-4 space-y-8">
            
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 sticky top-24 space-y-8">
              <div className="space-y-4">
                <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Lock size={18} className="text-[#800000]" /> Contact Details
                </h4>
                
                <div className={`p-8 rounded-[32px] text-left space-y-4 border-2 border-dashed transition-all ${profile.isDemo ? 'bg-slate-50 border-slate-200' : 'bg-green-50 border-green-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${profile.isDemo ? 'bg-slate-200 text-slate-400' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center`}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Phone Number</p>
                      <p className="font-bold text-slate-800">{profile.isDemo ? 'Private (Demo)' : '+91 98765 43210'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Verification Status</h4>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                      <CheckCircle2 size={18} className={`text-blue-500`} /> Identity Verified
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                      <CheckCircle2 size={18} className={`text-blue-500`} /> Phone Verified
                    </div>
                 </div>
              </div>

              {/* Sidebar Vertical Ad Slot - Hidden for Demo Profiles */}
              {!profile.isDemo && (
                <AdSlot id="profile-sidebar-vertical" format="vertical" className="pt-4" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
