'use client';

export default function TzurixLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4CC9F0" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="logoGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
      <path d="M50 20 L20 38 L20 74 L50 92 L50 56 L50 20Z" fill="url(#logoGradient2)" opacity="0.9"/>
      <path d="M50 20 L80 38 L80 74 L50 92 L50 56 L50 20Z" fill="url(#logoGradient1)" opacity="0.95"/>
      <path d="M50 20 L20 38 L50 56 L80 38 L50 20Z" fill="#4CC9F0" opacity="0.8"/>
      <path d="M35 45 L35 55 L45 50 L45 75 L55 80 L55 50 L65 55 L65 45 L50 35 L35 45Z" fill="#02060D" opacity="0.9"/>
    </svg>
  );
}
