import { useEffect, useState, useCallback } from 'react';
import {
  collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs, query, orderBy
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { SectionPreset } from '../../types';
import { nanoid } from '../../lib/id';
import { SECTION_SEEDS } from '../../data/presets';

const toSectionPreset = (data: Record<string, unknown>, id: string): SectionPreset => ({
  id,
  name: (data.name as string) ?? '',
  order: (data.order as number) ?? 0,
  isPreset: (data.isPreset as boolean) ?? false,
  createdAt: (data.createdAt as number) ?? Date.now(),
});

export const useSectionPresets = () => {
  const [sectionPresets, setSectionPresets] = useState<SectionPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'sectionPresets'), orderBy('order'));
    const unsub = onSnapshot(q, async snap => {
      if (snap.empty) {
        const batch = writeBatch(db);
        const now = Date.now();
        SECTION_SEEDS.forEach(seed => {
          const id = nanoid();
          batch.set(doc(db, 'sectionPresets', id), { ...seed, id, createdAt: now });
        });
        await batch.commit();
        return;
      }
      setSectionPresets(snap.docs.map(d => toSectionPreset(d.data(), d.id)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addSectionPreset = useCallback(async (name: string) => {
    const id = nanoid();
    const order = sectionPresets.length;
    await setDoc(doc(db, 'sectionPresets', id), { id, name, order, isPreset: false, createdAt: Date.now() });
    return id;
  }, [sectionPresets.length]);

  const updateSectionPreset = useCallback(async (id: string, patch: Partial<Omit<SectionPreset, 'id'>>) => {
    await updateDoc(doc(db, 'sectionPresets', id), patch);
  }, []);

  const deleteSectionPreset = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'sectionPresets', id));
  }, []);

  const reorderSectionPresets = useCallback(async (ordered: SectionPreset[]) => {
    const batch = writeBatch(db);
    ordered.forEach((s, i) => batch.update(doc(db, 'sectionPresets', s.id), { order: i }));
    await batch.commit();
  }, []);

  const checkSectionInUse = useCallback(async (id: string): Promise<number> => {
    const snap = await getDocs(collection(db, 'songs'));
    let count = 0;
    snap.docs.forEach(d => {
      const sections = d.data().sections ?? [];
      sections.forEach((s: { presetId?: string }) => {
        if (s.presetId === id) count++;
      });
    });
    return count;
  }, []);

  return { sectionPresets, loading, addSectionPreset, updateSectionPreset, deleteSectionPreset, reorderSectionPresets, checkSectionInUse };
};
