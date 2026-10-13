# Implementation Plan: Bottom Control Bar & Chessboard Settings Redesign

**Branch**: `001-bottom-controls-redesign` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-bottom-controls-redesign/spec.md`

## Summary

Redesign the visual presentation, symmetry, and layout of the Bottom Control Bar (3.5) and Chessboard Settings flyout (3.5.4) beneath the chessboard. The bottom dock will be unified into a single balanced horizontal row with uniform button heights (42px) and matched icon scales (22px). The settings popup will be relocated from over the board to a floating flyout anchored to the right of the board, overlaying the Move List column via `absolute` positioning (`z-50`) with outside click and `Escape` key dismissal. The popup interior will be styled with the site's dark + green theme, featuring a level slider, toggle switch, symmetric board action buttons, and complete removal of the deferred Board Editor. Zero new dependencies will be added, and all working features will remain strictly untouched.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16.3.4 (Turbopack)  
**Primary Dependencies**: Tailwind CSS v4, Lucide React (`lucide-react`), `react-chessboard`, `chess.js` (Strictly **zero new libraries**)  
**Storage**: N/A for visual styling (LocalStorage for toggle states in future feature)  
**Testing**: Visual and functional verification in desktop browser (1366x768 locked layout) via `quickstart.md`  
**Target Platform**: Desktop web browser (1366x768 fixed), Capacitor-ready architecture (`#remember`)  
**Project Type**: Next.js single-page web application  
**Performance Goals**: 60fps transitions, instantaneous (<100ms) popover toggle and outside-click dismissal  
**Constraints**: 
- 0px layout shift in Columns 1, 2, and 3
- 0% chessboard area covered by settings popup
- 1366x768 locked layout adherence (no scrollbars introduced)
- Constitution Principle II (Strict protection of ✅ Working features)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status | Notes |
|---|---|---|---|
| **I. Fixed Layout (1366x768)** | No layout shift, no global vertical scroll | **PASS** | Exception for 3.5.4 authorized in constitution v1.1.0; flyout uses absolute positioning over Move List |
| **II. Working Features Protected** | Working features not broken; #lock respected | **PASS** | Board, Move List, AI Column, and Banners are demarcated as DO NOT TOUCH |
| **III. Tag-Driven Control** | Honors `#change`, `#visual`, `#drag`, `#size`, `#remove`, `#exact` | **PASS** | Exact user requirements encoded in contracts and plan |
| **IV. Android-Ready Architecture** | Clean React code, mobile-friendly touch targets | **PASS** | 42px touch targets, standard DOM events |
| **V. Online vs Offline** | Offline execution preserved | **PASS** | Local engine parameters untouched |
| **VIII. Licenses & Dependencies** | Zero new dependencies | **PASS** | Uses existing Tailwind v4 and Lucide React icons |

## Project Structure & File Demarcation

### Documentation (this feature)

```text
specs/001-bottom-controls-redesign/
├── spec.md              # Feature specification (updated)
├── plan.md              # This implementation plan
├── research.md          # Phase 0 research document
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 validation guide
├── contracts/
│   └── ui-contracts.md  # Phase 1 UI component contracts
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 task list (created by /speckit-tasks)
```

### Source Code Files & Protection Status

The plan strictly isolates changes to the bottom dock and popup. Here is the explicit demarcation of files:

