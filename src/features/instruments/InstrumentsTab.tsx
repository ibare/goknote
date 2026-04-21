import { useMemo } from 'react';
import { AppHeader } from '../../components/ui/AppHeader';
import { InstrumentGroup } from './InstrumentGroup';
import { EmptyState } from '../../components/ui/EmptyState';
import { Sliders } from '@phosphor-icons/react';
import { useInstruments } from './useInstruments';
import { useSongs } from '../songs/useSongs';
import { useFilterStore } from '../../stores/filters';
import { StaggerList } from '../../components/motion/StaggerList';

export const InstrumentsTab = () => {
  const { instruments } = useInstruments();
  const { songs } = useSongs();
  const { instruments: filter } = useFilterStore();

  const { grouped, sectionsMap } = useMemo(() => {
    const sectionsMap = new Map<string, string[]>();

    const grouped = instruments
      .map(instrument => {
        const matchingSongs = songs.filter(song =>
          song.sections.some(sec =>
            sec.channels.some(ch => ch.presetId === instrument.id)
          )
        );
        matchingSongs.forEach(song => {
          const sections = song.sections
            .filter(sec => sec.channels.some(ch => ch.presetId === instrument.id))
            .map(sec => sec.name);
          sectionsMap.set(`${instrument.id}:${song.id}`, sections);
        });
        return { instrument, songs: matchingSongs };
      })
      .filter(({ songs: s }) => filter.showEmpty || s.length > 0)
      .sort((a, b) => {
        if (filter.sort === 'count') return b.songs.length - a.songs.length;
        if (filter.sort === 'name') return a.instrument.name.localeCompare(b.instrument.name);
        if (filter.sort === 'category') return a.instrument.category.localeCompare(b.instrument.category) || a.instrument.order - b.instrument.order;
        return a.instrument.order - b.instrument.order;
      });

    return { grouped, sectionsMap };
  }, [instruments, songs, filter]);

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        eyebrow={`by instrument · ${instruments.length} tracked`}
        title="Instruments"
      />
      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-3">
        {grouped.length === 0 ? (
          <EmptyState
            icon={<Sliders size={28} />}
            title="No instruments"
            description="Instruments used in songs appear here."
          />
        ) : (
          <StaggerList>
            {grouped.map(({ instrument, songs: s }) => (
              <InstrumentGroup
                key={instrument.id}
                instrument={instrument}
                songs={s}
                sectionsMap={sectionsMap}
              />
            ))}
          </StaggerList>
        )}
      </div>
    </div>
  );
};
