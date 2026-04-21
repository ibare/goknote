import type { ReactNode } from 'react';
import { MusicNote } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-8 text-center"
  >
    <div className="w-16 h-16 rounded-full bg-cream-soft flex items-center justify-center mb-4 text-ink-3">
      {icon ?? <MusicNote size={28} />}
    </div>
    <p className="text-[16px] font-semibold mb-1">{title}</p>
    {description && <p className="text-[14px] text-ink-2 mb-5">{description}</p>}
    {action && (
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={action.onClick}
        className="h-11 px-6 bg-ink text-surface rounded-pill text-[14px] font-medium"
      >
        {action.label}
      </motion.button>
    )}
  </motion.div>
);
