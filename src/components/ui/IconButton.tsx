import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  label: string;
  variant?: 'surface' | 'cream';
  active?: boolean;
  className?: string;
}

export const IconButton = ({ icon, onClick, label, variant = 'surface', active, className = '' }: IconButtonProps) => {
  const bg = variant === 'cream' ? 'bg-cream-soft' : 'bg-surface border border-line';
  const activeClass = active ? 'bg-ink text-surface' : '';

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-label={label}
      className={`w-11 h-11 rounded-full flex items-center justify-center ${bg} ${activeClass} focus-visible:ring-2 focus-visible:ring-ink ${className}`}
    >
      {icon}
    </motion.button>
  );
};
