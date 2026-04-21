import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
  padding?: string;
}

export const Card = ({ children, onClick, onLongPress, className = '', padding = 'p-5' }: CardProps) => {
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;

  const handlePointerDown = () => {
    if (onLongPress) {
      longPressTimer = setTimeout(onLongPress, 500);
    }
  };

  const handlePointerUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.985 } : undefined}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`bg-surface rounded-card shadow-card ${padding} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};