| File Path | Status | Action | Protected Sections / Notes |
|---|---|---|---|
| `client/src/components/ChessDashboard.tsx` | 🟡 Target File | **MODIFY** (Lines 403–469 only) | **⚠️ CRITICAL: Contains ✅ Working Features:**<br>• Lines 1–358: Top Player Banner (3.1), Game State & Engine Refs (**PROTECTED - DO NOT TOUCH**)<br>• Lines 359–382: Main Chessboard (3.2) & Eval Gauge (3.3) (**PROTECTED - DO NOT TOUCH**)<br>• Lines 383–402: Bottom Player Banner (3.4) (**PROTECTED - DO NOT TOUCH**)<br>• Lines 473–582: Move List integration & AI column (**PROTECTED - DO NOT TOUCH**)<br>• **ONLY lines 403–469 (Controls Bar & Popup) will be modified.** |
| `client/src/components/MoveList.tsx` | ✅ Working File | **NO CHANGE** | Move List column component. **PROTECTED - DO NOT TOUCH.** |
| `client/src/components/VisualSettingsModal.tsx` | ✅ Working File | **NO CHANGE** | Theme modal component. **PROTECTED - DO NOT TOUCH.** |
| `client/src/components/HistoricalGames.tsx` | ✅ Working File | **NO CHANGE** | Game browser component. **PROTECTED - DO NOT TOUCH.** |
| `client/src/lib/engine.ts` | ✅ Working File | **NO CHANGE** | Stockfish engine worker wrapper. **PROTECTED - DO NOT TOUCH.** |
| `client/src/lib/moveTree.ts` | ✅ Working File | **NO CHANGE** | Move tree data structure. **PROTECTED - DO NOT TOUCH.** |
| `client/src/app/page.tsx` | ✅ Working File | **NO CHANGE** | App root page. **PROTECTED - DO NOT TOUCH.** |

## Implementation Steps (Detailed Breakdown)

### Step 1: Bottom Control Bar Redesign (3.5)
- In `client/src/components/ChessDashboard.tsx` (around lines 403–424):
  - Replace the split `justify-between` two-block layout with a single unified flex container: `flex items-center justify-center gap-3 bg-surface-elevated rounded-xl px-3 py-2 border border-surface-border shrink-0`.
  - Standardize all button dimensions to `h-[42px]` (`w-[42px]` for icon buttons, `px-5 h-[42px]` for Start Analysis).
  - Standardize icon sizes: pass `size={22}` to `SkipBack`, `ArrowLeft`, `ArrowRight`, `SkipForward`, `Target`, `Brain`, and `SlidersHorizontal`.
  - Maintain all existing `onClick` bindings: `goToMove(null)`, `goToPreviousMove`, `goToNextMove`, `goToEndMove`, `setIsPracticing`, `handleStartAnalysis`, `setShowSettings`.

### Step 2: Flyout Positioning & Overlay Setup (3.5.4)
- Add a React `useRef<HTMLDivElement>(null)` for the settings popup container (`settingsRef`).
- Add a `useEffect` hook listening to `pointerdown` and `keydown` (`e.key === 'Escape'`) to dismiss the popup when clicking outside or pressing Escape.
- Position the popup container as an `absolute` element anchored to the settings button wrapper:
  - `absolute bottom-0 left-[calc(100%+12px)] w-[270px] bg-surface-elevated text-gray-200 rounded-xl shadow-2xl z-50 border border-surface-border overflow-hidden p-3 space-y-3`
  - This projects the flyout directly over Column 2 (Move List), leaving 100% of the chessboard visible.

### Step 3: Flyout Interior Controls Styling
- **Computer Level (3.5.4.1)**:
  - Header: `<label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-wider">Computer Level</label>`
  - Slider: `<input type="range" min="1" max="10" value={computerLevel} ... className="w-full accent-primary cursor-pointer" />`
  - Value Badge: `<p className="text-center text-xs text-gray-400">Level: <strong className="text-white font-mono">{computerLevel}</strong></p>`
- **Show Best Move (3.5.4.2)**:
  - Replace basic `<input type="checkbox">` with a styled toggle switch:
    - Pill container (`w-9 h-5 rounded-full transition-colors`) with sliding circle thumb (`w-3.5 h-3.5 rounded-full bg-white transition-transform`).
    - Label: `<span className="text-sm font-medium text-gray-200">Show best move</span>`.
- **Board Actions (3.5.4.3 – 3.5.4.5)**:
  - Style Flip Board, Starting Position, and Clear Board as clean list items: `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-surface transition text-left`.
  - Icons: `ArrowUpDown`, `RotateCcw`, `Trash2` sized to `18px`.
- **Board Editor Removal**:
  - Delete the `<button ...>Board Editor</button>` JSX node entirely.

## Complexity Tracking

*No violations or unnecessary patterns detected. Direct UI refinement adhering strictly to existing project conventions.*
