# Tasks: Roomy 3.5.5 Chessboard Settings Popup UI & FIDE/Lichess Chess Legality Engine

**Feature Branch**: `004-board-editor-legality-ui` | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Phase 1: UI Sizing & Contrast (User Story 1 - Priority: P1) 🎯 MVP

**Goal**: Expand the `3.5.5` Settings Popup to a roomy `450px` width (`~670px–690px` height within the `1366x768` viewport with inner scroll), enlarge palette tool button frames to `>= 42px × 42px` with crisp `30px` (`28px–32px`) Lichess `'cburnett'` SVG icons, apply a contrasting dark-slate surface (`#1e2327` / `#22272b`) to the Black Pieces Palette row, keep `"Level: 6"` on a single line, set dropdown heights to `38px`, and style the `3x3` Time Control preset buttons at `40px` height with `8px` equal gaps.

**Independent Test**: Open `http://localhost:3000` at `1366x768` px, click `3.5.5 Settings`, and verify the `450px` popup width, right-side parallel float (0% board overlap, 0px global scroll), `>= 42px × 42px` palette button frames, `30px` `'cburnett'` SVG icons, contrasting Black Pieces Palette container, `38px` dropdowns, and `40px` Time Control preset grid with `8px` gaps.

- [X] T001 [US1] Expand 3.5.5 popup container to 450px width (`w-[450px] max-h-[calc(100vh-24px)] overflow-y-auto p-4 gap-3`) and update right-side floating coordinate clamping (`window.innerWidth - 462`) in client/src/components/ChessDashboard.tsx
- [X] T002 [US1] Upgrade 3.5.5.3 Black Pieces Palette (`bg-[#1e2327] border-[#2f373e]`) and 3.5.5.4 White Pieces Palette to minimum 42x42px button frames (`min-w-[42px] h-[44px]`) with 30px (`w-[30px] h-[30px]`) Lichess 'cburnett' SVG piece icons and active green border highlights in client/src/components/ChessDashboard.tsx
- [X] T003 [US1] Update 3.5.5.1 single-line "Level: 6" badge (`whitespace-nowrap`), 3.5.5.5 & 3.5.5.7 dropdown heights (`h-[38px]`), and 3.5.5.8 Time Control 3x3 preset grid (`h-[40px]` buttons with `gap-2` / 8px equal gaps) in client/src/components/ChessDashboard.tsx

---

## Phase 2: Pointer Events & Tool Operations (User Story 2 - Priority: P2)

**Goal**: Wire unified Pointer Events (`pointerdown`, `pointermove`, `pointerup`) across the palette tools and chessboard squares to support the Hand tool (pick & move board pieces), Piece tools (click-to-place on square and drag-to-place from palette with floating SVG ghost preview), Trash tool (click-to-delete), and drag-outside-board deletion.

**Independent Test**: With `3.5.5` popup open, test placing pieces via click-to-place and drag-to-place from both palettes, moving board pieces with the Hand tool, deleting pieces by clicking with the Trash tool, and deleting pieces by dragging them outside the chessboard boundary.

- [X] T004 [US2] Implement orientation-aware pointer coordinate to algebraic square resolver (`getSquareFromPointerEvent(clientX, clientY)` against `boardWrapperRef`) and floating pointer-drag ghost preview state in client/src/components/ChessDashboard.tsx
- [X] T005 [US2] Wire Pointer Events (`pointerdown`, `pointermove`, `pointerup`) for Hand tool board piece pick-and-move, Piece tool click-to-place and palette drag-to-place, Trash tool click-to-delete, and drag-outside-board-boundary auto-deletion in client/src/components/ChessDashboard.tsx

---

## Phase 3: FIDE Chess Legality Logic (User Story 3 - Priority: P3)

**Goal**: Build the pure offline FIDE/Lichess legality validator module (`client/src/lib/chessLegalityValidator.ts`) enforcing exact 1 King per side (blocking 2nd King placement), non-adjacent Kings (`distance >= 2` squares), Rank 1 & Rank 8 pawn prohibition (snap-back), max 8 pawns and max 16 pieces per side, promotion math quota ($\max(0, Q - 1) + \max(0, R - 2) + \max(0, B - 2) + \max(0, N - 2) \le 8 - \text{current\_pawns}$), and inactive side King check / impossible check validation.

**Independent Test**: Attempt each illegal placement or turn switch (2nd King, touching Kings, Pawn on Rank 1/8, 9th Pawn, extra promoted piece exceeding $8 - \text{pawns}$, and switching turn when active King is in check) and verify immediate rejection with a clear reason.

