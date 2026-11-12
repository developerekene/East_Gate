import React from 'react';

interface EastGateLogoProps {
  className?: string;
}

export const EastGateLogo: React.FC<EastGateLogoProps> = ({ className = 'w-9 h-9' }) => {
  return (
    <div
      className={`${className} rounded-xl bg-gradient-to-tr from-[#0B2545] to-[#1E3A8A] text-white flex items-center justify-center shadow-sm border border-blue-400/25 shrink-0`}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        aria-hidden="true"
      >
        {/* Gate Arch & Top */}
        <path
          d="M5 12C5 7.58172 9.92487 4 16 4C22.0751 4 27 7.58172 27 12"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Left & Right Gate Pillars */}
        <path
          d="M7 11V27M25 11V27"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Inner Gate Doors */}
        <path
          d="M12 13V27M20 13V27"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        {/* Crossbars */}
        <path
          d="M7 16H25M7 22H25"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />
        {/* Center Gate Crest */}
        <circle cx="16" cy="9.5" r="1.8" fill="currentColor" />
      </svg>
    </div>
  );
};
