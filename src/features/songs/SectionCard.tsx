import { useState, useCallback } from 'react';
import { CaretRight, Plus, Trash } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DraggableAttributes } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { DragHandle } from '../../components/ui/DragHandle';
import { CollapsePresence } from '../../components/motion/Collapse';
import { SortableItem } from '../../components/ui/SortableItem';
import { ChannelRow } from './ChannelRow';
import { AddChannelSheet } from './AddChannelSheet';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Section, Channel, InstrumentPreset, InstrumentCategory } from '../../types';
import { nanoid } from '../../lib/id';

interface SectionCardProps {
  section: Section;
  instruments: InstrumentPreset[];
  onChange: (updated: Section) => void;
  onDelete: () => void;
  dragListeners?: SyntheticListenerMap;
  dragAttributes?: DraggableAttributes;
}

export const SectionCard = ({ section, instruments, onChange, onDelete, dragListeners, dragAttributes }: SectionCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [addChannelOpen, setAddChannelOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [note, setNote] = useState(section.note);
  const [editingNote, setEditingNote] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const handleNoteBlur = useCallback(() => {
    setEditingNote(false);
    if (note !== section.note) onChange({ ...section, note });
  }, [note, section, onChange]);

  const handleAddChannel = useCallback((name: string, presetId?: string, category?: InstrumentCategory) => {
    const channel: Channel = { id: nanoid(), name, presetId, category, note: '', order: section.channels.length };
    onChange({ ...section, channels: [...section.channels, channel] });
  }, [section, onChange]);

  const handleChannelNoteChange = useCallback((channelId: string, newNote: string) => {
    const channels = section.channels.map(c => c.id === channelId ? { ...c, note: newNote } : c);
    onChange({ ...section, channels });
  }, [section, onChange]);

  const handleDeleteChannel = useCallback((channelId: string) => {
    const channels = section.channels.filter(c => c.id !== channelId).map((c, i) => ({ ...c, order: i }));
    onChange({ ...section, channels });
  }, [section, onChange]);

  const handleChannelDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = section.channels.findIndex(c => c.id === active.id);
    const newIndex = section.channels.findIndex(c => c.id === over.id);
    const channels = arrayMove(section.channels, oldIndex, newIndex).map((c, i) => ({ ...c, order: i }));
    onChange({ ...section, channels });
  }, [section, onChange]);

  const previewChannels = section.channels.map(c => c.name).join(' · ');

  return (
    <div className="bg-surface rounded-card shadow-card mb-3">
      <div className="flex items-center gap-2 px-3 py-3">
        <DragHandle listeners={dragListeners} attributes={dragAttributes} />
        <button
          className="flex-1 flex items-center gap-2 text-left"
          onClick={() => setExpanded(e => !e)}
        >
          <span className="text-[15px] font-semibold flex-1">{section.name}</span>
          {section.channels.length > 0 && (
            <span className="text-[11px] text-ink-3 bg-cream-soft px-2 py-0.5 rounded-pill">
              {section.channels.length}
            </span>
          )}
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.18 }}>
            <CaretRight size={16} className="text-ink-3" />
          </motion.div>
        </button>
        <motion.button whileTap={{ scale: 0.94 }} onClick={() => setConfirmDelete(true)} className="text-ink-3 p-1">
          <Trash size={16} />
        </motion.button>
      </div>

      {!expanded && previewChannels && (
        <p className="px-3 pb-2 text-[11px] text-ink-3">{previewChannels}</p>
      )}

      <CollapsePresence open={expanded}>
        <div className="px-3 pb-3">
          {editingNote ? (
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="Section notes…"
              rows={2}
              autoFocus
              className="w-full text-[13px] text-ink-2 bg-cream-soft rounded-field px-3 py-2 outline-none resize-none mb-3"
            />
          ) : (
            <p
              className="text-[13px] text-ink-2 cursor-text mb-3 min-h-[20px]"
              onClick={() => setEditingNote(true)}
            >
              {note || <span className="text-ink-3 italic">Add section notes…</span>}
            </p>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleChannelDragEnd}>
            <SortableContext items={section.channels.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {section.channels.map(channel => (
                <SortableItem key={channel.id} id={channel.id}>
                  {({ listeners, attributes }) => (
                    <ChannelRow
                      channel={channel}
                      onNoteChange={n => handleChannelNoteChange(channel.id, n)}
                      onDelete={() => handleDeleteChannel(channel.id)}
                      dragListeners={listeners}
                      dragAttributes={attributes}
                    />
                  )}
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          <button
            onClick={() => setAddChannelOpen(true)}
            className="mt-2 flex items-center gap-1 text-[13px] text-ink-2 bg-cream-soft h-9 px-4 rounded-pill"
          >
            <Plus size={14} /> Add Instrument
          </button>
        </div>
      </CollapsePresence>

      <AddChannelSheet
        open={addChannelOpen}
        onClose={() => setAddChannelOpen(false)}
        instruments={instruments}
        onAdd={handleAddChannel}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete section"
        description={`Remove "${section.name}" and all its instruments?`}
        confirmLabel="Delete"
        onConfirm={() => { setConfirmDelete(false); onDelete(); }}
        onCancel={() => setConfirmDelete(false)}
        destructive
      />
    </div>
  );
};
