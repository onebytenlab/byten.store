'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function Logo({ className, width = '100%', height = '100%' }: LogoProps) {
  return (
    <svg
      xmlns="http://w3.org"
      viewBox="0 0 280 60"
      width={width}
      height={height}
      className={className}
      fill="none"
    >
      <g id="logo-mark">
        <path
          d="M15 12H38L27 48H4L15 12Z"
          fill="#22D3EE"
        />
        <path
          d="M22 10L17 50"
          stroke="#111827"
          strokeWidth="3"
        />
      </g>

      <g id="logo-text">
        <text
          x="65"
          y="41"
          fill="#ffffff"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="28"
          fontWeight="800"
          letterSpacing="1.5"
        >
          BYTEN
        </text>
        <text
          x="172"
          y="41"
          fill="#22D3EE"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="28"
          fontWeight="500"
          letterSpacing="1"
        >
          .STORE
        </text>
      </g>
    </svg>
  );
}
