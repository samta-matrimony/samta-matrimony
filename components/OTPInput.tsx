import React, { useState, useRef, useEffect } from 'react';
import { Timer, RefreshCw } from 'lucide-react';

interface OTPInputProps {
  onComplete: (otp: string) => void;
  onResend: () => void;
  isLoading: boolean;
  error?: string;
  cooldown?: number;
}

const OTPInput: React.FC<OTPInputProps> = ({ onComplete, onResend, isLoading, error, cooldown = 60 }) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [timer, setTimer] = useState(cooldown);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value.slice(-1);
    setOtp(newOtp);

    // Shift focus to next input
    if (element.value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Check if all fields are filled
    if (newOtp.every((val) => val !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const resetOtp = () => {
    setOtp(new Array(6).fill(''));
    inputs.current[0]?.focus();
    onResend();
    setTimer(cooldown);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between gap-2 md:gap-4">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            ref={(el) => {
              if (el) inputs.current[index] = el;
            }}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={isLoading}
            aria-label={`OTP digit ${index + 1} of 6`}
            className={`w-full aspect-square text-center text-2xl font-black rounded-2xl border-2 transition-all outline-none ${
              error ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 bg-slate-50 focus:border-[#800000] focus:bg-white'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <Timer size={14} aria-hidden="true" />
          {timer > 0 ? (
            <span>Resend available in {timer}s</span>
          ) : (
            <button
              type="button"
              onClick={resetOtp}
              disabled={isLoading}
              aria-label="Resend OTP code"
              className="text-[#800000] hover:underline disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw size={12} aria-hidden="true" /> Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPInput;