# Implementation Plan: Roomy 3.5.5 Chessboard Settings Popup UI & FIDE/Lichess Chess Legality Engine

**Branch**: `004-board-editor-legality-ui` | **Date**: 2026-10-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-board-editor-legality-ui/spec.md`

## Summary

Upgrade the `3.5.5` Chessboard Settings popup to a roomy, high-contrast `450px`-wide floating layout (`~670px–690px` height within the `1366x768` viewport, `>= 42px × 42px` palette button frames, `28px–32px` Lichess `'cburnett'` SVG piece icons, `#1e2327` contrasting Black Pieces Palette surface, `38px` dropdowns, and `40px` `3x3` Time Control preset buttons with `8px` gaps) and integrate a complete offline FIDE/Lichess Chess Legality Engine (`client/src/lib/chessLegalityValidator.ts`) + Pointer Events Board Editor bridge (`pointerdown`, `pointermove`, `pointerup`).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 16.3.4 (App Router)  
**Primary Dependencies**: `chess.js`, `react-chessboard`, `lucide-react`, Tailwind CSS, Lichess `'cburnett'` SVG piece assets (`/public/pieces/cburnett/*.svg`)  
**Storage**: Local React state synchronized in real time with `5.3.1` FEN input and `Column 2` Move Tree  
**Testing**: Visual & interactive verification at `1366x768` (`quickstart.md`) + TypeScript compilation check  
**Target Platform**: Desktop browser (`1366x768` locked layout) + Touch / Capacitor Android WebView (`#remember`)  
**Project Type**: Web application (`client/src/`)  
**Performance Goals**: `< 1 ms` per legality validation check; `60 fps` pointer-drag ghost preview  
**Constraints**: `#offline` execution; zero global vertical scroll; zero overlap over `3.2 Main Board`; zero layout shift in `Column 2` or `Column 3`  
**Scale/Scope**: 1 new pure validation module (`client/src/lib/chessLegalityValidator.ts`) + targeted updates in `client/src/components/ChessDashboard.tsx`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Verification |
|---|---|---|
| **I. Fixed Layout (NON-NEGOTIABLE)** | ✅ PASS | Popup floats at `w-[450px] max-h-[calc(100vh-24px)] overflow-y-auto` within `1366x768` bounds (`#change #visual #size` authorized in Constitution v1.2.0). Zero global vertical scroll. |
| **II. Working Features Protected (NON-NEGOTIABLE)** | ✅ PASS | `3.2 Main Board` dimensions, `3.3 Eval Bar`, `Column 2 Move List` component, `Column 3 AI Coach`, `engine.ts`, and `moveTree.ts` remain untouched. |
| **IV. Android-Ready Architecture (`#remember`)** | ✅ PASS | All palette and board editor interactions use Pointer Events (`pointerdown`, `pointermove`, `pointerup`) with `touch-none select-none`. |
| **V. Online vs Offline Execution** | ✅ PASS | 100% `#offline` client-side execution. |
| **VIII. Licenses and Dependencies** | ✅ PASS | Zero new external packages; uses existing MIT libraries and commercial-OK Lichess `'cburnett'` SVGs. |
| **XI. Chess Legality & Validation (FIDE / Lichess Standard)** | ✅ PASS | Dedicated `chessLegalityValidator.ts` enforces 1 King per side, non-adjacent Kings (`distance >= 2`), no Rank 1/8 pawns, max 8 pawns/16 pieces, promotion quota math, inactive King check block, dynamic home-square castling, dynamic legal en passant files, and invalid position button locks. |

## Project Structure

### Documentation (this feature)

```text
specs/004-board-editor-legality-ui/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── contracts/
    └── legality-and-ui-contracts.md
```

### Source Code (repository root)

```text
client/
└── src/
    ├── lib/
    │   └── chessLegalityValidator.ts   # [NEW] Pure FIDE/Lichess legality & FEN builder module
    └── components/
        └── ChessDashboard.tsx          # [MODIFY] Roomy 450px 3.5.5 popup UI, Pointer Events bridge, legality locks & live FEN sync
```

**Structure Decision**: Keep all FIDE/Lichess chess composition math, attack detection, dynamic castling eligibility, and en passant file calculation cleanly isolated in `client/src/lib/chessLegalityValidator.ts`, while `ChessDashboard.tsx` handles the roomy `450px` popup UI, Pointer Events coordinate mapping, and button/FEN state synchronization.

