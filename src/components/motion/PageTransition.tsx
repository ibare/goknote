import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  sub?: boolean;
}

export const PageTransition = ({ children, sub }: PageTransitionProps) => (
  <motion.div
    initial={{ opacity: 0, x: sub ? 24 : 8 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: sub ? -24 : -8 }}
    transition={{ duration: sub ? 0.18 : 0.12, ease: 'easeInOut' }}
    className="h-full"
  >
    {children}
  </motion.div>
);
