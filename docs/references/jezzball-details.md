# JezzBall: rules, appearance, and gameplay

This reference describes the original **1992 Windows JezzBall**, with notes distinguishing it from later remakes. Research checked on October 8, 2026, including the original `JEZZBALL.HLP` help file and an archived screenshot.

## What JezzBall was

JezzBall is a single-player, real-time arcade puzzle game created by **Dima Pavlovsky**, produced by **Marjacq Micro Ltd.**, and published by **Microsoft**. It appeared in **Microsoft Entertainment Pack 4**, and subsequently in **The Best of Microsoft Entertainment Pack**. It is associated with the Windows 3.x era, although many people remember playing it on later Windows computers.

The premise is simple: red-and-white balls bounce around a rectangular chamber, and you build walls to confine them to progressively smaller spaces. Clear **at least 75% of the original chamber** to finish a level. Its territory-capture concept resembles *Qix*, but JezzBall's distinctive interaction is placing a wall that automatically grows in two opposite directions. [Sources: original game's About text in the [archived software](https://archive.org/details/win3_JezzBall), [publication history](https://en.wikipedia.org/wiki/JezzBall).]

The original help supplies a small science-fiction premise: the balls are newly discovered **Jezz atoms**, and tighter confinement earns more galactic credits for transporting them to Earth. This is background flavor; play takes place entirely in the chamber. [Source: `JEZZBALL.HLP`, “Overview,” in the [original archive](https://archive.org/details/win3_JezzBall).]

## The basic play loop

1. Watch the atoms move and anticipate their next bounces.
2. Choose a horizontal or vertical wall orientation.
3. Position the wallbuilder at a useful point in the open chamber.
4. Click once. Two wall halves extend automatically from that point.
5. If a half reaches an existing boundary safely, it becomes a permanent wall.
6. Newly enclosed regions containing no atoms are filled in and counted as cleared area.
7. Repeat until the cleared percentage reaches the target, or until lives or time run out.

There is no avatar to steer around the board. The mouse positions a construction tool, and the challenge is choosing **where and when to commit**. Once construction starts, the moving atoms make the outcome uncertain. [Sources: original help, “Playing the Game,” in the [archive](https://archive.org/details/win3_JezzBall); independent wall-half behavior described in the [archived game description](https://archive.org/details/win3_JezzBall).]

## Controls and menus

| Input or command | Original behavior |
| --- | --- |
| Move mouse | Position the wallbuilder. |
| Left-click | Begin wall construction at the selected location. No dragging is required. |
| Right-click | Toggle between horizontal and vertical construction. |
| Double-headed cursor arrow | Show the currently selected wall direction. |
| `F2` / Game → New Game | Start a new game. |
| `F3` / Game → Pause | Pause or resume; the countdown stops while paused. |
| Paused button in the chamber | Resume a paused game. |
| `Esc` / Minimize | Minimize the original Windows application; its countdown stops. |
| Options → Slow / Fast | Change the game speed. Fast is the initial setting. |
| Options → Sound | Toggle game sounds. |
| Game → Demo | Watch a demonstration of playing techniques. |
| Game → High Scores | View the high-score table. |
| `F1` | Open Help. |

[Source: original `JEZZBALL.HLP`, “Playing the Game,” “Strategy and Hints,” and menu-command topics, checked against menu strings in the [archived executable](https://archive.org/details/win3_JezzBall).]

## Wall construction and collisions

### Two halves, one click

A horizontal deployment grows left and right. A vertical deployment grows upward and downward. Both begin at the click location and take time to reach the surrounding walls.

```text
Horizontal:    ← growing half — click — growing half →

Vertical:                    ↑
                        growing half
                             |
                           click
                             |
                        growing half
                             ↓
```

The original uses red and blue for the two extending sides. Those colors make the construction easy to see against the gray board. The player chooses the orientation and origin, rather than drawing a free-form path. [Sources: [original-game visual description](https://gamefaqs.gamespot.com/pc/581727-jezzball/reviews/21086), [independent halves in the archived description](https://archive.org/details/win3_JezzBall).]

### Vulnerable during construction

An atom striking an unfinished wall half destroys that half and costs a life. The other half can keep extending and succeed. A half that has already anchored can remain as a useful partial wall after its partner is destroyed. Completed walls contain and reflect atoms instead of being destroyed by ordinary contact.

This means a failed deployment can still change the board. Building near an edge can secure the short half quickly, even if the longer half is subsequently hit. The original help explicitly recommends this deliberate use of partial walls in crowded chambers. [Sources: original help, “Playing the Game” and “Strategy and Hints,” in the [archive](https://archive.org/details/win3_JezzBall); two-piece construction also described by the [JezzBall Classic developer](https://winterdust.itch.io/jezzball-classic).]

### Position changes the risk

As a practical consequence of simultaneous growth, placing the origin near the middle of the intended span minimizes the distance the slower-to-finish half must travel. Placing it near an edge anchors one half sooner, while leaving the other exposed longer. These support different strategies: complete a safe division, or spend a life to establish part of a future enclosure.

## How area capture works

**Empty space is captured; atoms remain alive inside the remaining open space.** The goal is confinement, rather than removing the atoms individually.

When construction seals a region off from all atoms, that region fills black. If a completed divider leaves atoms on both sides, both sides remain playable. The dividing wall itself still occupies area, but the game does not automatically fill the smaller side merely because it is smaller. [Sources: [original gameplay description](https://en.wikipedia.org/wiki/JezzBall); original help, “Scoring,” in the [archive](https://archive.org/details/win3_JezzBall).]

For example:

- **Both atoms on the right:** a successful vertical divider can clear the empty left region.
- **One atom on each side:** the divider creates two occupied rooms. You can continue shrinking each room separately.
- **Several occupied rooms:** their remaining open areas collectively count against the 75% target. You do not have to gather every atom into one final box.

Conceptually, progress is:

```text
cleared percentage = 100 × cleared area / original chamber area
```

The original counts both constructed wall squares and the empty regions those walls cut off. The denominator remains the starting chamber area. For example, clearing half the board and then half of the remaining half yields 75% cleared overall. This example describes the geometry; actual grid cells and wall thickness affect the precise displayed result.

## Levels, lives, and the timer

The first level starts with **two atoms and two lives**. Each subsequent level normally adds one atom, with a fresh life allowance matching the atom count. Losing all lives ends the game. Finishing a level restores a full chamber for the next challenge, while the accumulated score carries forward.

| Level | Starting atoms | Starting lives |
| --- | ---: | ---: |
| 1 | 2 | 2 |
| 2 | 3 | 3 |
| 3 | 4 | 4 |
| 10 | 11 | 11 |

The original reaches **50 atoms at level 49** and repeats that maximum difficulty rather than presenting a final victory ending. [Source: [JezzBall gameplay and progression](https://en.wikipedia.org/wiki/JezzBall).]

Each level also has a countdown. Running out of time ends the game, even with lives remaining. Later levels provide a larger time allowance. The original displays a numeric counter rather than a modern `minutes:seconds` clock; historical guides list `1500` for level one. That number should not be interpreted as 1,500 seconds. [Sources: original help, “Rules of the Game,” in the [archive](https://archive.org/details/win3_JezzBall); [historical timer table](https://gamefaqs.gamespot.com/pc/581727-jezzball/faqs/35608).]

The central difficulty increase is the number of moving atoms. More atoms make safe construction windows rarer, especially when many share the same small room. Slow mode reduces atom and wallbuilder speed and awards half the points of Fast mode. [Source: original help, “Playing the Game” and “Options Menu Commands,” in the [archive](https://archive.org/details/win3_JezzBall).]

## Scoring

The original awards points for cleared grid squares, including wall construction and empty regions filled after enclosure. The value increases with the number of atoms in play. Fast mode pays twice the Slow-mode value.

The original help gives these level-one examples:

| Cleared amount | Slow | Fast |
| --- | ---: | ---: |
| One square | 3.5 points | 7 points |
| One full vertical column | 70 points | 140 points |
| One full horizontal row | 98 points | 196 points |

It also describes additional area bonuses **above 80% cleared**, and a further bonus tier **above 90%**. These bonuses increase with the atom count. [Source: original `JEZZBALL.HLP`, “Scoring,” in the [archive](https://archive.org/details/win3_JezzBall).]

The practical scoring challenge is to set up a final capture that jumps from below 75% to substantially above it. An illustrative finish from 72% to 93% reaches both bonus tiers; finishing at 76% completes the level with less area reward. You need to prepare that large final enclosure before crossing the completion threshold.

The faithful remake JezzBall Classic additionally describes end-of-level rewards for remaining time and lives. Its page is useful corroboration of the scoring feel, but the original help is the stronger reference for the square values and area thresholds above; this document does not claim a fully verified original bonus formula. [Source: [JezzBall Classic gameplay description](https://winterdust.itch.io/jezzball-classic).]

## What the original looked like

![Archived screenshot of the original JezzBall showing its Windows title bar, gray chamber, red-and-white atoms, and status labels.](https://archive.org/download/win3_JezzBall/00_coverscreenshot.jpg)

*The image is loaded from the Internet Archive. The patterned desktop visible outside the game window belongs to the emulation environment.*

The defining visual elements are:

| Element | Appearance |
| --- | --- |
| Application frame | A compact Windows 3.x window, with a title bar and standard window controls. |
| Menu bar | Game, Options, and Help across the top. |
| Chamber | A wide rectangular gray field with a fine, visibly tiled grid. |
| Atoms | Small red-and-white pixel sprites, with simple shading suggesting little balls. |
| Wallbuilder cursor | A small double-headed arrow showing the selected axis. |
| Construction | Bright red and blue wall halves extending in straight lines. |
| Captured space and permanent walls | Black areas replacing the gray playable field. |
| Status information | White text on black surrounding the chamber. |

Lives appear above the chamber toward the left, the score near the top center, and time toward the right. **Area Cleared** appears centered below the chamber. The screenshot shows a 28-column by 20-row grid; this also agrees with the full-column and full-row scoring examples in the original help.

Its visual identity comes from crisp pixel edges, restrained colors, a conspicuous grid, and strong contrast between the remaining gray chamber and the expanding black captured area. There is a fixed view of the board throughout play. [Sources: direct inspection of the [archived screenshot](https://archive.org/download/win3_JezzBall/00_coverscreenshot.jpg), [period visual description](https://gamefaqs.gamespot.com/pc/581727-jezzball/reviews/21086), and original help's scoring examples.]

## Movement, pacing, and sound

Atoms keep moving while you choose a placement, and wall construction visibly unfolds over time. The player therefore alternates between watching trajectories, identifying an opening, clicking, and waiting for the wall halves to resolve. Shrinking occupied rooms changes how frequently atoms encounter their boundaries.

The game includes sound effects and a Sound toggle. The original help says a sound card and driver are required; the archived executable references sounds for events including bounces, atom hits, and level completion. Exact playback can depend on which audio files a preserved copy includes. Optional music libraries advertised by modern remakes should be treated as remake features. [Sources: original help and executable in the [archive](https://archive.org/details/win3_JezzBall); modern audio additions listed by [JezzBall Classic](https://winterdust.itch.io/jezzball-classic).]

As a design interpretation, the appeal is the tension between orderly geometry and continuous motion. A good capture produces an immediate, readable reward: a large gray region turns black, the percentage rises, and the remaining problem becomes smaller. The same reduction can make the next move harder when it concentrates many atoms together.

## Common strategies

The original help recommends the following approaches:

- **Learn on Slow.** Use the extra reaction time to practice placement and timing.
- **Favor shorter spans.** Initial vertical cuts cross the shorter dimension of the wide chamber.
- **Center safe deployments.** Let the two halves share the construction distance.
- **Separate crowded groups.** Multiple occupied rooms can be easier to shrink than one dense room.
- **Use partial walls deliberately.** Secure one end near a boundary and accept a lost life when the resulting barrier improves future options.
- **Build narrow traps.** A long channel can admit an atom that you then seal in with another wall.
- **Prepare a large final capture.** Plan for the area bonus before reaching 75%.
- **Check the cursor direction.** A well-timed click is wasted if it launches along the wrong axis.

[Source: original `JEZZBALL.HLP`, “Strategy and Hints,” in the [archive](https://archive.org/details/win3_JezzBall).]

## Details to preserve when recreating its feel

These priorities follow from the rules and visuals above:

1. Two independently resolving wall halves launched by a single click.
2. Visible construction time, with danger during construction and safety after anchoring.
3. Useful surviving partial walls after a collision.
4. Automatic filling of enclosed, atom-free regions.
5. Progress based on the original board area, with a 75% completion target.
6. Multiple occupied regions remaining active at once.
7. More atoms and a fresh life allowance on subsequent levels.
8. Clear presentation of lives, score, time, orientation, and cleared percentage.
9. Strong visual distinction between open space, active construction, and completed walls.

For an exact historical reproduction, additional observation of the original executable is needed for wall growth rate, atom velocities, atom-to-atom collisions, moving-tip collision exceptions, construction concurrency, timer units, percentage rounding, and the complete bonus calculation. Those details are not established by this reference. Later clones can differ in these areas even when their basic rules match.

## Sources and evidence notes

- [Original JezzBall preserved by the Internet Archive](https://archive.org/details/win3_JezzBall): primary software artifact. This research inspected `JEZZBALL.HLP`, the executable's menu/About strings, and its sound references. The help topics supply controls, scoring, and strategy details.
- [Original-game screenshot](https://archive.org/download/win3_JezzBall/00_coverscreenshot.jpg): direct visual evidence for the board, sprites, window, and status layout.
- [JezzBall overview on Wikipedia](https://en.wikipedia.org/wiki/JezzBall): secondary corroboration for publication history, starting lives, and maximum-level behavior.
- [AlaskaFox's 2005 FAQ on GameFAQs](https://gamefaqs.gamespot.com/pc/581727-jezzball/faqs/35608): secondary reference for the historical timer display. Its tables and examples contain inconsistencies, so they are not treated as an exact specification.
- [Shady's 2001 review on GameFAQs](https://gamefaqs.gamespot.com/pc/581727-jezzball/reviews/21086): player account corroborating the gray grid and red/blue construction colors. Its reported sound problem is not evidence that the original lacked audio.
- [JezzBall Classic by Winterdust](https://winterdust.itch.io/jezzball-classic): developer documentation for a later remake that aims to reproduce the original. Used for corroboration and to identify additions; its mods, special atom types, background photographs, and music selection are not assumed to be original features.

The original help itself includes an inconsistent level-seven hit-count example. The progression table here follows the consistently documented two-life start and one additional life per added atom instead of repeating that example.
