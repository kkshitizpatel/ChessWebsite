# Implementation Plan: Legal-Style Move List Outline Numbering & Accuracy Panel Name Wrap and Enlarged Badges

**Branch**: `006-outline-numbering-accuracy-polish` | **Date**: 2026-10-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-outline-numbering-accuracy-polish/spec.md`

## Summary

Refine Column 2 by updating `MoveList.tsx` (`4.2`) with a hierarchical Legal Outline variation numbering engine (`1.1`, `1.2`, `1.3`... for variations and `1.1.1`, `1.1.2`... for nested sub-variations while preserving standard `1`, `2`, `3`... for the main line), and upgrading `AccuracyReportPanel.tsx` (`4.6`) with Excel-style multiline text-wrapping (`whitespace-normal`, `break-words`) for player names and enlarged classification metrics (`15px–16px` counts, `22px–24px` circular badges).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 16.3.4 (App Router)  
**Primary Dependencies**: `chess.js`, `lucide-react`, Tailwind CSS  
**Storage**: Local React state in `ChessDashboard.tsx`  
**Testing**: Visual verification at `1366x768` (`quickstart.md`) + TypeScript type check  
**Target Platform**: Desktop browser (`1366x768` locked layout) + Capacitor Android WebView (`#remember`)  
**Project Type**: Web application (`client/src/`)  
**Performance Goals**: `< 1ms` tree numbering calculation; `0px` layout shift  
**Constraints**: Zero changes to Column 1 (Board Area, Eval Bar, Bottom Dock) or Column 3 (AI Coach); zero global page vertical scroll (Principle I)  
**Scale/Scope**: 2 targeted components (`client/src/components/MoveList.tsx`, `client/src/components/AccuracyReportPanel.tsx`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Verification |
|---|---|---|
| **I. Fixed Layout (NON-NEGOTIABLE)** | ✅ PASS | All styling and sizing changes are strictly confined to Column 2's inner container (`h-full flex flex-col overflow-hidden`). Move List has `flex-1 min-h-0 overflow-y-auto`. Zero global vertical scroll on `1366x768`. |
| **II. Working Features Protected (NON-NEGOTIABLE)** | ✅ PASS | Column 1 (Board Area, Eval Bar, Controls, Settings Popup) and Column 3 (AI Coach) remain untouched (#no_change). Only `4.2` and `4.6` are modified. |
| **IV. Android-Ready Architecture (`#remember`)** | ✅ PASS | CSS flexbox and touch-friendly enlarged badge tap targets (`22px–24px`) work seamlessly across WebView and desktop. |
| **V. Online vs Offline Execution** | ✅ PASS | 100% `#offline` local client-side rendering. |
| **VI. Analysis Correctness (NON-NEGOTIABLE)** | ✅ PASS | Principle VI accuracy formulas, Win% drop calculations, and classification logic are completely preserved. |

## Project Structure

### Documentation (this feature)

```text
specs/006-outline-numbering-accuracy-polish/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── contracts/
    └── ui-polish-contracts.md
```

### Source Code (repository root)

```text
client/
└── src/
    └── components/
        ├── MoveList.tsx            # [MODIFY] Legal outline numbering algorithm (1.1, 1.2, 1.3... & 1.1.1, 1.1.2...)
        └── AccuracyReportPanel.tsx # [MODIFY] Multiline player names (whitespace-normal, break-words) & enlarged counts/badges
```

---

## Key Architecture Components

### 1. Variation Legal Outline Numbering Engine (`MoveList.tsx`)
- **Numbering Specification**:
  - **Depth 0 (Main Line)**: Integer sequence `1`, `2`, `3`, `4`...
  - **Depth 1 (First-Level Variations)**: Outline prefix `1.` + sequential move index within that branch: `1.1`, `1.2`, `1.3`, `1.4`...
  - **Depth 2 (Nested Variations)**: Outline prefix `1.1.` + sequential move index within that nested branch: `1.1.1`, `1.1.2`...
  - **Depth 3+**: Recursive extension `${parentPrefix}.${stepIndex}`.
- **Implementation Mechanism**:
  - `buildLichessVariationRows(tree)` will accept a `prefix: string` (empty string for main line, `"1"` for primary variations, etc.) and a sequential step counter `branchStepIndex`.
  - For main line (`depth === 0`), `displayLabel` is simply `${node.moveNumber}`.
  - For variations (`depth > 0`), `displayLabel` is `${outlinePrefix}.${stepIndex}` (e.g. `1.1`, `1.2`, `1.3`).
  - If a variation starts with a Black move, the badge displays `1.1`, the White slot shows `...`, and Black move sits in the Black slot, advancing cleanly to `1.2` for the subsequent row.

### 2. Accuracy Panel Header Typography & Multiline Wrapping (`AccuracyReportPanel.tsx`)
- **Header Structure**:
  - Remove `truncate` / `text-ellipsis` from the player name containers.
  - Apply `whitespace-normal break-words leading-tight text-center max-w-[110px] text-[11px] font-bold`.
  - Header row container styled as `min-h-[40px] px-3 border-b border-[#2b2926] bg-[#161513] flex items-center py-1`.
  - Keeps `"Players"` label fixed on left (`w-[80px] shrink-0`), centered grid `grid-cols-[1fr_20px_1fr]` for White and Black names, and top-right `'X'` close button cleanly aligned.

### 3. Breakdown Row Metrics Sizing (#size) (`AccuracyReportPanel.tsx` & `MoveList.tsx`)
- **Move Quality Badge Sizes**:
  - Update `MoveQualityBadge` in `MoveList.tsx` to support `size="lg"`:
    - `size="lg"`: `w-[22px] h-[22px] text-[11px]` (or `w-[24px] h-[24px] text-[11px]`) for `AccuracyReportPanel`.
    - `size="sm"`: `w-[16px] h-[16px] text-[9px]` preserved for inline `MoveList` rows.
- **Breakdown Row Metrics in `AccuracyReportPanel.tsx`**:
  - Count text: updated to `text-[15px] font-bold font-mono` (from `text-[12px]`).
  - Centered badge: uses `size="lg"` (`w-[22px] h-[22px]`).
  - Row height: `min-h-[26px] py-0.5 flex items-center`.
  - Panel height: `h-[340px] shrink-0` ensuring all 9 rows, Header, and Accuracy score row fit without any vertical clipping.

### 4. Non-Regression & Viewport Safeguards (Principle I & II)
- Column 2 flex layout in `ChessDashboard.tsx`:
  - `MoveList` inside `flex-1 min-h-0 overflow-y-auto`.
  - `AccuracyReportPanel` inside `h-[340px] shrink-0`.
  - Total Column 2 height stays exactly within the `~716px` available bounds ($36\text{px} + 340\text{px} + 340\text{px} = 716\text{px}$). Zero global vertical scroll.
- Column 1 and Column 3 untouched.
