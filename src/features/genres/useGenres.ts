import { useEffect, useState, useCallback } from 'react';
import {
  collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs, query, orderBy
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Genre } from '../../types';
import { nanoid } from '../../lib/id';
import { GENRE_SEEDS } from '../../data/presets';

const toGenre = (data: Record<string, unknown>, id: string): Genre => ({
  id,
  name: (data.name as string) ?? '',
  color: (data.color as Genre['color']) ?? 'slate',
  order: (data.order as number) ?? 0,
  isPreset: (data.isPreset as boolean) ?? false,
  createdAt: (data.createdAt as number) ?? Date.now(),
});

export const useGenres = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'genres'), orderBy('order'));
    const unsub = onSnapshot(q, async snap => {
      if (snap.empty) {
        const batch = writeBatch(db);
        const now = Date.now();
        GENRE_SEEDS.forEach(seed => {
          const id = nanoid();
          batch.set(doc(db, 'genres', id), { ...seed, id, createdAt: now });
        });
        await batch.commit();
        return;
      }
      setGenres(snap.docs.map(d => toGenre(d.data(), d.id)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addGenre = useCallback(async (payload: Omit<Genre, 'id' | 'createdAt'>) => {
    const id = nanoid();
    await setDoc(doc(db, 'genres', id), { ...payload, id, createdAt: Date.now() });
    return id;
  }, []);

  const updateGenre = useCallback(async (id: string, patch: Partial<Omit<Genre, 'id'>>) => {
    await updateDoc(doc(db, 'genres', id), patch);
  }, []);

  const deleteGenre = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'genres', id));
  }, []);

  const reorderGenres = useCallback(async (ordered: Genre[]) => {
    const batch = writeBatch(db);
    ordered.forEach((g, i) => batch.update(doc(db, 'genres', g.id), { order: i }));
    await batch.commit();
  }, []);

  const checkGenreInUse = useCallback(async (id: string): Promise<number> => {
    const snap = await getDocs(collection(db, 'songs'));
    return snap.docs.filter(d => d.data().genreId === id).length;
  }, []);

  return { genres, loading, addGenre, updateGenre, deleteGenre, reorderGenres, checkGenreInUse };
};
