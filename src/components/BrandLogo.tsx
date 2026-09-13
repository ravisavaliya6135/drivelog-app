import { memo } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BrandLogo = memo(function BrandLogo({
  className = '',
  size = 'md',
  showText = true,
}: BrandLogoProps) {
  const sizeMap = {
    sm: { box: 'w-7 h-7', icon: 'w-4 h-4', text: 'text-sm' },
    md: { box: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-base' },
    lg: { box: 'w-12 h-12', icon: 'w-7 h-7', text: 'text-xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Automotive Cockpit Shield Icon */}
      <div
        className={`${currentSize.box} relative rounded-xl bg-gradient-to-br from-slate-900 via-[#0F172A] to-teal-950 p-[1px] shadow-[0_4px_16px_rgba(20,184,166,0.3)] ring-1 ring-white/20 dark:ring-teal-500/30 flex items-center justify-center overflow-hidden flex-shrink-0`}
      >
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-indigo-500/20 opacity-80" />
        
        {/* Road & Horizon Vector Mark */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${currentSize.icon} relative z-10 text-teal-400`}
        >
          {/* Steering Wheel / Horizon Outer Arc */}
          <path
            d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-white opacity-90"
          />
          {/* Perspective Road Lanes */}
          <path
            d="M9 19L11 12M15 19L13 12"
            stroke="#14B8A6"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Dashed Center Road Marker */}
          <path
            d="M12 11V15M12 17V19"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Horizon Sunrise / Twilight Dot */}
          <circle cx="12" cy="8" r="1.5" fill="#38BDF8" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${currentSize.text}`}>
              Drive<span className="text-teal-600 dark:text-teal-400">Hours</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
