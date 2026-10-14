# Tasks: Column 2 Lichess PGN Tree Branching, Move Classification Badges & 4.6 Accuracy Summary Panel

**Input**: Design documents from `/specs/005-movelist-branching-accuracy/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/movelist-and-accuracy-contracts.md](contracts/movelist-and-accuracy-contracts.md)

**Organization**: Tasks are grouped into 5 sequential phases mapping to the foundational data model, the 3 P1 User Stories (`4.2`, `4.5`, `4.6`), and final verification.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Exact file paths are included in every task description.

---

## Phase 1: Foundational Data Model & Shared Classification Registry

**Purpose**: Extend `MoveTree` / `MoveNode` types and define the shared 9-tier move classification visual metadata & Principle VI data structures before UI and engine wiring.

- [X] T001 Extend `MoveNode` and `MoveTree` in `client/src/lib/moveTree.ts` to include `MoveQuality` (`'Brilliant' | 'Great' | 'Best' | 'Excellent' | 'Good' | 'Book' | 'Inaccuracy' | 'Mistake' | 'Blunder'`), `evalText?: string`, `accuracy?: number`, `winDrop?: number`, and `initialFen?: string`
- [X] T002 [P] Create `client/src/lib/moveAnalysisDispatcher.ts` with the 9-tier `MOVE_QUALITY_CONFIG` visual registry (SAN text colors `#2fe0c6`, `#458cf7`, `#81b64c`, `#96bc4b`, `#97af8b`, `#c29b70`, `#e5a93c`, `#e67e22`, `#e74c3c`, circular badge colors, and symbols `!!`, `!`, `★`, `👍`, `✔`, `📖`, `?!`, `?`, `??`) and `AccuracyStatsSummary` types

**Checkpoint**: Shared types and classification visual registry are ready for `MoveList.tsx`, `AccuracyReportPanel.tsx`, and `ChessDashboard.tsx`.

---

## Phase 2: User Story 1 - Lichess Standard PGN Tree Branching & Legitimate Move Numbering (`4.2`) (Priority: P1) 🎯 MVP

**Goal**: Eliminate the flat `'1.1'`, `'2.1'`, `'3.1'` variation numbering bug in `MoveList.tsx` (`4.2`) and render main-line moves (`1. e4 e5`) and indented variation sub-tree blocks (`1... f6 2. g3 g6`) with legitimate chess move numbers.

**Independent Test**: Play `1. e4 e5 2. Nf3 Nc6`, click `1. e4`, and play `1... c5 2. Nf3 d6`. Verify that main-line rows display integer move numbers (`1`, `2`) and the variation renders inside a visually indented sub-tree block starting with `1...` (`...` in the White slot, `c5` in the Black slot) followed by `2. Nf3 d6`, with zero decimal labels (`1.1`, `2.1`).

- [X] T003 [US1] Replace `traceLine(startNodeId, labelPrefix)` in `client/src/components/MoveList.tsx` with a hierarchical Lichess-standard tree builder that removes `${node.moveNumber}.${labelPrefix}` and outputs integer move numbers (`1`, `2`, `3`...) for main-line and White-start variation rows and `${node.moveNumber}...` (`1...`) with `...` in the White slot for Black-first variation starts
- [X] T004 [US1] Style nested variation blocks (`depth >= 1`) in `client/src/components/MoveList.tsx` with visual indentation (`marginLeft: depth * 12px`), a left variation branch accent border (`border-l-2 border-[#3c3a38]`), and full support for `4.3` row checkboxes and `4.4` move click navigation

**Checkpoint**: `4.2` Move List & Lichess PGN Tree Branching works cleanly with zero `1.1`/`2.1` labels.

---

## Phase 3: User Story 2 - Principle VI Batch Analysis & Move Classification Visuals (`4.5`) (Priority: P1)

**Goal**: Evaluate all game moves sequentially with Stockfish (`#offline`) when `3.5.4 Start Analysis` is clicked, compute Constitution Principle VI `WinPercent`, `Drop`, `MoveAccuracy`, consistency-weighted game accuracy, and 9-tier `MoveQuality` classifications, and render colored SAN text, circular badges (`!!`, `!`, `★`, `👍`, `✔`, `📖`, `?!`, `?`, `??`), and eval scores (`+0.8`, `-1.2`) in `MoveList.tsx` (`4.5`).

**Independent Test**: Play or paste a PGN game and click `3.5.4 Start Analysis`. Verify every move in Column 2 receives its colored SAN text, circular classification badge immediately next to the SAN, and formatted eval score pill (`+0.8`, `-1.2`).

