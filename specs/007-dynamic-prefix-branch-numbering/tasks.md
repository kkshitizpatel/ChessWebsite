# Tasks: Dynamic Parent-Prefix Move List Variation Numbering (4.2)

**Input**: Design documents from `/specs/007-dynamic-prefix-branch-numbering/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/variation-numbering-contract.md](contracts/variation-numbering-contract.md), [quickstart.md](quickstart.md)

**Organization**: Tasks are grouped into sequential phases mapping to foundational setup, the 3 P1 User Stories, and validation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Exact file paths are included in every task description.

---

## Phase 1: Foundational Inspection & Setup

**Purpose**: Verify the current state of `buildLichessVariationRows` and ensure clean baseline for prefix refactoring.

- [X] T001 Inspect `buildLichessVariationRows` in `client/src/components/MoveList.tsx` to identify all occurrences of hardcoded `'1'` in `childPrefix` branching calls

---

## Phase 2: User Story 1 - Dynamic Parent Prefix for Primary Variations (`Depth = 1`) (Priority: P1) 🎯 MVP

**Goal**: Replace the hardcoded `'1'` prefix on primary variations branching from main line with the dynamic parent move number (`wNode.moveNumber` / `bNode.moveNumber`), so Move 2 variations display `2.1`, `2.2`... and Move 3 variations display `3.1`, `3.2`...

**Independent Test**: In a game with moves `1. e4 e5 2. Nf3 Nc6`, click on `2. Nf3` and play `2. Bc4`. Verify the branch row displays outline badge `2.1` (NOT `1.1`) and subsequent moves display `2.2`.

- [X] T002 [US1] Update `childPrefix` calculation for White move rows in `buildLichessVariationRows` (`client/src/components/MoveList.tsx`) from `depth === 0 ? '1' : thisRowLabel` to `depth === 0 ? `${wNode.moveNumber}` : thisRowLabel` for both `pendingWhiteVariations` and `blackVariations`
- [X] T003 [US1] Update `childPrefix` calculation for Black move rows in `buildLichessVariationRows` (`client/src/components/MoveList.tsx`) from `depth === 0 ? '1' : thisRowLabel` to `depth === 0 ? `${bNode.moveNumber}` : thisRowLabel` for alternative Black sibling branches

---

## Phase 3: User Story 2 - Recursive Parent Prefix for Nested Variations (`Depth >= 2`) (Priority: P1)

**Goal**: Ensure multi-level sub-trees inherit their direct parent branch label (e.g. `2.1` $\rightarrow$ `2.1.1`, `2.1.2`).

**Independent Test**: Branch a sub-variation from row `2.1`. Verify the nested row displays outline badge `2.1.1` and continuation moves display `2.1.2`.

- [X] T004 [US2] Verify and ensure nested variations at `depth >= 2` in `buildLichessVariationRows` (`client/src/components/MoveList.tsx`) cleanly inherit `thisRowLabel` as their `outlinePrefix`, rendering 3-level outline labels (`2.1.1`, `2.1.2`...)

---

## Phase 4: User Story 3 - Black Turn Ellipsis & Non-Regression Safeguards (Priority: P1)

**Goal**: Ensure variations starting on Black's turn preserve the `...` placeholder in White's slot, and ensure move selection checkboxes (`4.3`), board clicks (`4.4`), classification icons (`4.5`), and 4.6 Accuracy Panel are 100% intact.

**Independent Test**: Branch an alternative Black reply at Move 2 (`2... Nf6`). Verify the row badge displays `2.1`, White slot displays `...`, Black slot displays `Nf6`, and clicking `Nf6` jumps the board to the correct position with correct FEN.

- [X] T005 [US3] Verify Black-first variation rows preserve the `...` placeholder in White's cell and format as `${outlinePrefix}.${stepCounter}` (e.g. `2.1 ... Nf6`) in `client/src/components/MoveList.tsx`
- [X] T006 [US3] Verify that move checkboxes (`4.3`), board jump clicks (`4.4`), inline classification icons (`4.5`), and 4.6 Accuracy Panel remain 100% unaffected by the dynamic prefix change in `client/src/components/MoveList.tsx`

---

## Phase 5: Polish & Validation

**Purpose**: Confirm clean TypeScript compilation, verify all scenarios against quickstart.md, and ensure zero global vertical scroll.

- [X] T007 Run TypeScript compilation check (`npx tsc --noEmit` in `client/`) to confirm 0 type errors
- [X] T008 Execute quickstart verification scenarios from `specs/007-dynamic-prefix-branch-numbering/quickstart.md` across Moves 1, 2, and 3, and verify 0px outer page scroll on 1366x768

---

## Dependencies & Execution Order

- **Phase 1 (`T001`)**: Inspection and baseline validation.
- **Phase 2 (`T002`–`T003`)**: User Story 1 (Dynamic Parent Prefix for Depth 1).
- **Phase 3 (`T004`)**: User Story 2 (Recursive Parent Prefix for Depth >= 2).
- **Phase 4 (`T005`–`T006`)**: User Story 3 (Black turn ellipsis & non-regression safeguards).
- **Phase 5 (`T007`–`T008`)**: Polish and full scenario validation.
