# Phase 0 Research: Dynamic Parent-Prefix Move List Variation Numbering (4.2)

## 1. Root Cause of Hardcoded '1.1' Reset Bug
- **Finding**: In `buildLichessVariationRows()` in `client/src/components/MoveList.tsx`, recursive calls to `emitLine` when branching from the main line (`depth === 0`) passed `childPrefix` as:
  ```ts
  const childPrefix = depth === 0 ? '1' : thisRowLabel;
  ```
- **Consequence**: Regardless of whether the variation branched at Move 1, Move 2 (`2. Nf3`), Move 3 (`3. Bb5`), or Move 10, when `depth === 0`, `childPrefix` was hardcoded to `'1'`, causing the first row of every first-level variation to be labeled `1.1`.
- **Decision**: Replace hardcoded `'1'` with the dynamic parent move number `${wNode.moveNumber}` (or `${bNode.moveNumber}` for Black moves):
  ```ts
  const childPrefix = depth === 0 ? `${wNode.moveNumber}` : thisRowLabel;
  ```
  And for Black turn lines:
  ```ts
  const childPrefix = depth === 0 ? `${bNode.moveNumber}` : thisRowLabel;
  ```

## 2. Dynamic Prefix Inheritance Across Depth Levels
- **Depth 0 (Main Line)**:
  - White or move-pair row label: `${wNode.moveNumber}` (e.g. `1`, `2`, `3`).
  - Black-first root move label: `${bNode.moveNumber}...`
- **Depth 1 (Primary Variation)**:
  - Branch starts from Main Move $N$.
  - `outlinePrefix` receives `${node.moveNumber}` from parent ($N$).
  - Row labels increment sequentially: `${outlinePrefix}.${stepCounter}` $\rightarrow$ $N.1, N.2, N.3...$
  - Example: Branch from Move 2 $\rightarrow$ `2.1`, `2.2`, `2.3`...
  - Example: Branch from Move 3 $\rightarrow$ `3.1`, `3.2`, `3.3`...
- **Depth >= 2 (Nested Variations)**:
  - When branching at a sub-line row (whose label is `thisRowLabel`, e.g. `2.1`), `childPrefix` is passed as `thisRowLabel` (`"2.1"`).
  - Nested row labels increment: `${outlinePrefix}.${stepCounter}` $\rightarrow$ `2.1.1`, `2.1.2`, `2.1.3`...
  - Sub-nested level 3 $\rightarrow$ `2.1.1.1`, `2.1.1.2`...

## 3. Black Turn Ellipsis Preservation
- **Behavior**: When a variation starts on Black's turn (e.g., alternative at Move 2 `2... Nf6` instead of `2... Nc6`):
  - Row badge displays `2.1`.
  - The White move cell displays `...` (via `!row.whiteNode && Boolean(row.blackNode)`).
  - The Black move cell displays `Nf6`.
  - Together, this visually represents standard chess notation: `2.1 ... Nf6`.
- **Decision**: Keep `isBlackStartPlaceholder` rendering intact without modification.

## 4. Safeguards and Non-Regression (#no_change)
- **State Integrity**: `buildLichessVariationRows` is a pure presentation projection function. It only formats `displayLabel` for display.
- **Node IDs & PGN Integrity**: Node IDs, parent-child tree links in `MoveTree`, and FEN history remain 100% unaltered.
- **UI Integrity**: Badge width `w-[36px] min-w-[36px]`, indentation `row.depth * 12px`, checkboxes (`4.3`), board jump clicks (`4.4`), classification icons (`4.5`), Column 1, Column 3, and Accuracy Panel (`4.6`) remain completely untouched.
