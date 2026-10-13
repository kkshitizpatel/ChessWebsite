# Quickstart & Verification Guide: `004-board-editor-legality-ui`

## Prerequisites
- Next.js dev server running at `http://localhost:3000` (`npm.cmd run dev` in `client/`).
- Desktop viewport set to `1366x768`.

## Verification Scenarios

1. **Roomy Popup Dimensions & Contrast (`#size #visual`)**:
   - Click `3.5.5 Settings` (right-most slider button in `3.5` bottom bar).
   - Verify popup width is `450px` (`440px–460px` range), floats to the right of the chessboard without covering the board, and fits inside `768px` height with zero global vertical scroll.
   - Verify Black Pieces Palette has a contrasting dark-slate surface (`#1e2327`), tool buttons are `>= 42px × 42px`, `'cburnett'` SVG piece icons are `30px` (`28px–32px`), dropdowns are `38px` high, and Time Control buttons are `40px` high with `8px` gaps.

2. **Pointer Events Board Interactions (`#drag #logic`)**:
   - **Click-to-place**: Select `wQ` in White Palette and click `d4` on the board → White Queen appears on `d4`.
   - **Drag-to-place**: Press and drag `bN` from Black Palette onto `f6` → Black Knight drops on `f6`.
   - **Hand Tool**: Select Hand tool, drag White Queen from `d4` to `e4` → Queen moves to `e4`.
   - **Trash & Drag-Outside Delete**: Select Trash tool and click `f6` → Black Knight is removed. Drag `e4` Queen outside the chessboard and release → Queen is deleted.

3. **FIDE / Lichess Chess Legality Engine (`Principle XI`)**:
   - **King Rules**: Try placing a 2nd White King → blocked. Try moving White King next to Black King → blocked.
   - **Pawn Rules**: Try dropping a Pawn on Rank 1 or Rank 8 → rejected/snaps back. Try adding a 9th Pawn → blocked.
   - **Promotion Math**: With 8 White Pawns on board, try adding a 2nd White Queen → blocked by promotion math quota. Delete 1 White Pawn (7 pawns left) and add 2nd White Queen → allowed ($1 \le 8 - 7$).
   - **Dynamic Castling**: Move White Rook off `h1` → `White 0-0` checkbox immediately unchecks and disables. Move White King off `e1` → both `White 0-0` and `White 0-0-0` uncheck and disable.
   - **Dynamic En Passant**: Verify En Passant dropdown is locked to `'-'` and disabled on starting board; set up a White pawn on `e5` and Black pawn on `d5` (with `d6`/`d7` empty and White to play) → file `'d'` becomes selectable.
   - **Clear Board & Starting Position**: Click `Clear Board` → board empties, `Start Analysis` & `Practice` disable, inline warning `"Invalid position: White King is missing"` appears. Click `Starting Position` → full initial setup restored and warning clears.
