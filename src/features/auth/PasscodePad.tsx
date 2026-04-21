import { motion } from 'framer-motion';
import { Backspace } from '@phosphor-icons/react';

interface PasscodePadProps {
  onDigit: (d: string) => void;
  onDelete: () => void;
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

export const PasscodePad = ({ onDigit, onDelete }: PasscodePadProps) => (
  <div className="grid grid-rows-4 gap-3">
    {ROWS.map((row, ri) => (
      <div key={ri} className="grid grid-cols-3 gap-3 justify-items-center">
        {row.map((key, ki) => {
          if (!key) return <div key={ki} className="w-[60px] h-[60px]" />;
          if (key === 'del') return (
            <motion.button
              key={ki}
              whileTap={{ scale: 0.96, backgroundColor: '#FFFFFF' }}
              onClick={onDelete}
              className="w-[60px] h-[60px] rounded-full bg-cream-soft flex items-center justify-center"
              aria-label="Delete"
            >
              <Backspace size={22} className="text-ink" />
            </motion.button>
          );
          return (
            <motion.button
              key={ki}
              whileTap={{ scale: 0.96, backgroundColor: '#FFFFFF' }}
              onClick={() => onDigit(key)}
              className="w-[60px] h-[60px] rounded-full bg-cream-soft text-[22px] font-medium flex items-center justify-center"
            >
              {key}
            </motion.button>
          );
        })}
      </div>
    ))}
  </div>
);
