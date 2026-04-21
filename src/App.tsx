import { useEffect, useState } from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, ensureAuth } from './lib/firebase';
import { useSessionStore } from './stores/session';
import { PasscodeScreen } from './features/auth/PasscodeScreen';
import { TabBar } from './components/ui/TabBar';
import { AppRoutes } from './routes';

type AppState = 'loading' | 'setup' | 'locked' | 'unlocked';

const SUB_ROUTES = ['/songs/', '/settings/'];

const AppInner = () => {
  const [appState, setAppState] = useState<AppState>('loading');
  const [fabOpen, setFabOpen] = useState(false);
  const { unlocked, unlock } = useSessionStore();
  const location = useLocation();

  const isSubRoute = SUB_ROUTES.some(r => location.pathname.startsWith(r));

  useEffect(() => {
    let unsubFirestore: (() => void) | undefined;
    ensureAuth().then(() => {
      unsubFirestore = onSnapshot(doc(db, 'meta', 'app'), snap => {
        if (!snap.exists()) {
          setAppState('setup');
          return;
        }
        const isSession = sessionStorage.getItem('goknote.unlocked') === '1';
        if (isSession) { unlock(); setAppState('unlocked'); }
        else setAppState('locked');
      });
    });
    return () => unsubFirestore?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (unlocked && (appState === 'locked' || appState === 'setup')) setAppState('unlocked');
  }, [unlocked, appState]);

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-ink-4 border-t-ink animate-spin" />
      </div>
    );
  }

  if (appState === 'setup') return <PasscodeScreen mode="setup-enter" />;
  if (appState === 'locked') return <PasscodeScreen mode="unlock" />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <AppRoutes fabOpen={fabOpen} setFabOpen={setFabOpen} />
      </div>
      {!isSubRoute && <TabBar onFabClick={() => setFabOpen(v => !v)} fabOpen={fabOpen} />}
    </div>
  );
};

const App = () => (
  <HashRouter>
    <AppInner />
  </HashRouter>
);

export default App;
