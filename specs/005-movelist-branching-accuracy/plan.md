# Implementation Plan: Column 2 Lichess PGN Tree Branching, Move Classification Badges & 4.6 Accuracy Summary Panel

**Branch**: `005-movelist-branching-accuracy` | **Date**: 2026-10-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-movelist-branching-accuracy/spec.md`

## Summary

Fix the flat decimal variation indexing bug (`1.1`, `2.1`, `3.1`) in Column 2 (`4.2 Move List`) by implementing Lichess-standard hierarchical variation blocks with legitimate chess move numbers (`1... f6 2. g3 g6`), build an offline Stockfish batch analysis & Principle VI classification dispatcher (`client/src/lib/moveAnalysisDispatcher.ts`) triggered on `3.5.4 Start Analysis` to render the 9 colored move classifications and circular badges (`4.5`) next to each SAN and eval pill, and integrate the collapsible `4.6 Accuracy Summary Panel` (`client/src/components/AccuracyReportPanel.tsx`) at the bottom of Column 2 within the locked `1366x768` layout.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 16.3.4 (App Router)  
**Primary Dependencies**: `chess.js`, `@mliebelt/pgn-parser`, `lucide-react`, Tailwind CSS, Stockfish WASM Web Worker (`engine.ts`)  
**Storage**: Local React state (`moveTree`, `accuracyStats`, `showAccuracyPanel`) inside `ChessDashboard.tsx`  
**Testing**: Visual & mathematical verification at `1366x768` (`quickstart.md`) + TypeScript compilation check  
**Target Platform**: Desktop browser (`1366x768` locked layout) + Capacitor Android WebView (`#remember`)  
**Project Type**: Web application (`client/src/`)  
**Performance Goals**: Sequential batch evaluation of game moves via local Stockfish Web Worker (`depth 10–12` per ply for fast interactive feedback); `< 1 ms` per Principle VI math calculation  
**Constraints**: `#offline` Stockfish analysis and Principle VI classification; zero global vertical scroll (`1366x768` locked); Column 1 Board Area and Column 3 AI layout untouched  
**Scale/Scope**: 1 new analysis math & batch dispatcher module (`client/src/lib/moveAnalysisDispatcher.ts`), 1 new UI component (`client/src/components/AccuracyReportPanel.tsx`), and targeted updates to `MoveList.tsx`, `moveTree.ts`, and `ChessDashboard.tsx`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Verification |
|---|---|---|
| **I. Fixed Layout (NON-NEGOTIABLE)** | ✅ PASS | Column 2 wrapper stays `h-full flex flex-col overflow-hidden`. `MoveList` uses `flex-1 min-h-0 overflow-y-auto` and `AccuracyReportPanel` mounts at the bottom (`h-[320px] shrink-0`) when open. Authorized in Constitution v1.2.0 Principle I Exception Note. Zero global vertical scroll. |
| **II. Working Features Protected (NON-NEGOTIABLE)** | ✅ PASS | Only `4.2`, `4.5`, and `4.6` (`4.6.1`–`4.6.10`) and the `3.5.4 Start Analysis` batch trigger are updated. Column 1 (`3.1`–`3.5.5` Board & Settings Popup), `4.1` Header, `4.3` Checkboxes, `4.4` Move Click, and Column 3 (`5.1`–`5.3`) remain protected. |
| **IV. Android-Ready Architecture (`#remember`)** | ✅ PASS | Batch analysis runs through the `Engine` abstraction layer (`engine.ts`), ready for Capacitor native Stockfish replacement. |
| **V. Online vs Offline Execution** | ✅ PASS | Move evaluation, Win% drop, classification badges, and game accuracy run 100% `#offline` in the browser; AI text explanation remains `#online` via `/api/explain`. |
| **VI. Analysis Correctness (NON-NEGOTIABLE)** | ✅ PASS | Strictly enforces `WinPercent = 50 + 50 * (2 / (1 + e^(-0.00368208 * cp)) - 1)`, `Drop = WinPercentBefore - WinPercentAfter`, `MoveAccuracy = clamp(103.1668 * e^(-0.04354 * Drop) - 3.1669, 0, 100)`, consistency-weighted game accuracy, and exact Win% drop classification brackets. |
| **VIII. Licenses and Dependencies** | ✅ PASS | Zero new external packages added. |

## Project Structure

### Documentation (this feature)

```text
specs/005-movelist-branching-accuracy/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── contracts/
    └── movelist-and-accuracy-contracts.md
```

### Source Code (repository root)

