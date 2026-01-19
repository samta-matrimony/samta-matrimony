import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  ShieldCheck, 
  Zap, 
  Crown,
  ArrowRight,
  Download,
  Mail,
  Lock,
  CreditCard,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../contexts/AnalyticsContext';

interface Plan {
  type: 'Free' | 'Silver' | 'Gold' | 'Platinum';
  price: string;
  numericPrice: number;
  duration: string;
  months: number;
  features: string[];
  notIncluded?: string[];
  color: string;
  btnColor: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    type: 'Free',
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
    type: 'Silver',
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
    type: 'Gold',
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
    type: 'Platinum',
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

interface FormState {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const analytics = useAnalytics();
  
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const validateEmail = useCallback((email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const validateCardNumber = useCallback((cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return /^\d{13,19}$/.test(cleaned);
  }, []);

  const validateExpiryDate = useCallback((expiry: string): boolean => {
    return /^\d{2}\/\d{2}$/.test(expiry);
  }, []);

  const validateCVV = useCallback((cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv);
  }, []);

  const handleSelect = useCallback((plan: Plan) => {
    setError(null);

    if (plan.type === 'Free') {
      if (!auth?.isAuthenticated) {
        navigate('/register');
      } else {
        navigate('/dashboard');
      }
      return;
    }

    analytics?.track?.('plan_selection', { plan: plan.type, price: plan.numericPrice });

    if (!auth?.isAuthenticated) {
      navigate('/register', { state: { mode: 'login', from: '/plans' } });
      return;
    }

    setSelectedPlan(plan);
    setShowCheckout(true);
    setFormData({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    analytics?.track?.('payment_start', { plan: plan.type });
  }, [auth?.isAuthenticated, navigate, analytics]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePurchase = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPlan) {
      setError('No plan selected');
      return;
    }

    // Validation
    if (!formData.cardholderName?.trim()) {
      setError('Cardholder name is required');
      return;
    }

    if (!validateCardNumber(formData.cardNumber)) {
      setError('Invalid card number (13-19 digits)');
      return;
    }

    if (!validateExpiryDate(formData.expiryDate)) {
      setError('Invalid expiry date (MM/YY)');
      return;
    }

    if (!validateCVV(formData.cvv)) {
      setError('Invalid CVV (3-4 digits)');
      return;
    }

    if (!auth?.user?.email || !validateEmail(auth.user.email)) {
      setError('Invalid email address on account');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1200));

      // In production, call actual payment gateway
      if (auth?.upgradePlan && selectedPlan.type !== 'Free') {
        await auth.upgradePlan(selectedPlan.type as "Silver" | "Gold" | "Platinum", selectedPlan.months);
      }

      analytics?.track?.('payment_success', {
        plan: selectedPlan.type,
        amount: selectedPlan.numericPrice,
        duration: selectedPlan.duration
      });

      navigate('/dashboard', { state: { upgradeSuccess: true } });
    } catch (err: any) {
      const errorMsg = err?.message || 'Payment processing failed. Please try again.';
      setError(errorMsg);
      analytics?.track?.('payment_failure', {
        plan: selectedPlan.type,
        error: errorMsg
      });
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPlan, formData, auth, analytics, validateCardNumber, validateExpiryDate, validateCVV, validateEmail, navigate]);

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
                className={`relative bg-white rounded-[48px] p-8 shadow-xl border-2 transition-all hover:scale-105 flex flex-col ${
                  plan.popular ? 'border-yellow-400' : 'border-slate-50'
                } ${auth?.user?.subscription?.plan === plan.type ? 'ring-4 ring-[#80000030]' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                {auth?.user?.subscription?.plan === plan.type && (
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
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-emerald-500 font-black mt-0.5">✓</span>
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                  {plan.notIncluded?.map((f, i) => (
                    <li key={`excluded-${i}`} className="flex items-start gap-3 opacity-50">
                      <span className="text-slate-300 font-black mt-0.5">✕</span>
                      <span className="text-sm text-slate-500">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan)}
                  disabled={auth?.user?.subscription?.plan === plan.type || isProcessing}
                  className={`w-full py-4 rounded-3xl font-black text-white transition-all shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${plan.btnColor}`}
                  aria-label={`Select ${plan.type} plan`}
                >
                  {plan.type === 'Free'
                    ? auth?.isAuthenticated
                      ? 'Current Plan'
                      : 'Get Started'
                    : `Select ${plan.type}`}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-[40px] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-2xl font-serif font-black">Trusted by Over 5 Million Members</h3>
              <p className="text-white/60 max-w-lg">
                Your safety and privacy are our top priorities. All payments are encrypted and processed securely.
              </p>
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
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => {
                setShowCheckout(false);
                setError(null);
              }}
              className="text-slate-400 font-bold flex items-center gap-2 hover:text-[#800000]"
              aria-label="Go back to plans"
            >
              <ArrowRight className="rotate-180" size={20} /> Change Selection
            </button>
            <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Payment Gateway: Secure
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Order Summary */}
            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-black text-slate-800">Order Summary</h2>
              <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
                {selectedPlan && (
                  <>
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-50">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center`}>
                        {selectedPlan.icon}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800">{selectedPlan.type}</h3>
                        <p className="text-sm text-slate-500">{selectedPlan.duration}</p>
                      </div>
                    </div>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Subtotal</span>
                        <span>{selectedPlan.price}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Tax (18% GST)</span>
                        <span>₹{Math.round(selectedPlan.numericPrice * 0.18)}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-50 flex justify-between font-black text-lg">
                        <span>Total Amount</span>
                        <span className="text-[#800000]">
                          ₹{Math.round(selectedPlan.numericPrice * 1.18)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-black text-slate-800">Payment Details</h2>
              <form onSubmit={handlePurchase} className="bg-white rounded-[40px] p-8 shadow-2xl border border-slate-100 space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 flex gap-3 rounded">
                    <AlertCircle className="text-red-500 shrink-0" size={20} />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="cardholderName"
                    placeholder="AS SHOWN ON CARD"
                    value={formData.cardholderName}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm focus:border-[#800000] outline-none transition-all disabled:opacity-50"
                    aria-label="Cardholder Name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      disabled={isProcessing}
                      required
                      maxLength={19}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#800000] outline-none transition-all disabled:opacity-50"
                      aria-label="Card Number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      disabled={isProcessing}
                      required
                      maxLength={5}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm focus:border-[#800000] outline-none transition-all disabled:opacity-50"
                      aria-label="Expiry Date"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      CVV
                    </label>
                    <input
                      type="password"
                      name="cvv"
                      placeholder="***"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      disabled={isProcessing}
                      required
                      maxLength={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm focus:border-[#800000] outline-none transition-all disabled:opacity-50"
                      aria-label="CVV"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#800000] text-white py-5 rounded-3xl font-black shadow-xl hover:bg-[#600000] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-busy={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Complete Payment
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      SSL Encrypted
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Your card information is never stored on our servers
                  </p>
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
