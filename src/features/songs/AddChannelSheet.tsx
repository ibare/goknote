import { useState, useMemo } from 'react';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Pill } from '../../components/ui/Pill';
import { TextField } from '../../components/ui/TextField';
import type { InstrumentPreset, InstrumentCategory } from '../../types';
import { motion } from 'framer-motion';

interface AddChannelSheetProps {
  open: boolean;
  onClose: () => void;
  instruments: InstrumentPreset[];
  onAdd: (name: string, presetId?: string, category?: InstrumentCategory) => void;
}

const CATEGORIES: (InstrumentCategory | 'All')[] = ['All', 'Rhythm', 'Bass', 'Keyboard', 'Strings', 'Vocal', 'Brass', 'Other'];

export const AddChannelSheet = ({ open, onClose, instruments, onAdd }: AddChannelSheetProps) => {
  const [category, setCategory] = useState<InstrumentCategory | 'All'>('All');
  const [search, setSearch] = useState('');
  const [custom, setCustom] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const filtered = useMemo(() => {
    let list = instruments;
    if (category !== 'All') list = list.filter(i => i.category === category);
    if (search) list = list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [instruments, category, search]);

  const handleSelect = (inst: InstrumentPreset) => {
    onAdd(inst.name, inst.id, inst.category);
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
    <BottomSheet open={open} onClose={onClose} title="Add Instrument">
      <div className="px-4 pt-3 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
          {CATEGORIES.map(cat => (
            <Pill
              key={cat}
              label={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
              small
            />
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search instruments…"
          className="w-full h-10 px-4 bg-cream-soft rounded-pill text-[14px] outline-none mb-3"
        />
        <div className="grid grid-cols-2 gap-2 mb-3">
          {filtered.map(inst => (
            <motion.button
              key={inst.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(inst)}
              className="h-11 rounded-field bg-cream-soft text-[14px] font-medium"
            >
              {inst.name}
            </motion.button>
          ))}
        </div>
        {showCustom ? (
          <div className="flex gap-2">
            <TextField
              value={custom}
              onChange={e => setCustom(e.target.value)}
              placeholder="Instrument name"
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
