import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  Heart,
  Star,
  ChevronDown,
  MapPin,
  Lock,
  Sparkles,
  UserCheck,
  ShieldAlert,
  Handshake
} from 'lucide-react';
import { BROWSE_CATEGORIES } from '../constants';
import { MOCK_PROFILES } from '../services/mockData';
import ProfileCard from '../components/ProfileCard';
import AdSlot from '../components/AdSlot';

const FAQ_DATA = [
  {
    question: "Why is samtamatrimony.com better compared to other matrimonial websites?",
    answer: "Samta Matrimony bridges the gap between traditional values and modern technology. Unlike other platforms, we use Gemini AI to provide deep compatibility insights while maintaining a strict manual verification process for every single profile to ensure quality over quantity."
  },
  {
    question: "Is samtamatrimony.com a trustworthy matchmaking platform?",
    answer: "Absolutely. Trust is the foundation of Samta Matrimony. We have a zero-tolerance policy for fake profiles. Our dedicated moderation team reviews every registration, and we provide 'Verified' badges only to those who complete our multi-step identity check."
  },
  {
    question: "How does profile verification work on Samta Matrimony?",
    answer: "Profile verification involves three layers: mobile OTP verification, email confirmation, and optional document verification (Govt ID). Once verified, your profile receives a Blue Shield badge, significantly increasing your trust score and match interest rate."
  },
  {
    question: "Is my personal data and privacy safe?",
    answer: "Your privacy is our highest priority. We offer granular privacy controls that allow you to decide who sees your photos, contact details, and professional information. All interactions are protected by industry-standard encryption."
  },
  {
    question: "Can I use the platform for free?",
    answer: "Yes! Samta Matrimony is designed to be accessible. Currently, we offer complete access to browsing profiles, sending interests, and communicating with matches at no cost to our registered members."
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState({
    gender: 'Female',
    ageFrom: '21',
    ageTo: '30',
    religion: 'Any'
  });

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?gender=${quickSearch.gender}&ageFrom=${quickSearch.ageFrom}&ageTo=${quickSearch.ageTo}&religion=${quickSearch.religion}`);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1920" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#800000e6] to-[#00000080]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30 text-sm font-medium">
              <ShieldCheck size={14} fill="#FFD700" className="text-[#FFD700]" />
              Safe & Secure Matrimony
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
              Begin Your Journey to <span className="text-[#FFD700]">Eternal</span> Togetherness
            </h1>
            <p className="text-lg md:text-xl opacity-90 font-light max-w-lg leading-relaxed">
              Find someone who truly understands your culture, values, and lifestyle preferences. Join a community built on trust and respect.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/register" className="bg-[#FFD700] text-[#800000] px-8 py-4 rounded-xl font-bold text-lg hover:bg-white transition-all shadow-xl">
                Register Free Today
              </Link>
              <div className="flex items-center -space-x-3">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-[#800000]" alt="" />
                ))}
                <span className="ml-6 text-sm font-semibold italic">Authentic profiles joining daily</span>
              </div>
            </div>
          </div>

          {/* Quick Search Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md mx-auto lg:ml-auto w-full">
            <h3 className="text-2xl font-bold text-[#800000] mb-6 flex items-center gap-2">
              <Search size={24} /> Quick Search
            </h3>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Looking for</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Female', 'Male'].map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`py-2.5 rounded-lg font-semibold transition-all ${quickSearch.gender === g ? 'bg-[#800000] text-white' : 'bg-slate-100 text-slate-600'}`}
                      onClick={() => setQuickSearch({...quickSearch, gender: g as any})}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Age From</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm" value={quickSearch.ageFrom} onChange={e => setQuickSearch({...quickSearch, ageFrom: e.target.value})}>
                    {[...Array(40)].map((_, i) => <option key={i+18} value={i+18}>{i+18}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Age To</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm" value={quickSearch.ageTo} onChange={e => setQuickSearch({...quickSearch, ageTo: e.target.value})}>
                    {[...Array(40)].map((_, i) => <option key={i+18} value={i+18}>{i+18}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Religion</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm" value={quickSearch.religion} onChange={e => setQuickSearch({...quickSearch, religion: e.target.value})}>
                  <option>Any</option>
                  <option>Hindu</option>
                  <option>Muslim</option>
                  <option>Christian</option>
                  <option>Sikh</option>
                  <option>Jain</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-[#800000] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#600000] transition-all flex items-center justify-center gap-2">
                Let's Begin <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Horizontal Ad Slot 1 */}
      <div className="max-w-7xl mx-auto px-4">
        <AdSlot id="home-top-horizontal" format="horizontal" />
      </div>

      {/* Browse Profiles Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#800000] mb-4">Browse Profiles By</h2>
            <div className="w-20 h-1.5 bg-[#FFD700] mx-auto rounded-full"></div>
            <p className="mt-6 text-slate-500 max-w-2xl mx-auto">
              Easily explore verified profiles through our curated categories tailored for your specific preferences.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {BROWSE_CATEGORIES.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/browse?type=${cat.param}`}
                className="group flex flex-col items-center p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl hover:border-[#800000] transition-all duration-300"
              >
                <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-[#800000] mb-4 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                  <Users size={24} />
                </div>
                <span className="text-sm font-bold text-slate-700 text-center">{cat.label}</span>
                <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Explore</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Profiles */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-[#800000]">Recently Joined</h2>
              <p className="text-slate-500 mt-2">Discover members who have recently started their partner search</p>
            </div>
            <Link to="/search" className="text-[#800000] font-bold flex items-center gap-1 hover:underline">
              View All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {MOCK_PROFILES.slice(0, 4).map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Column 1: Screened Profiles */}
            <div className="space-y-4 group">
              <div className="w-20 h-20 bg-[#80000010] text-[#800000] rounded-[24px] flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 duration-300 shadow-sm border border-[#80000005]">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-800">Quality Screened Profiles</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
                Every registration undergoes a screening process to maintain community standards and support authentic partner discovery.
              </p>
            </div>

            {/* Column 2: Personal Verification Options */}
            <div className="space-y-4 group">
              <div className="w-20 h-20 bg-[#FFD70010] text-[#B8860B] rounded-[24px] flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 duration-300 shadow-sm border border-[#FFD70005]">
                <MapPin size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-800">Identity Verification</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
                We offer premium verification features to enhance member credibility and foster a safer environment for all users.
              </p>
            </div>

            {/* Column 3: Control over Privacy */}
            <div className="space-y-4 group">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[24px] flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 duration-300 shadow-sm border border-emerald-50">
                <Lock size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-800">Member-Centric Privacy</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
                Take complete control of your visibility. Decide who can see your photos, contact details, and personal background.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Ad Slot 2 */}
      <div className="max-w-7xl mx-auto px-4">
        <AdSlot id="home-mid-horizontal" format="horizontal" />
      </div>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#800000] mb-4">Frequently Asked Questions</h2>
            <div className="w-20 h-1.5 bg-[#FFD700] mx-auto rounded-full"></div>
            <p className="mt-6 text-slate-500">Essential information for your partner search on Samta Matrimony</p>
          </div>

          <div className="space-y-4">
            {FAQ_DATA.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm transition-all duration-300"
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center group"
                >
                  <span className={`font-bold text-base md:text-lg transition-colors ${expandedFaq === index ? 'text-[#800000]' : 'text-slate-700'}`}>
                    {faq.question}
                  </span>
                  <div className={`shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedFaq === index ? 'bg-[#800000] text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${expandedFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="px-6 pb-6 text-slate-500 text-sm md:text-base leading-relaxed border-t border-slate-50 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Commitment Section (Replaced Numerical Stats) */}
      <section className="bg-[#800000] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-white text-center">
            <div className="space-y-3">
              <UserCheck className="mx-auto mb-4 text-[#FFD700]" size={36} />
              <h4 className="text-xl font-bold">Profile Authenticity</h4>
              <p className="text-xs opacity-70 leading-relaxed font-medium">
                Active moderation and screening to ensure memberships align with matrimonial intent.
              </p>
            </div>
            <div className="space-y-3">
              <ShieldAlert className="mx-auto mb-4 text-[#FFD700]" size={36} />
              <h4 className="text-xl font-bold">Safe Facilitation</h4>
              <p className="text-xs opacity-70 leading-relaxed font-medium">
                A neutral platform providing tools for secure discovery while respecting member autonomy.
              </p>
            </div>
            <div className="space-y-3">
              <Lock className="mx-auto mb-4 text-[#FFD700]" size={36} />
              <h4 className="text-xl font-bold">Privacy First</h4>
              <p className="text-xs opacity-70 leading-relaxed font-medium">
                Comprehensive controls over data sharing, keeping you in charge of your personal journey.
              </p>
            </div>
            <div className="space-y-3">
              <Handshake className="mx-auto mb-4 text-[#FFD700]" size={36} />
              <h4 className="text-xl font-bold">Honest Approach</h4>
              <p className="text-xs opacity-70 leading-relaxed font-medium">
                Built on transparency and respect, helping modern individuals find traditional balance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;