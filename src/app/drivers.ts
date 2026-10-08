import { createSessionBridge } from '@local-games/runtime/gyral';
import { HEIGHT, WIDTH, type Phase } from '../game/types.ts';
import type { Action, Session, Snapshot } from '../runtime/session.ts';

export interface Hud {
  readonly phase: Phase; readonly level: number; readonly score: number; readonly lives: number;
  readonly seconds: number; readonly percent: number; readonly axis: 'vertical' | 'horizontal';
  readonly slow: boolean; readonly sound: boolean; readonly best: number; readonly notice: string;
  readonly blocked: string | null;
}
export function hud(snapshot: Snapshot): Hud {
  const { game } = snapshot;
  return { phase: game.phase, level: game.level, score: game.score, lives: game.lives, seconds: Math.ceil(game.remaining),
    percent: Math.floor(game.captured / (WIDTH * HEIGHT) * 100), axis: snapshot.axis, slow: game.slow,
    sound: snapshot.sound, best: snapshot.best, notice: game.notice, blocked: snapshot.blocked };
}
const bridge = createSessionBridge<Snapshot, Action, Hud>({ name: 'jezz', select: hud,
  equal: (a, b) => a.phase === b.phase && a.level === b.level && a.score === b.score && a.lives === b.lives
    && a.seconds === b.seconds && a.percent === b.percent && a.axis === b.axis && a.slow === b.slow
    && a.sound === b.sound && a.best === b.best && a.notice === b.notice && a.blocked === b.blocked });
export const actionDriver = bridge.action;
export const watchHud = bridge.watch;
export const act = bridge.act;
export const provideSession = (element: Element, session: Session): (() => void) => bridge.provide(element, session);
