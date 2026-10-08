import { define, html } from '@gyral/core';
import { newGame } from '../game/engine.ts';
import type { Action } from '../runtime/session.ts';
import { act, hud, watchHud, type Hud } from './drivers.ts';

interface State { readonly hud: Hud; readonly error: string }
type Msg = { readonly _tag: 'Changed'; readonly hud: Hud } | { readonly _tag: 'Start' } | { readonly _tag: 'Pause' }
  | { readonly _tag: 'Next' } | { readonly _tag: 'Rotate' } | { readonly _tag: 'Sound' }
  | { readonly _tag: 'Speed' } | { readonly _tag: 'Failed'; readonly message: string };
const perform = (s: State, action: Action) => [s, [act(action, (message): Msg => ({ _tag: 'Failed', message }))]] as const;
const initial = hud({ game: newGame(), axis: 'vertical', sound: false, best: 0, blocked: null });
const clock = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
export const Controls = define<State, Msg>('jezz-controls', {
  shadow: false,
  init: () => [{ hud: initial, error: '' }, [watchHud((hud): Msg => ({ _tag: 'Changed', hud }))]],
  intent: {
    Start: () => ({ _tag: 'Start' }), Pause: () => ({ _tag: 'Pause' }), Next: () => ({ _tag: 'Next' }),
    Rotate: () => ({ _tag: 'Rotate' }), Sound: () => ({ _tag: 'Sound' }), Speed: () => ({ _tag: 'Speed' }),
  },
  update: {
    Changed: (s, m) => ({ ...s, hud: m.hud }), Failed: (s, m) => ({ ...s, error: m.message }),
    Start: s => perform(s, { type: 'restart' }), Pause: s => perform(s, { type: 'pause' }),
    Next: s => perform(s, { type: 'next' }), Rotate: s => perform(s, { type: 'rotate' }),
    Sound: s => perform(s, { type: 'sound' }), Speed: s => perform(s, { type: 'speed', slow: !s.hud.slow }),
  },
  view: (s, i) => {
    const h = s.hud, active = h.phase === 'playing' || h.phase === 'paused';
    return html`<div class="control-surface" data-phase=${h.phase}>
      <dl class="stats" aria-label="Game statistics">
        <div><dt>Level</dt><dd><output id="level">${String(h.level).padStart(2, '0')}</output></dd></div>
        <div><dt>Score</dt><dd><output id="score">${h.score.toLocaleString('en-US')}</output></dd></div>
        <div><dt>Lives</dt><dd><output id="lives">${String(h.lives).padStart(2, '0')}</output><span class="life-dot" aria-hidden="true">●</span></dd></div>
        <div class=${h.seconds <= 20 ? 'time urgent' : 'time'}><dt>Time left</dt><dd><output id="clock">${clock(h.seconds)}</output></dd></div>
      </dl>
      <div class="capture-heading"><label for="captured">Chamber cleared</label><p><output id="percent">${h.percent}%</output><span> / 75%</span></p></div>
      <meter id="captured" min="0" max="100" low="25" high="75" optimum="100" value=${h.percent}>${h.percent}% cleared</meter>
      <p class="game-notice" role="status">${s.error || h.blocked || h.notice}</p>
      <div class="actions">
        ${h.phase === 'won' ? html`<button type="button" class="primary" ?disabled=${!!h.blocked} data-intent=${i.Next}>Next chamber <span aria-hidden="true">↗</span></button>`
          : active ? html`<button type="button" class="primary" ?disabled=${!!h.blocked} data-intent=${i.Pause}>${h.phase === 'paused' ? 'Resume game' : 'Pause game'}<span aria-hidden="true">${h.phase === 'paused' ? '▷' : 'Ⅱ'}</span></button>`
            : html`<button type="button" class="primary" ?disabled=${!!h.blocked} data-intent=${i.Start}>${h.phase === 'over' ? 'Play again' : 'Start game'}<span aria-hidden="true">↗</span></button>`}
        <button type="button" class="rotate" data-intent=${i.Rotate}>${h.axis === 'vertical' ? '↕' : '↔'} <span>${h.axis === 'vertical' ? 'Vertical wall' : 'Horizontal wall'}</span><kbd>R</kbd></button>
      </div>
      <details class="game-options"><summary>Game options</summary>
        <fieldset class="settings"><legend>Play your way</legend>
          <button type="button" aria-pressed=${h.slow} ?disabled=${h.phase === 'playing'} data-intent=${i.Speed}>Slow pace <span>${h.slow ? 'On' : 'Off'}</span></button>
          <button type="button" aria-pressed=${h.sound} data-intent=${i.Sound}>Sound <span>${h.sound ? 'On' : 'Off'}</span></button>
        </fieldset>
        <p class="personal-best">Best on this device <strong>${h.best.toLocaleString('en-US')}</strong></p>
      </details>
    </div>`;
  },
});
