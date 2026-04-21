import { useState } from 'react';
import { BottomSheet } from '../../components/ui/BottomSheet';
import type { SectionPreset } from '../../types';
import { TextField } from '../../components/ui/TextField';
import { motion } from 'framer-motion';

interface AddSectionSheetProps {
  open: boolean;
  onClose: () => void;
  presets: SectionPreset[];
  onAdd: (name: string, presetId?: string) => void;
}

export const AddSectionSheet = ({ open, onClose, presets, onAdd }: AddSectionSheetProps) => {
  const [search, setSearch] = useState('');
  const [custom, setCustom] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const filtered = presets.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (preset: SectionPreset) => {
    onAdd(preset.name, preset.id);
    setSearch('');
    onClose();
  };

  const handleCustom = () => {
    if (custom.trim()) {
      onAdd(custom.trim());
      setCustom('');
      setShowCustom(false);
      onClose();
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Section">
      <div className="px-5 pt-3 pb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search sections…"
          className="w-full h-10 px-4 bg-cream-soft rounded-pill text-[14px] outline-none mb-4"
        />
        <div className="grid grid-cols-2 gap-2 mb-4">
          {filtered.map(p => (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(p)}
              className="h-11 rounded-field bg-cream-soft text-[14px] font-medium"
            >
              {p.name}
            </motion.button>
          ))}
        </div>
        {showCustom ? (
          <div className="flex gap-2">
            <TextField
              value={custom}
              onChange={e => setCustom(e.target.value)}
              placeholder="Section name"
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && handleCustom()}
              autoFocus
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCustom}
              className="h-12 px-5 bg-ink text-surface rounded-field text-[14px] font-medium"
            >
              Add
            </motion.button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full h-11 rounded-pill border border-line text-[14px] text-ink-2"
          >
            + Custom name
          </button>
        )}
      </div>
    </BottomSheet>
  );
};
