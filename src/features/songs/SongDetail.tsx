import { useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DotsThree, Plus } from '@phosphor-icons/react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { AppHeader } from '../../components/ui/AppHeader';
import { IconButton } from '../../components/ui/IconButton';
import { Tag } from '../../components/ui/Tag';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SortableItem } from '../../components/ui/SortableItem';
import { SectionCard } from './SectionCard';
import { AddSectionSheet } from './AddSectionSheet';
import { useSongs } from './useSongs';
import { useGenres } from '../genres/useGenres';
import { useInstruments } from '../instruments/useInstruments';
import { useSectionPresets } from '../settings/useSectionPresets';
import type { Section } from '../../types';
import { nanoid } from '../../lib/id';
import { motion, AnimatePresence } from 'framer-motion';

export const SongDetail = () => {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const { songs, updateSong, deleteSong } = useSongs();
  const { genres } = useGenres();
  const { instruments } = useInstruments();
  const { sectionPresets } = useSectionPresets();

  const song = songs.find(s => s.id === songId);
  const genre = genres.find(g => g.id === song?.genreId);

  const [menuOpen, setMenuOpen] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [note, setNote] = useState(song?.note ?? '');
  const [editingNote, setEditingNote] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const showToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 1500);
  };

  const handleNoteBlur = useCallback(() => {
    setEditingNote(false);
    if (!song || note === song.note) return;
    updateSong(song.id, { note });
    showToast();
  }, [note, song, updateSong]);

  const handleNoteChange = (v: string) => {
    setNote(v);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      if (song) { updateSong(song.id, { note: v }); showToast(); }
    }, 600);
  };

  const handleAddSection = useCallback((name: string, presetId?: string) => {
    if (!song) return;
    const section: Section = {
      id: nanoid(), name, presetId, note: '', order: song.sections.length, channels: []
    };
    updateSong(song.id, { sections: [...song.sections, section] });
  }, [song, updateSong]);

  const handleSectionChange = useCallback((updated: Section) => {
    if (!song) return;
    const sections = song.sections.map(s => s.id === updated.id ? updated : s);
    updateSong(song.id, { sections });
    showToast();
  }, [song, updateSong]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    if (!song) return;
    const sections = song.sections.filter(s => s.id !== sectionId).map((s, i) => ({ ...s, order: i }));
    updateSong(song.id, { sections });
  }, [song, updateSong]);

  const handleSectionDragEnd = useCallback((event: DragEndEvent) => {
    if (!song) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = song.sections.findIndex(s => s.id === active.id);
    const newIndex = song.sections.findIndex(s => s.id === over.id);
    const sections = arrayMove(song.sections, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
    updateSong(song.id, { sections });
  }, [song, updateSong]);

  if (!song) return (
    <div className="flex flex-col h-full">
      <AppHeader title="Song" leading="back" />
      <div className="flex-1 flex items-center justify-center text-ink-3">Song not found</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        eyebrow={[genre?.name, song.artist].filter(Boolean).join(' · ')}
        title={song.title}
        leading="back"
        trailing={
          <IconButton
            icon={<DotsThree size={22} />}
            onClick={() => setMenuOpen(true)}
            label="Song menu"
            variant="cream"
          />
        }
      />

      <div className="flex-1 overflow-y-auto px-5 pb-12">
        <div className="mb-4">
          {genre && <Tag label={genre.name} color={genre.color} />}
        </div>

        {editingNote ? (
          <textarea
            value={note}
            onChange={e => handleNoteChange(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="Overall impressions…"
            rows={3}
            autoFocus
            className="w-full text-[15px] text-ink bg-cream-soft rounded-field px-4 py-3 outline-none resize-none mb-4"
          />
        ) : (
          <p
            className="text-[15px] text-ink mb-4 cursor-text min-h-[44px]"
            onClick={() => setEditingNote(true)}
          >
            {note || <span className="text-ink-3 italic">Overall impressions…</span>}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] italic text-ink-3">
            Arrangement · {song.sections.length} section{song.sections.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={() => setAddSectionOpen(true)}
            className="flex items-center gap-1 text-[13px] bg-cream-soft h-8 px-3 rounded-pill"
          >
            <Plus size={13} /> Section
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={song.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {song.sections
              .slice()
              .sort((a, b) => a.order - b.order)
              .map(section => (
                <SortableItem key={section.id} id={section.id}>
                  {({ listeners, attributes }) => (
                    <SectionCard
                      section={section}
                      instruments={instruments}
                      onChange={handleSectionChange}
                      onDelete={() => handleDeleteSection(section.id)}
                      dragListeners={listeners}
                      dragAttributes={attributes}
                    />
                  )}
                </SortableItem>
              ))}
          </SortableContext>
        </DndContext>
      </div>

      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 bg-surface rounded-pill shadow-lift px-4 py-2 text-[13px] text-ink-3 z-50"
          >
            Saving…
          </motion.div>
        )}
      </AnimatePresence>

      <AddSectionSheet
        open={addSectionOpen}
        onClose={() => setAddSectionOpen(false)}
        presets={sectionPresets}
        onAdd={handleAddSection}
      />

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="px-5 py-3">
          <button
            className="w-full text-left py-4 text-[15px] text-red-500 border-t border-line"
            onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
          >
            Delete Song
          </button>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete song"
        description={`Delete "${song.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={async () => { await deleteSong(song.id); navigate('/songs', { replace: true }); }}
        onCancel={() => setConfirmDelete(false)}
        destructive
      />
    </div>
  );
};
