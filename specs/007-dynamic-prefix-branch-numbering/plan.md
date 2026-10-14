# Implementation Plan: Dynamic Parent-Prefix Move List Variation Numbering (4.2)

**Branch**: `007-dynamic-prefix-branch-numbering` | **Date**: 2026-10-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-dynamic-prefix-branch-numbering/spec.md`

## Summary

Fix the Move List (`4.2`) variation numbering engine in `client/src/components/MoveList.tsx` by replacing the hardcoded `'1.1'` reset logic with a **Dynamic Parent Prefix** rule. First-level variations will derive their prefix from their parent main-line move number $N$ ($N.1, N.2, N.3...$), and nested variations will inherit their direct parent branch label ($\text{ParentPrefix}.1, \text{ParentPrefix}.2...$). All UI styling, checkboxes (`4.3`), board jumps (`4.4`), classification icons (`4.5`), and the Accuracy Panel (`4.6`) remain completely untouched (`#no_change`).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 16.3.4 (App Router)  
**Primary Dependencies**: `chess.js`, `lucide-react`, Tailwind CSS  
**Storage**: Local React state in `ChessDashboard.tsx` (`MoveTree`)  
**Testing**: Manual visual & functional verification (`quickstart.md`) + `tsc --noEmit`  
**Target Platform**: Desktop browser (`1366x768` locked layout) + Capacitor Android WebView (`#remember`)  
**Project Type**: Web application (`client/src/`)  
**Performance Goals**: `< 1ms` tree numbering calculation; `0px` layout shift  
**Constraints**: Zero changes to Column 1 (Board/Engine), Column 3 (AI Panel), or 4.6 Accuracy Panel; zero visual CSS changes (`#no_change`)  
**Scale/Scope**: 1 targeted component file (`client/src/components/MoveList.tsx`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Verification |
|---|---|---|
| **I. Fixed Layout (NON-NEGOTIABLE)** | ✅ PASS | Zero visual changes. Container dimensions and inner scrolling remain untouched. Zero outer vertical scroll on 1366x768. |
| **II. Working Features Protected (NON-NEGOTIABLE)** | ✅ PASS | Board drag-drop & pointer events (3.2), Stockfish 19 worker, FEN parser (5.3), and 4.6 Accuracy Panel are 100% untouched (#no_change). Change is strictly limited to displayLabel string generation in MoveList.tsx. |
| **III. Tag-Driven Change Control** | ✅ PASS | Follows `#exact #logic #no_change`. Specification and plan created before execution. |
| **IV. Android-Ready Architecture (`#remember`)** | ✅ PASS | Pure deterministic projection function runs offline in any JS runtime / WebView without platform APIs. |
| **V. Online vs Offline Execution** | ✅ PASS | 100% `#offline` local client-side calculation. |
| **VI. Analysis Correctness (NON-NEGOTIABLE)** | ✅ PASS | Engine evaluations, move qualities, and accuracy statistics are untouched. |

## Project Structure

### Documentation (this feature)

```text
specs/007-dynamic-prefix-branch-numbering/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── contracts/
    └── variation-numbering-contract.md
```

### Source Code (repository root)

```text
client/
└── src/
    └── components/
        └── MoveList.tsx  # [MODIFY] Update buildLichessVariationRows to pass dynamic parent moveNumber
```

---

## Key Architectural Steps

### 1. Locate Numbering Logic
In `client/src/components/MoveList.tsx`, rows are constructed by `buildLichessVariationRows(tree: MoveTree)`.
Inside it, recursive helper `emitLine(startNodeId, depth, siblingAlternativeIds, outlinePrefix)` emits line rows and recursively branches sub-trees.

### 2. Prefix Inheritance Refactoring
Currently, when `depth === 0`, child variations receive:
```ts
const childPrefix = depth === 0 ? '1' : thisRowLabel;
```
This hardcodes `'1'` for all variations originating from the main line, regardless of whether the branch originates from move 1, 2, 3, or 10.

**Refactor**:
- For White move row (`wNode`):
  ```ts
  const childPrefix = depth === 0 ? `${wNode.moveNumber}` : thisRowLabel;
  ```
  This guarantees that:
  - Branch from Move 1 White (`1. e4`) $\rightarrow$ `childPrefix = '1'` $\rightarrow$ `1.1, 1.2, 1.3...`
  - Branch from Move 2 White (`2. Nf3`) $\rightarrow$ `childPrefix = '2'` $\rightarrow$ `2.1, 2.2, 2.3...`
  - Branch from Move $N$ White $\rightarrow$ `childPrefix = `${N}`` $\rightarrow$ `N.1, N.2, N.3...`
- For Black move row (`bNode`):
  ```ts
  const childPrefix = depth === 0 ? `${bNode.moveNumber}` : thisRowLabel;
  ```
- For recursive nested variations (`depth >= 2`):
  `thisRowLabel` is already the current row's label (e.g. `"2.1"`). Passing `thisRowLabel` ensures nested sub-branches inherit `"2.1"` to produce `2.1.1`, `2.1.2`...

### 3. Black Turn Ellipsis Preservation
When a variation starts on Black's turn:
- `whiteNode` is `undefined`.
- `blackNode` is populated with the Black half-move node.
- The row displays outline badge `${currentPrefix}.${stepCounter}` (e.g. `2.1`).
- `renderMoveCell` automatically displays `...` in the White slot whenever `!row.whiteNode && Boolean(row.blackNode)`.
- Black's move renders in the Black slot.
- Visual display: `2.1 ... [SAN]`. Preserved exactly.

### 4. Non-Regression Verification
- String formatting fix only affects `displayLabel` in `MoveRowItem`.
- `node.id`, `node.parentId`, `node.fen`, and `currentNodeId` in `MoveTree` are strictly preserved.
- Move selection checkboxes (`4.3`), board clicks (`4.4`), classification icons (`4.5`), and 4.6 Accuracy Panel are 100% unaffected.
