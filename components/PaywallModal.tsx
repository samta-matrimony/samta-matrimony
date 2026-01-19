
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, reason }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="bg-gradient-to-br from-[#800000] to-[#400000] p-10 text-white text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-10">
             <Sparkles size={120} />
           </div>
           
           <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/20">
              <Zap size={40} className="text-[#FFD700]" fill="#FFD700" />
           </div>
           
           <h3 className="text-3xl font-serif font-black mb-2">Upgrade to Premium</h3>
           <p className="text-white/70 text-sm font-medium">{reason}</p>
        </div>

        <div className="p-10 space-y-8">
           <div className="space-y-4">
              <div className="flex items-start gap-4">
                 <div className="w-6 h-6 bg-green-50 text-green-500 rounded-full flex items-center justify-center mt-0.5">
                   <CheckCircle2 size={16} />
                 </div>
                 <div>
                    <p className="font-bold text-slate-800 text-sm">Unlimited Interests & Chat</p>
                    <p className="text-xs text-slate-400">Connect with your matches without limits.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-6 h-6 bg-green-50 text-green-500 rounded-full flex items-center justify-center mt-0.5">
                   <CheckCircle2 size={16} />
                 </div>
                 <div>
                    <p className="font-bold text-slate-800 text-sm">View Contact Details</p>
                    <p className="text-xs text-slate-400">Unlock phone numbers and direct addresses.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-6 h-6 bg-green-50 text-green-500 rounded-full flex items-center justify-center mt-0.5">
                   <CheckCircle2 size={16} />
                 </div>
                 <div>
                    <p className="font-bold text-slate-800 text-sm">3x More Matches</p>
                    <p className="text-xs text-slate-400">Get featured at the top of search results.</p>
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  onClose();
                  navigate('/plans');
                }}
                className="w-full bg-[#800000] text-white py-4 rounded-2xl font-black shadow-xl shadow-maroon-100 hover:bg-[#600000] transition-all"
              >
                View Plans & Upgrade
              </button>
              <button 
                onClick={onClose}
                className="w-full text-slate-400 text-sm font-bold hover:text-slate-600 transition-all"
              >
                Maybe later
              </button>
           </div>
           
           <div className="flex items-center justify-center gap-2 pt-2 grayscale opacity-50">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safe & Secure Payments</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
