import { useState } from 'react';
import { CaretRight, WaveSquare, PianoKeys, MusicNote, Microphone, Waveform, Sparkle, MusicNotes } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { CollapsePresence } from '../../components/motion/Collapse';
import { useNavigate } from 'react-router-dom';
import type { InstrumentPreset, Song, InstrumentCategory } from '../../types';

const CATEGORY_ICONS: Record<InstrumentCategory, React.ReactNode> = {
  Rhythm:   <MusicNotes size={18} />,
  Bass:     <WaveSquare size={18} />,
  Keyboard: <PianoKeys size={18} />,
  Strings:  <MusicNote size={18} />,
  Vocal:    <Microphone size={18} />,
  Brass:    <Waveform size={18} />,
  Other:    <Sparkle size={18} />,
};

interface InstrumentGroupProps {
  instrument: InstrumentPreset;
  songs: Song[];
  sectionsMap: Map<string, string[]>;
}

export const InstrumentGroup = ({ instrument, songs, sectionsMap }: InstrumentGroupProps) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-surface rounded-card shadow-card mb-3">
      <button
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-[34px] h-[34px] rounded-field bg-cream-soft flex items-center justify-center text-ink-2 shrink-0">
          {CATEGORY_ICONS[instrument.category] ?? <Sparkle size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold">{instrument.name}</p>
          <p className="text-[12px] text-ink-3">{instrument.category} · {songs.length} song{songs.length !== 1 ? 's' : ''}</p>
        </div>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.18 }}>
          <CaretRight size={16} className="text-ink-3" />
        </motion.div>
      </button>

      <CollapsePresence open={expanded}>
        <div className="px-4 pb-3">
          {songs.map(song => {
            const sections = sectionsMap.get(`${instrument.id}:${song.id}`) ?? [];
            return (
              <button
                key={song.id}
                className="w-full flex items-center justify-between py-3 border-t border-line text-left gap-2"
                onClick={() => navigate(`/songs/${song.id}`)}
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-medium truncate">{song.title}</p>
                  <p className="text-[12px] text-ink-2">{song.artist}</p>
                </div>
                <p className="text-[11px] text-ink-3 shrink-0">{sections.join(' · ')}</p>
              </button>
            );
          })}
        </div>
      </CollapsePresence>
    </div>
  );
};
