import React from 'react';

// The SentenceFlow brand mark: three flowing waves ("流" / Flow).
// Uses `currentColor` so it works both as white-on-gradient in the header
// tile and as a muted slate mark in the footer. Keep this the single source
// of the mark — the standalone assets in /brand and /public/favicon.svg share
// the same geometry.
export const LogoMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 8q3 -3 6 0t6 0t6 0" />
    <path d="M3 12q3 -3 6 0t6 0t6 0" />
    <path d="M3 16q3 -3 6 0t6 0t6 0" />
  </svg>
);

export default LogoMark;
