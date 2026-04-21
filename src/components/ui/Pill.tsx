import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PillProps {
  label: ReactNode;
  active?: boolean;
  onClick?: () => void;
  small?: boolean;
  className?: string;
}

export const Pill = ({ label, active, onClick, small, className = '' }: PillProps) => {
  const base = small
    ? 'h-8 px-3 text-[13px]'
    : 'h-9 px-4 text-[14px]';
  const color = active
    ? 'bg-ink text-surface border-ink'
    : 'bg-surface text-ink border-line';

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`${base} rounded-pill border flex items-center justify-center font-medium focus-visible:ring-2 focus-visible:ring-ink ${color} ${className}`}
    >
      {label}
    </motion.button>
  );
};
