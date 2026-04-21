import type { ReactNode } from 'react';
import { useRef } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  trailing?: ReactNode;
}

export const SearchBar = ({ value, onChange, placeholder = 'Search…', trailing }: SearchBarProps) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex items-center gap-2 bg-cream-soft rounded-pill h-11 px-4 focus-within:shadow-card transition-shadow"
      onClick={() => ref.current?.focus()}
    >
      <MagnifyingGlass size={18} className="text-ink-3 shrink-0" />
      <input
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3"
      />
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
};
