import { BottomSheet } from '../../components/ui/BottomSheet';
import { Pill } from '../../components/ui/Pill';
import { Tag } from '../../components/ui/Tag';
import type { Genre, InstrumentPreset } from '../../types';
import { motion } from 'framer-motion';

type SortOption = 'recent' | 'title' | 'artist' | 'created';

interface SongFilterSheetProps {
  open: boolean;
  onClose: () => void;
  sort: SortOption;
  genreIds: string[];
  instrumentIds: string[];
  genres: Genre[];
  instruments: InstrumentPreset[];
  onApply: (sort: SortOption, genreIds: string[], instrumentIds: string[]) => void;
  onReset: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent',  label: 'Last edited' },
  { value: 'title',   label: 'Title' },
  { value: 'artist',  label: 'Artist' },
  { value: 'created', label: 'Date added' },
];

export const SongFilterSheet = ({
  open, onClose, sort, genreIds, instrumentIds, genres, instruments, onApply, onReset,
}: SongFilterSheetProps) => {
  const toggle = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  let localSort = sort;
  let localGenres = [...genreIds];
  let localInstruments = [...instrumentIds];

  return (
    <BottomSheet open={open} onClose={onClose} title="Filter & Sort">
      <div className="px-5 py-4 flex flex-col gap-6">
        <div>
          <p className="text-[13px] font-semibold mb-2 text-ink-2">Sort by</p>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map(o => (
              <Pill
                key={o.value}
                label={o.label}
                active={localSort === o.value}
                onClick={() => { localSort = o.value; }}
                small
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[13px] font-semibold mb-2 text-ink-2">Genre</p>
          <div className="flex flex-wrap gap-2">
            {genres.map(g => (
              <motion.button
                key={g.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => { localGenres = toggle(localGenres, g.id); }}
                className={`rounded-pill border-2 transition-colors ${localGenres.includes(g.id) ? 'border-ink' : 'border-transparent'}`}
              >
                <Tag label={g.name} color={g.color} />
              </motion.button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[13px] font-semibold mb-2 text-ink-2">Instrument</p>
          <div className="flex flex-wrap gap-2">
            {instruments.map(inst => (
              <Pill
                key={inst.id}
                label={inst.name}
                active={localInstruments.includes(inst.id)}
                onClick={() => { localInstruments = toggle(localInstruments, inst.id); }}
                small
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3 pb-2">
          <button
            onClick={() => { onReset(); onClose(); }}
            className="flex-1 h-11 rounded-pill border border-line text-[14px] font-medium"
          >
            Reset
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { onApply(localSort, localGenres, localInstruments); onClose(); }}
            className="flex-1 h-11 rounded-pill bg-ink text-surface text-[14px] font-medium"
          >
            Apply
          </motion.button>
        </div>
      </div>
    </BottomSheet>
  );
};
