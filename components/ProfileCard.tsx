
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, ShieldCheck, Heart, User, Check, Clock, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useInteractions } from '../contexts/InteractionContext';

interface ProfileCardProps {
  profile: UserProfile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const { isAuthenticated, user } = useAuth();
  const { getInterestWithUser, sendInterest } = useInteractions();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);

  const interest = getInterestWithUser(profile.id);
  const isPending = interest?.status === 'pending';
  const isAccepted = interest?.status === 'accepted';
  const isSentByMe = interest?.senderId === user?.uid;

  const handleInterest = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (profile.isDemo) return; // Disable for demo profiles

    if (!isAuthenticated) {
      navigate('/register', { state: { mode: 'login' } });
      return;
    }

    if (interest) return;

    setIsSending(true);
    try {
      await sendInterest(profile.id);
    } catch (err) {
      console.error('Failed to send interest:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full shadow-sm relative">
      {/* Demo Profile Label */}
      {profile.isDemo && (
        <div className="absolute top-0 right-0 z-20 bg-[#800000] text-white text-[10px] font-black px-3 py-1.5 rounded-bl-xl flex items-center gap-1.5 shadow-lg">
          <AlertCircle size={12} />
          DEMO PROFILE
        </div>
      )}

      {/* Photo Section */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={profile.photoUrl} 
          alt={profile.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {profile.isPremium && !profile.isDemo && (
            <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded shadow-sm flex items-center gap-1">
              PREMIUM
            </span>
          )}
          {profile.isVerified && (
            <span className="bg-blue-600 text-white p-1 rounded-full shadow-lg w-fit">
              <ShieldCheck size={14} />
            </span>
          )}
        </div>

        {/* Essential Info on Image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-[10px] font-medium tracking-wide opacity-90 uppercase">{profile.lastActive}</span>
          </div>
          <h3 className="text-xl font-bold leading-tight flex items-center gap-2">
            {profile.name}, {profile.age}
          </h3>
          <div className="flex items-center gap-1 mt-1 opacity-90 text-sm">
            <MapPin size={14} className="text-yellow-400" />
            <span className="truncate">{profile.city}, {profile.district}, {profile.state}</span>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-5 flex-grow space-y-4">
        {/* Occupation */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            <Briefcase size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Profession</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{profile.occupation}</p>
          </div>
        </div>

        {/* Religion/Caste */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            <User size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Religion / Caste</p>
            <p className="text-sm font-semibold text-slate-700 truncate">
              {profile.religion}, {profile.caste}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 pb-5 pt-0 space-y-2">
        <Link 
          to={`/profile/${profile.id}`}
          className="block w-full text-center py-3 bg-[#800000] text-white rounded-xl font-bold hover:bg-[#600000] transition-colors text-sm shadow-md shadow-maroon-100/50"
        >
          {profile.isDemo ? 'Preview Details' : 'View Profile'}
        </Link>
        
        <button 
          onClick={handleInterest}
          disabled={profile.isDemo || isSending || (interest && (isSentByMe || isAccepted))}
          className={`w-full flex items-center justify-center gap-2 py-2.5 border-2 rounded-xl transition-all text-xs font-black uppercase tracking-tight ${
            profile.isDemo ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' :
            isAccepted ? 'bg-green-50 border-green-200 text-green-600' :
            interest ? 'bg-slate-50 border-slate-200 text-slate-400' :
            'border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
          }`}
        >
          {profile.isDemo ? (
            'Demo Profile Only'
          ) : isSending ? (
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          ) : isAccepted ? (
            <><Check size={16} /> Accepted</>
          ) : isPending ? (
            <><Clock size={16} /> {isSentByMe ? 'Interest Sent' : 'Pending Action'}</>
          ) : (
            <><Heart size={16} className="text-red-500 fill-red-500" /> Send Interest</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
