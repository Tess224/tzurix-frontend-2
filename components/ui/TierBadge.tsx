// components/ui/TierBadge.tsx
import { TIERS } from '@/lib/constants';
import { TierType } from '@/types';

interface TierBadgeProps {
  tier: TierType;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
}

export default function TierBadge({ tier, size = 'sm', showEmoji = true }: TierBadgeProps) {
  const config = TIERS[tier];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full font-medium
      ${sizeClasses[size]}
      ${config.bgClass} 
      ${config.borderClass}
      ${config.textClass}
      border
    `}>
      {showEmoji && <span>{config.emoji}</span>}
      {config.name}
    </span>
  );
}
