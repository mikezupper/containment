import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { halfRect } from '../game/geometry.ts';
import { HEIGHT, RADIUS, WIDTH, type Axis, type Game } from '../game/types.ts';

export interface Cursor { readonly x: number; readonly y: number }
/** Three.js only projects the game. It never decides collision, capture, or time. */
export class ChamberRenderer {
  readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera();
  private readonly ray = new THREE.Raycaster();
  private readonly plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private readonly blocks: THREE.InstancedMesh;
  private readonly growing: THREE.Mesh[] = [];
  private readonly balls: THREE.Group[] = [];
  private readonly cursor: THREE.Mesh;
  private readonly environment: THREE.WebGLRenderTarget;
  private cells: readonly boolean[] | null = null;
  private readonly geometries = new Set<THREE.BufferGeometry>();
  private readonly materials = new Set<THREE.Material>();
  private readonly ballGeometry: THREE.SphereGeometry;
  private readonly capGeometry: THREE.SphereGeometry;
  private readonly ivory: THREE.MeshPhysicalMaterial;
  private readonly coral: THREE.MeshPhysicalMaterial;
  private readonly observer: ResizeObserver;
  private closed = false;

  constructor(private readonly host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    this.canvas = this.renderer.domElement;
    this.canvas.setAttribute('aria-hidden', 'true');
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    const environmentScene = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environment = pmrem.fromScene(environmentScene, 0.04);
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = 0.25;
    environmentScene.dispose(); pmrem.dispose();
    this.camera.position.set(0, -17, 44); this.camera.up.set(0, 1, 0); this.camera.lookAt(0, 0, 0);
    const key = new THREE.DirectionalLight(0xfff2de, 2.5); key.position.set(-10, 10, 25); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 60 });
    key.shadow.bias = -0.001; key.shadow.normalBias = 0.04; this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x78fff0, 0.8); fill.position.set(15, -8, 12); this.scene.add(fill);
    this.scene.add(new THREE.HemisphereLight(0xd6f9ff, 0x14232a, 0.65));
    const metal = this.material(new THREE.MeshPhysicalMaterial({ color: 0x273941, metalness: 0.6, roughness: 0.4, clearcoat: 0.15, envMapIntensity: 0.08 }));
    const floor = this.material(new THREE.MeshStandardMaterial({ color: 0x13262e, metalness: 0.1, roughness: 0.85, envMapIntensity: 0.3 }));
    const led = this.material(new THREE.MeshStandardMaterial({ color: 0x80e6cf, emissive: 0x5cf2cb, emissiveIntensity: 0.7, roughness: 0.3 }));
    this.box(31, 23, 1, 0, 0, -0.85, metal);
    this.box(WIDTH, HEIGHT, 0.25, 0, 0, -0.15, floor);
    for (const y of [-10.3, 10.3]) { this.box(29, 0.5, 0.8, 0, y, 0.15, metal); this.box(28.4, 0.055, 0.04, 0, y, 0.58, led); }
    for (const x of [-14.3, 14.3]) { this.box(0.5, 20.2, 0.8, x, 0, 0.15, metal); this.box(0.055, 19.9, 0.04, x, 0, 0.58, led); }
    const boltMaterial = this.material(new THREE.MeshStandardMaterial({ color: 0xa8b5b6, metalness: 0.85, roughness: 0.3 }));
    const boltGeometry = this.geometry(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 12));
    for (const x of [-14.85, 14.85]) for (const y of [-10.85, 10.85]) {
      const bolt = new THREE.Mesh(boltGeometry, boltMaterial); bolt.rotation.x = Math.PI / 2; bolt.position.set(x, y, -0.3); this.scene.add(bolt);
    }
    const points: THREE.Vector3[] = [];
    for (let x = 0; x <= WIDTH; x++) points.push(new THREE.Vector3(x - WIDTH / 2, -HEIGHT / 2, 0.005), new THREE.Vector3(x - WIDTH / 2, HEIGHT / 2, 0.005));
    for (let y = 0; y <= HEIGHT; y++) points.push(new THREE.Vector3(-WIDTH / 2, y - HEIGHT / 2, 0.005), new THREE.Vector3(WIDTH / 2, y - HEIGHT / 2, 0.005));
    this.scene.add(new THREE.LineSegments(this.geometry(new THREE.BufferGeometry().setFromPoints(points)),
      this.material(new THREE.LineBasicMaterial({ color: 0x72949d, transparent: true, opacity: 0.28 }))));
    const captured = this.material(new THREE.MeshPhysicalMaterial({ color: 0x27887d, metalness: 0.45, roughness: 0.3, clearcoat: 0.6, emissive: 0x124f48, emissiveIntensity: 0.2 }));
    this.blocks = new THREE.InstancedMesh(this.geometry(new THREE.BoxGeometry(0.97, 0.97, 0.4)), captured, WIDTH * HEIGHT);
    this.blocks.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.blocks.count = 0; this.blocks.receiveShadow = true; this.blocks.castShadow = true; this.scene.add(this.blocks);
    const growingMaterial = this.material(new THREE.MeshPhysicalMaterial({ color: 0xf4c476, emissive: 0xc77724, emissiveIntensity: 0.45, metalness: 0.25, roughness: 0.25 }));
    for (let i = 0; i < 2; i++) { const mesh = this.box(1, 1, 0.48, 0, 0, 0.3, growingMaterial); mesh.visible = false; this.growing.push(mesh); }
    this.cursor = this.box(0.92, 0.92, 0.045, 0, 0, 0.08,
      this.material(new THREE.MeshBasicMaterial({ color: 0xf7d695, transparent: true, opacity: 0.5, depthWrite: false })));
    this.cursor.visible = false;
    this.ballGeometry = this.geometry(new THREE.SphereGeometry(RADIUS, 24, 16));
    this.capGeometry = this.geometry(new THREE.SphereGeometry(RADIUS + 0.003, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2));
    this.ivory = this.material(new THREE.MeshPhysicalMaterial({ color: 0xfaf3df, metalness: 0.12, roughness: 0.2, clearcoat: 1 }));
    this.coral = this.material(new THREE.MeshPhysicalMaterial({ color: 0xff624e, metalness: 0.2, roughness: 0.23, clearcoat: 1 }));
    host.append(this.canvas);
    this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host); this.resize();
  }
  draw(game: Game, cursor: Cursor | null, axis: Axis): void {
    if (this.closed) return;
    if (this.cells !== game.cells) {
      this.cells = game.cells;
      const matrix = new THREE.Matrix4(); let count = 0;
      game.cells.forEach((solid, cell) => {
        if (solid) { matrix.makeTranslation(cell % WIDTH + 0.5 - WIDTH / 2, HEIGHT / 2 - Math.floor(cell / WIDTH) - 0.5, 0.2); this.blocks.setMatrixAt(count++, matrix); }
      });
      this.blocks.count = count; this.blocks.instanceMatrix.needsUpdate = true; this.blocks.computeBoundingSphere();
    }
    while (this.balls.length < game.balls.length) {
      const group = new THREE.Group();
      const body = new THREE.Mesh(this.ballGeometry, this.ivory), cap = new THREE.Mesh(this.capGeometry, this.coral);
      body.castShadow = true; cap.castShadow = true; group.add(body, cap); this.scene.add(group); this.balls.push(group);
    }
    this.balls.forEach((group, i) => {
      const ball = game.balls[i]; group.visible = !!ball;
      if (ball) { group.position.set(ball.x - WIDTH / 2, HEIGHT / 2 - ball.y, RADIUS + 0.04);
        group.rotation.set(ball.y / RADIUS, ball.x / RADIUS, 0); }
    });
    this.growing.forEach((mesh, i) => {
      const half = game.cut?.halves[i]; mesh.visible = !!half && half.status === 'growing';
      if (game.cut && half && mesh.visible) {
        const rect = halfRect(game.cut, half); mesh.position.set(rect.x + rect.w / 2 - WIDTH / 2, HEIGHT / 2 - rect.y - rect.h / 2, 0.28);
        mesh.scale.set(Math.max(0.01, rect.w), Math.max(0.01, rect.h), 1);
      }
    });
    this.cursor.visible = !!cursor && (game.phase === 'playing' || game.phase === 'ready') && !game.cut;
    if (cursor) {
      this.cursor.position.set(Math.floor(cursor.x) + 0.5 - WIDTH / 2, HEIGHT / 2 - Math.floor(cursor.y) - 0.5, 0.08);
      this.cursor.scale.set(axis === 'horizontal' ? 2 : 0.45, axis === 'vertical' ? 2 : 0.45, 1);
    }
    this.renderer.render(this.scene, this.camera);
  }
  pick(clientX: number, clientY: number): Cursor | null {
    const rect = this.canvas.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1), this.camera);
    const point = this.ray.ray.intersectPlane(this.plane, new THREE.Vector3());
    if (!point) return null;
    const x = point.x + WIDTH / 2, y = HEIGHT / 2 - point.y;
    return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT ? { x, y } : null;
  }
  close(): void {
    if (this.closed) return; this.closed = true; this.observer.disconnect();
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.blocks.dispose(); this.environment.dispose(); this.renderer.dispose();
    if (!this.renderer.getContext().isContextLost()) this.renderer.forceContextLoss();
    this.canvas.remove();
  }
  private resize(): void {
    if (this.closed) return;
    const width = this.host.clientWidth, height = this.host.clientHeight; if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    const aspect = width / height, halfHeight = Math.max(12.5, 17 / aspect);
    this.camera.left = -halfHeight * aspect; this.camera.right = halfHeight * aspect;
    this.camera.top = halfHeight; this.camera.bottom = -halfHeight; this.camera.near = 1; this.camera.far = 100;
    this.camera.updateProjectionMatrix();
    // Resizing clears the drawing buffer. Paused/ready sessions publish no frames,
    // so redraw the existing scene here without advancing any game state.
    if (!this.renderer.getContext().isContextLost()) this.renderer.render(this.scene, this.camera);
  }
  private geometry<T extends THREE.BufferGeometry>(value: T): T { this.geometries.add(value); return value; }
  private material<T extends THREE.Material>(value: T): T { this.materials.add(value); return value; }
  private box(w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material): THREE.Mesh {
    const mesh = new THREE.Mesh(this.geometry(new THREE.BoxGeometry(w, h, d)), material);
    mesh.position.set(x, y, z); mesh.receiveShadow = true; mesh.castShadow = true; this.scene.add(mesh); return mesh;
  }
}
