import { motion } from 'framer-motion';

interface PasscodeDotsProps {
  count: number;
  shaking: boolean;
}

export const PasscodeDots = ({ count, shaking }: PasscodeDotsProps) => (
  <motion.div
    className="flex gap-4 justify-center"
    animate={shaking ? {
      x: [-8, 8, -4, 4, 0],
      transition: { duration: 0.04 * 5, times: [0, 0.2, 0.4, 0.7, 1] }
    } : { x: 0 }}
  >
    {[0, 1, 2, 3].map(i => (
      <div
        key={i}
        className={`w-4 h-4 rounded-full border-2 transition-colors duration-100 ${
          i < count ? 'bg-ink border-ink' : 'border-ink-4 bg-transparent'
        }`}
      />
    ))}
  </motion.div>
);
