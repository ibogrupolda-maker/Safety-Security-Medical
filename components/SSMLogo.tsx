
import React from 'react';

const SSMLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="pinGradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#2979FF" />
        </linearGradient>
        <linearGradient id="plusGradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#A7FFEB" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="1" dy="1" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Pin Shape */}
      <path 
        d="M50 92C50 92 18 64 18 40C18 22.3269 32.3269 8 50 8C67.6731 8 82 22.3269 82 40C82 64 50 92 50 92Z" 
        fill="url(#pinGradient)" 
      />
      
      {/* Internal Cutout */}
      <circle cx="50" cy="40" r="14" fill="white" />
      
      {/* Overlapping Medical Plus */}
      <g filter="url(#shadow)">
        <path 
          d="M88 42C88 43.1046 87.1046 44 86 44H74V56C74 57.1046 73.1046 58 72 58H64C62.8954 58 62 57.1046 62 56V44H50C48.8954 44 48 43.1046 48 42V34C48 32.8954 48.8954 32 50 32H62V20C62 18.8954 62.8954 18 64 18H72C73.1046 18 74 18.8954 74 20V32H86C87.1046 32 88 32.8954 88 34V42Z" 
          fill="url(#plusGradient)"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default SSMLogo;
