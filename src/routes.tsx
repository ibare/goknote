import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { SongsTab } from './features/songs/SongsTab';
import { SongDetail } from './features/songs/SongDetail';
import { GenresTab } from './features/genres/GenresTab';
import { InstrumentsTab } from './features/instruments/InstrumentsTab';
import { SettingsTab } from './features/settings/SettingsTab';
import { InstrumentsManager } from './features/settings/InstrumentsManager';
import { GenresManager } from './features/settings/GenresManager';
import { SectionsManager } from './features/settings/SectionsManager';
import { ChangePasscode } from './features/settings/ChangePasscode';
import { PageTransition } from './components/motion/PageTransition';

interface AppRoutesProps {
  fabOpen: boolean;
  setFabOpen: (v: boolean) => void;
}

export const AppRoutes = ({ fabOpen, setFabOpen }: AppRoutesProps) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/songs" replace />} />
        <Route path="/songs" element={<PageTransition><SongsTab fabOpen={fabOpen} setFabOpen={setFabOpen} /></PageTransition>} />
        <Route path="/songs/:songId" element={<PageTransition sub><SongDetail /></PageTransition>} />
        <Route path="/genres" element={<PageTransition><GenresTab /></PageTransition>} />
        <Route path="/instruments" element={<PageTransition><InstrumentsTab /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><SettingsTab /></PageTransition>} />
        <Route path="/settings/instruments" element={<PageTransition sub><InstrumentsManager /></PageTransition>} />
        <Route path="/settings/genres" element={<PageTransition sub><GenresManager /></PageTransition>} />
        <Route path="/settings/sections" element={<PageTransition sub><SectionsManager /></PageTransition>} />
        <Route path="/settings/passcode" element={<PageTransition sub><ChangePasscode /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};
