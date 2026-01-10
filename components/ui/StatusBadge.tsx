// components/ui/StatusBadge.tsx
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

type StatusType = 'ready' | 'pending' | 'needs_interface' | 'warning' | 'error';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const STATUS_CONFIG = {
  ready: {
    icon: CheckCircle2,
    label: 'Arena Ready',
    className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  pending: {
    icon: Clock,
    label: 'Pending Validation',
    className: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  needs_interface: {
    icon: AlertCircle,
    label: 'Needs Interface',
    className: 'text-red-400 bg-red-500/10 border-red-500/30',
  },
  warning: {
    icon: AlertCircle,
    label: 'Warning',
    className: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    className: 'text-red-400 bg-red-500/10 border-red-500/30',
  },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.error;
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border
      ${config.className}
    `}>
      <Icon size={12} />
      {label || config.label}
    </span>
  );
    }
