import { useLocation, useNavigate } from 'react-router-dom';
import { MusicNote, Tag, Sliders, Gear, MusicNote as MusicNoteFill, Tag as TagFill, Sliders as SlidersFill, Gear as GearFill } from '@phosphor-icons/react';
import { FAB } from './FAB';

interface TabBarProps {
  onFabClick: () => void;
  fabOpen?: boolean;
}

const tabs = [
  { path: '/songs', label: 'Songs', Icon: MusicNote, IconFill: MusicNoteFill },
  { path: '/genres', label: 'Genres', Icon: Tag, IconFill: TagFill },
  { path: '/instruments', label: 'Instruments', Icon: Sliders, IconFill: SlidersFill },
  { path: '/settings', label: 'Settings', Icon: Gear, IconFill: GearFill },
];

export const TabBar = ({ onFabClick, fabOpen }: TabBarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-line safe-bottom">
      <div className="flex items-end h-[72px]">
        {[tabs[0], tabs[1]].map(({ path, label, Icon, IconFill }) => {
          const active = pathname.startsWith(path);
          const Ic = active ? IconFill : Icon;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full pb-1"
            >
              <Ic size={22} weight={active ? 'fill' : 'regular'} className={active ? 'text-ink' : 'text-ink-3'} />
              <span className={`text-[11px] ${active ? 'text-ink font-medium' : 'text-ink-3'}`}>{label}</span>
            </button>
          );
        })}

        <div className="flex-1 flex items-end justify-center pb-2">
          <div style={{ transform: 'translateY(-8px)' }}>
            <FAB onClick={onFabClick} open={fabOpen} />
          </div>
        </div>

        {[tabs[2], tabs[3]].map(({ path, label, Icon, IconFill }) => {
          const active = pathname.startsWith(path);
          const Ic = active ? IconFill : Icon;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full pb-1"
            >
              <Ic size={22} weight={active ? 'fill' : 'regular'} className={active ? 'text-ink' : 'text-ink-3'} />
              <span className={`text-[11px] ${active ? 'text-ink font-medium' : 'text-ink-3'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
