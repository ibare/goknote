import { useNavigate } from 'react-router-dom';
import { PasscodeDots } from './PasscodeDots';
import { PasscodePad } from './PasscodePad';
import { usePasscode } from './usePasscode';
import type { PasscodeMode } from './usePasscode';

interface PasscodeScreenProps {
  mode: PasscodeMode;
}

const labels: Record<PasscodeMode, { eyebrow: string; title: string }> = {
  'setup-enter':   { eyebrow: 'set a passcode',   title: 'Create Passcode' },
  'setup-confirm': { eyebrow: 'confirm passcode',  title: 'Confirm Passcode' },
  'unlock':        { eyebrow: 'enter passcode',    title: 'Unlock' },
};

export const PasscodeScreen = ({ mode }: PasscodeScreenProps) => {
  const navigate = useNavigate();
  const { digits, shaking, currentMode, handleDigit, handleDelete } = usePasscode(
    mode,
    () => navigate('/songs', { replace: true })
  );

  const { eyebrow, title } = labels[currentMode];

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-8 safe-top">
      <div className="w-full max-w-[320px] flex flex-col items-center gap-10">
        <div className="text-center">
          <p className="text-[12px] text-ink-3 italic tracking-[0.03em] mb-2">{eyebrow}</p>
          <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
        </div>
        <PasscodeDots count={digits.length} shaking={shaking} />
        <PasscodePad onDigit={handleDigit} onDelete={handleDelete} />
      </div>
    </div>
  );
};