- [X] T006 [US3] Create `parseFenToBoardMap`, `buildFenFromEditorState`, and `validateEditorAction` (enforcing 1 King per color guard, Chebyshev King distance >= 2, Rank 1/8 pawn block, max 8 pawns, promotion math quota `max(0,Q-1)+max(0,R-2)+max(0,B-2)+max(0,N-2) <= 8 - pawns`, and max 16 pieces per side) in client/src/lib/chessLegalityValidator.ts
- [X] T007 [US3] Implement custom attack/check detector (`isSquareAttacked`, `getCheckingPieces`), `validateBoardPosition` (missing King, inactive side King in check, impossible multiple check), and `canSwitchTurn` guard in client/src/lib/chessLegalityValidator.ts

---

## Phase 4: Dynamic Castling & En Passant Sync (User Story 3 - Priority: P3)

**Goal**: Implement home-square-based dynamic castling eligibility (`e1/h1/a1` for White `0-0`/`0-0-0`, `e8/h8/a8` for Black `0-0`/`0-0-0`) with automatic uncheck & disable when King/Rook moves or is deleted, legitimate En Passant file calculation (`a–h` vs locked `'-'`), and real-time 6-field FEN synchronization with Column 3 (`5.3.1`) and Column 2 Move List reset.

**Independent Test**: Move or remove a King or Rook from `e1/h1/a1/e8/h8/a8` and verify its castling checkbox immediately unchecks and disables; place opposing Rank 5/4 pawns with adjacent friendly pawn to verify En Passant file unlock; confirm Column 3 FEN (`5.3.1`) updates live on every edit.

- [X] T008 [US3] Implement `computeEligibleCastlingRights` (checking `e1/h1/a1` and `e8/h8/a8`) and `computeLegalEnPassantFiles` (checking Rank 5/4 pawn + empty capture/origin squares + adjacent friendly pawn) in client/src/lib/chessLegalityValidator.ts
- [X] T009 [US3] Wire dynamic Castling checkboxes (`3.5.5.6`), dynamic En Passant dropdown (`3.5.5.7`), Turn to play switch validation (`3.5.5.5`), real-time `5.3.1` FEN input sync, and `Column 2` Move List reset (`[SetUp "1"]`, `[FEN "..."]`) in client/src/components/ChessDashboard.tsx

---

## Phase 5: Actions & Guards (User Story 3 - Priority: P3)

**Goal**: Wire `3.5.5.9 Starting Position` (full initial FEN, castling, turn, and move list reset), `3.5.5.10 Clear Board` (`8/8/8/8/8/8/8/8 w - - 0 1`, all castling off, ep `'-'`), the inline invalid-position warning banner, and disabled states on `3.5.4 Start Analysis` and `3.5.3 Practice with Computer` whenever the position is incomplete or invalid.

**Independent Test**: Click `3.5.5.10 Clear Board` and verify all pieces clear, castling/ep disable, `3.5.4 Start Analysis` and `3.5.3 Practice` buttons disable, and the inline warning banner displays `"Invalid position: White King is missing"`; click `3.5.5.9 Starting Position` and verify standard initial FEN, all 4 castling rights enabled, and buttons re-enabled.

- [X] T010 [US3] Wire `3.5.5.9 Starting Position` and `3.5.5.10 Clear Board` handlers to `editorBoard` state, legality validator, and Move List reset in client/src/components/ChessDashboard.tsx
- [X] T011 [US3] Implement inline invalid-position warning banner and action-rejection feedback, and disable `3.5.4 Start Analysis` & `3.5.3 Practice with Computer` buttons when `!positionValidation.isValid` in client/src/components/ChessDashboard.tsx
- [X] T012 Verify 1366x768 layout bounds, zero global scroll, and protected feature integrity (Principle I, II, XI) in client/src/components/ChessDashboard.tsx and update status rows in Site_Reference.md

---

## Dependencies & Execution Order

1. **Phase 1 (`T001` – `T003` — US1)**: Establishes the roomy `450px` popup dimensions, `>= 42px × 42px` palette button frames, `30px` `'cburnett'` SVG icons, contrasting Black Palette surface, and `38px`/`40px` control proportions.
2. **Phase 2 (`T004` – `T005` — US2) & Phase 3 (`T006` – `T007` — US3)**: `Phase 3` (`chessLegalityValidator.ts`) can be built in parallel with or immediately before `Phase 2` Pointer Events wiring so every pointer placement/move calls `validateEditorAction`.
3. **Phase 4 (`T008` – `T009` — US3)**: Connects dynamic Castling rights, dynamic En Passant files, Turn validation, and live `5.3.1` FEN / `Column 2` Move List sync.
4. **Phase 5 (`T010` – `T012` — US3 & Polish)**: Completes `Starting Position`, `Clear Board`, inline warning banners, `Start Analysis` / `Practice` button guards, and final `Site_Reference.md` status update.
