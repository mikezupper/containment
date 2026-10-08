# Containment rules and tuning

The original research is in [JezzBall details](../references/jezzball-details.md).
This document describes Containment's current code, including choices that differ from the
historical game or are not verified against its executable.

## Core play

The chamber has 28 × 20 cells. Balls are circles of radius 0.32 cell, moving continuously
in the board plane. Balls bounce off solid cells, outer boundaries, and other balls.
The engine resolves movement at 120 fixed ticks per second.

A placement selects an open cell. Two wall halves grow from its center in the selected
axis toward the nearest solid boundary. The entire starting cell belongs to both halves;
a ball touching it can break both. This grid rule prevents a half from solidifying a
cell around a ball. A growing half is one cell thick. A ball hitting
any part of that half, including its tip, destroys it and costs one life. Both halves
can fail independently. A half that completes remains solid even if the other fails.
Only one placement may grow at a time.

Once both halves resolve, a four-neighbor flood from every ball identifies the remaining
open space. Any disconnected space with no ball fills in. Wall cells and filled cells
both count toward the percentage of the original 560-cell chamber. Regions containing
balls remain open, even when they are disconnected from each other.

Clearing at least 75% ends the level. Level one has two balls and two lives. Each next
level resets the chamber and adds a ball and a fresh matching life allowance. Level
49 has 50 balls and repeats at that cap. The score carries forward. Zero lives or an
expired clock ends the run. If expiry or the last lost life coincides with a capture,
game over takes precedence.

## Modern tuning choices

| Setting | Current value |
| --- | --- |
| Normal ball speed at spawn | 5.2 cells/second |
| Slow ball speed at spawn | 3.2 cells/second |
| Wall growth speed, each half | 12 cells/second in both modes |
| Initial time | 150 seconds, displayed as 2:30 |
| Additional time per level | 30 seconds |
| Area points | 10 × level per newly cleared cell |
| Completion time bonus | Rounded-up remaining seconds × 10 × level |
| Area bonus above 80% | 1,000 × level |
| Area bonus above 90% | 2,000 × level, replacing the 80% bonus |

Slow pace changes ball speed and keeps the same wall speed and score formula. It is a
modern assistance option. The original slowed construction too and reduced scoring.
The clock units, exact collision thresholds, placement concurrency, and complete bonus
formula have not been fully reconstructed from the Windows executable. These values
must not be described as historically exact.

Spawn positions are seeded and stratified to avoid overlapping balls. Each new chamber
derives its spawn layout from the run seed and level. Equal-mass ball collision exchanges
normal velocity; there is no rigid-body physics dependency. Visual sphere rotation is
derived from position and does not affect rules.

## Player controls and state

Mouse click or a touch tap places a wall. Right-click, the wall button, or **R** while
the chamber is focused rotates the next placement. Arrow keys move the keyboard aim;
Shift increases movement to four cells. Enter or Space places a wall. **P** or Escape
pauses/resumes while the chamber is focused. Touch scrolling does not deliberately
place walls; a drag beyond 10 pixels is rejected.

Slow pace may change before a run or while paused. Sound starts off and is opt-in.
The best score is saved on this device when local storage is available. There is no
saved run, account, public leaderboard, or multiplayer mode in this milestone.

Hiding the tab or blurring the window pauses the run. Resuming requires a player action.
Graphics loss also pauses and preserves the run, while preventing placement or resume.
The chamber recreates its resources after restoration or a manual retry. It stays paused
until the player resumes.
The camera remains fixed for every phase, so a pointer target does not shift with play.