---

## Key Architecture Components

### 1. Floating Layer & Roomy Responsive Sizing (`#size #visual`)
- **Popup Container**:
  - `fixed z-50 w-[450px] max-h-[calc(100vh-24px)] overflow-y-auto bg-[#1e1e1e] text-gray-200 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] border border-[#2e2e2e] p-4 flex flex-col gap-3`
  - Positioned parallel to the right of `3.5.5 Settings` button via `left = Math.min(rect.right + 12, window.innerWidth - 462)` and `bottom = Math.max(window.innerHeight - rect.bottom, 12)` so it never covers `3.2 Main Board` and causes `0px` flex layout jump in Column 2/3.
- **Palette & Control Proportions**:
  - Each of the 8 palette buttons per row sits inside a `grid-cols-8 gap-1.5` container with `min-w-[42px] h-[44px]` frame (`>= 42px × 42px`).
  - Lichess `'cburnett'` SVG piece icons are sized at `w-[30px] h-[30px]` (`28px–32px`) for crisp visual clarity.
  - `3.5.5.3 Black Pieces Palette` uses a distinct contrasting dark-slate surface (`bg-[#1e2327] border border-[#2f373e]`) so black piece silhouettes stand out clearly, with a green border highlight (`border-primary bg-primary/20`) on the active tool.
  - `3.5.5.1` `"Level: 6"` badge is single-line (`whitespace-nowrap`); `3.5.5.5 Turn to play` and `3.5.5.7 En passant rights` dropdowns are `h-[38px]`; `3.5.5.8 Time Control` `3x3` preset buttons are `h-[40px]` with `gap-2` (`8px` equal gaps).

### 2. Chess Legality Engine Module (`client/src/lib/chessLegalityValidator.ts`)
- **Board Representation & FEN Serialization**:
  - `parseFenToBoardMap(fen)` and `buildFenFromEditorState(board, turn, castling, epFile)` convert cleanly between a 64-square `BoardMap` (`Record<string, { color, type, code }>`) and 6-field FEN strings (even when a King is temporarily missing after `Clear Board`).
- **Real-Time Action Validator (`validateEditorAction`)**:
  - Executed before applying any palette click-to-place, palette drag-drop, or Hand tool move:
    1. **Exact 1 King Rule**: If placing a King (`wK` or `bK`) when a King of that color already exists on another square, block immediately (`"Only 1 King per side is allowed"`).
    2. **Non-Adjacent Kings Rule**: Compute Chebyshev distance $\max(|\Delta \text{file}|, |\Delta \text{rank}|)$ between `wK` and `bK`; if $< 2$, reject/snap back (`"Kings cannot touch (minimum distance 2 squares)"`).
    3. **Pawn Rank 1/8 Rule**: If placing or moving a Pawn (`wP` or `bP`) onto Rank `1` or Rank `8`, reject/snap back (`"Pawns cannot be placed on Rank 1 or Rank 8"`).
    4. **Max 8 Pawns Rule**: If resulting pawn count for that color $> 8$, reject (`"Maximum 8 pawns per side allowed"`).
    5. **Promotion Math Quota & Max 16 Pieces**:
       $$\max(0, Q - 1) + \max(0, R - 2) + \max(0, B - 2) + \max(0, N - 2) \le 8 - \text{current\_pawns}$$
       and total pieces for that color $\le 16$. If exceeded, reject (`"Promotion quota exceeded for remaining pawns"`).
- **Full Position & Check Validator (`validateBoardPosition` & `canSwitchTurn`)**:
  - Verifies both `wK` and `bK` exist on the board (`"Invalid position: White King is missing"` / `"Invalid position: Black King is missing"`).
  - Verifies non-adjacent Kings, Pawn ranks/counts, and Promotion Math quota.
  - **Inactive Side Check Detector (`isSquareAttacked`)**: Checks whether the inactive player's King (`turn === 'w' ? 'b' : 'w'`) is attacked by any piece of the active player. If attacked, marks position invalid (`"Opponent king cannot be in check"`), and blocks `3.5.5.5 Turn to play` switch if switching turn would put the newly inactive King in check.
  - **Impossible Check Detector**: Counts attacking pieces on the active King; blocks $> 2$ simultaneous checkers or illegal double checks (e.g., two sliding/knight/pawn checks that cannot be discovered).
