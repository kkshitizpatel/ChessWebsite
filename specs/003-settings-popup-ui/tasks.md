# Tasks: 3.5 Bottom Control Bar & 3.5.5 Chessboard Settings Popup Complete UI

**Feature Branch**: `003-settings-popup-ui` | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Phase 1: User Story 1 - 3.5 Bottom Control Bar Layout & Symmetry (Priority: P1) 🎯 MVP

**Goal**: Place `3.5.1 Flip board` as the left-most button in `3.5 Bottom Control Bar` (reusing the existing orientation toggle handler), followed by `3.5.2 Playback buttons`, `3.5.3 Practice`, `3.5.4 Start Analysis`, and `3.5.5 Settings` with uniform `42px` height, vertically centered `22px` icons, and equal gaps.

**Independent Test**: Load `http://localhost:3000` at `1366x768` px and verify the bottom bar order (`Flip` → `Start` → `Back` → `Forward` → `End` → `Practice` → `Start Analysis` → `Settings`), equal heights, equal spacing, and working board flip.

- [X] T001 [US1] Task 1: Update 3.5 Bottom Control Bar layout — move 3.5.1 Flip board button to left-most position (reusing existing orientation handler) and align all button heights (42px), icon sizes (22px), and equal gaps in client/src/components/ChessDashboard.tsx

---

## Phase 2: User Story 2 - 3.5.5 Popup Wrapper, Floating Placement & Inner Scroll (Priority: P2)

**Goal**: Build the 3.5.5 Settings Popup outer wrapper as a right-anchored floating layer (`fixed z-50`) parallel to the chessboard with outside-click / `Escape` dismissal, `1366x768` viewport height constraint (`max-h-[calc(100vh-24px)]`), and internal vertical scroll (`overflow-y-auto`).

**Independent Test**: Click 3.5.5 Settings button; verify popup opens to the right of the chessboard (0% board covered, 0px layout shift in Column 2/3), fits inside `768px` height with inner scroll, and closes on outside click or `Escape`.

- [X] T002 [US2] Task 2: Build 3.5.5 Popup wrapper container with right-side parallel floating placement, outside-click & Escape dismissal handler, 768px height constraint, and inner scroll in client/src/components/ChessDashboard.tsx

---

## Phase 3: User Story 3 - 3.5.5 Popup Interior Sections (`3.5.5.1` – `3.5.5.10`) (Priority: P3)

**Goal**: Implement all 10 visual sections inside the 3.5.5 Settings Popup in exact reference order: Computer level card (with single-line `Level: 6` badge), Show best move toggle, Black & White `cburnett` piece palettes (with Pointer Events skeleton), Turn/Castling/En-passant card, 9-preset Time Control grid, and side-by-side Starting Position / Clear Board footer buttons.

**Independent Test**: Open 3.5.5 popup and verify each section (`3.5.5.1` through `3.5.5.10`) visually matches the reference screenshot and interacts smoothly with local UI state.

- [X] T003 [US3] Task 3: Implement Popup header controls — 3.5.5.1 Computer level card (with single-line non-wrapping "Level: 6" badge and 1-10 green slider) and 3.5.5.2 Show best move toggle switch (default OFF) in client/src/components/ChessDashboard.tsx
- [X] T004 [US3] Task 4: Implement 3.5.5.3 Black Pieces Palette and 3.5.5.4 White Pieces Palette UI using Lichess 'cburnett' SVG icons, Hand/Trash tools, active green tool highlight, and Pointer Events (onPointerDown, onPointerMove) skeleton handlers in client/src/components/ChessDashboard.tsx
- [X] T005 [US3] Task 5: Implement Chess board state control inputs card — 3.5.5.5 Turn to play dropdown (White/Black), 3.5.5.6 Castling rights checkboxes (White/Black 0-0 & 0-0-0), and 3.5.5.7 En passant rights dropdown ('-', a-h files) in client/src/components/ChessDashboard.tsx
- [X] T006 [US3] Task 6: Implement 3.5.5.8 Time control toggle + 9-preset 3x3 grid (1m, 1+1, 2+1, 3m, 3+2, 5m, 10m [selected], 10+5, 15+10) and side-by-side footer buttons for 3.5.5.9 Starting Position & 3.5.5.10 Clear Board in client/src/components/ChessDashboard.tsx

---

## Phase 4: Polish & Visual Regression Verification

**Purpose**: Verify `1366x768` bounds, zero global scroll, and 100% protection of working features (Principle II).

- [X] T007 Task 7: Perform visual regression and 1366x768 boundary inspection (verify zero global scroll, zero board overlap, and zero changes to protected 3.2 Board, 3.3 Eval Bar, Column 2 Move List, and Column 3 AI components) in client/src/components/ChessDashboard.tsx and update Site_Reference.md

---

## Dependencies & Execution Order

1. **`T001` (Task 1 — US1)**: Establishes the 3.5 Bottom Control Bar layout and moves `3.5.1 Flip board` to the far left.
2. **`T002` (Task 2 — US2)**: Establishes the 3.5.5 floating popup shell, height constraint, and inner scroll container.
3. **`T003` → `T004` → `T005` → `T006` (Tasks 3–6 — US3)**: Sequentially populate the interior sections of the 3.5.5 popup in top-to-bottom visual order.
4. **`T007` (Task 7 — Polish)**: Final `1366x768` visual boundary check, protected feature verification, and `Site_Reference.md` status update.
