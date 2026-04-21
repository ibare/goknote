import { useState, useCallback } from 'react';
import { Plus } from '@phosphor-icons/react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { AppHeader } from '../../components/ui/AppHeader';
import { IconButton } from '../../components/ui/IconButton';
import { SortableItem } from '../../components/ui/SortableItem';
import { DragHandle } from '../../components/ui/DragHandle';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { TextField } from '../../components/ui/TextField';
import { Tag } from '../../components/ui/Tag';
import { useGenres } from '../genres/useGenres';
import { useSongs } from '../songs/useSongs';
import type { Genre, GenreColorKey } from '../../types';
import { motion } from 'framer-motion';

const COLORS: GenreColorKey[] = ['lavender', 'sage', 'peach', 'sky', 'rose', 'butter', 'slate'];

export const GenresManager = () => {
  const { genres, addGenre, updateGenre, deleteGenre, reorderGenres, checkGenreInUse } = useGenres();
  const { songs } = useSongs();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const [editTarget, setEditTarget] = useState<Genre | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Genre | null>(null);
  const [deleteBlockMsg, setDeleteBlockMsg] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<GenreColorKey>('slate');

  const genreUsage = (id: string) => songs.filter(s => s.genreId === id).length;

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = genres.findIndex(g => g.id === active.id);
    const newIndex = genres.findIndex(g => g.id === over.id);
    const reordered = arrayMove(genres, oldIndex, newIndex);
    reorderGenres(reordered);
  }, [genres, reorderGenres]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const count = await checkGenreInUse(deleteTarget.id);
    if (count > 0) {
      setDeleteBlockMsg(`This genre is used by ${count} song${count !== 1 ? 's' : ''}. Change their genre first.`);
      setDeleteTarget(null);
      return;
    }
    await deleteGenre(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addGenre({ name: newName.trim(), color: newColor, order: genres.length, isPreset: false });
    setNewName(''); setNewColor('slate'); setAddOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        eyebrow="catalog · presets"
        title="Genres"
        leading="back"
        trailing={
          <IconButton icon={<Plus size={20} />} onClick={() => setAddOpen(true)} label="Add genre" variant="cream" />
        }
      />

      <div className="flex-1 overflow-y-auto px-5 pb-12 pt-2">
        <p className="text-[12px] text-ink-3 italic mb-3">
          {genres.length} presets · hold and drag to reorder
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={genres.map(g => g.id)} strategy={verticalListSortingStrategy}>
            <div className="bg-surface rounded-card shadow-card divide-y divide-line">
              {genres.map(genre => (
                <SortableItem key={genre.id} id={genre.id}>
                  {({ listeners, attributes }) => (
                    <div className="flex items-center gap-2 px-3 py-3">
                      <DragHandle listeners={listeners} attributes={attributes} />
                      <div className="flex-1 flex items-center gap-2">
                        <Tag label={genre.name} color={genre.color} />
                        <span className="text-[12px] text-ink-3">{genreUsage(genre.id)} songs</span>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditTarget(genre)}
                          className="text-[13px] text-ink-2 px-3 h-8 bg-cream-soft rounded-pill"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDeleteTarget(genre)}
                          className="text-[13px] text-red-500 px-3 h-8 bg-rose-50 rounded-pill"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="Add Genre">
        <div className="px-5 py-4 flex flex-col gap-4">
          <TextField
            label="Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Genre name"
            autoFocus
          />
          <div>
            <p className="text-[13px] font-medium text-ink-2 mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setNewColor(c)}
                  className={`rounded-pill border-2 transition-colors ${newColor === c ? 'border-ink' : 'border-transparent'}`}
                >
                  <Tag label={c} color={c} />
                </motion.button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAddOpen(false)} className="flex-1 h-11 rounded-pill border border-line text-[14px]">Cancel</button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} className="flex-1 h-11 rounded-pill bg-ink text-surface text-[14px]">Add</motion.button>
          </div>
        </div>
      </BottomSheet>

      {editTarget && (
        <BottomSheet open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Genre">
          <div className="px-5 py-4 flex flex-col gap-4">
            <TextField
              label="Name"
              value={editTarget.name}
              onChange={e => setEditTarget({ ...editTarget, name: e.target.value })}
              autoFocus
            />
            <div>
              <p className="text-[13px] font-medium text-ink-2 mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <motion.button
                    key={c}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEditTarget({ ...editTarget, color: c })}
                    className={`rounded-pill border-2 ${editTarget.color === c ? 'border-ink' : 'border-transparent'}`}
                  >
                    <Tag label={c} color={c} />
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditTarget(null)} className="flex-1 h-11 rounded-pill border border-line text-[14px]">Cancel</button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={async () => { await updateGenre(editTarget.id, { name: editTarget.name, color: editTarget.color }); setEditTarget(null); }}
                className="flex-1 h-11 rounded-pill bg-ink text-surface text-[14px]"
              >
                Save
              </motion.button>
            </div>
          </div>
        </BottomSheet>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete genre"
        description={`Delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />

      <BottomSheet open={!!deleteBlockMsg} onClose={() => setDeleteBlockMsg('')}>
        <div className="px-5 py-6">
          <p className="text-[15px] mb-4">{deleteBlockMsg}</p>
          <button onClick={() => setDeleteBlockMsg('')} className="w-full h-11 rounded-pill bg-ink text-surface text-[14px]">OK</button>
        </div>
      </BottomSheet>
    </div>
  );
};
