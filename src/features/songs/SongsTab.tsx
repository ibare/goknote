import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FunnelSimple, CaretDown } from '@phosphor-icons/react';
import { AppHeader } from '../../components/ui/AppHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { IconButton } from '../../components/ui/IconButton';
import { Pill } from '../../components/ui/Pill';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { SongCard } from './SongCard';
import { AddSongSheet } from './AddSongSheet';
import { SongFilterSheet } from './SongFilterSheet';
import { StaggerList } from '../../components/motion/StaggerList';
import { useSongs } from './useSongs';
import { useGenres } from '../genres/useGenres';
import { useInstruments } from '../instruments/useInstruments';
import { useFilterStore } from '../../stores/filters';
import type { Song } from '../../types';

interface SongsTabProps {
  fabOpen: boolean;
  setFabOpen: (v: boolean) => void;
}

const SORT_LABELS: Record<string, string> = {
  recent: 'Last edited',
  title: 'Title',
  artist: 'Artist',
  created: 'Date added',
};

export const SongsTab = ({ fabOpen, setFabOpen }: SongsTabProps) => {
  const navigate = useNavigate();
  const { songs, addSong, deleteSong } = useSongs();
  const { genres } = useGenres();
  const { instruments } = useInstruments();
  const { songs: filter, setSongFilter, resetSongFilter } = useFilterStore();

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Song | null>(null);
  const [actionTarget, setActionTarget] = useState<Song | null>(null);

  const genreMap = useMemo(() => Object.fromEntries(genres.map(g => [g.id, g])), [genres]);

  const filtered = useMemo(() => {
    let list = [...songs];
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
    }
    if (filter.genreIds.length) list = list.filter(s => filter.genreIds.includes(s.genreId));
    if (filter.instrumentIds.length) {
      list = list.filter(s =>
        filter.instrumentIds.every(iid =>
          s.sections.some(sec => sec.channels.some(ch => ch.presetId === iid))
        )
      );
    }
    switch (filter.sort) {
      case 'title':   list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'artist':  list.sort((a, b) => a.artist.localeCompare(b.artist)); break;
      case 'created': list.sort((a, b) => b.createdAt - a.createdAt); break;
      default:        list.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return list;
  }, [songs, filter]);

  const handleAddSong = async (payload: Parameters<typeof addSong>[0]) => {
    const id = await addSong(payload);
    navigate(`/songs/${id}`);
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        eyebrow={`library · ${songs.length} song${songs.length !== 1 ? 's' : ''}`}
        title="Songs"
        trailing={
          <IconButton
            icon={<FunnelSimple size={20} />}
            onClick={() => setFilterOpen(true)}
            label="Filter songs"
            variant="cream"
          />
        }
      />

      <div className="px-5 pt-2 pb-3 flex flex-col gap-3">
        <SearchBar
          value={filter.search}
          onChange={v => setSongFilter({ search: v })}
          placeholder="Search songs, artists…"
        />
        <Pill
          label={<span className="flex items-center gap-1">{SORT_LABELS[filter.sort]} <CaretDown size={14} /></span>}
          onClick={() => setSortOpen(true)}
          small
        />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {filtered.length === 0 ? (
          <EmptyState
            title="No songs yet"
            description="Add your first song to get started."
            action={{ label: 'Add Song', onClick: () => setFabOpen(true) }}
          />
        ) : (
          <StaggerList className="flex flex-col gap-3">
            {filtered.map(song => (
              <SongCard
                key={song.id}
                song={song}
                genre={genreMap[song.genreId]}
                onLongPress={() => setActionTarget(song)}
              />
            ))}
          </StaggerList>
        )}
      </div>

      <AddSongSheet
        open={fabOpen}
        onClose={() => setFabOpen(false)}
        genres={genres}
        onSave={handleAddSong}
      />

      <SongFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        sort={filter.sort}
        genreIds={filter.genreIds}
        instrumentIds={filter.instrumentIds}
        genres={genres}
        instruments={instruments}
        onApply={(sort, genreIds, instrumentIds) => setSongFilter({ sort, genreIds, instrumentIds })}
        onReset={resetSongFilter}
      />

      <BottomSheet open={!!actionTarget} onClose={() => setActionTarget(null)}>
        <div className="px-5 py-3">
          <button
            className="w-full text-left py-4 text-[15px] border-b border-line"
            onClick={() => {
              if (actionTarget) navigate(`/songs/${actionTarget.id}`);
              setActionTarget(null);
            }}
          >
            Edit
          </button>
          <button
            className="w-full text-left py-4 text-[15px] text-red-500"
            onClick={() => { setDeleteTarget(actionTarget); setActionTarget(null); }}
          >
            Delete
          </button>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete song"
        description={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={async () => { if (deleteTarget) await deleteSong(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />

      <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        <div className="px-5 py-2">
          {Object.entries(SORT_LABELS).map(([val, label]) => (
            <button
              key={val}
              className={`w-full text-left py-4 text-[15px] border-b border-line last:border-0 ${filter.sort === val ? 'font-semibold' : ''}`}
              onClick={() => { setSongFilter({ sort: val as typeof filter.sort }); setSortOpen(false); }}
            >
              {label}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};
