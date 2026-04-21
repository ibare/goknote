import { DotsSixVertical } from '@phosphor-icons/react';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { DraggableAttributes } from '@dnd-kit/core';

interface DragHandleProps {
  listeners?: SyntheticListenerMap;
  attributes?: DraggableAttributes;
}

export const DragHandle = ({ listeners, attributes }: DragHandleProps) => (
  <button
    {...listeners}
    {...attributes}
    className="flex items-center justify-center w-8 h-8 text-ink-3 cursor-grab active:cursor-grabbing touch-none"
    aria-label="Drag to reorder"
  >
    <DotsSixVertical size={20} />
  </button>
);