```text
client/
└── src/
    ├── lib/
    │   ├── moveTree.ts                 # [MODIFY] Add MoveQuality / accuracy fields & initialFen tracking
    │   └── moveAnalysisDispatcher.ts   # [NEW] Principle VI math formulas, 9-tier move classifier & Stockfish batch queue
    └── components/
        ├── MoveList.tsx                # [MODIFY] Lichess hierarchical variation tree renderer + 9 classification badges & colors
        ├── AccuracyReportPanel.tsx     # [NEW] Column 2 bottom 4.6 Accuracy Summary Panel (photo-less header, score cards, 9-row table, 'X' close)
        └── ChessDashboard.tsx          # [MODIFY] Wire batch analysis on Start Analysis (3.5.4) & mount AccuracyReportPanel in Column 2
```

**Structure Decision**: Isolate all Constitution Principle VI mathematical formulas, opening book detection, sacrifice/sharpness checks, and the sequential Stockfish evaluation queue in `client/src/lib/moveAnalysisDispatcher.ts`, while `AccuracyReportPanel.tsx` encapsulates the `4.6` green-box summary UI and `MoveList.tsx` handles Lichess variation rendering and inline badges.

---

## Key Architectural Safeguards

### 1. PGN Tree & Lichess Variation Formatter (`MoveList.tsx` & `moveTree.ts`)
- **Problem**: `MoveList.tsx` previously constructed `const label = labelPrefix ? "${node.moveNumber}.${labelPrefix}" : "${node.moveNumber}"`, producing invalid decimal labels (`1.1`, `2.1`, `3.1`) for variations.
- **Solution (Lichess Standard Tree Numbering)**:
  - Preserve the recursive tree structure in `MoveTree` (`{ id, moveNumber, turn, san, fen, parentId, childrenIds, eval, quality, accuracy }`).
  - Replace `traceLine(startNodeId, labelPrefix)` with a hierarchical renderer that outputs:
    - **Main Line Rows (`depth = 0`)**: Standard paired rows (`1. e4 e5`, `2. Nf3 Nc6`) where the move number badge is always the integer `row.moveNumber` (`1`, `2`, `3`...).
    - **Variation Sub-Tree Blocks (`depth >= 1`)**: Whenever a move has alternative branches (`childrenIds.slice(1)` on parent), render those alternative branches inside a visually indented sub-tree block (`marginLeft: depth * 12px`, left accent border `border-l-2 border-[#3c3a38]`).
    - **Legitimate Turn Alignment**:
      - If a variation starts on White's turn (`turn === 'w'`), the row displays integer `moveNumber` (`1`, `2`...) with the White move in the White slot and its continuation Black reply in the Black slot.
      - If a variation starts on Black's turn (`turn === 'b'`, e.g., branching off White's `1. e4` with `1... f6`), the first row of the variation displays move number `${node.moveNumber}...` (`1...`), shows `...` in the White slot, places `f6` in the Black slot, and continues the variation's subsequent full moves (`2. g3 g6`) in normal paired rows below it.

