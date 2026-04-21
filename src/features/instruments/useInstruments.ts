import { useEffect, useState, useCallback } from 'react';
import {
  collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs, query, orderBy
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { InstrumentPreset } from '../../types';
import { nanoid } from '../../lib/id';
import { INSTRUMENT_SEEDS } from '../../data/presets';

const toInstrument = (data: Record<string, unknown>, id: string): InstrumentPreset => ({
  id,
  name: (data.name as string) ?? '',
  category: (data.category as InstrumentPreset['category']) ?? 'Other',
  order: (data.order as number) ?? 0,
  isPreset: (data.isPreset as boolean) ?? false,
  createdAt: (data.createdAt as number) ?? Date.now(),
});

export const useInstruments = () => {
  const [instruments, setInstruments] = useState<InstrumentPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'instruments'), orderBy('order'));
    const unsub = onSnapshot(q, async snap => {
      if (snap.empty) {
        const batch = writeBatch(db);
        const now = Date.now();
        INSTRUMENT_SEEDS.forEach(seed => {
          const id = nanoid();
          batch.set(doc(db, 'instruments', id), { ...seed, id, createdAt: now });
        });
        await batch.commit();
        return;
      }
      setInstruments(snap.docs.map(d => toInstrument(d.data(), d.id)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addInstrument = useCallback(async (payload: Omit<InstrumentPreset, 'id' | 'createdAt'>) => {
    const id = nanoid();
    await setDoc(doc(db, 'instruments', id), { ...payload, id, createdAt: Date.now() });
    return id;
  }, []);

  const updateInstrument = useCallback(async (id: string, patch: Partial<Omit<InstrumentPreset, 'id'>>) => {
    await updateDoc(doc(db, 'instruments', id), patch);
  }, []);

  const deleteInstrument = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'instruments', id));
  }, []);

  const reorderInstruments = useCallback(async (ordered: InstrumentPreset[]) => {
    const batch = writeBatch(db);
    ordered.forEach((inst, i) => batch.update(doc(db, 'instruments', inst.id), { order: i }));
    await batch.commit();
  }, []);

  const checkInstrumentInUse = useCallback(async (id: string): Promise<number> => {
    const snap = await getDocs(collection(db, 'songs'));
    let count = 0;
    snap.docs.forEach(d => {
      const song = d.data();
      const sections = song.sections ?? [];
      sections.forEach((s: { channels: { presetId?: string }[] }) => {
        s.channels?.forEach((c: { presetId?: string }) => {
          if (c.presetId === id) count++;
        });
      });
    });
    return count;
  }, []);

  return { instruments, loading, addInstrument, updateInstrument, deleteInstrument, reorderInstruments, checkInstrumentInUse };
};
