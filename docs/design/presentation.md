# Presentation and accessibility

The selected direction is a modern 3D chamber with lighting and richer materials.
The chamber has a metal bezel, a fine grid, illuminated edge strips, raised mint cells,
amber growing walls, and red-and-white enamel balls. A fixed orthographic camera gives
depth without perspective-driven changes in apparent cell size.

## Render and input together

Picking intersects the pointer ray with the actual board plane; it does not approximate
cells from the canvas rectangle. The renderer fits the complete chamber at each size.
Its device pixel ratio is capped at two. Captured cells share an instanced mesh. Ball
geometries and materials are shared across levels, then disposed with the renderer.
Resizing redraws the existing scene even when paused, without advancing game time.

The console precedes the chamber in reading order and sits to its left on desktop.
On narrow screens it becomes a compact sticky panel above the board, keeping pause
and wall direction within reach. Short landscape screens use a narrow side panel.
Secondary settings use native details so they can stay collapsed during play.
The side-panel layout starts at a 480-pixel viewport width on short screens. At heights
of 384 pixels or less, its heading stays available to assistive technology but is
visually hidden to leave room for play controls. Narrow portrait screens cap the board
height against the stable viewport, keeping its bottom in view with controls collapsed.
Controls use native buttons and a native meter. The page uses a single main landmark and heading, a skip
link, readable instructions, and a status region for discrete events. Rapid score and
clock updates are not live announcements.

Keyboard focus makes an aim marker available. The chamber announces its controls and
the current aimed row/column. The canvas itself is hidden from the accessibility tree;
it would otherwise expose a meaningless bitmap. This is a timing-based visual game,
and these controls do not make its moving geometry fully playable without sight. No
claim of complete nonvisual equivalence is made.

## CSS and motion

CSS uses ordered layers, logical properties, a small OKLCH token set, system fonts,
grid/flex layout, and a container query for the console. Light and dark themes follow
the system preference. Controls have a minimum 44-pixel height and visible focus.
Reduced motion removes smooth scrolling; the ball movement remains essential to play.
There is no camera shake, orbit animation, flashing, or required decorative transition.
Forced-color and increased-contrast preferences have explicit styles.

## Search-visible content

The document title, description, favicon, game explanation, rules, and full controls
are present in the initial HTML. JavaScript renders the interactive console and chamber.
The heading, metadata, and accessible labels use Containment. The heading scales down
on narrow screens, and the introduction wraps to keep the longer name within the page.
No domain has been chosen, so canonical URLs, `og:url`, hosted share images, and a
host-qualified sitemap are deliberately pending a real deployment decision. No speculative
structured data or invented claims about search ranking are included.
