# Original-game calibration evidence

Checked: 8 October 2026. This record compares the remake with the original help and
archived screenshot. It does not claim a controlled run of the Windows executable.
The broader [historical reference](jezzball-details.md) supplies publication and visual
context; [product rules](../product/rules.md) specify the code's behavior.

On 8 October 2026, the owner closed `jezz-3gt` as no longer needed. Exact historical
calibration is out of scope. The findings and measurement protocol below remain as
reference material; no original-executable comparison was performed.

## Artifact provenance

The source is the [Internet Archive's preserved JezzBall](https://archive.org/details/win3_JezzBall).
The help was extracted with HelpDeco and inspected as RTF. The original binaries and
extracted text are research inputs, not assets bundled with the game.

| Artifact | SHA-256 |
| --- | --- |
| `JEZZBALL.EXE` | `0450d0559fa5957d813bdd7be1f71122bf23047869b610802386320f109cb705` |
| `JEZZBALL.HLP` | `aab2b95e5eae8348d3aa3e092753f3196d2ac786d4c3fc9cb12d0c638c05fa32` |

The available environment has no Wine, DOSBox, or Windows guest. Static help inspection
cannot settle timing or collisions. No historical tuning values changed during this
pass, and no faithful/classic mode is advertised.

## What the evidence establishes

| Concern | Original evidence | Remake treatment |
| --- | --- | --- |
| Completion | Help: at least 75% of the chamber | Same threshold, based on original area |
| Wall halves | Help: grow both ways; an anchored half survives the other half's failure | Independent halves and retained partial walls |
| Scoreable area | Help: constructed squares and enclosed empty areas both score | Both count toward points and cleared area |
| Level growth | Help: each level adds an atom | Same, with a documented maximum-level policy |
| Pause | Help: pause and minimization stop the clock | Pause, blur, visibility, and graphics loss stop simulation time |
| Slow mode | Help: both atoms and construction slow; points halve | Assistance mode slows only atoms, with unchanged scoring |
| Initial square value | Help: 3.5 Slow, 7 Fast | Modern value: 10 × level |
| Area bonuses | Help: per-percent rewards above 80%, then 90% | Modern fixed tier bonuses; not the original formula |
| Board dimensions | Screenshot and help's row/column arithmetic imply 28 × 20 | Same grid; this is an inference from two agreeing sources |

The help's level-seven life example is inconsistent with its progression description.
The remake follows the two-life start and fresh allowance matching the atom count;
that exception remains visible in the historical reference.

## Measurements needed for exact fidelity

A controlled original-game recording should identify the artifact hash, guest OS,
emulator and version, CPU setting, window dimensions, speed option, and measured wall
time. Record several repeats rather than treating emulator frame cadence as original
timing. A software timer may behave differently under another guest or CPU setting.

| Unresolved detail | Controlled observation | Evidence to retain |
| --- | --- | --- |
| Timer units and level allowance | Record the counter over a measured wall-time interval at multiple levels, then repeat while paused and minimized | Video, counter samples, configuration, elapsed time |
| Atom and wall speeds | Track positions in grid units in Fast and Slow, including identical wall spans | Frame timestamps and coordinate measurements |
| Construction concurrency | Click a second open cell while a long wall is growing | Input timing and visible wall identities |
| Starting-cell collision | Launch with an atom crossing the origin from several directions | Frame sequence showing life count and surviving halves |
| Tip collision | Arrange an atom to meet the moving endpoint, then compare a side hit | Contact frame, wall state, life change |
| Atom-to-atom contact | Observe isolated crossings and head-on encounters | Before/after trajectories |
| Percentage rounding | Clear known cell counts around completion and bonus thresholds | Cell count and displayed percentage |
| Complete bonus formula | Compare finishes near 80% and 90%, varying time, lives, level, and speed independently | Score before capture, cells gained, final score, all varied inputs |

The remake's starting-cell footprint, one-placement limit, collision response,
150-second initial clock, 30-second level increment, and fixed-step cadence remain
explicit design choices. A displayed historical counter of `1500` alone does not
establish a duration in seconds. Changing these choices requires observed evidence
and regression cases that preserve the verified interaction.

## Current regression coverage

Engine tests cover the 75% threshold, independent half failures, retained partial walls,
multiple occupied regions, original-area accounting, level progression, pause, expiry,
and seeded determinism. A starting-cell regression prevents completed cells from
enclosing a ball. These establish internal consistency; they do not prove the original
used the same collision algorithm or timing. Beads issue `jezz-3gt` is closed at the
owner's request because historical calibration is no longer required.
