import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StaggerListProps {
  children: ReactNode[];
  className?: string;
}

export const StaggerList = ({ children, className = '' }: StaggerListProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
  >
    {children.map((child, i) => (
      <motion.div
        key={i}
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
        }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);
