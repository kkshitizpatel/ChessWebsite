# Phase 0 Research: Roomy 3.5.5 Settings Popup UI & FIDE/Lichess Chess Legality Engine

**Feature**: `004-board-editor-legality-ui`  
**Date**: 2026-10-13

## Research Decisions

### 1. Roomy Floating Popup Sizing & Viewport Fit (`450px` Width within `1366x768`)
- **Decision**: Render the `3.5.5` Settings Popup as a `position: fixed; z-index: 50` floating panel with `w-[450px]`, `max-h-[calc(100vh-24px)]` (`~680px` natural content height), `overflow-y-auto`, and `p-4 gap-3`, anchored parallel to the right of the `3.5.5` button (`left = Math.min(rect.right + 12, window.innerWidth - 462)`, `bottom = Math.max(window.innerHeight - rect.bottom, 12)`).
- **Rationale**: In the `1366x768` desktop layout, Column 1 is `~580px` wide, leaving `~786px` to the right of Column 1. A `450px`-wide floating popup fits completely to the right of the chessboard (`0%` board overlap, `0px` flex layout shift in Column 2/3) while giving 8 palette buttons per row `>= 48px × 44px` frames (`> 42px × 42px` minimum) and `30px` crisp `'cburnett'` SVG icons.
- **Alternatives Considered**:
  - Keeping `w-[330px]`: Rejected because 8 buttons across `330px` results in cramped `~34px` cells and smaller icons.
  - Inline flex expansion: Rejected because it shifts Column 2 and Column 3 (violating Principle I & II).

### 2. Dedicated FIDE / Lichess Chess Legality Module (`client/src/lib/chessLegalityValidator.ts`)
- **Decision**: Create a pure, zero-dependency TypeScript module `client/src/lib/chessLegalityValidator.ts` that models the 64-square board map (`Record<string, { type: PieceSymbol; color: 'w' | 'b' }>`) and provides deterministic functions for:
  1. **Immediate Action Guard (`validateEditorAction`)**: Checks candidate board state before committing a placement or move so illegal drops (2nd King of same color, touching Kings with Chebyshev distance $< 2$, Pawns on Rank 1/8, $> 8$ Pawns, promotion math quota overflow $\max(0,Q-1)+\max(0,R-2)+\max(0,B-2)+\max(0,N-2) > 8 - P$, or $> 16$ total pieces) snap back / reject immediately with an explanatory message.
  2. **Complete Position Legality (`validateBoardPosition`)**: Evaluates whether the current board can be analyzed or practiced (both Kings present, non-adjacent Kings, inactive King not in check, active King not in impossible multiple check, plus piece/pawn quotas).
  3. **Custom Attack & Check Detection (`isSquareAttacked`, `getCheckingPieces`)**: Works even on incomplete boards (e.g., while editing) where `chess.js` constructor would throw, and combines with `chess.js` validation when both Kings are present.
  4. **Dynamic Castling & En Passant Calculators (`computeEligibleCastlingRights`, `computeLegalEnPassantFiles`)**: Inspects exact home squares (`e1/h1/a1`, `e8/h8/a8`) and rank 4/5 pawn structures to auto-enable/disable castling checkboxes and en passant file options.
- **Rationale**: Satisfies Constitution Principle XI ("Sirf `chess.js` ke validation par depend nahi rehna hai, extra custom legality checks code me lagaye jayenge") and Principle VIII (no GPL libraries).
- **Alternatives Considered**:
  - Relying only on `new Chess(fen)`: Rejected because `chess.js` cannot validate intermediate editor actions or explain specific promotion-math / castling / en passant rules.

### 3. Unified Pointer Events Bridge (`pointerdown`, `pointermove`, `pointerup`)
- **Decision**: Implement a unified Pointer Events coordinate bridge over the chessboard wrapper (`boardWrapperRef`) and palette tool buttons:
  - Maps `(e.clientX, e.clientY)` against `boardWrapperRef.current.getBoundingClientRect()` into `(fileIndex, rankIndex)` (inverting both axes when `boardOrientation === 'black'`).
  - Supports 4 seamless editor interactions:
    1. **Click-to-place**: Clicking a board square when a Piece tool (`wK..wP`, `bK..bP`) is active places that piece on the square (if `validateEditorAction` passes).
    2. **Drag-to-place from Palette**: Pressing `pointerdown` on a palette piece button, moving (`pointermove`) a floating SVG ghost preview over the board, and releasing (`pointerup`) over a square drops the piece on that square.
    3. **Hand Tool Pick & Move**: When Hand tool (`w-hand` / `b-hand`) is active, pressing `pointerdown` on an occupied board square drags that piece (`pointermove` ghost preview) and moves it to the release square (`pointerup`) if legal.
    4. **Trash Click & Drag-Outside-to-Delete**: Clicking a board square with Trash tool (`w-trash` / `b-trash`) removes the piece; dragging any board piece and releasing (`pointerup`) outside `boardWrapperRef`'s bounding box automatically deletes the piece from its origin square.
- **Rationale**: Complies with Constitution Principle IV (Pointer Events required for desktop mouse, touch screens, and Android WebView).
- **Alternatives Considered**:
  - HTML5 `draggable` / `onDragStart` / `onDrop`: Rejected by Constitution Principle IV because HTML5 drag-and-drop fails on mobile touchscreens and Android WebViews.
