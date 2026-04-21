import { motion } from 'framer-motion';
import { Plus } from '@phosphor-icons/react';

interface FABProps {
  onClick: () => void;
  open?: boolean;
}

export const FAB = ({ onClick, open }: FABProps) => (
  <motion.button
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    className="w-[58px] h-[58px] rounded-full bg-ink flex items-center justify-center shadow-fab focus-visible:ring-2 focus-visible:ring-ink-2"
    aria-label="Add song"
  >
    <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
      <Plus size={24} color="white" weight="bold" />
    </motion.div>
  </motion.button>
);
