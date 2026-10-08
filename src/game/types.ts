export const WIDTH = 28;
export const HEIGHT = 20;
export const RADIUS = 0.32;
export const STEP = 1 / 120;
export const TARGET = 0.75;
export type Axis = 'vertical' | 'horizontal';
export type Phase = 'ready' | 'playing' | 'paused' | 'won' | 'over';
export interface Ball { readonly x: number; readonly y: number; readonly vx: number; readonly vy: number }
export interface Half {
  readonly direction: -1 | 1;
  readonly length: number;
  readonly target: number;
  readonly status: 'growing' | 'complete' | 'failed';
}
export interface Cut { readonly x: number; readonly y: number; readonly axis: Axis; readonly halves: readonly Half[] }
export interface Game {
  readonly version: 1;
  readonly seed: number;
  readonly tick: number;
  readonly phase: Phase;
  readonly level: number;
  readonly lives: number;
  readonly score: number;
  readonly remaining: number;
  readonly slow: boolean;
  readonly cells: readonly boolean[];
  readonly balls: readonly Ball[];
  readonly cut: Cut | null;
  readonly captured: number;
  readonly notice: string;
}
export type Input = { readonly type: 'start'; readonly seed: number } | { readonly type: 'pause' }
  | { readonly type: 'next' } | { readonly type: 'speed'; readonly slow: boolean }
  | { readonly type: 'place'; readonly x: number; readonly y: number; readonly axis: Axis };
