import { useEffect, useState, useCallback } from 'react';
import {
  collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, orderBy
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Song } from '../../types';
import { nanoid } from '../../lib/id';

const toSong = (data: Record<string, unknown>, id: string): Song => ({
  id,
  title: (data.title as string) ?? '',
  artist: (data.artist as string) ?? '',
  genreId: (data.genreId as string) ?? '',
  note: (data.note as string) ?? '',
  sections: (data.sections as Song['sections']) ?? [],
  createdAt: (data.createdAt as number) ?? Date.now(),
  updatedAt: (data.updatedAt as number) ?? Date.now(),
});

export const useSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'songs'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setSongs(snap.docs.map(d => toSong(d.data(), d.id)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addSong = useCallback(async (payload: Omit<Song, 'id' | 'createdAt' | 'updatedAt' | 'sections'>) => {
    const id = nanoid();
    const now = Date.now();
    const song: Song = { ...payload, id, sections: [], createdAt: now, updatedAt: now };
    await setDoc(doc(db, 'songs', id), song);
    return id;
  }, []);

  const updateSong = useCallback(async (id: string, patch: Partial<Omit<Song, 'id'>>) => {
    await updateDoc(doc(db, 'songs', id), { ...patch, updatedAt: Date.now() });
  }, []);

  const deleteSong = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'songs', id));
  }, []);

  return { songs, loading, addSong, updateSong, deleteSong };
};
