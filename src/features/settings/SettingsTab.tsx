import { useNavigate } from 'react-router-dom';
import { CaretRight, Sliders, Tag, ListBullets, LockKey } from '@phosphor-icons/react';
import { AppHeader } from '../../components/ui/AppHeader';
import { useGenres } from '../genres/useGenres';
import { useInstruments } from '../instruments/useInstruments';
import { useSectionPresets } from './useSectionPresets';

export const SettingsTab = () => {
  const navigate = useNavigate();
  const { genres } = useGenres();
  const { instruments } = useInstruments();
  const { sectionPresets } = useSectionPresets();

  const catalog = [
    { label: 'Instruments', sub: `${instruments.length} presets`, icon: <Sliders size={18} />, path: '/settings/instruments' },
    { label: 'Genres', sub: `${genres.length} presets`, icon: <Tag size={18} />, path: '/settings/genres' },
    { label: 'Sections', sub: `${sectionPresets.length} presets`, icon: <ListBullets size={18} />, path: '/settings/sections' },
  ];

  return (
    <div className="flex flex-col h-full">
      <AppHeader eyebrow="preferences" title="Settings" />

      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4 flex flex-col gap-6">
        <div>
          <p className="text-[12px] text-ink-3 font-medium mb-2 uppercase tracking-wider">Catalog</p>
          <div className="bg-surface rounded-card shadow-card divide-y divide-line">
            {catalog.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left"
              >
                <div className="w-8 h-8 rounded-field bg-cream-soft flex items-center justify-center text-ink-2">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-medium">{item.label}</p>
                  <p className="text-[12px] text-ink-3">{item.sub}</p>
                </div>
                <CaretRight size={16} className="text-ink-3" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[12px] text-ink-3 font-medium mb-2 uppercase tracking-wider">App</p>
          <div className="bg-surface rounded-card shadow-card divide-y divide-line">
            <button
              onClick={() => navigate('/settings/passcode')}
              className="w-full flex items-center gap-3 px-4 py-4 text-left"
            >
              <div className="w-8 h-8 rounded-field bg-cream-soft flex items-center justify-center text-ink-2">
                <LockKey size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-medium">Change Passcode</p>
              </div>
              <CaretRight size={16} className="text-ink-3" />
            </button>
            <div className="flex items-center gap-3 px-4 py-4 opacity-40">
              <div className="flex-1">
                <p className="text-[15px] font-medium">Theme</p>
              </div>
              <span className="text-[11px] bg-cream-soft text-ink-3 px-2 py-0.5 rounded-pill">Coming soon</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex-1">
                <p className="text-[15px] font-medium">Version</p>
              </div>
              <span className="text-[13px] text-ink-3">0.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
