import { useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { sha256 } from '../../lib/hash';
import { AppHeader } from '../../components/ui/AppHeader';
import { PasscodeDots } from '../auth/PasscodeDots';
import { PasscodePad } from '../auth/PasscodePad';
import type { AppMeta } from '../../types';
import { useNavigate } from 'react-router-dom';

type Step = 'current' | 'new' | 'confirm';

const STEP_LABELS: Record<Step, { eyebrow: string; title: string }> = {
  current: { eyebrow: 'verify current',  title: 'Current Passcode' },
  new:     { eyebrow: 'set new',         title: 'New Passcode' },
  confirm: { eyebrow: 'confirm new',     title: 'Confirm Passcode' },
};

export const ChangePasscode = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('current');
  const [digits, setDigits] = useState<string[]>([]);
  const [newCode, setNewCode] = useState('');
  const [shaking, setShaking] = useState(false);

  const shake = () => {
    setShaking(true);
    setTimeout(() => { setShaking(false); setDigits([]); }, 500);
  };

  const handleDigit = async (d: string) => {
    if (digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);
    if (next.length < 4) return;
    const code = next.join('');

    if (step === 'current') {
      const snap = await getDoc(doc(db, 'meta', 'app'));
      if (!snap.exists()) { shake(); return; }
      const meta = snap.data() as AppMeta;
      const hash = await sha256(code);
      if (hash !== meta.passcodeHash) { shake(); return; }
      setTimeout(() => { setDigits([]); setStep('new'); }, 120);
      return;
    }

    if (step === 'new') {
      setNewCode(code);
      setTimeout(() => { setDigits([]); setStep('confirm'); }, 120);
      return;
    }

    if (step === 'confirm') {
      if (code !== newCode) { shake(); setTimeout(() => setStep('new'), 500); return; }
      const hash = await sha256(code);
      await updateDoc(doc(db, 'meta', 'app'), { passcodeHash: hash });
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader title={STEP_LABELS[step].title} leading="back" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-10">
        <p className="text-[12px] text-ink-3 italic">{STEP_LABELS[step].eyebrow}</p>
        <PasscodeDots count={digits.length} shaking={shaking} />
        <PasscodePad onDigit={handleDigit} onDelete={() => setDigits(d => d.slice(0, -1))} />
      </div>
    </div>
  );
};
