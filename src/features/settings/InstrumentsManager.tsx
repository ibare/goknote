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
import { Pill } from '../../components/ui/Pill';
import { useInstruments } from '../instruments/useInstruments';
import type { InstrumentPreset, InstrumentCategory } from '../../types';
import { motion } from 'framer-motion';

const CATEGORIES: InstrumentCategory[] = ['Rhythm', 'Bass', 'Keyboard', 'Strings', 'Vocal', 'Brass', 'Other'];

export const InstrumentsManager = () => {
  const { instruments, addInstrument, updateInstrument, deleteInstrument, reorderInstruments, checkInstrumentInUse } = useInstruments();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const [editTarget, setEditTarget] = useState<InstrumentPreset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstrumentPreset | null>(null);
  const [deleteWarn, setDeleteWarn] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<InstrumentCategory>('Other');

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = instruments.findIndex(i => i.id === active.id);
    const newIndex = instruments.findIndex(i => i.id === over.id);
    reorderInstruments(arrayMove(instruments, oldIndex, newIndex));
  }, [instruments, reorderInstruments]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const count = await checkInstrumentInUse(deleteTarget.id);
    if (count > 0) {
      setDeleteWarn(`${count} channel${count !== 1 ? 's' : ''} will lose their preset link. Continue?`);
      return;
    }
    await deleteInstrument(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleForceDelete = async () => {
    if (!deleteTarget) return;
    await deleteInstrument(deleteTarget.id);
    setDeleteTarget(null);
    setDeleteWarn('');
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addInstrument({ name: newName.trim(), category: newCat, order: instruments.length, isPreset: false });
    setNewName(''); setNewCat('Other'); setAddOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        eyebrow="catalog · presets"
        title="Instruments"
        leading="back"
        trailing={
          <IconButton icon={<Plus size={20} />} onClick={() => setAddOpen(true)} label="Add instrument" variant="cream" />
        }
      />
      <div className="flex-1 overflow-y-auto px-5 pb-12 pt-2">
        <p className="text-[12px] text-ink-3 italic mb-3">{instruments.length} presets · hold and drag to reorder</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={instruments.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="bg-surface rounded-card shadow-card divide-y divide-line">
              {instruments.map(inst => (
                <SortableItem key={inst.id} id={inst.id}>
                  {({ listeners, attributes }) => (
                    <div className="flex items-center gap-2 px-3 py-3">
                      <DragHandle listeners={listeners} attributes={attributes} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium">{inst.name}</p>
                        <p className="text-[12px] text-ink-3">{inst.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditTarget(inst)} className="text-[13px] text-ink-2 px-3 h-8 bg-cream-soft rounded-pill">Edit</motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setDeleteTarget(inst)} className="text-[13px] text-red-500 px-3 h-8 bg-rose-50 rounded-pill">Delete</motion.button>
                      </div>
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="Add Instrument">
        <div className="px-5 py-4 flex flex-col gap-4">
          <TextField label="Name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Instrument name" autoFocus />
          <div>
            <p className="text-[13px] font-medium text-ink-2 mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => <Pill key={c} label={c} active={newCat === c} onClick={() => setNewCat(c)} small />)}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAddOpen(false)} className="flex-1 h-11 rounded-pill border border-line text-[14px]">Cancel</button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} className="flex-1 h-11 rounded-pill bg-ink text-surface text-[14px]">Add</motion.button>
          </div>
        </div>
      </BottomSheet>

      {editTarget && (
        <BottomSheet open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Instrument">
          <div className="px-5 py-4 flex flex-col gap-4">
            <TextField label="Name" value={editTarget.name} onChange={e => setEditTarget({ ...editTarget, name: e.target.value })} autoFocus />
            <div>
              <p className="text-[13px] font-medium text-ink-2 mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => <Pill key={c} label={c} active={editTarget.category === c} onClick={() => setEditTarget({ ...editTarget, category: c })} small />)}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditTarget(null)} className="flex-1 h-11 rounded-pill border border-line text-[14px]">Cancel</button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={async () => { await updateInstrument(editTarget.id, { name: editTarget.name, category: editTarget.category }); setEditTarget(null); }} className="flex-1 h-11 rounded-pill bg-ink text-surface text-[14px]">Save</motion.button>
            </div>
          </div>
        </BottomSheet>
      )}

      <ConfirmDialog open={!!deleteTarget && !deleteWarn} title="Delete instrument" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} destructive />
      <ConfirmDialog open={!!deleteWarn} title="Warning" description={deleteWarn} confirmLabel="Delete anyway" onConfirm={handleForceDelete} onCancel={() => { setDeleteTarget(null); setDeleteWarn(''); }} destructive />
    </div>
  );
};
