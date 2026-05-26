import CloseIcon from '@mui/icons-material/Close';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useUiMode } from '../../context/UiModeContext';
import { SECTION_LABELS, SECTION_SHORT, type SectionId } from '../../types/sections';
import {
  CELL_SIZE,
  SECTION_COUNT,
  VISION_RADIUS,
} from '../../game/mazeLogic';
import { scrollToSection } from '../../utils/scroll';
import { SectionPanel } from '../sections/SectionPanel';
import { SectionMarkerIcon } from './SectionMarkerIcon';
import {
  buildMaze,
  cellKey,
  directionFromKey,
  directionsEqual,
  getCameraWithPan,
  getMoveInterval,
  isWall,
  type CellPos,
  type MazeGrid,
  type PanOffset,
  type SectionCells,
} from '../../game/mazeLogic';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type CellEntry = {
  row: number;
  col: number;
  sectionId: SectionId | null;
};

export function GameMode() {
  const { mode, setMode } = useUiMode();
  const viewportRef = useRef<HTMLDivElement>(null);
  const mazeWorldRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const [maze, setMaze] = useState<MazeGrid>([]);
  const [sectionCells, setSectionCells] = useState<SectionCells>({});
  const [player, setPlayer] = useState<CellPos>({ row: 1, col: 1 });
  const playerRef = useRef(player);
  playerRef.current = player;
  const [explored, setExplored] = useState<Set<string>>(() => new Set(['1,1']));
  const [visited, setVisited] = useState<Set<SectionId>>(() => new Set());
  const [found, setFound] = useState<Set<SectionId>>(() => new Set());
  const [pendingSectionId, setPendingSectionId] = useState<SectionId | null>(null);
  const [modalSectionId, setModalSectionId] = useState<SectionId | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [lastClassicSection, setLastClassicSection] = useState<SectionId>('hero');

  const keysDownRef = useRef<Record<string, boolean>>({});
  const heldDirRef = useRef<{ dr: number; dc: number } | null>(null);
  const holdStartedAtRef = useRef(0);
  const moveLoopActiveRef = useRef(false);
  const moveLoopIdRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef(0);
  const blockedByWallRef = useRef(false);
  const focusBeforeModalRef = useRef<HTMLElement | null>(null);
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });
  const panRef = useRef(panOffset);
  panRef.current = panOffset;
  const isPanningRef = useRef(false);
  const wheelPanEndRef = useRef<number | null>(null);
  const panDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const regenerateMaze = useCallback(() => {
    const { maze: newMaze, sectionCells: cells, startPos } = buildMaze(
      viewportRef.current,
    );
    setMaze(newMaze);
    setSectionCells(cells);
    setPlayer(startPos);
    setExplored(new Set([cellKey(startPos.row, startPos.col)]));
    setVisited(new Set());
    setFound(new Set());
    setPendingSectionId(null);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const getPendingFromPlayer = useCallback(
    (pos: CellPos): SectionId | null => {
      return sectionCells[cellKey(pos.row, pos.col)] ?? null;
    },
    [sectionCells],
  );

  const updatePrompt = useCallback(
    (pos: CellPos, open: boolean) => {
      const pending = getPendingFromPlayer(pos);
      setPendingSectionId(pending);
      if (pending && !open) {
        setFound((prev) => new Set(prev).add(pending));
      }
    },
    [getPendingFromPlayer],
  );

  const snapAvatarPosition = useCallback(() => {
    if (prefersReducedMotion || !avatarRef.current || !mazeWorldRef.current) return;
    const avatar = avatarRef.current;
    const world = mazeWorldRef.current;
    avatar.style.transition = 'none';
    world.style.transition = 'none';
    const cam = getCameraWithPan(maze, playerRef.current, viewportRef.current, panRef.current);
    world.style.transform = `translate(${cam.offsetX}px, ${cam.offsetY}px)`;
    avatar.style.left = `${cam.playerX}px`;
    avatar.style.top = `${cam.playerY}px`;
    requestAnimationFrame(() => {
      avatar.style.transition = '';
      world.style.transition = '';
    });
  }, [maze]);

  const applyMoveTransition = useCallback((ms: number) => {
    if (prefersReducedMotion || !avatarRef.current) return;
    const duration = `${ms}ms`;
    avatarRef.current.style.transitionDuration = duration;
    avatarRef.current.style.transitionTimingFunction = 'cubic-bezier(0.22, 1, 0.36, 1)';
    if (mazeWorldRef.current) {
      mazeWorldRef.current.style.transitionDuration = duration;
      mazeWorldRef.current.style.transitionTimingFunction = 'cubic-bezier(0.22, 1, 0.36, 1)';
    }
  }, []);

  const positionView = useCallback((pos: CellPos, m: MazeGrid, pan: PanOffset) => {
    if (!avatarRef.current || !mazeWorldRef.current || m.length === 0) return;
    const cam = getCameraWithPan(m, pos, viewportRef.current, pan);
    panRef.current = cam.pan;

    const world = mazeWorldRef.current;
    const avatar = avatarRef.current;
    if (isPanningRef.current) {
      world.style.transition = 'none';
      avatar.style.transition = 'none';
    }
    world.style.transform = `translate(${cam.offsetX}px, ${cam.offsetY}px)`;
    avatar.style.left = `${cam.playerX}px`;
    avatar.style.top = `${cam.playerY}px`;
  }, []);

  const disablePanTransitions = useCallback(() => {
    if (!mazeWorldRef.current || !avatarRef.current) return;
    mazeWorldRef.current.style.transition = 'none';
    avatarRef.current.style.transition = 'none';
  }, []);

  const applyPan = useCallback(
    (nextPan: PanOffset) => {
      positionView(playerRef.current, maze, nextPan);
      setPanOffset({ ...panRef.current });
    },
    [maze, positionView],
  );

  const tryMove = useCallback(
    (dr: number, dc: number): boolean => {
      if (mode !== 'game' || modalOpen) return false;

      const p = playerRef.current;
      const nr = p.row + dr;
      const nc = p.col + dc;
      if (isWall(maze, nr, nc)) {
        avatarRef.current?.classList.remove('is-walking');
        if (!blockedByWallRef.current) {
          blockedByWallRef.current = true;
          snapAvatarPosition();
        }
        return false;
      }

      blockedByWallRef.current = false;
      const interval = prefersReducedMotion
        ? 50
        : getMoveInterval(holdStartedAtRef.current);
      applyMoveTransition(interval);

      const next = { row: nr, col: nc };
      setPlayer(next);
      setExplored((prev) => new Set(prev).add(cellKey(nr, nc)));
      avatarRef.current?.classList.add('is-walking');
      return true;
    },
    [mode, modalOpen, maze, applyMoveTransition, snapAvatarPosition],
  );

  const stopMoveLoop = useCallback(() => {
    moveLoopActiveRef.current = false;
    holdStartedAtRef.current = 0;
    lastMoveTimeRef.current = 0;
    blockedByWallRef.current = false;
    if (moveLoopIdRef.current) {
      cancelAnimationFrame(moveLoopIdRef.current);
      moveLoopIdRef.current = null;
    }
    avatarRef.current?.classList.remove('is-walking');
  }, []);

  const startMoveLoop = useCallback(() => {
    if (moveLoopActiveRef.current || !heldDirRef.current) return;
    moveLoopActiveRef.current = true;
    lastMoveTimeRef.current = 0;

    const tick = (now: number) => {
      if (!moveLoopActiveRef.current || !heldDirRef.current || modalOpen || mode !== 'game') {
        stopMoveLoop();
        return;
      }
      const interval = prefersReducedMotion ? 50 : getMoveInterval(holdStartedAtRef.current);
      if (!lastMoveTimeRef.current) lastMoveTimeRef.current = now;
      if (now - lastMoveTimeRef.current >= interval) {
        tryMove(heldDirRef.current.dr, heldDirRef.current.dc);
        lastMoveTimeRef.current = now;
      }
      moveLoopIdRef.current = requestAnimationFrame(tick);
    };
    moveLoopIdRef.current = requestAnimationFrame(tick);
  }, [modalOpen, mode, stopMoveLoop, tryMove]);

  const beginHeldMove = useCallback(
    (key: string) => {
      const dir = directionFromKey(key);
      if (!dir) return false;
      const dirChanged = !directionsEqual(heldDirRef.current, dir);
      keysDownRef.current[key] = true;
      heldDirRef.current = dir;
      if (dirChanged) {
        holdStartedAtRef.current = performance.now();
        blockedByWallRef.current = false;
      }
      if (!moveLoopActiveRef.current) {
        tryMove(dir.dr, dir.dc);
        startMoveLoop();
      }
      return true;
    },
    [startMoveLoop, tryMove],
  );

  const openSectionModal = useCallback(
    (sectionId: SectionId) => {
      focusBeforeModalRef.current = document.activeElement as HTMLElement;
      setLastClassicSection(sectionId);
      setVisited((prev) => new Set(prev).add(sectionId));
      setFound((prev) => new Set(prev).add(sectionId));
      setModalSectionId(sectionId);
      setModalOpen(true);
      stopMoveLoop();
    },
    [stopMoveLoop],
  );

  const closeSectionModal = useCallback(() => {
    setModalOpen(false);
    window.setTimeout(() => {
      setModalSectionId(null);
      focusBeforeModalRef.current?.focus();
      viewportRef.current?.focus();
    }, prefersReducedMotion ? 0 : 260);
  }, []);

  useEffect(() => {
    positionView(player, maze, panOffset);
    if (panRef.current.x !== panOffset.x || panRef.current.y !== panOffset.y) {
      setPanOffset({ ...panRef.current });
    }
    updatePrompt(player, modalOpen);
  }, [player, maze, panOffset, modalOpen, positionView, updatePrompt]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || mode !== 'game') return;

    const onWheel = (e: WheelEvent) => {
      if (modalOpen) return;
      e.preventDefault();
      disablePanTransitions();
      applyPan({
        x: panRef.current.x - e.deltaX,
        y: panRef.current.y - e.deltaY,
      });
      if (wheelPanEndRef.current !== null) {
        window.clearTimeout(wheelPanEndRef.current);
      }
      wheelPanEndRef.current = window.setTimeout(() => {
        wheelPanEndRef.current = null;
        if (mazeWorldRef.current) mazeWorldRef.current.style.transition = '';
        if (avatarRef.current) avatarRef.current.style.transition = '';
      }, 120);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelPanEndRef.current !== null) {
        window.clearTimeout(wheelPanEndRef.current);
      }
    };
  }, [mode, modalOpen, applyPan, disablePanTransitions]);

  const onMapPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (modalOpen || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.game-mode__dpad, .game-mode__prompt')) return;

    isPanningRef.current = true;
    panDragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add('is-panning');
  };

  const onMapPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = panDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    disablePanTransitions();
    applyPan({ x: drag.panX + dx, y: drag.panY + dy });
  };

  const endMapPan = (target: HTMLDivElement, pointerId: number) => {
    if (panDragRef.current?.pointerId === pointerId) {
      panDragRef.current = null;
      setPanOffset(panRef.current);
    }
    isPanningRef.current = false;
    target.classList.remove('is-panning');
    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  };

  const onMapDoubleClick = () => {
    setPanOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!modalOpen) return;
    requestAnimationFrame(() => {
      document
        .querySelectorAll('.game-mode__modal-body .reveal')
        .forEach((el) => el.classList.add('is-visible'));
    });
  }, [modalOpen, modalSectionId]);

  useEffect(() => {
    if (mode === 'game') {
      document.body.classList.add('game-active');
      requestAnimationFrame(() => {
        regenerateMaze();
        requestAnimationFrame(() => viewportRef.current?.focus());
      });
    } else {
      document.body.classList.remove('game-active');
      stopMoveLoop();
      keysDownRef.current = {};
      heldDirRef.current = null;
      closeSectionModal();
      scrollToSection(lastClassicSection);
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onResize = () => {
      if (mode === 'game') positionView(player, maze, panRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mode, player, maze, positionView]);

  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (mode !== 'game') return;
      if (e.key === 'Escape' && modalOpen) {
        e.preventDefault();
        closeSectionModal();
        return;
      }
      if (modalOpen) return;
      if ((e.key === 'Enter' || e.key === ' ') && pendingSectionId) {
        e.preventDefault();
        openSectionModal(pendingSectionId);
        return;
      }
      if (beginHeldMove(e.key)) e.preventDefault();
    };

    const onKeyUp = (e: globalThis.KeyboardEvent) => {
      if (mode !== 'game') return;
      if (!directionFromKey(e.key)) return;
      delete keysDownRef.current[e.key];
      const prev = heldDirRef.current;
      const priority = ['ArrowUp', 'w', 'W', 'ArrowDown', 's', 'S', 'ArrowLeft', 'a', 'A', 'ArrowRight', 'd', 'D'];
      heldDirRef.current = null;
      for (const k of priority) {
        if (keysDownRef.current[k]) {
          heldDirRef.current = directionFromKey(k);
          break;
        }
      }
      if (!heldDirRef.current) {
        stopMoveLoop();
      } else if (!directionsEqual(prev, heldDirRef.current)) {
        holdStartedAtRef.current = performance.now();
        lastMoveTimeRef.current = 0;
        blockedByWallRef.current = false;
      }
    };

    const onBlur = () => {
      keysDownRef.current = {};
      stopMoveLoop();
      heldDirRef.current = null;
    };

    document.addEventListener('keydown', onKeyDown as unknown as EventListener);
    document.addEventListener('keyup', onKeyUp as unknown as EventListener);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('keydown', onKeyDown as unknown as EventListener);
      document.removeEventListener('keyup', onKeyUp as unknown as EventListener);
      window.removeEventListener('blur', onBlur);
    };
  }, [
    mode,
    modalOpen,
    pendingSectionId,
    beginHeldMove,
    stopMoveLoop,
    closeSectionModal,
    openSectionModal,
  ]);

  if (mode !== 'game') return null;

  const mazeReady = maze.length > 0 && (maze[0]?.length ?? 0) > 0;
  const cols = maze[0]?.length ?? 0;
  const rows = maze.length;
  const cells: CellEntry[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        row: r,
        col: c,
        sectionId: sectionCells[cellKey(r, c)] ?? null,
      });
    }
  }

  const mazeStyle: CSSProperties = {
    gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
    gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
    width: cols * CELL_SIZE,
    height: rows * CELL_SIZE,
  };

  return (
    <div className="game-mode" aria-hidden={false}>
      <div className="game-mode__hud">
        <div className="game-mode__hud-left">
          <h2 className="game-mode__title">Lucas&apos;s World</h2>
          <p className="game-mode__progress" aria-live="polite">
            {visited.size} / {SECTION_COUNT} discovered
          </p>
        </div>
        <p className="game-mode__hint">
          WASD or arrows to move · Drag or scroll to pan · Double-click map to recenter
        </p>
        <button type="button" className="btn btn--ghost game-mode__exit" onClick={() => setMode('classic')}>
          Exit to Classic
        </button>
      </div>

      <div
        className="game-mode__viewport"
        ref={viewportRef}
        tabIndex={0}
        aria-label="Resume maze — use arrow keys or WASD to move"
      >
        <div
          className="game-mode__map-wrap game-mode__map-wrap--pannable"
          onPointerDown={onMapPointerDown}
          onPointerMove={onMapPointerMove}
          onPointerUp={(e) => endMapPan(e.currentTarget, e.pointerId)}
          onPointerCancel={(e) => endMapPan(e.currentTarget, e.pointerId)}
          onDoubleClick={onMapDoubleClick}
        >
          {!mazeReady && (
            <p className="game-mode__loading" aria-live="polite">
              Generating map…
            </p>
          )}
          <div className="game-mode__maze-world" ref={mazeWorldRef}>
            <div className="game-mode__maze" style={mazeStyle} role="img" aria-label="Maze map">
              {cells.map(({ row, col, sectionId }) => {
                const key = cellKey(row, col);
                const dist = Math.hypot(row - player.row, col - player.col);
                const isVisible = dist <= VISION_RADIUS;
                const isExplored = explored.has(key);
                const wall = maze[row]?.[col] === '#';
                const classes = [
                  'game-mode__cell',
                  wall ? 'is-wall' : 'is-floor',
                  sectionId ? 'is-section' : '',
                  isVisible ? 'is-visible' : isExplored ? 'is-explored' : 'is-hidden',
                  sectionId && found.has(sectionId) ? 'is-found' : '',
                  sectionId && visited.has(sectionId) ? 'is-visited' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div
                    key={key}
                    className={classes}
                    data-row={row}
                    data-col={col}
                    data-section={sectionId ?? undefined}
                  >
                    {sectionId && (
                      <>
                        <span
                          className="game-mode__section-marker"
                          role="img"
                          aria-label={SECTION_LABELS[sectionId]}
                        >
                          <SectionMarkerIcon sectionId={sectionId} />
                        </span>
                        {visited.has(sectionId) && (
                          <span className="game-mode__section-check" aria-hidden>
                            ✓
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="game-mode__avatar" ref={avatarRef} aria-hidden />
          </div>
        </div>

        {pendingSectionId && !modalOpen && (
          <div className="game-mode__prompt">
            <p className="game-mode__prompt-text">
              You found {SECTION_LABELS[pendingSectionId]}. Press Enter or tap Open to view.
            </p>
            <button
              type="button"
              className="btn btn--primary game-mode__prompt-btn"
              onClick={() => openSectionModal(pendingSectionId)}
            >
              Open {SECTION_SHORT[pendingSectionId]}
            </button>
          </div>
        )}

        <div className="game-mode__dpad" aria-label="Movement controls">
          {(['up', 'left', 'down', 'right'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              className="game-mode__dpad-btn"
              data-move={dir}
              aria-label={`Move ${dir}`}
              onClick={() => {
                const key =
                  dir === 'up'
                    ? 'ArrowUp'
                    : dir === 'down'
                      ? 'ArrowDown'
                      : dir === 'left'
                        ? 'ArrowLeft'
                        : 'ArrowRight';
                beginHeldMove(key);
              }}
            >
              {dir === 'up' ? '↑' : dir === 'down' ? '↓' : dir === 'left' ? '←' : '→'}
            </button>
          ))}
        </div>
      </div>

      <div className={`game-mode__modal${modalOpen ? ' is-open' : ''}`} hidden={!modalOpen}>
        <div
          className="game-mode__modal-backdrop"
          aria-hidden
          onClick={closeSectionModal}
        />
        <div
          className="game-mode__modal-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-modal-title"
        >
          <div className="game-mode__modal-header">
            <h3 className="game-mode__modal-title" id="game-modal-title">
              {modalSectionId ? SECTION_LABELS[modalSectionId] : ''}
            </h3>
            <button
              type="button"
              className="game-mode__modal-close"
              aria-label="Close modal"
              onClick={closeSectionModal}
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
          <div className="game-mode__modal-body">
            {modalSectionId && <SectionPanel sectionId={modalSectionId} variant="modal" />}
          </div>
        </div>
      </div>
    </div>
  );
}
