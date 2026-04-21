import { useState, useRef, useCallback } from 'react';
import { DragHandle } from '../../components/ui/DragHandle';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Trash } from '@phosphor-icons/react';
import type { Channel } from '../../types';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { DraggableAttributes } from '@dnd-kit/core';
import { motion } from 'framer-motion';

interface ChannelRowProps {
  channel: Channel;
  onNoteChange: (note: string) => void;
  onDelete: () => void;
  dragListeners?: SyntheticListenerMap;
  dragAttributes?: DraggableAttributes;
}

export const ChannelRow = ({ channel, onNoteChange, onDelete, dragListeners, dragAttributes }: ChannelRowProps) => {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(channel.note);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBlur = useCallback(() => {
    setEditing(false);
    if (note !== channel.note) onNoteChange(note);
  }, [note, channel.note, onNoteChange]);

  const handleChange = (v: string) => {
    setNote(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onNoteChange(v), 600);
  };

  return (
    <div className="flex items-start gap-2 py-3 border-b border-line last:border-0">
      <DragHandle listeners={dragListeners} attributes={dragAttributes} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium mb-1">{channel.name}</p>
        {editing ? (
          <textarea
            value={note}
            onChange={e => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Instrument note…"
            rows={2}
            autoFocus
            className="w-full text-[13px] text-ink-2 bg-cream-soft rounded-field px-3 py-2 outline-none resize-none"
          />
        ) : (
          <p
            className="text-[13px] text-ink-2 cursor-text min-h-[20px]"
            onClick={() => setEditing(true)}
          >
            {note || <span className="text-ink-3 italic">Tap to add note…</span>}
          </p>
        )}
      </div>
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => setConfirmDelete(true)}
        className="text-ink-3 mt-1 p-1"
        aria-label="Delete instrument"
      >
        <Trash size={16} />
      </motion.button>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete instrument"
        description={`Remove "${channel.name}"?`}
        confirmLabel="Delete"
        onConfirm={() => { setConfirmDelete(false); onDelete(); }}
        onCancel={() => setConfirmDelete(false)}
        destructive
      />
    </div>
  );
};
