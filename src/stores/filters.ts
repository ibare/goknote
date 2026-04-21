import { create } from 'zustand';

interface SongFilter {
  search: string;
  sort: 'recent' | 'title' | 'artist' | 'created';
  genreIds: string[];
  instrumentIds: string[];
}

interface GenreFilter {
  sort: 'count' | 'name' | 'order';
  showEmpty: boolean;
}

interface InstrumentFilter {
  sort: 'count' | 'name' | 'order' | 'category';
  showEmpty: boolean;
}

interface FilterState {
  songs: SongFilter;
  genres: GenreFilter;
  instruments: InstrumentFilter;
  setSongFilter: (patch: Partial<SongFilter>) => void;
  setGenreFilter: (patch: Partial<GenreFilter>) => void;
  setInstrumentFilter: (patch: Partial<InstrumentFilter>) => void;
  resetSongFilter: () => void;
}

const defaultSongs: SongFilter = {
  search: '',
  sort: 'recent',
  genreIds: [],
  instrumentIds: [],
};

export const useFilterStore = create<FilterState>(set => ({
  songs: defaultSongs,
  genres: { sort: 'order', showEmpty: false },
  instruments: { sort: 'category', showEmpty: false },
  setSongFilter: patch => set(s => ({ songs: { ...s.songs, ...patch } })),
  setGenreFilter: patch => set(s => ({ genres: { ...s.genres, ...patch } })),
  setInstrumentFilter: patch => set(s => ({ instruments: { ...s.instruments, ...patch } })),
  resetSongFilter: () => set({ songs: defaultSongs }),
}));