### 2. Batch Analysis & Principle VI Classification Dispatcher (`client/src/lib/moveAnalysisDispatcher.ts`)
- **Sequential Stockfish Queue**:
  - When `3.5.4 Start Analysis` is clicked, `analyzeMoveTreeWithStockfish(tree, rootFen, engine, onProgress)` walks the game tree sequentially, evaluating each position (`MultiPV 2`, `depth 10`) using the local Stockfish Web Worker (`engine.evaluateFen`).
  - Scores from Stockfish (which are reported from side-to-move's perspective in UCI) are normalized to **White's perspective in centipawns (`cpWhite`)** and stored on each `MoveNode` as `eval` in pawns (`cpWhite / 100`).
- **Constitution Principle VI Mathematical Formulas**:
  - **Win Percentage**:
    $$\text{WinPercent}(\text{cp}) = 50 + 50 \cdot \left(\frac{2}{1 + e^{-0.00368208 \cdot \text{cp}}} - 1\right)$$
    (For mate scores, $\text{cp} = \pm 10000$ according to the winning side.)
  - **Win% Drop (from moving player's perspective)**:
    - If White moved (`turn === 'w'`): $\text{Drop} = \max(0, \text{WinPercent}(\text{cpBefore}) - \text{WinPercent}(\text{cpAfter}))$
    - If Black moved (`turn === 'b'`): $\text{Drop} = \max(0, (100 - \text{WinPercent}(\text{cpBefore})) - (100 - \text{WinPercent}(\text{cpAfter})))$
  - **Move Accuracy**:
    $$\text{MoveAccuracy} = \text{clamp}\left(103.1668 \cdot e^{-0.04354 \cdot \text{Drop}} - 3.1669,\ 0,\ 100\right)$$
  - **Consistency-Weighted Game Accuracy**:
    - Computes sliding-window standard deviation (volatility weight $w_i \in [0.5, 1.0]$) combined with harmonic/weighted mean across a player's non-book moves, matching Principle VI and the `~76%` reference benchmark.
- **9-Tier Move Classification Rules (`MoveQuality`)**:
  1. **Book (`📖`)**: Plies within the first 6 full moves that match standard opening theory / ECO lines with $\text{Drop} \le 2.5\%$.
  2. **Brilliant (`!!`)**: Played move matches engine's top move (or $\text{Drop} \le 1.0\%$), involves a material sacrifice (moving side's material balance decreases or leaves a higher-value piece en prise that is not immediately recaptured for equal/greater material), position after the move is not losing ($\text{WinPercent}_{\text{mover}} \ge 45\%$), and was not a forced/only legal move (2nd-best move also existed).
  3. **Great (`!`)**: Played move is the engine's top move ($\text{Drop} \le 1.5\%$) in a sharp/critical position where the 2nd-best move (`score2`) has a Win% at least `12%` worse than the best move ($\text{WinPercent}(\text{best}) - \text{WinPercent}(\text{secondBest}) \ge 12\%$).
  4. **Best (`★`)**: Played move matches the engine's top PV move (`uciMove === bestMoveUci`) or has $\text{Drop} \le 0.5\%$.
  5. **Excellent (`👍`)**: $0\% < \text{Drop} \le 2\%$.
  6. **Good (`✔`)**: $2\% < \text{Drop} \le 5\%$.
  7. **Inaccuracy (`?!`)**: $5\% < \text{Drop} \le 10\%$.
  8. **Mistake (`?`)**: $10\% < \text{Drop} \le 20\%$.
  9. **Blunder (`??`)**: $\text{Drop} > 20\%$.

### 3. Move Classification Visuals (`4.5`) & Accuracy Panel Component (`AccuracyReportPanel.tsx` — `4.6`)
- **Shared Classification Badge Registry**:
  | Classification | SAN Text Color | Badge BG / Color | Badge Symbol / Icon |
  |---|---|---|---|
  | `Brilliant` | `text-[#2fe0c6]` | `bg-[#1ba39c] text-white` | `!!` |
  | `Great` | `text-[#458cf7]` | `bg-[#458cf7] text-white` | `!` |
  | `Best` | `text-[#81b64c]` | `bg-[#81b64c] text-white` | `★` |
  | `Excellent` | `text-[#96bc4b]` | `bg-[#96bc4b] text-[#1a1917]` | `👍` |
  | `Good` | `text-[#97af8b]` | `bg-[#6b8760] text-white` | `✔` |
  | `Book` | `text-[#c29b70]` | `bg-[#a88865] text-white` | `📖` |
  | `Inaccuracy` | `text-[#e5a93c]` | `bg-[#e5a93c] text-[#1a1917]` | `?!` |
  | `Mistake` | `text-[#e67e22]` | `bg-[#e67e22] text-white` | `?` |
  | `Blunder` | `text-[#e74c3c]` | `bg-[#e74c3c] text-white` | `??` |
- **`AccuracyReportPanel.tsx` Props & Layout**:
  - Props: `isOpen: boolean`, `onClose: () => void`, `whiteName: string`, `blackName: string`, `whiteAccuracy: number`, `blackAccuracy: number`, `statsSummary: AccuracyStatsSummary`.
  - Container: `h-[320px] shrink-0 border-t border-[#302e2b] bg-[#1a1917] flex flex-col overflow-hidden select-none`.
  - Top Header Row: `"Players"` label on left, truncated `whiteName` in middle column, truncated `blackName` in right column (zero avatars/photos), plus top-right `'X'` close button (`onClick={onClose}`).
  - Accuracy Row: `"Accuracy"` label on left, White accuracy rounded pill (`bg-[#f0f0f0] text-[#1a1917] font-extrabold`) and Black accuracy rounded pill (`bg-[#262522] text-gray-100 border border-[#3c3a38] font-extrabold`).
  - 9-Row Breakdown Table: Compact rows (`flex-1 flex flex-col justify-between px-3 py-1.5 overflow-y-auto`) displaying `Category Label | White Count | [Centered Badge] | Black Count` for `Brilliant`, `Great`, `Best`, `Excellent`, `Good`, `Book`, `Inaccuracy`, `Mistake`, and `Blunder`.

### 4. Layout Protection (Principle I & II)
- Column 2 outer wrapper in `ChessDashboard.tsx`:
  `className="hidden lg:flex w-[300px] xl:w-[330px] h-full flex-col border-x border-surface-border bg-surface shrink-0 overflow-hidden"`
- Inside Column 2:
  1. `4.1 Move List Header` (`shrink-0`, with an optional compact `"Report"` toggle button when analysis stats exist so the user can also re-open `4.6` after closing it with `'X'`).
  2. `4.2 Move List Scroll Container` (`flex-1 min-h-0 overflow-y-auto`).
  3. `4.6 AccuracyReportPanel` (`h-[320px] shrink-0`, rendered when `showAccuracyPanel && accuracySummary !== null`).
- Column 1 (`Chessboard Area`) and Column 3 (`AI Explanation & FEN/PGN/LINK`) remain 100% untouched in geometry and behavior.
