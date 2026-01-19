
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CreditCard, 
  Lock,
  Star,
  Crown,
  CheckCircle2,
  XCircle,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { PlanType } from '../types';

const PLANS = [
  {
    type: 'Free' as PlanType,
    price: '₹0',
    numericPrice: 0,
    duration: 'Forever',
    months: 0,
    features: [
      'Create Basic Profile',
      'Send up to 2 Interests',
      'Browse All Profiles',
      'Standard Matchmaking',
      'Limited Photo Views'
    ],
    notIncluded: [
      'View Contact Details',
      'Unlimited Chatting',
      'Priority Support'
    ],
    color: 'from-slate-50 to-slate-100',
    btnColor: 'bg-slate-500',
    icon: <User className="text-slate-500" size={28} />
  },
  {
    type: 'Silver' as PlanType,
    price: '₹149',
    numericPrice: 149,
    duration: '1 Month',
    months: 1,
    features: [
      'Send up to 10 Interests',
      'View Full Profile Details',
      'Enable Chat with Matches',
      'See Who Viewed You',
      'Standard Support'
    ],
    color: 'from-slate-100 to-slate-200',
    btnColor: 'bg-slate-800',
    icon: <ShieldCheck className="text-slate-600" size={28} />
  },
  {
    type: 'Gold' as PlanType,
    price: '₹399',
    numericPrice: 399,
    duration: '3 Months',
    months: 3,
    popular: true,
    features: [
      'Unlimited Interests',
      'Unlimited Chatting',
      'Priority Profile Visibility',
      'Advanced Search Filters',
      'Premium Profile Badge'
    ],
    color: 'from-yellow-400/20 to-yellow-600/20',
    btnColor: 'bg-yellow-600',
    icon: <Zap className="text-yellow-600" size={28} />
  },
  {
    type: 'Platinum' as PlanType,
    price: '₹699',
    numericPrice: 699,
    duration: '6 Months',
    months: 6,
    features: [
      'Everything in Gold',
      'Weekly Profile Boost',
      'Early Access to New Profiles',
      'Platinum Concierge Support',
      'Exclusive VIP Badge'
    ],
    color: 'from-purple-100 to-indigo-100',
    btnColor: 'bg-indigo-600',
    icon: <Crown className="text-indigo-600" size={28} />
  }
];

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const { upgradePlan, isAuthenticated, user } = useAuth();
  const { track } = useAnalytics();
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[2] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleSelect = (plan: typeof PLANS[0]) => {
    if (plan.type === 'Free') {
      if (!isAuthenticated) navigate('/register');
      else navigate('/dashboard');
      return;
    }

    track('plan_selection', { plan: plan.type, price: plan.numericPrice });
    if (!isAuthenticated) {
      navigate('/register', { state: { mode: 'login', from: { pathname: '/plans' } } });
      return;
    }
    
    setSelectedPlan(plan);
    setShowCheckout(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    track('payment_start', { plan: plan.type });
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    try {
      await upgradePlan(selectedPlan.type, selectedPlan.months);
      track('payment_success', { 
        plan: selectedPlan.type, 
        amount: selectedPlan.numericPrice,
        duration: selectedPlan.duration
      });
      navigate('/dashboard', { state: { upgradeSuccess: true } });
    } catch (err) {
      track('payment_failure', { plan: selectedPlan.type, error: 'Simulated payment failure' });
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-in fade-in duration-500">
      
      {!showCheckout ? (
        <>
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-5xl font-serif font-black text-[#800000]">Pricing & Plans</h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Unlock premium features and find your life partner faster with our specialized plans designed for your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-20">
            {PLANS.map((plan) => (
              <div 
                key={plan.type}
                className={`relative bg-white rounded-[48px] p-8 shadow-xl border-2 transition-all hover:scale-105 flex flex-col ${plan.popular ? 'border-yellow-400' : 'border-slate-50'} ${user?.subscription?.plan === plan.type ? 'ring-4 ring-[#80000030]' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                
                {user?.subscription?.plan === plan.type && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#800000] text-white px-6 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                    Current Plan
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                   {plan.icon}
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-800">{plan.type}</h3>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{plan.duration}</p>
                </div>

                <div className="mb-6">
                   <p className="text-4xl font-black text-[#800000]">{plan.price}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                         <Check size={12} className="text-green-500" />
                      </div>
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded?.map(f => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                         <XCircle size={12} className="text-slate-300" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleSelect(plan)}
                  disabled={user?.subscription?.plan === plan.type}
                  className={`w-full py-4 rounded-3xl font-black text-white transition-all shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-50 ${plan.btnColor}`}
                >
                  {plan.type === 'Free' ? (isAuthenticated ? 'Current Plan' : 'Get Started') : `Select ${plan.type}`}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-[40px] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="space-y-4 text-center md:text-left">
                <h3 className="text-2xl font-serif font-black">Trusted by Over 5 Million Members</h3>
                <p className="text-white/60 max-w-lg">Your safety and privacy are our top priorities. All payments are encrypted and processed securely.</p>
             </div>
             <div className="flex gap-4">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                   <ShieldCheck size={24} className="text-[#FFD700]" />
                   <span className="text-xs font-bold">100% Secure</span>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                   <Lock size={24} className="text-[#FFD700]" />
                   <span className="text-xs font-bold">Encrypted</span>
                </div>
             </div>
          </div>
        </>
      ) : (
        /* CHECKOUT SECTION */
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
           <div className="flex justify-between items-center mb-8">
              <button 
                onClick={() => setShowCheckout(false)}
                className="text-slate-400 font-bold flex items-center gap-2 hover:text-[#800000]"
              >
                <ArrowRight className="rotate-180" size={20} /> Change Selection
              </button>
              <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 Payment Gateway: Live Secure
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                 <h2 className="text-3xl font-serif font-black text-slate-800">Order Summary</h2>
                 <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-50">
                       <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedPlan?.color} flex items-center justify-center`}>
                          {selectedPlan?.icon}
                       </div>
                       <div>
                          <p className="font-black text-lg text-slate-800">{selectedPlan?.type} Membership</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedPlan?.duration}</p>
                       </div>
                    </div>
                    <div className="space-y-4 mb-8">
                       <div className="flex justify-between text-slate-600 font-medium">
                          <span>Base Price</span>
                          <span>{selectedPlan?.price}</span>
                       </div>
                       <div className="flex justify-between text-slate-600 font-medium">
                          <span>GST (18%)</span>
                          <span>Included</span>
                       </div>
                       <div className="pt-4 border-t border-slate-50 flex justify-between">
                          <span className="text-xl font-black text-slate-800">Total Due</span>
                          <span className="text-xl font-black text-[#800000]">{selectedPlan?.price}</span>
                       </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center gap-3">
                       <Star className="text-green-600" size={18} fill="currentColor" />
                       <p className="text-xs font-bold text-green-700">Special limited period offer applied!</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <h2 className="text-3xl font-serif font-black text-slate-800">Payment Details</h2>
                 <form onSubmit={handlePurchase} className="bg-white rounded-[40px] p-8 shadow-2xl border border-slate-100 space-y-6">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Card Number</label>
                       <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input 
                             type="text" 
                             placeholder="4242 4242 4242 4242"
                             required
                             className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all"
                          />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expiry</label>
                          <input 
                             type="text" 
                             placeholder="MM/YY"
                             required
                             className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm focus:border-[#800000] outline-none transition-all"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CVV</label>
                          <input 
                             type="text" 
                             placeholder="123"
                             required
                             className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm focus:border-[#800000] outline-none transition-all"
                          />
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Name on Card</label>
                       <input 
                          type="text" 
                          placeholder="AS SHOWN ON CARD"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm focus:border-[#800000] outline-none transition-all"
                       />
                    </div>

                    <button 
                       type="submit"
                       disabled={isProcessing}
                       className="w-full bg-[#800000] text-white py-5 rounded-3xl font-black shadow-xl shadow-maroon-100 hover:bg-[#600000] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {isProcessing ? (
                         <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                         <>Pay {selectedPlan?.price} Securely <Lock size={18} /></>
                       )}
                    </button>

                    <div className="flex flex-col items-center gap-2">
                       <p className="text-[10px] text-center text-slate-400 font-medium max-w-xs">
                         By clicking pay, you agree to our Subscription Terms. All transactions are 256-bit SSL encrypted.
                       </p>
                       <div className="flex gap-2 grayscale opacity-40">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" alt="Visa" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-3" alt="Mastercard" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-3" alt="PayPal" />
                       </div>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
