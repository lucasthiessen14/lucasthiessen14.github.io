import { SECTION_IDS, type SectionId } from '../types/sections';

export type CellPos = { row: number; col: number };

export const MIN_MAZE_ROOMS_W = 13;
export const MIN_MAZE_ROOMS_H = 9;
export const MAX_MAZE_ROOMS_W = 36;
export const MAX_MAZE_ROOMS_H = 28;
export const VIEWPORT_CELL_BUFFER = 6;
export const CELL_SIZE = 36;
export const VISION_RADIUS = 4;
export const MOVE_MS_INITIAL = 130;
export const MOVE_MS_MIN = 50;
export const MOVE_RAMP_MS = 800;
export const SECTION_COUNT = 7;

export type MazeGrid = string[][];
export type SectionCells = Record<string, SectionId>;

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function getViewportSize(viewportEl: HTMLElement | null): { width: number; height: number } {
  if (viewportEl && viewportEl.clientWidth > 0 && viewportEl.clientHeight > 0) {
    return { width: viewportEl.clientWidth, height: viewportEl.clientHeight };
  }
  const navHeight =
    parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10) || 64;
  return {
    width: window.innerWidth,
    height: Math.max(320, window.innerHeight - navHeight),
  };
}

export function computeRoomCount(viewportEl: HTMLElement | null): { roomsW: number; roomsH: number } {
  const view = getViewportSize(viewportEl);
  const minGridW = Math.ceil(view.width / CELL_SIZE) + VIEWPORT_CELL_BUFFER;
  const minGridH = Math.ceil(view.height / CELL_SIZE) + VIEWPORT_CELL_BUFFER;
  const roomsW = Math.ceil((minGridW - 1) / 2);
  const roomsH = Math.ceil((minGridH - 1) / 2);
  return {
    roomsW: Math.min(MAX_MAZE_ROOMS_W, Math.max(MIN_MAZE_ROOMS_W, roomsW)),
    roomsH: Math.min(MAX_MAZE_ROOMS_H, Math.max(MIN_MAZE_ROOMS_H, roomsH)),
  };
}

export function padMazeToViewport(grid: MazeGrid, viewportEl: HTMLElement | null): MazeGrid {
  const view = getViewportSize(viewportEl);
  const minCols = Math.ceil(view.width / CELL_SIZE);
  const minRows = Math.ceil(view.height / CELL_SIZE);
  const result = grid.map((row) => [...row]);

  while (result[0].length < minCols) {
    for (let r = 0; r < result.length; r++) result[r].push('#');
  }
  while (result.length < minRows) {
    result.push(Array(result[0].length).fill('#'));
  }
  return result;
}

function generateMazeGrid(roomsW: number, roomsH: number): MazeGrid {
  const width = roomsW * 2 + 1;
  const height = roomsH * 2 + 1;
  const grid: MazeGrid = Array.from({ length: height }, () => Array(width).fill('#'));

  function carve(row: number, col: number) {
    grid[row][col] = '.';
    const directions: [number, number][] = shuffle([
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0],
    ]);
    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr <= 0 || nc <= 0 || nr >= height - 1 || nc >= width - 1) continue;
      if (grid[nr][nc] !== '#') continue;
      grid[row + dr / 2][col + dc / 2] = '.';
      carve(nr, nc);
    }
  }

  carve(1, 1);
  return grid;
}

function getFloorCells(grid: MazeGrid): CellPos[] {
  const floors: CellPos[] = [];
  for (let r = 1; r < grid.length - 1; r++) {
    for (let c = 1; c < grid[r].length - 1; c++) {
      if (grid[r][c] === '.') floors.push({ row: r, col: c });
    }
  }
  return floors;
}

function cellDistance(a: CellPos, b: CellPos): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function placeSections(grid: MazeGrid): SectionCells {
  const sections: SectionCells = {};
  const floors = getFloorCells(grid);
  const start: CellPos = { row: 1, col: 1 };
  const placed: CellPos[] = [start];
  sections[cellKey(start.row, start.col)] = 'hero';

  const remaining = SECTION_IDS.filter((id) => id !== 'hero');

  for (const sectionId of remaining) {
    let best: CellPos | null = null;
    let bestScore = -1;

    for (const cell of shuffle(floors)) {
      const key = cellKey(cell.row, cell.col);
      if (sections[key]) continue;
      const minDist = placed.reduce(
        (min, p) => Math.min(min, cellDistance(cell, p)),
        Infinity,
      );
      if (minDist > bestScore) {
        bestScore = minDist;
        best = cell;
      }
    }

    if (!best) {
      best = floors.find((cell) => !sections[cellKey(cell.row, cell.col)]) ?? null;
    }

    if (best) {
      sections[cellKey(best.row, best.col)] = sectionId;
      placed.push(best);
    }
  }

  return sections;
}

