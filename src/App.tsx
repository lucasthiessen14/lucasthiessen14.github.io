import { useUiMode } from './context/UiModeContext';
import { useReveal } from './hooks/useReveal';
import { useScrollSpy } from './hooks/useScrollSpy';
import { ClassicSite } from './components/ClassicSite';
import { GameMode } from './components/game/GameMode';
import { Footer } from './components/layout/Footer';
import { Nav } from './components/layout/Nav';

export function App() {
  const { mode } = useUiMode();
  useReveal(mode === 'classic');
  useScrollSpy();

  return (
    <>
      <div className="scroll-progress" id="scroll-progress" aria-hidden="true" />
      <Nav />
      {mode === 'classic' && <ClassicSite />}
      <GameMode />
      {mode === 'classic' && <Footer />}
    </>
  );
}
