import type { ReactNode } from 'react';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapseProps {
  open: boolean;
  children: ReactNode;
}

export const Collapse = ({ open, children }: CollapseProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>(0);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      const h = ref.current.scrollHeight;
      setHeight(h);
      const timer = setTimeout(() => setHeight('auto'), 400);
      return () => clearTimeout(timer);
    } else {
      setHeight(ref.current.scrollHeight);
      requestAnimationFrame(() => setHeight(0));
    }
  }, [open]);

  return (
    <motion.div
      animate={{ height, opacity: open ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 38 }}
      style={{ overflow: 'hidden' }}
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  );
};

export const CollapsePresence = ({ open, children }: CollapseProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 38 }}
        style={{ overflow: 'hidden' }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);
