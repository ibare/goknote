import { useState, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { sha256 } from '../../lib/hash';
import { useSessionStore } from '../../stores/session';
import type { AppMeta } from '../../types';

export type PasscodeMode = 'setup-enter' | 'setup-confirm' | 'unlock';

export const usePasscode = (mode: PasscodeMode, onSuccess: () => void) => {
  const [digits, setDigits] = useState<string[]>([]);
  const [pending, setPending] = useState('');
  const [shaking, setShaking] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const unlock = useSessionStore(s => s.unlock);

  const shake = useCallback(() => {
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
      setDigits([]);
    }, 500);
  }, []);

  const handleDigit = useCallback(async (d: string) => {
    if (digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);

    if (next.length < 4) return;

    const code = next.join('');

    if (currentMode === 'setup-enter') {
      setPending(code);
      setTimeout(() => {
        setDigits([]);
        setCurrentMode('setup-confirm');
      }, 120);
      return;
    }

    if (currentMode === 'setup-confirm') {
      if (code !== pending) {
        shake();
        setTimeout(() => setCurrentMode('setup-enter'), 500);
        return;
      }
      const hash = await sha256(code);
      const meta: AppMeta = { passcodeHash: hash, createdAt: Date.now(), version: 1 };
      await setDoc(doc(db, 'meta', 'app'), meta);
      unlock();
      onSuccess();
      return;
    }

    if (currentMode === 'unlock') {
      const snap = await getDoc(doc(db, 'meta', 'app'));
      if (!snap.exists()) { shake(); return; }
      const meta = snap.data() as AppMeta;
      const hash = await sha256(code);
      if (hash !== meta.passcodeHash) { shake(); return; }
      unlock();
      onSuccess();
    }
  }, [digits, currentMode, pending, shake, unlock, onSuccess]);

  const handleDelete = useCallback(() => {
    setDigits(d => d.slice(0, -1));
  }, []);

  return { digits, shaking, currentMode, handleDigit, handleDelete };
};
