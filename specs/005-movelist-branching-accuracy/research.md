# Phase 0 Research: Column 2 Lichess PGN Tree Branching, Move Classification Badges & 4.6 Accuracy Summary Panel

## 1. Lichess PGN Variation Tree Rendering (`4.2`)
- **Decision**: Replace the flat decimal `labelPrefix` (`1.1`, `2.1`, `3.1`) in `MoveList.tsx` with a structured variation tree traversal that emits main-line paired rows (`depth = 0`) and indented sub-variation rows (`depth >= 1`) using legitimate chess move numbers (`node.moveNumber`).
- **Rationale**: In standard chess notation (FIDE / Lichess / Chess.com), move numbers always represent the full-move count (`1`, `2`, `3`...). When a variation begins on Black's half-move (branching off a White move), it is written as `1... f6 2. g3 g6` inside an indented variation block.
- **Alternatives Considered**: Inline PGN parenthetical text `(1... f6 2. g3 g6)` without row checkboxes — rejected because `4.3 Move Selection Checkboxes` and `4.5 Move Classification Visuals` require structured rows so every variation move can be individually clicked, evaluated, and selected for AI analysis.

## 2. Sequential Batch Stockfish Evaluation & Principle VI Formulas (`4.5` & `4.6.1`–`4.6.10`)
- **Decision**: Create `client/src/lib/moveAnalysisDispatcher.ts` to run a sequential evaluation pass over the game's `MoveTree` nodes using `engineRef.current.evaluateFen(fen, 10)` (`MultiPV 2`) when `3.5.4 Start Analysis` is clicked, normalizing UCI scores to White's perspective and applying Constitution Principle VI formulas.
- **Rationale**: Stockfish UCI reports `score cp` and `score mate` relative to the side to move in the given FEN. Normalizing to White's perspective (`cpWhite = turnToMove === 'w' ? score : -score`) ensures `WinPercentBefore` and `WinPercentAfter` are always directionally consistent when computing `Drop` for White and Black moves.
- **Alternatives Considered**: Parallel worker pool — rejected because a single lightweight Web Worker (`stockfish-19-lite-single` / `engine.ts`) is mandated by Constitution Principle VIII (`zero-server load, single-threaded worker`).

## 3. Collapsible 4.6 Accuracy Summary Panel inside Column 2 (`AccuracyReportPanel.tsx`)
- **Decision**: Mount `AccuracyReportPanel` as a `h-[320px] shrink-0` flex child at the bottom of Column 2 (`w-[300px] xl:w-[330px] h-full flex flex-col overflow-hidden`), hidden by default (`isOpen = false`), auto-opened when `Start Analysis` completes, and collapsible via its top-right `'X'` close button.
- **Rationale**: Matches the user's reference screenshots (Red Box = Move List, Green Box = Accuracy Summary Panel at the bottom of Column 2, Image 2 = photo-less player names, Accuracy score cards, and 9 classification rows) while strictly preserving the `1366x768` zero-global-scroll layout (Principle I).
- **Alternatives Considered**: Full-screen modal overlay — rejected because the specification requires the panel inside Column 2's bottom green box container.
