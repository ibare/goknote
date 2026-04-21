export type GenreColorKey =
  | 'lavender' | 'sage' | 'peach' | 'sky' | 'rose' | 'butter' | 'slate';

export type InstrumentCategory =
  | 'Rhythm' | 'Bass' | 'Keyboard' | 'Strings' | 'Vocal' | 'Brass' | 'Other';

export interface Genre {
  id: string;
  name: string;
  color: GenreColorKey;
  order: number;
  isPreset: boolean;
  createdAt: number;
}

export interface InstrumentPreset {
  id: string;
  name: string;
  category: InstrumentCategory;
  order: number;
  isPreset: boolean;
  createdAt: number;
}

export interface SectionPreset {
  id: string;
  name: string;
  order: number;
  isPreset: boolean;
  createdAt: number;
}

export interface Channel {
  id: string;
  presetId?: string;
  name: string;
  category?: InstrumentCategory;
  note: string;
  order: number;
}

export interface Section {
  id: string;
  presetId?: string;
  name: string;
  note: string;
  order: number;
  channels: Channel[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genreId: string;
  note: string;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}

export interface AppMeta {
  passcodeHash: string;
  createdAt: number;
  version: number;
}
