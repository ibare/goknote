import type { Genre, InstrumentPreset, SectionPreset } from '../types';

export const GENRE_SEEDS: Omit<Genre, 'id' | 'createdAt'>[] = [
  { name: 'R&B / Soul', color: 'lavender', order: 0,  isPreset: true },
  { name: 'Funk',       color: 'peach',    order: 1,  isPreset: true },
  { name: 'Jazz',       color: 'sky',      order: 2,  isPreset: true },
  { name: 'Indie',      color: 'sage',     order: 3,  isPreset: true },
  { name: 'Folk',       color: 'butter',   order: 4,  isPreset: true },
  { name: 'Pop',        color: 'rose',     order: 5,  isPreset: true },
  { name: 'Rock',       color: 'slate',    order: 6,  isPreset: true },
  { name: 'Hip-hop',    color: 'lavender', order: 7,  isPreset: true },
  { name: 'Electronic', color: 'sky',      order: 8,  isPreset: true },
  { name: 'K-pop',      color: 'rose',     order: 9,  isPreset: true },
  { name: 'Ballad',     color: 'slate',    order: 10, isPreset: true },
  { name: 'Classical',  color: 'butter',   order: 11, isPreset: true },
];

export const SECTION_SEEDS: Omit<SectionPreset, 'id' | 'createdAt'>[] = [
  { name: 'Intro',       order: 0, isPreset: true },
  { name: 'Verse',       order: 1, isPreset: true },
  { name: 'Pre-Chorus',  order: 2, isPreset: true },
  { name: 'Chorus',      order: 3, isPreset: true },
  { name: 'Post-Chorus', order: 4, isPreset: true },
  { name: 'Bridge',      order: 5, isPreset: true },
  { name: 'Breakdown',   order: 6, isPreset: true },
  { name: 'Drop',        order: 7, isPreset: true },
  { name: 'Interlude',   order: 8, isPreset: true },
  { name: 'Outro',       order: 9, isPreset: true },
];

export const INSTRUMENT_SEEDS: Omit<InstrumentPreset, 'id' | 'createdAt'>[] = [
  { name: 'Drums',           category: 'Rhythm',   order: 0,  isPreset: true },
  { name: 'Percussion',      category: 'Rhythm',   order: 1,  isPreset: true },
  { name: 'Claps',           category: 'Rhythm',   order: 2,  isPreset: true },
  { name: 'Bass',            category: 'Bass',     order: 3,  isPreset: true },
  { name: 'Synth Bass',      category: 'Bass',     order: 4,  isPreset: true },
  { name: 'Sub',             category: 'Bass',     order: 5,  isPreset: true },
  { name: 'Rhodes',          category: 'Keyboard', order: 6,  isPreset: true },
  { name: 'Piano',           category: 'Keyboard', order: 7,  isPreset: true },
  { name: 'Organ',           category: 'Keyboard', order: 8,  isPreset: true },
  { name: 'Synth Lead',      category: 'Keyboard', order: 9,  isPreset: true },
  { name: 'Synth Pad',       category: 'Keyboard', order: 10, isPreset: true },
  { name: 'Acoustic Guitar', category: 'Strings',  order: 11, isPreset: true },
  { name: 'Electric Guitar', category: 'Strings',  order: 12, isPreset: true },
  { name: 'Strings',         category: 'Strings',  order: 13, isPreset: true },
  { name: 'Lead Vocal',      category: 'Vocal',    order: 14, isPreset: true },
  { name: 'BG Vocals',       category: 'Vocal',    order: 15, isPreset: true },
  { name: 'Harmony',         category: 'Vocal',    order: 16, isPreset: true },
  { name: 'Horns',           category: 'Brass',    order: 17, isPreset: true },
  { name: 'Saxophone',       category: 'Brass',    order: 18, isPreset: true },
  { name: 'Trumpet',         category: 'Brass',    order: 19, isPreset: true },
  { name: 'Sample',          category: 'Other',    order: 20, isPreset: true },
  { name: 'FX',              category: 'Other',    order: 21, isPreset: true },
];
