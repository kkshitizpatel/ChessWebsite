# Quickstart Validation Guide: 3.5 Bottom Control Bar & 3.5.5 Settings Popup UI

**Feature**: `003-settings-popup-ui`
**Created**: 2026-10-13
**Status**: Ready for Verification

## Prerequisites
- Next.js development server running at `http://localhost:3000`.
- Desktop viewport set to `1366x768` px.

## Validation Scenarios

### 1. Bottom Control Bar Order & Symmetry (`3.5`)
1. Open `http://localhost:3000`.
2. Inspect the bottom bar below the chessboard from left to right.
3. **Verify**:
   - **3.5.1 Flip board** is the left-most first button (`ArrowUpDown` icon), and clicking it flips the board orientation.
   - Next are **3.5.2 Playback buttons** (`Start`, `Back`, `Forward`, `End`).
   - Next is **3.5.3 Practice with Computer** (`Target` icon).
   - Next is **3.5.4 Start Analysis** (Green button).
   - Right-most is **3.5.5 Chessboard Settings** (`SlidersHorizontal` icon).
   - All buttons have equal height (`42px`), equal inter-button gaps, and vertically centered icons (`22px`).

### 2. Settings Popup Placement & Inner Scroll (`3.5.5`)
1. Click the **3.5.5 Settings** button.
2. **Verify**:
   - Popup opens parallel to the right of the chessboard (over the Move List column), covering 0% of the chessboard.
   - Popup fits completely inside the `1366x768` viewport and scrolls internally if needed without shifting any column layout.
   - Clicking outside or pressing `Escape` dismisses the popup immediately.

### 3. Settings Popup Sections & Reference Match (`3.5.5.1` – `3.5.5.10`)
1. Open the **3.5.5 Settings** popup and verify from top to bottom:
   - **3.5.5.1 Computer Level**: `COMPUTER LEVEL` header, single-line `Level: 6` badge (no text wrapping), scale `1–10`, green slider thumb.
   - **3.5.5.2 Show best move**: Label + toggle switch (default OFF).
   - **3.5.5.3 Black Pieces Palette**: `Hand`, `bK`, `bQ`, `bR`, `bB`, `bN`, `bP` (`cburnett` SVGs), `Trash` with Pointer Event (`onPointerDown`) selection highlight.
   - **3.5.5.4 White Pieces Palette**: `Hand` (default active green box), `wK`, `wQ`, `wR`, `wB`, `wN`, `wP` (`cburnett` SVGs), `Trash`.
   - **3.5.5.5 Turn to play**: Dropdown (`White to play` / `Black to play`).
   - **3.5.5.6 Castling rights**: `White` and `Black` rows with `0-0` and `0-0-0` green checkboxes.
   - **3.5.5.7 En passant rights**: Dropdown (`-`, `a`–`h`).
   - **3.5.5.8 Time control**: `TIME CONTROL` header + toggle switch + 9-preset 3x3 grid (`10 min` highlighted green by default).
   - **3.5.5.9 Starting Position & 3.5.5.10 Clear Board**: Side-by-side equal-width buttons at the bottom.
