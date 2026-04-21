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
import { useSectionPresets } from './useSectionPresets';
import type { SectionPreset } from '../../types';
import { motion } from 'framer-motion';

export const SectionsManager = () => {
  const { sectionPresets, addSectionPreset, updateSectionPreset, deleteSectionPreset, reorderSectionPresets, checkSectionInUse } = useSectionPresets();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const [editTarget, setEditTarget] = useState<SectionPreset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SectionPreset | null>(null);
  const [deleteWarn, setDeleteWarn] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionPresets.findIndex(s => s.id === active.id);
    const newIndex = sectionPresets.findIndex(s => s.id === over.id);
    reorderSectionPresets(arrayMove(sectionPresets, oldIndex, newIndex));
  }, [sectionPresets, reorderSectionPresets]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const count = await checkSectionInUse(deleteTarget.id);
    if (count > 0) {
      setDeleteWarn(`${count} section${count !== 1 ? 's' : ''} will lose their preset link. Continue?`);
      return;
    }
    await deleteSectionPreset(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleForceDelete = async () => {
    if (!deleteTarget) return;
    await deleteSectionPreset(deleteTarget.id);
    setDeleteTarget(null);
    setDeleteWarn('');
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        eyebrow="catalog · presets"
        title="Sections"
        leading="back"
        trailing={<IconButton icon={<Plus size={20} />} onClick={() => setAddOpen(true)} label="Add section" variant="cream" />}
      />
      <div className="flex-1 overflow-y-auto px-5 pb-12 pt-2">
        <p className="text-[12px] text-ink-3 italic mb-3">{sectionPresets.length} presets · hold and drag to reorder</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sectionPresets.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="bg-surface rounded-card shadow-card divide-y divide-line">
              {sectionPresets.map(preset => (
                <SortableItem key={preset.id} id={preset.id}>
                  {({ listeners, attributes }) => (
                    <div className="flex items-center gap-2 px-3 py-3">
                      <DragHandle listeners={listeners} attributes={attributes} />
                      <p className="flex-1 text-[14px] font-medium">{preset.name}</p>
                      <div className="flex gap-2">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditTarget(preset)} className="text-[13px] text-ink-2 px-3 h-8 bg-cream-soft rounded-pill">Edit</motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setDeleteTarget(preset)} className="text-[13px] text-red-500 px-3 h-8 bg-rose-50 rounded-pill">Delete</motion.button>
                      </div>
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="Add Section">
        <div className="px-5 py-4 flex flex-col gap-4">
          <TextField label="Name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Section name" autoFocus />
          <div className="flex gap-3">
            <button onClick={() => setAddOpen(false)} className="flex-1 h-11 rounded-pill border border-line text-[14px]">Cancel</button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={async () => { if (newName.trim()) { await addSectionPreset(newName.trim()); setNewName(''); setAddOpen(false); } }} className="flex-1 h-11 rounded-pill bg-ink text-surface text-[14px]">Add</motion.button>
          </div>
        </div>
      </BottomSheet>

      {editTarget && (
        <BottomSheet open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Section">
          <div className="px-5 py-4 flex flex-col gap-4">
            <TextField label="Name" value={editTarget.name} onChange={e => setEditTarget({ ...editTarget, name: e.target.value })} autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setEditTarget(null)} className="flex-1 h-11 rounded-pill border border-line text-[14px]">Cancel</button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={async () => { await updateSectionPreset(editTarget.id, { name: editTarget.name }); setEditTarget(null); }} className="flex-1 h-11 rounded-pill bg-ink text-surface text-[14px]">Save</motion.button>
            </div>
          </div>
        </BottomSheet>
      )}

      <ConfirmDialog open={!!deleteTarget && !deleteWarn} title="Delete section" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} destructive />
      <ConfirmDialog open={!!deleteWarn} title="Warning" description={deleteWarn} confirmLabel="Delete anyway" onConfirm={handleForceDelete} onCancel={() => { setDeleteTarget(null); setDeleteWarn(''); }} destructive />
    </div>
  );
};