- **Dynamic Castling Validity Map (`computeEligibleCastlingRights`)**:
  - `wK`: `board['e1']?.code === 'wK' && board['h1']?.code === 'wR'`
  - `wQ`: `board['e1']?.code === 'wK' && board['a1']?.code === 'wR'`
  - `bK`: `board['e8']?.code === 'bK' && board['h8']?.code === 'bR'`
  - `bQ`: `board['e8']?.code === 'bK' && board['a8']?.code === 'bR'`
  - Any castling flag whose eligibility becomes `false` is immediately auto-unchecked and disabled in UI state.
- **Legitimate En Passant File Calculator (`computeLegalEnPassantFiles`)**:
  - Returns the list of files `['a'..'h']` where a legal en passant capture is physically possible for `turn`:
    - `turn === 'w'`: Black pawn on `<file>5`, `<file>6` and `<file>7` empty, and a White pawn on `<adjFile>5`.
    - `turn === 'b'`: White pawn on `<file>4`, `<file>3` and `<file>2` empty, and a Black pawn on `<adjFile>4`.
  - If empty, locks En Passant dropdown to `'-'` and disables it.

### 3. Pointer Events Bridge (`pointerdown`, `pointermove`, `pointerup`)
- **Square Resolution Helper (`getSquareFromPointerEvent(clientX, clientY)`)**:
  - Uses `boardWrapperRef.current.getBoundingClientRect()`.
  - If `(clientX, clientY)` is outside `[rect.left, rect.right] × [rect.top, rect.bottom]`, returns `null` (used to trigger drag-outside deletion when dragging a board piece).
  - Otherwise maps normalized $(x, y) \in [0, 8) \times [0, 8)$ to file (`a..h`) and rank (`1..8`), accounting for `boardOrientation === 'white' | 'black'`.
- **Interactive Modes**:
  - **Palette Drag-to-Place & Click-to-Select**: `onPointerDown` on any palette piece (`wK..wP`, `bK..bP`) selects that tool and starts a pointer-drag tracking session; if the user drags onto the board and releases (`pointerup`), places the piece on the target square; if the user simply clicks the palette button and then clicks/taps a board square, places the piece on that square.
  - **Hand Tool (`w-hand` / `b-hand`)**: When active while the editor popup is open, pressing `pointerdown` on an occupied board square lifts that piece into a floating ghost preview (`pointermove`); releasing (`pointerup`) on a legal target square moves the piece, or releasing outside the board deletes it.
  - **Trash Tool (`w-trash` / `b-trash`)**: Clicking/tapping any occupied board square immediately removes that piece and recalculates castling, en passant, FEN, and position validity.

### 4. State, Live FEN Sync & Button Locks
- **Real-Time Sync**:
  - Every committed board edit updates `editorBoard`, recalculates `eligibleCastling` and `legalEpFiles`, builds the 6-field FEN (`buildFenFromEditorState`), updates `fenInput` (`5.3.1`), resets `moveTree` (`Column 2`) with `[SetUp "1"]` and `[FEN "..."]`, and updates `chessRef.current` whenever `positionValidation.isValid === true`.
- **Invalid State Guard**:
  - When `!positionValidation.isValid` (or after `3.5.5.10 Clear Board`):
    - `3.5.4 Start Analysis` and `3.5.3 Practice with Computer` buttons are disabled (`disabled={!positionValidation.isValid || isAnalyzingLocal}`).
    - An inline warning banner is displayed in the popup/board area showing `positionValidation.reason` (or temporary `editorActionFeedback` when a single illegal drop was blocked).
- **`3.5.5.9 Starting Position` & `3.5.5.10 Clear Board`**:
  - `Starting Position`: Resets to `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`, Turn = `'w'`, all 4 castling rights checked & enabled, En Passant = `'-'`, Move List cleared, and Invalid State Guard cleared.
  - `Clear Board`: Sets empty `BoardMap` (`8/8/8/8/8/8/8/8 w - - 0 1`), all castling unchecked & disabled, En Passant locked to `'-'`, Move List cleared, and Invalid State Guard activated (`"Invalid position: White King is missing"`).
