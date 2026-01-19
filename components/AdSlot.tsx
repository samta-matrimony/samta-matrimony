
import React from 'react';

interface AdSlotProps {
  id: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Reusable AdSlot component for Google AdSense integration.
 * Complies with AdSense policies by providing clear "Advertisement" labels.
 */
const AdSlot: React.FC<AdSlotProps> = ({ id, format = 'auto', className = '' }) => {
  if (!id || typeof id !== 'string') {
    console.warn('AdSlot: Missing or invalid id prop');
    return null;
  }

  const heightMap: Record<string, number> = {
    rectangle: 250,
    horizontal: 90,
    vertical: 600,
    auto: 100,
    fluid: 100,
  };

  const minHeight = heightMap[format] || 100;

  return (
    <div className={`ad-container my-8 mx-auto flex flex-col items-center justify-center ${className}`}>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2">Advertisement</span>
      <div
        className="w-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center transition-colors hover:bg-slate-100"
        style={{ minHeight: `${minHeight}px` }}
      >
        {/* AdSense code will be injected here via the script in index.html */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-PLACEHOLDER"
          data-ad-slot={id}
          data-ad-format={format}
          data-full-width-responsive="true"
        ></ins>
        <p className="text-[10px] font-bold text-slate-400 italic">Space for Ad #{id}</p>
      </div>
    </div>
  );
};

export default AdSlot;
