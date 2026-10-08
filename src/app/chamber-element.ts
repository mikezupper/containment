import { HEIGHT, WIDTH } from '../game/types.ts';
import type { Session } from '../runtime/session.ts';
import { ChamberRenderer, type Cursor } from '../rendering/chamber.ts';

/** Owns the WebGL widget and input listeners across connect/disconnect and HMR. */
export class ChamberElement extends HTMLElement {
  session: Session | null = null;
  private renderer: ChamberRenderer | null = null;
  private stop: (() => void) | null = null;
  private events: AbortController | null = null;
  private graphicsEvents: AbortController | null = null;
  private graphicsReady = false;
  private cursor: Cursor | null = null;
  private keyboard = false;
  private lastTouch: { x: number; y: number } | null = null;
  connectedCallback(): void {
    if (!this.session || this.events) return;
    this.tabIndex = 0;
    this.setAttribute('role', 'group'); this.setAttribute('aria-label', 'Containment chamber');
    this.setAttribute('aria-describedby', 'board-help keyboard-position');
    this.events = new AbortController(); const { signal } = this.events;
    this.addEventListener('click', event => {
      if (event.target instanceof HTMLButtonElement && event.target.classList.contains('retry-graphics')) this.prepareGraphics();
    }, { signal });
    this.prepareGraphics();
    this.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      this.keyboard = false; this.cursor = this.renderer?.pick(event.clientX, event.clientY) ?? null; this.draw();
    }, { signal });
    this.addEventListener('pointerleave', () => { if (!this.keyboard) { this.cursor = null; this.draw(); } }, { signal });
    this.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') this.lastTouch = { x: event.clientX, y: event.clientY }; }, { signal });
    this.addEventListener('pointerup', event => {
      if (event.button !== 0 || !this.graphicsReady) return;
      if (event.pointerType === 'touch' && (!this.lastTouch || Math.hypot(event.clientX - this.lastTouch.x, event.clientY - this.lastTouch.y) > 10)) return;
      this.lastTouch = null; this.cursor = this.renderer?.pick(event.clientX, event.clientY) ?? null;
      if (this.cursor && this.session) { this.focus({ preventScroll: true }); this.session.dispatch({ type: 'place', ...this.cursor, axis: this.session.snapshot.axis }); }
    }, { signal });
    this.addEventListener('pointercancel', () => { this.lastTouch = null; }, { signal });
    this.addEventListener('contextmenu', event => { event.preventDefault(); this.session?.dispatch({ type: 'rotate' }); }, { signal });
    this.addEventListener('focus', () => { if (!this.cursor) this.cursor = { x: 14.5, y: 10.5 }; this.draw(); }, { signal });
    this.addEventListener('keydown', this.keydown, { signal });
    this.stop = this.session.subscribe(() => this.draw());
  }
  disconnectedCallback(): void {
    this.stop?.(); this.stop = null; this.events?.abort(); this.events = null;
    this.graphicsEvents?.abort(); this.graphicsEvents = null;
    this.renderer?.close(); this.renderer = null; this.graphicsReady = false;
    delete this.dataset.ready; delete this.dataset.graphics;
  }
  private prepareGraphics(): void {
    if (!this.session || !this.isConnected) return;
    this.graphicsReady = false; delete this.dataset.ready;
    this.graphicsEvents?.abort(); this.renderer?.close(); this.renderer = null; this.replaceChildren();
    try {
      this.renderer = new ChamberRenderer(this);
      this.graphicsEvents = new AbortController(); const { signal } = this.graphicsEvents;
      this.renderer.canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault(); this.graphicsReady = false; delete this.dataset.ready; this.dataset.graphics = 'lost';
        this.session?.setBlocked('Graphics interrupted. Your game is paused while the chamber recovers.');
        this.appendRetry();
      }, { signal });
      this.renderer.canvas.addEventListener('webglcontextrestored', () => {
        // Three restores its context first. Recreate render targets and environment
        // textures as well, since their generated contents were lost with the GPU.
        queueMicrotask(() => { if (!signal.aborted && this.isConnected) this.prepareGraphics(); });
      }, { signal });
      this.graphicsReady = true; this.dataset.ready = 'true'; this.dataset.graphics = 'ready';
      this.session.setBlocked(null); this.draw();
    } catch {
      this.graphicsReady = false; this.graphicsEvents?.abort(); this.renderer?.close(); this.renderer = null; this.replaceChildren();
      this.dataset.graphics = 'unavailable';
      this.session.setBlocked('The 3D chamber is unavailable. Try again or enable hardware acceleration.');
      const message = document.createElement('p'); message.className = 'render-error';
      message.textContent = 'This game needs WebGL 2. Your run is safe while you retry the chamber.';
      this.append(message); this.appendRetry();
    }
  }
  private appendRetry(): void {
    if (this.querySelector('.retry-graphics')) return;
    const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'retry-graphics'; retry.textContent = 'Try 3D again';
    this.append(retry);
  }
  private draw(): void {
    if (!this.session) return;
    if (this.graphicsReady) this.renderer?.draw(this.session.snapshot.game, this.cursor, this.session.snapshot.axis);
    this.dataset.phase = this.session.snapshot.game.phase;
    if (this.keyboard && this.cursor) {
      const output = document.querySelector('#keyboard-position');
      if (output) output.textContent = `Aim: column ${Math.floor(this.cursor.x) + 1}, row ${Math.floor(this.cursor.y) + 1}.`;
    }
  }
  private readonly keydown = (event: KeyboardEvent): void => {
    if (!this.session) return;
    const key = event.key.toLowerCase();
    if (!['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'enter', 'r', 'p', 'escape'].includes(key)) return;
    event.preventDefault();
    if (key === 'r') { this.session.dispatch({ type: 'rotate' }); return; }
    if (key === 'p' || key === 'escape') { this.session.dispatch({ type: 'pause' }); return; }
    this.keyboard = true;
    this.cursor ??= { x: 14.5, y: 10.5 };
    const distance = event.shiftKey ? 4 : 1;
    if (key === 'arrowleft') this.cursor = { ...this.cursor, x: Math.max(0.5, this.cursor.x - distance) };
    if (key === 'arrowright') this.cursor = { ...this.cursor, x: Math.min(WIDTH - 0.5, this.cursor.x + distance) };
    if (key === 'arrowup') this.cursor = { ...this.cursor, y: Math.max(0.5, this.cursor.y - distance) };
    if (key === 'arrowdown') this.cursor = { ...this.cursor, y: Math.min(HEIGHT - 0.5, this.cursor.y + distance) };
    if (key === ' ' || key === 'enter') this.session.dispatch({ type: 'place', ...this.cursor, axis: this.session.snapshot.axis });
    this.draw();
  };
}
customElements.define('jezz-chamber', ChamberElement);
