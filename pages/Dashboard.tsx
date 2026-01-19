import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInteractions } from '../contexts/InteractionContext';
import { useMatchmaking } from '../contexts/MatchmakingContext';
import { MOCK_PROFILES } from '../services/mockData';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Check, 
  X, 
  MessageSquare, 
  Clock, 
  MapPin, 
  User, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ChevronRight, 
  Bell,
  Star,
  RefreshCcw,
  Target,
  ArrowRight,
  Camera,
  Info
} from 'lucide-react';
import MetaSEO from '../components/MetaSEO';
import TourTooltip from '../components/TourTooltip';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { interests, updateInterestStatus } = useInteractions();
  const { recommendations, notifications, isLoading: isRecLoading, refreshRecommendations, markNotificationAsRead } = useMatchmaking();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'matches'>('received');
  const [showNotifications, setShowNotifications] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('samta_tour_seen');
    if (!hasSeenTour) {
      setTimeout(() => setTourStep(1), 1500);
    }
  }, [location]);

  const endTour = () => {
    setTourStep(null);
    localStorage.setItem('samta_tour_seen', 'true');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const receivedInterests = interests.filter(i => i.receiverId === user?.id && i.status === 'pending');
  const sentInterests = interests.filter(i => i.senderId === user?.id);
  const matchedInterests = interests.filter(i => 
    (i.senderId === user?.id || i.receiverId === user?.id) && i.status === 'accepted'
  );

  const getProfile = (id: string) => MOCK_PROFILES.find(p => p.id === id);

  const handleAction = async (id: string, status: 'accepted' | 'rejected') => {
    await updateInterestStatus(id, status);
  };

  const profileCompletion = () => {
    let score = 0;
    if (user?.photoUrl) score += 25;
    if (user?.bio) score += 25;
    if (user?.education) score += 25;
    if (user?.partnerPreferences) score += 25;
    return score;
  };

  const OnboardingFlow = () => {
    const score = profileCompletion();
    if (score === 100) return null;

    return (
      <div className="mb-12 bg-white rounded-[40px] p-8 md:p-10 border border-[#80000020] shadow-xl shadow-maroon-100/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-125 duration-1000">
            <Sparkles size={120} className="text-[#800000]" />
         </div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative shrink-0">
               <svg className="w-32 h-32 transform -rotate-90">
                 <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                 <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                   strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * score) / 100}
                   className="text-[#800000] transition-all duration-1000 ease-out" />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-[#800000]">{score}%</span>
               </div>
            </div>
            
            <div className="flex-grow space-y-4">
               <div>
                 <h3 className="text-2xl font-serif font-black text-slate-800">Complete Your Journey</h3>
                 <p className="text-slate-500">Profiles with 100% completion get <span className="font-bold text-[#800000]">5x more visibility</span>.</p>
               </div>
               
               <div className="flex flex-wrap gap-3">
                  {!user?.photoUrl && <Link to="/my-profile" className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-[#80000010] transition-colors"><Camera size={14} /> Add Photos</Link>}
                  {!user?.bio && <Link to="/my-profile" className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-[#80000010] transition-colors"><Info size={14} /> Write Bio</Link>}
                  <Link to="/my-profile" className="px-4 py-2 bg-[#800000] rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-maroon-100 transition-transform active:scale-95">Complete Setup <ArrowRight size={14} /></Link>
               </div>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500 relative">
      <MetaSEO title={`My Dashboard | Samta Matrimony`} />
      
      {/* Guided Tour Tooltips */}
      {tourStep === 1 && (
        <TourTooltip 
          step={1} totalSteps={3} title="Smart AI Matchmaking" 
          content="Our Gemini AI analyzes thousands of data points to find your highly compatible soulmate." 
          onNext={() => setTourStep(2)} onClose={endTour}
          positionClass="top-[450px] left-[20%]"
        />
      )}
      {tourStep === 2 && (
        <TourTooltip 
          step={2} totalSteps={3} title="Priority Interests" 
          content="Send interests to start a conversation. Once they accept, you can chat privately." 
          onNext={() => setTourStep(3)} onClose={endTour}
          positionClass="top-[850px] left-[30%]"
        />
      )}
      {tourStep === 3 && (
        <TourTooltip 
          step={3} totalSteps={3} title="Profile Access" 
          content="Enjoy full access to verified contact details and unlimited messaging." 
          onNext={endTour} onClose={endTour}
          positionClass="top-[450px] right-[5%]"
        />
      )}

      {/* Header with Notifications */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-[#800000] text-white rounded-[32px] flex items-center justify-center font-serif text-3xl font-black shadow-xl">
              {user?.name?.[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg border border-slate-100">
               <User size={14} className="text-slate-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-serif font-black text-[#800000]">Namaste, {user?.name}</h1>
            </div>
            <p className="text-slate-500 font-medium">Verified Member since {user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'joining'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#800000] transition-all relative"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-slate-50">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute top-full right-0 mt-4 w-80 bg-white shadow-2xl rounded-3xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="font-black text-xs uppercase tracking-widest text-slate-500">Notifications</h4>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-[#80000003]' : ''}`}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.link) navigate(n.link);
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-bold text-slate-800">{n.title}</p>
                          <span className="text-[9px] text-slate-400 font-medium">Just now</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-slate-400 text-xs">No notifications yet</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <Link to="/search" className="flex-grow md:flex-none bg-[#800000] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-maroon-100 hover:bg-[#600000] transition-all flex items-center justify-center gap-2">
            Find Matches <ChevronRight size={20} />
          </Link>
        </div>
      </div>

      <OnboardingFlow />

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-grow w-full lg:w-2/3 space-y-12">
          
          <section className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Target size={120} />
            </div>
            
            <div className="flex justify-between items-end mb-8 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-[#80000010] text-[#800000] rounded-full text-[10px] font-black uppercase tracking-widest">Powered by AI</span>
                  <Sparkles size={14} className="text-[#800000]" />
                </div>
                <h2 className="text-3xl font-serif font-black text-slate-800">Best Matches for You</h2>
                <p className="text-slate-400 text-sm mt-1">AI-analyzed compatibility based on your behavior and preferences</p>
              </div>
              <button 
                onClick={refreshRecommendations}
                disabled={isRecLoading}
                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-[#80000010] hover:text-[#800000] transition-all disabled:opacity-50"
              >
                <RefreshCcw size={20} className={isRecLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {isRecLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                 <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-xs font-black text-[#800000] uppercase tracking-widest">Recalculating Match Scores...</p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {recommendations.map(rec => {
                  const profile = getProfile(rec.profileId);
                  if (!profile) return null;
                  return (
                    <div key={rec.profileId} className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 group hover:bg-white hover:shadow-xl hover:border-[#80000030] transition-all duration-500">
                      <div className="flex gap-4 items-start mb-6">
                        <div className="relative shrink-0">
                          <img src={profile.photoUrl} className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white" alt="" />
                          <div className="absolute -top-2 -right-2 bg-white px-2 py-1 rounded-lg shadow-md border border-slate-50">
                             <div className="flex items-center gap-1">
                               <span className="text-xs font-black text-[#800000]">{rec.score}%</span>
                             </div>
                          </div>
                        </div>
                        <div className="flex-grow pt-1">
                          <h4 className="font-black text-slate-800 text-lg group-hover:text-[#800000] transition-colors">{profile.name}</h4>
                          <p className="text-xs text-slate-500">{profile.age} Yrs • {profile.city}</p>
                          <div className="mt-2 flex items-center gap-2">
                             <div className="flex-grow bg-slate-200 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-[#800000] h-full" style={{ width: `${rec.score}%` }}></div>
                             </div>
                          </div>
                        </div>
                      </div>
                      
                      {rec.reason && (
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-6 italic line-clamp-2">
                          "{rec.reason}"
                        </p>
                      )}

                      <div className="flex gap-3">
                        <Link to={`/profile/${profile.id}`} className="flex-grow bg-white text-slate-800 text-center py-3 rounded-xl font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-all">
                           View Profile
                        </Link>
                        <button 
                          onClick={() => navigate(`/profile/${profile.id}`)}
                          className="w-12 h-12 bg-[#800000] text-white rounded-xl flex items-center justify-center shadow-lg shadow-maroon-100 hover:bg-[#600000] transition-all"
                        >
                          <Heart size={20} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                 <Target size={48} className="text-slate-100 mx-auto" />
                 <p className="text-slate-400 font-medium italic">No matches found. Try updating your partner preferences.</p>
              </div>
            )}
          </section>

          <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-slate-100">
            <div className="flex gap-4 border-b border-slate-200 mb-8 overflow-x-auto whitespace-nowrap pb-2">
              <button 
                onClick={() => setActiveTab('received')}
                className={`pb-4 px-6 font-black text-sm uppercase tracking-widest transition-all relative ${activeTab === 'received' ? 'text-[#800000]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Interests Received {receivedInterests.length > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{receivedInterests.length}</span>}
                {activeTab === 'received' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#800000] rounded-full"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('sent')}
                className={`pb-4 px-6 font-black text-sm uppercase tracking-widest transition-all relative ${activeTab === 'sent' ? 'text-[#800000]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Interests Sent
                {activeTab === 'sent' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#800000] rounded-full"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('matches')}
                className={`pb-4 px-6 font-black text-sm uppercase tracking-widest transition-all relative ${activeTab === 'matches' ? 'text-[#800000]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                My Connections
                {activeTab === 'matches' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#800000] rounded-full"></div>}
              </button>
            </div>

            <div className="space-y-6">
              {activeTab === 'received' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {receivedInterests.length > 0 ? (
                    receivedInterests.map(interest => {
                      const profile = getProfile(interest.senderId);
                      if (!profile) return null;
                      return (
                        <div key={interest.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-6 group hover:shadow-xl transition-all">
                          <div className="flex items-center gap-4">
                             <img src={profile.photoUrl} className="w-16 h-16 rounded-2xl object-cover shadow-md" alt="" />
                             <div>
                               <h3 className="font-bold text-slate-800 text-lg">{profile.name}</h3>
                               <p className="text-xs text-slate-500">{profile.age} Yrs • {profile.city}</p>
                             </div>
                          </div>
                          <div className="flex gap-3">
                             <button 
                               onClick={() => handleAction(interest.id, 'accepted')}
                               className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-100 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                             >
                               <Check size={18} /> Accept
                             </button>
                             <button 
                               onClick={() => handleAction(interest.id, 'rejected')}
                               className="flex-1 bg-white text-slate-600 py-3 rounded-xl font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                             >
                               <X size={18} /> Decline
                             </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-16 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                        <Heart size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700">No new interests</h3>
                      <p className="text-slate-400 text-xs mt-1">Interests you receive will appear here.</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'sent' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sentInterests.length > 0 ? (
                    sentInterests.map(interest => {
                      const profile = getProfile(interest.receiverId);
                      if (!profile) return null;
                      return (
                        <div key={interest.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-6">
                          <div className="flex items-center gap-4">
                             <img src={profile.photoUrl} className="w-16 h-16 rounded-2xl object-cover shadow-md" alt="" />
                             <div className="flex-grow">
                               <div className="flex justify-between items-start">
                                 <h3 className="font-bold text-slate-800">{profile.name}</h3>
                                 <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                   interest.status === 'accepted' ? 'bg-green-100 text-green-600' :
                                   interest.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                   'bg-yellow-100 text-yellow-600'
                                 }`}>
                                   {interest.status}
                                 </span>
                               </div>
                               <p className="text-xs text-slate-500 mt-1">{profile.occupation}</p>
                             </div>
                          </div>
                          <Link to={`/profile/${profile.id}`} className="block w-full text-center py-3 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold text-sm">
                             View Profile
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-16 text-center text-slate-400 text-sm italic">You haven't sent any interests yet.</div>
                  )}
                </div>
              )}

              {activeTab === 'matches' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {matchedInterests.length > 0 ? (
                     matchedInterests.map(interest => {
                       const partnerId = interest.senderId === user?.id ? interest.receiverId : interest.senderId;
                       const profile = getProfile(partnerId);
                       if (!profile) return null;
                       return (
                          <div key={interest.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-6 group hover:shadow-xl transition-all">
                            <div className="flex items-center gap-4">
                               <img src={profile.photoUrl} className="w-16 h-16 rounded-2xl object-cover shadow-md" alt="" />
                               <div className="flex-grow">
                                 <h3 className="font-bold text-slate-800">{profile.name}</h3>
                                 <p className="text-xs text-slate-500">{profile.occupation}</p>
                               </div>
                            </div>
                            <button 
                              onClick={() => navigate(`/messages/${profile.id}`)}
                              className="w-full bg-[#800000] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-maroon-100 hover:bg-[#600000] transition-all flex items-center justify-center gap-2"
                            >
                              <MessageSquare size={18} /> Start Chatting
                            </button>
                          </div>
                       );
                     })
                   ) : (
                     <div className="col-span-full py-16 text-center text-slate-400 text-sm">No connections yet. Start sending interests!</div>
                   )}
                 </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3 shrink-0 space-y-8 lg:sticky lg:top-24">
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 rounded-[40px] p-8 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                <Target size={140} />
             </div>
             
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                     <Star size={20} className="text-[#FFD700]" fill="#FFD700" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black">Daily Suggestion</h4>
                    <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">Selected for your behavior</p>
                  </div>
               </div>

               {MOCK_PROFILES.find(p => p.id === '3') && (
                 <div className="space-y-6">
                    <div className="flex gap-4 items-center">
                       <img src={MOCK_PROFILES.find(p => p.id === '3')?.photoUrl} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-2xl" alt="" />
                       <div>
                          <p className="font-bold text-lg">{MOCK_PROFILES.find(p => p.id === '3')?.name}</p>
                          <p className="text-xs text-white/60">{MOCK_PROFILES.find(p => p.id === '3')?.occupation}</p>
                       </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                       <p className="text-xs italic text-white/80 leading-relaxed">
                         "We noticed you frequently look for Data Scientists. Priya might be your perfect match!"
                       </p>
                    </div>
                    <Link to="/profile/3" className="block w-full bg-white text-indigo-900 text-center py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/50 hover:bg-[#FFD700] hover:text-[#800000] transition-all">
                       Check Profile
                    </Link>
                 </div>
               )}
             </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-8">
             <div>
                <h4 className="text-xl font-black text-slate-800 mb-2">Safe Journey</h4>
                <p className="text-sm text-slate-500 mb-6 font-light">Your information is never shared without your explicit permission.</p>
                <button className="w-full text-xs font-black uppercase tracking-widest bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl hover:bg-slate-100 transition-all">Verify My Identity</button>
             </div>

             <div className="pt-8 border-t border-slate-50">
                <Link to="/search" className="flex items-center justify-between text-sm font-bold text-slate-700 group">
                   Browse Similar Profiles <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                <ShieldCheck size={140} />
             </div>
             <p className="text-xl font-serif font-black mb-2">Member Support</p>
             <p className="text-sm text-white/70 mb-6 font-light">Need help finding the right match? Our experts are here to assist you.</p>
             <Link to="/contact" className="inline-block text-xs font-black uppercase tracking-widest bg-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition-all">Contact Us</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;