- [X] T005 [US2] Implement Principle VI mathematical functions (`computeWinPercent`, `computeMoveAccuracy`, `computeConsistencyWeightedAccuracy`, `classifyMoveByPrincipleVI`) and the sequential Stockfish batch evaluator (`analyzeMoveTreeWithStockfish`) in `client/src/lib/moveAnalysisDispatcher.ts`
- [X] T006 [US2] Update White and Black move cells in `client/src/components/MoveList.tsx` (`4.5`) to render each analyzed move's SAN in its classification color (`MOVE_QUALITY_CONFIG[node.quality].textClass`), attach its circular classification badge (`!!`, `!`, `★`, `👍`, `✔`, `📖`, `?!`, `?`, `??`) immediately next to the SAN, and display its formatted eval score pill (`+0.8`, `-1.2`, `M3`)
- [X] T007 [US2] Update `handleStartAnalysis` in `client/src/components/ChessDashboard.tsx` (`3.5.4`) to run `analyzeMoveTreeWithStockfish` across the current `moveTree`, update node `eval`, `quality`, and `accuracy` states, and compute `AccuracyStatsSummary` for White and Black

**Checkpoint**: Clicking `Start Analysis` evaluates and classifies every move in the Move List with exact colors, circular badges, and eval pills.

---

## Phase 4: User Story 3 - Column 2 Bottom `4.6 Accuracy Summary Panel` (`4.6` & `4.6.1`–`4.6.10`) (Priority: P1)

**Goal**: Build `AccuracyReportPanel.tsx` and mount it at the bottom of Column 2 (green box container), hidden by default, auto-opening when `Start Analysis` completes, displaying photo-less dynamic player names, White/Black rounded Accuracy score cards, all 9 classification breakdown rows (`Brilliant` through `Blunder`), and a top-right `'X'` close button that collapses the panel so the Move List expands to full Column 2 height.

**Independent Test**: Run `Start Analysis` and verify the `4.6 Accuracy Summary Panel` opens in the bottom half of Column 2 (`~320px` height) with photo-less player names, rounded accuracy cards, and 9 classification rows, and closes cleanly when clicking `'X'` without any global vertical scroll on `1366x768`.

- [X] T008 [P] [US3] Create `client/src/components/AccuracyReportPanel.tsx` implementing the Chess.com dark-theme table layout (Reference Image 2): top-right `'X'` close button (`onClose`), photo-less `"Players"` header row (`whiteName`, `blackName`), rounded White/Black `"Accuracy"` score cards (`whiteAccuracy.toFixed(1)`, `blackAccuracy.toFixed(1)`), and the 9-row breakdown table (`Brilliant`, `Great`, `Best`, `Excellent`, `Good`, `Book`, `Inaccuracy`, `Mistake`, `Blunder`) with `White count | [Centered Badge Icon] | Black count`
- [X] T009 [US3] Mount `AccuracyReportPanel` inside Column 2's `flex-col overflow-hidden` container in `client/src/components/ChessDashboard.tsx` (`MoveList` in `flex-1 min-h-0 overflow-y-auto` + `AccuracyReportPanel` in `h-[320px] shrink-0`), auto-open it when `Start Analysis` completes, and add a compact `"Report"` toggle button in the `4.1` Move List Header so users can also re-open the panel after closing it with `'X'`

**Checkpoint**: `4.6 Accuracy Summary Panel` opens at the bottom of Column 2 on analysis completion and collapses cleanly on `'X'` click.

---

## Phase 5: Polish, Layout Verification & Reference Sync

**Purpose**: Verify zero global vertical scroll at `1366x768`, ensure zero regressions in Column 1 or Column 3, and update `Site_Reference.md` / `Site_Reference.txt`.

- [X] T010 Verify `1366x768` fixed layout compliance (Principle I), TypeScript compilation, and end-to-end behavior of `4.2` variation branching, `4.5` move badges, and `4.6` Accuracy Summary Panel in `client/src/components/ChessDashboard.tsx`
- [X] T011 Update `Site_Reference.md` and `Site_Reference.txt` status rows for `4.2`, `4.5`, and `4.6` (`4.6.1`–`4.6.10`) to `✅ Working`

---

## Dependencies & Execution Order

- **Phase 1 (`T001`–`T002`)**: Foundational types and visual config — runs first.
- **Phase 2 (`T003`–`T004`)**: User Story 1 (`4.2` Lichess variation tree rendering in `MoveList.tsx`) — depends on `T001`.
- **Phase 3 (`T005`–`T007`)**: User Story 2 (`4.5` Principle VI batch evaluator & inline move badges) — depends on `T001`–`T004`.
- **Phase 4 (`T008`–`T009`)**: User Story 3 (`4.6` `AccuracyReportPanel.tsx` & Column 2 integration) — `T008` can run in parallel with Phase 2/3 once `T002` is done; `T009` integrates into `ChessDashboard.tsx`.
- **Phase 5 (`T010`–`T011`)**: Final verification and `Site_Reference.md` sync.
