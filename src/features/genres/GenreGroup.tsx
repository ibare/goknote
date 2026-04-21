import { useState } from 'react';
import { CaretRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { CollapsePresence } from '../../components/motion/Collapse';
import { useNavigate } from 'react-router-dom';
import type { Genre, Song } from '../../types';

const DOT_COLORS: Record<string, string> = {
  lavender: '#9B87F5',
  sage: '#5CB87A',
  peach: '#F59B5C',
  sky: '#5C9BF5',
  rose: '#F55C7A',
  butter: '#F5D45C',
  slate: '#9B9B9B',
};

interface GenreGroupProps {
  genre: Genre;
  songs: Song[];
}

export const GenreGroup = ({ genre, songs }: GenreGroupProps) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-surface rounded-card shadow-card mb-3">
      <button
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: DOT_COLORS[genre.color] ?? '#9B9B9B' }}
        />
        <span className="flex-1 text-[15px] font-semibold">{genre.name}</span>
        <span className="text-[12px] text-ink-3">{songs.length}</span>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.18 }}>
          <CaretRight size={16} className="text-ink-3" />
        </motion.div>
      </button>

      <CollapsePresence open={expanded}>
        <div className="px-4 pb-3">
          {songs.map(song => (
            <button
              key={song.id}
              className="w-full flex items-center justify-between py-3 border-t border-line text-left"
              onClick={() => navigate(`/songs/${song.id}`)}
            >
              <span className="text-[14px] font-medium">{song.title}</span>
              <span className="text-[13px] text-ink-2">{song.artist}</span>
            </button>
          ))}
        </div>
      </CollapsePresence>
    </div>
  );
};
