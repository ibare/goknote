import { useState } from 'react';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { TextField } from '../../components/ui/TextField';
import { TextArea } from '../../components/ui/TextArea';
import { Tag } from '../../components/ui/Tag';
import type { Genre } from '../../types';
import { motion } from 'framer-motion';

interface AddSongSheetProps {
  open: boolean;
  onClose: () => void;
  genres: Genre[];
  onSave: (payload: { title: string; artist: string; genreId: string; note: string }) => Promise<void>;
}

export const AddSongSheet = ({ open, onClose, genres, onSave }: AddSongSheetProps) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genreId, setGenreId] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!artist.trim()) e.artist = 'Artist is required';
    if (!genreId) e.genre = 'Please select a genre';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), artist: artist.trim(), genreId, note });
      setTitle(''); setArtist(''); setGenreId(''); setNote(''); setErrors({});
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Song">
      <div className="px-5 pt-4 pb-2 flex flex-col gap-4">
        <TextField
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Song title"
          error={errors.title}
        />
        <TextField
          label="Artist"
          value={artist}
          onChange={e => setArtist(e.target.value)}
          placeholder="Artist name"
          error={errors.artist}
        />
        <div>
          <p className="text-[13px] font-medium text-ink-2 mb-2">Genre</p>
          <div className="flex flex-wrap gap-2">
            {genres.map(g => (
              <motion.button
                key={g.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => setGenreId(g.id)}
                className={`rounded-pill border-2 transition-colors ${genreId === g.id ? 'border-ink' : 'border-transparent'}`}
              >
                <Tag label={g.name} color={g.color} />
              </motion.button>
            ))}
          </div>
          {errors.genre && <p className="text-[12px] text-red-500 mt-1">{errors.genre}</p>}
        </div>
        <TextArea
          label="Note (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Overall impressions…"
          rows={3}
        />
        <div className="flex gap-3 pb-2">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-pill border border-line text-[14px] font-medium"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-11 rounded-pill bg-ink text-surface text-[14px] font-medium disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </motion.button>
        </div>
      </div>
    </BottomSheet>
  );
};
