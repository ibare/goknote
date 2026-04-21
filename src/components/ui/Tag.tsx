import type { GenreColorKey } from '../../types';

const colorMap: Record<GenreColorKey, string> = {
  lavender: 'bg-tag-lavender-bg text-tag-lavender-ink',
  sage:     'bg-tag-sage-bg text-tag-sage-ink',
  peach:    'bg-tag-peach-bg text-tag-peach-ink',
  sky:      'bg-tag-sky-bg text-tag-sky-ink',
  rose:     'bg-tag-rose-bg text-tag-rose-ink',
  butter:   'bg-tag-butter-bg text-tag-butter-ink',
  slate:    'bg-tag-slate-bg text-tag-slate-ink',
};

interface TagProps {
  label: string;
  color: GenreColorKey;
}

export const Tag = ({ label, color }: TagProps) => (
  <span className={`inline-flex items-center h-6 px-[10px] rounded-pill text-[11px] font-medium ${colorMap[color]}`}>
    {label}
  </span>
);
