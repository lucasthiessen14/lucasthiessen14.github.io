import { useUiMode } from './context/UiModeContext';
import { useGameThemeSync } from './hooks/useGameThemeSync';
import { useReveal } from './hooks/useReveal';
import { useScrollSpy } from './hooks/useScrollSpy';
import { DeckView } from './components/deck/DeckView';
import { ClassicSite } from './components/ClassicSite';
import { GameMode } from './components/game/GameMode';
import { IdeView } from './components/ide/IdeView';
import { LogView } from './components/log/LogView';
import { Footer } from './components/layout/Footer';
import { Nav } from './components/layout/Nav';
import { PlainSite } from './components/plain/PlainSite';
import { ShellView } from './components/shell/ShellView';
import { ViewUnlockModal } from './components/ViewUnlockModal';
import { isClassicView } from './utils/viewModes';

export function App() {
  const { mode } = useUiMode();
  useGameThemeSync();
  useReveal(isClassicView(mode));
  useScrollSpy();

  const showModernChrome = isClassicView(mode);

  return (
    <>
      {showModernChrome && (
        <div className="scroll-progress" id="scroll-progress" aria-hidden="true" />
      )}
      {showModernChrome && <Nav />}
      {mode === 'classic' && (
        <>
          <ClassicSite />
          <Footer />
        </>
      )}
      {mode === 'plain' && <PlainSite />}
      {mode === 'shell' && <ShellView />}
      {mode === 'log' && <LogView />}
      {mode === 'deck' && <DeckView />}
      {mode === 'ide' && <IdeView />}
      <GameMode />
      <ViewUnlockModal />
    </>
  );
}
