import { create } from 'zustand';

interface SessionState {
  unlocked: boolean;
  unlock: () => void;
  lock: () => void;
}

const SESSION_KEY = 'goknote.unlocked';

export const useSessionStore = create<SessionState>(() => ({
  unlocked: sessionStorage.getItem(SESSION_KEY) === '1',
  unlock: () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    useSessionStore.setState({ unlocked: true });
  },
  lock: () => {
    sessionStorage.removeItem(SESSION_KEY);
    useSessionStore.setState({ unlocked: false });
  },
}));
