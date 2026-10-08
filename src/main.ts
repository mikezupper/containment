import './styles/main.css';
import { Controls } from './app/controls.ts';
import { provideSession } from './app/drivers.ts';
import { Session } from './runtime/session.ts';
import { GameAudio } from './app/audio.ts';

const controls = document.querySelector<HTMLElement>('#controls');
const board = document.querySelector<HTMLElement>('#board');
if (controls && board) {
  let best = 0;
  // Retain the original storage key across the Containment rename.
  try { const saved = Number(localStorage.getItem('jezzball.best.v1')); if (Number.isSafeInteger(saved) && saved >= 0) best = saved; } catch { /* Storage is optional. */ }
  const seed = crypto.getRandomValues(new Uint32Array(1))[0]!;
  const session = new Session(seed, best), audio = new GameAudio();
  session.setBlocked('Preparing the 3D chamber…');
  const release = provideSession(controls, session); controls.replaceChildren(new Controls());
  const { ChamberElement } = await import('./app/chamber-element.ts');
  const chamber = new ChamberElement(); chamber.session = session; board.replaceChildren(chamber);
  const stop = session.subscribe(snapshot => {
    audio.update(snapshot);
    if (snapshot.best > best) { best = snapshot.best; try { localStorage.setItem('jezzball.best.v1', String(best)); } catch { /* Keep playing without persistence. */ } }
    const overlay = document.querySelector<HTMLElement>('#board-state');
    if (overlay) {
      overlay.hidden = snapshot.game.phase === 'playing' && !snapshot.blocked;
      overlay.textContent = snapshot.blocked || (snapshot.game.phase === 'ready' ? 'A little space. A little strategy.' : snapshot.game.phase === 'paused' ? 'Room to think.' : snapshot.game.phase === 'won' ? 'Nicely contained.' : 'Another way in.');
    }
  });
  const lifecycle = new AbortController();
  const pause = () => { if (session.snapshot.game.phase === 'playing') session.dispatch({ type: 'pause' }); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); }, { signal: lifecycle.signal });
  window.addEventListener('blur', pause, { signal: lifecycle.signal });
  let frame = 0, previous = performance.now();
  const tick = (now: number) => { session.frame((now - previous) / 1000); previous = now; frame = requestAnimationFrame(tick); };
  frame = requestAnimationFrame(tick);
  const close = () => { cancelAnimationFrame(frame); lifecycle.abort(); stop(); controls.replaceChildren(); board.replaceChildren(); release(); audio.close(); session.close(); };
  window.addEventListener('pagehide', event => { if (event.persisted) pause(); else close(); }, { signal: lifecycle.signal });
  if (import.meta.hot) import.meta.hot.dispose(close);
}
