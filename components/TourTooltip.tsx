import React from 'react';
import { X, ChevronRight, Sparkles } from 'lucide-react';

interface TourTooltipProps {
  step: number;
  totalSteps: number;
  title: string;
  content: string;
  onNext: () => void;
  onClose: () => void;
  positionClass: string;
}

const TourTooltip: React.FC<TourTooltipProps> = ({
  step,
  totalSteps,
  title,
  content,
  onNext,
  onClose,
  positionClass,
}) => {
  if (step < 1 || step > totalSteps) {
    console.warn(`TourTooltip: Invalid step ${step}/${totalSteps}`);
    return null;
  }

  return (
    <div
      className={`absolute z-[60] w-64 bg-slate-900 text-white p-5 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 ${positionClass}`}
      role="tooltip"
      aria-label={`Tour step ${step} of ${totalSteps}: ${title}`}
    >
      <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45"></div>

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#FFD700]" aria-hidden="true" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
            Step {step}/{totalSteps}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors p-1"
          aria-label="Close tour"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      <h4 className="font-bold text-sm mb-1">{title}</h4>
      <p className="text-xs text-white/70 leading-relaxed mb-4">{content}</p>

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        aria-label={step === totalSteps ? 'Finish tour' : 'Go to next step'}
      >
        {step === totalSteps ? 'Finish Tour' : 'Next Step'} <ChevronRight size={12} aria-hidden="true" />
      </button>
    </div>
  );
};

export default TourTooltip;