export function buildMaze(viewportEl: HTMLElement | null): {
  maze: MazeGrid;
  sectionCells: SectionCells;
  startPos: CellPos;
} {
  const dims = computeRoomCount(viewportEl);
  let maze = generateMazeGrid(dims.roomsW, dims.roomsH);
  maze = padMazeToViewport(maze, viewportEl);
  const sectionCells = placeSections(maze);
  const startPos = { row: 1, col: 1 };
  return { maze, sectionCells, startPos };
}

export function isWall(maze: MazeGrid, row: number, col: number): boolean {
  if (row < 0 || col < 0 || row >= maze.length || col >= maze[0].length) return true;
  return maze[row][col] === '#';
}

export function getCameraOffsets(
  maze: MazeGrid,
  player: CellPos,
  viewportEl: HTMLElement | null,
): { offsetX: number; offsetY: number; playerX: number; playerY: number } {
  const viewW = viewportEl?.clientWidth ?? 0;
  const viewH = viewportEl?.clientHeight ?? 0;
  const playerX = player.col * CELL_SIZE + CELL_SIZE / 2;
  const playerY = player.row * CELL_SIZE + CELL_SIZE / 2;
  let offsetX = viewW / 2 - playerX;
  let offsetY = viewH / 2 - playerY;
  const mazeW = maze[0].length * CELL_SIZE;
  const mazeH = maze.length * CELL_SIZE;
  offsetX = Math.min(0, Math.max(viewW - mazeW, offsetX));
  offsetY = Math.min(0, Math.max(viewH - mazeH, offsetY));
  return { offsetX, offsetY, playerX, playerY };
}

export type PanOffset = { x: number; y: number };

export function getCameraWithPan(
  maze: MazeGrid,
  player: CellPos,
  viewportEl: HTMLElement | null,
  pan: PanOffset,
): { offsetX: number; offsetY: number; playerX: number; playerY: number; pan: PanOffset } {
  const cam = getCameraOffsets(maze, player, viewportEl);
  let offsetX = cam.offsetX + pan.x;
  let offsetY = cam.offsetY + pan.y;
  const viewW = viewportEl?.clientWidth ?? 0;
  const viewH = viewportEl?.clientHeight ?? 0;
  const mazeW = maze[0].length * CELL_SIZE;
  const mazeH = maze.length * CELL_SIZE;
  offsetX = Math.min(0, Math.max(viewW - mazeW, offsetX));
  offsetY = Math.min(0, Math.max(viewH - mazeH, offsetY));
  return {
    offsetX,
    offsetY,
    playerX: cam.playerX,
    playerY: cam.playerY,
    pan: { x: offsetX - cam.offsetX, y: offsetY - cam.offsetY },
  };
}

export function getMoveInterval(holdStartedAt: number): number {
  if (!holdStartedAt) return MOVE_MS_INITIAL;
  const elapsed = performance.now() - holdStartedAt;
  const t = Math.min(1, elapsed / MOVE_RAMP_MS);
  return MOVE_MS_INITIAL - (MOVE_MS_INITIAL - MOVE_MS_MIN) * t * t;
}

export function directionFromKey(key: string): { dr: number; dc: number } | null {
  if (key === 'ArrowUp' || key === 'w' || key === 'W') return { dr: -1, dc: 0 };
  if (key === 'ArrowDown' || key === 's' || key === 'S') return { dr: 1, dc: 0 };
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') return { dr: 0, dc: -1 };
  if (key === 'ArrowRight' || key === 'd' || key === 'D') return { dr: 0, dc: 1 };
  return null;
}

export function directionsEqual(
  a: { dr: number; dc: number } | null,
  b: { dr: number; dc: number } | null,
): boolean {
  return !!a && !!b && a.dr === b.dr && a.dc === b.dc;
}
