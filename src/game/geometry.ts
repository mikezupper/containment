import { HEIGHT, RADIUS, WIDTH, type Ball, type Cut, type Half } from './types.ts';

export interface Rect { readonly x: number; readonly y: number; readonly w: number; readonly h: number }
export const index = (x: number, y: number): number => y * WIDTH + x;
export const inBoard = (x: number, y: number): boolean => x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT;
export const blocked = (cells: readonly boolean[], x: number, y: number): boolean => !inBoard(x, y) || cells[index(x, y)] === true;
export function intersects(ball: Pick<Ball, 'x' | 'y'>, rect: Rect): boolean {
  const dx = ball.x - Math.max(rect.x, Math.min(ball.x, rect.x + rect.w));
  const dy = ball.y - Math.max(rect.y, Math.min(ball.y, rect.y + rect.h));
  return dx * dx + dy * dy < RADIUS * RADIUS;
}
export function free(cells: readonly boolean[], x: number, y: number): boolean {
  if (x < RADIUS || y < RADIUS || x > WIDTH - RADIUS || y > HEIGHT - RADIUS) return false;
  for (let cy = Math.floor(y - RADIUS); cy <= Math.floor(y + RADIUS); cy++) {
    for (let cx = Math.floor(x - RADIUS); cx <= Math.floor(x + RADIUS); cx++) {
      if (blocked(cells, cx, cy) && intersects({ x, y }, { x: cx, y: cy, w: 1, h: 1 })) return false;
    }
  }
  return true;
}
export function halfRect(cut: Cut, half: Half): Rect {
  const start = cut.axis === 'vertical' ? cut.y + 0.5 : cut.x + 0.5;
  // Both halves own the starting cell. A completed grid cell must never expand
  // beyond the collision footprint that was checked while its half grew.
  const low = half.direction < 0 ? start - Math.max(0.5, half.length) : start - 0.5;
  const length = Math.max(0.5, half.length) + 0.5;
  return cut.axis === 'vertical'
    ? { x: cut.x, y: low, w: 1, h: length }
    : { x: low, y: cut.y, w: length, h: 1 };
}
/** Flood from every ball. A disconnected component with any ball remains playable. */
export function capture(cells: readonly boolean[], balls: readonly Ball[]): boolean[] {
  const seen = new Set<number>();
  const queue: number[] = [];
  for (const ball of balls) {
    const cell = index(Math.floor(ball.x), Math.floor(ball.y));
    if (!cells[cell] && !seen.has(cell)) { seen.add(cell); queue.push(cell); }
  }
  for (let i = 0; i < queue.length; i++) {
    const cell = queue[i]!;
    const x = cell % WIDTH, y = Math.floor(cell / WIDTH);
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]] as const) {
      const next = index(nx, ny);
      if (!blocked(cells, nx, ny) && !seen.has(next)) { seen.add(next); queue.push(next); }
    }
  }
  return cells.map((solid, cell) => solid || !seen.has(cell));
}
