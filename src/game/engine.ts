import { blocked, capture, free, halfRect, inBoard, intersects } from './geometry.ts';
import { HEIGHT, RADIUS, STEP, TARGET, WIDTH, type Ball, type Cut, type Game, type Half, type Input } from './types.ts';

function random(seed: number): () => number {
  let value = seed >>> 0;
  return () => { value = (value + 0x6d2b79f5) >>> 0; let n = value;
    n = Math.imul(n ^ n >>> 15, n | 1); n ^= n + Math.imul(n ^ n >>> 7, n | 61);
    return ((n ^ n >>> 14) >>> 0) / 4294967296; };
}
export function newGame(seed = 1, level = 1, score = 0, slow = false): Game {
  const rng = random(seed + level * 7919);
  const count = Math.min(50, level + 1);
  const balls: Ball[] = [];
  const columns = Math.ceil(Math.sqrt(count * WIDTH / HEIGHT)), rows = Math.ceil(count / columns);
  for (let i = 0; i < count; i++) {
    // Stratified positions prevent overlapping spawns, even at the 50-ball cap.
    const x = (i % columns + 0.5) * WIDTH / columns + (rng() - 0.5);
    const y = (Math.floor(i / columns) + 0.5) * HEIGHT / rows + (rng() - 0.5);
    const angle = Math.PI * (0.18 + rng() * 0.14);
    const speed = slow ? 3.2 : 5.2;
    balls.push({ x, y, vx: Math.cos(angle) * speed * (rng() < 0.5 ? -1 : 1), vy: Math.sin(angle) * speed * (rng() < 0.5 ? -1 : 1) });
  }
  return { version: 1, seed: seed >>> 0, tick: 0, phase: 'ready', level, score, slow, lives: count,
    remaining: 150 + (level - 1) * 30, cells: Array<boolean>(WIDTH * HEIGHT).fill(false), balls,
    cut: null, captured: 0, notice: 'Ready when you are. Clear 75% of the chamber.' };
}
function place(game: Game, input: Extract<Input, { type: 'place' }>): Game {
  if (game.phase !== 'playing' || game.cut || !Number.isFinite(input.x) || !Number.isFinite(input.y)) return game;
  const x = Math.floor(input.x), y = Math.floor(input.y);
  if (!inBoard(x, y) || blocked(game.cells, x, y) || (input.axis !== 'horizontal' && input.axis !== 'vertical')) return game;
  const halves = ([-1, 1] as const).map(direction => {
    let cx = x, cy = y, steps = 0;
    while (!blocked(game.cells, cx, cy)) { steps++; cx += input.axis === 'horizontal' ? direction : 0; cy += input.axis === 'vertical' ? direction : 0; }
    return { direction, length: 0, target: steps - 0.5, status: 'growing' } satisfies Half;
  });
  return { ...game, cut: { x, y, axis: input.axis, halves }, notice: 'Wall growing. Keep both ends clear.' };
}
export function dispatch(game: Game, input: Input): Game {
  switch (input.type) {
    case 'start': return { ...newGame(input.seed, 1, 0, game.slow), phase: 'playing', notice: 'Chamber open. Place your first wall.' };
    case 'pause': return game.phase === 'playing' ? { ...game, phase: 'paused', notice: 'Paused. Take your time.' }
      : game.phase === 'paused' ? { ...game, phase: 'playing', notice: 'Back in motion.' } : game;
    case 'next': return game.phase === 'won' ? { ...newGame(game.seed, Math.min(49, game.level + 1), game.score, game.slow), phase: 'playing', notice: 'New chamber. One more ball to watch.' } : game;
    case 'speed': {
      if (game.phase === 'playing') return game;
      const ratio = (input.slow ? 3.2 : 5.2) / (game.slow ? 3.2 : 5.2);
      return { ...game, slow: input.slow, balls: game.balls.map(b => ({ ...b, vx: b.vx * ratio, vy: b.vy * ratio })) };
    }
    case 'place': return place(game, input);
  }
}
function moveBalls(game: Game): Ball[] {
  const balls = game.balls.map(ball => {
    let { x, y, vx, vy } = ball;
    const nx = x + vx * STEP;
    if (free(game.cells, nx, y)) x = nx; else vx = -vx;
    const ny = y + vy * STEP;
    if (free(game.cells, x, ny)) y = ny; else vy = -vy;
    return { x, y, vx, vy };
  });
  for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
    const a = balls[i]!, b = balls[j]!;
    const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
    if (length > 0 && length < RADIUS * 2) {
      const nx = dx / length, ny = dy / length;
      const relative = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
      if (relative > 0) {
        balls[i] = { ...a, vx: a.vx - relative * nx, vy: a.vy - relative * ny };
        balls[j] = { ...b, vx: b.vx + relative * nx, vy: b.vy + relative * ny };
      }
    }
  }
  return balls;
}
function complete(cells: readonly boolean[], cut: Cut, half: Half): boolean[] {
  const rect = halfRect(cut, half);
  return cells.map((solid, cell) => {
    const x = cell % WIDTH + 0.5, y = Math.floor(cell / WIDTH) + 0.5;
    return solid || (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h);
  });
}
/** Advance exactly one fixed tick. Time and randomness never enter through globals. */
export function advance(game: Game): Game {
  if (game.phase !== 'playing') return game;
  const balls = moveBalls(game);
  let next: Game = { ...game, balls, tick: game.tick + 1, remaining: Math.max(0, game.remaining - STEP) };
  if (game.cut) {
    let cells = game.cells, lives = game.lives;
    const cut = game.cut;
    const halves = cut.halves.map(half => {
      if (half.status !== 'growing') return half;
      const grown = { ...half, length: Math.min(half.target, half.length + 12 * STEP) };
      if (balls.some(ball => intersects(ball, halfRect(cut, grown)))) {
        lives--; return { ...grown, status: 'failed' } satisfies Half;
      }
      if (grown.length >= half.target) { cells = complete(cells, cut, grown); return { ...grown, status: 'complete' } satisfies Half; }
      return grown;
    });
    const done = halves.every(half => half.status !== 'growing');
    if (done) cells = capture(cells, balls);
    const captured = cells.filter(Boolean).length;
    const gained = captured - game.captured;
    next = { ...next, cells, lives: Math.max(0, lives), captured, score: game.score + gained * 10 * game.level,
      cut: done ? null : { ...cut, halves },
      notice: lives < game.lives ? 'Ball hit a growing wall. Life lost.' : done ? `Section sealed. ${Math.floor(captured / (WIDTH * HEIGHT) * 100)}% cleared.` : game.notice };
  }
  if (next.lives <= 0 || next.remaining <= 0) return { ...next, phase: 'over', cut: null,
    notice: next.lives <= 0 ? 'No lives left. Give the chamber another try.' : 'Time is up. Give the chamber another try.' };
  if (next.captured / (WIDTH * HEIGHT) >= TARGET && !next.cut) {
    const area = next.captured / (WIDTH * HEIGHT);
    const bonus = Math.ceil(next.remaining) * 10 * next.level + (area > 0.9 ? 2000 : area > 0.8 ? 1000 : 0) * next.level;
    return { ...next, phase: 'won', score: next.score + bonus, notice: `Chamber cleared. ${Math.floor(area * 100)}% captured. Time bonus added.` };
  }
  return next;
}
