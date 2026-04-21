import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface AppHeaderProps {
  eyebrow?: string;
  title: string;
  leading?: 'back' | ReactNode;
  trailing?: ReactNode;
}

export const AppHeader = ({ eyebrow, title, leading, trailing }: AppHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="px-5 safe-top pb-2">
      {leading === 'back' && (
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-ink-2 mb-1 -ml-1"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
          <span className="text-[14px]">Back</span>
        </motion.button>
      )}
      {leading && leading !== 'back' && (
        <div className="mb-1">{leading}</div>
      )}
      <div className="flex items-end justify-between">
        <div>
          {eyebrow && (
            <p className="text-[11px] text-ink-3 italic tracking-[0.03em] mb-0.5">{eyebrow}</p>
          )}
          <h1 className="text-[32px] font-bold leading-tight tracking-[-0.02em]">{title}</h1>
        </div>
        {trailing && (
          <div className="flex items-center gap-2 pb-1">{trailing}</div>
        )}
      </div>
    </div>
  );
};
