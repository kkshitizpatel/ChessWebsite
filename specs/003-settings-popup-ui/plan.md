# Implementation Plan: 3.5 Bottom Control Bar & 3.5.5 Chessboard Settings Popup Complete UI

**Branch**: `003-settings-popup-ui` | **Date**: 2026-10-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-settings-popup-ui/spec.md`

## Summary

Implement the complete UI design, structure, and layout for the **3.5 Bottom Control Bar** and **3.5.5 Chessboard Settings Popup** matching the reference screenshot and Constitution v1.2.0. In the Bottom Control Bar (`3.5`), **3.5.1 Flip board** is positioned as the left-most first button (reusing its existing orientation handler), followed by Playback buttons (`3.5.2`), Practice (`3.5.3`), Start Analysis (`3.5.4`), and Settings (`3.5.5`) with equal gaps, equal height (`42px`), and standardized `22px` icons. In the Settings Popup (`3.5.5`), all 10 sub-features (`3.5.5.1` to `3.5.5.10`) are rendered inside a right-anchored floating layer (`fixed z-50`) with `max-h-[calc(100vh-24px)] overflow-y-auto` so that 0% of the chessboard is covered, zero layout shift occurs in Column 2/3, and the entire popup fits within the `1366x768` frame. Palette tools (`3.5.5.3` & `3.5.5.4`) use Lichess `'cburnett'` SVG icons and wire skeleton Pointer Events (`onPointerDown`, `onPointerMove`) for Android/WebView compatibility.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16.3.4 (Turbopack)  
**Primary Dependencies**: Tailwind CSS v4, Lucide React (`lucide-react` — adding `Hand` icon import), existing `/pieces/cburnett/*.svg` assets (Strictly **zero new external packages**)  
**Storage**: React local UI state for visual controls (`activeEditorTool`, `editorTurn`, `editorCastling`, `editorEnPassant`, `timeControlEnabled`, `selectedTimePreset`)  
**Testing**: Visual & interaction verification at `1366x768` resolution per `quickstart.md`  
**Target Platform**: Desktop browser (`1366x768` locked layout) + Capacitor Android WebView-ready (`#remember`)  
**Project Type**: Next.js web application  
**Performance Goals**: Instantaneous (<50ms) popup toggle, 60fps inner scrolling, zero layout shift (CLS = 0)  
**Constraints**:
- Strictly UI/visual structure only (deep Board Editor legality & engine arrow wiring deferred to logic phases)
- 0% chessboard or evaluation bar coverage when popup is open
- 0px layout shift in Column 1, Column 2 (Move List), and Column 3 (AI Column)

## Key Architectural Safeguards

1. **Floating Layer Isolation (Zero Layout Shift)**:
   - The `3.5.5` Settings Popup is rendered in a `fixed z-50` floating layer anchored relative to `settingsBtnRef.current.getBoundingClientRect()` (`left: rect.right + 12`, `bottom: Math.max(window.innerHeight - rect.bottom, 12)`).
   - Because it is out-of-flow and escapes Column 1's `overflow-hidden`, opening or scrolling the popup causes **zero flex layout shift** and **Column 2 / Column 3 do not move by a single pixel**.
2. **Pointer Events Skeleton for Touch/WebView Compatibility (Principle IV)**:
   - Palette buttons in `3.5.5.3` (Black Pieces Palette) and `3.5.5.4` (White Pieces Palette) attach `onPointerDown` and `onPointerMove` skeleton handlers (with `touch-none select-none`) instead of desktop-only HTML5 `draggable` events, ensuring Capacitor Android WebView compatibility from day one.
3. **Flip Board Handler Reuse (`3.5.1`)**:
   - The existing Flip Board handler (`setBoardOrientation(o => o === "white" ? "black" : "white")`) is preserved intact; only its DOM node position is moved from inside the popup to the first (left-most) slot of the `3.5 Bottom Control Bar`.
4. **Working Features Verification & Protection (Principle II)**:
   - **Stockfish Worker (`client/src/lib/engine.ts`)**: Untouched (`0` lines modified).
   - **Move Recorder & Tree (`client/src/lib/moveTree.ts`, `client/src/components/MoveList.tsx`)**: Untouched (`0` lines modified).
   - **FEN / PGN / Link Parsers (`ChessDashboard.tsx` lines 133–240 & 550–575)**: Untouched (`0` lines modified).
   - **Main Chessboard (`3.2`) & Eval Bar (`3.3`) (`ChessDashboard.tsx` lines 359–382)**: Untouched (`0` lines modified).
   - **AI Explanation Column (`Column 3`) (`ChessDashboard.tsx` lines 495–548)**: Untouched (`0` lines modified).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Check | Status | Notes |
|---|---|---|---|
| **I. Fixed Layout (1366x768)** | Fits inside 1366x768; inner scroll allowed inside popup; `#change #visual` authorized for 3.5 & 3.5.5 | **PASS** | `max-h-[calc(100vh-24px)] overflow-y-auto` keeps popup strictly inside 768px height |
| **II. Working Features Protected** | Stockfish worker, Move List, FEN parser, Board, Eval Bar, AI Column untouched | **PASS** | Demarcated in file table below; only 3.5 & 3.5.5 JSX + local UI states in `ChessDashboard.tsx` are modified |
| **III. Tag-Driven Control** | Honors `#change #visual #add #drag #size #exact` | **PASS** | Matches reference image and exact numbering `3.5.1`–`3.5.5.10` |
| **IV. Android-Ready (`#remember`)** | Pointer Events (`onPointerDown`, `onPointerMove`) used on palette items | **PASS** | Skeleton Pointer Event handlers wired on all 16 palette items |
| **VIII. Licenses & Dependencies** | Lichess `'cburnett'` SVGs reused; zero new npm packages | **PASS** | Uses `/pieces/cburnett/*.svg` already in `client/public/pieces/cburnett/` |

## Project Structure & File Demarcation

### Documentation (this feature)

```text
specs/003-settings-popup-ui/
├── spec.md              # Complete UI specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 architectural & UI research
├── data-model.md        # Phase 1 UI state model
├── quickstart.md        # Phase 1 visual validation guide
├── contracts/
│   └── ui-contracts.md  # Phase 1 UI component & layout contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 task breakdown (created by /speckit-tasks)
```

### Source Code Demarcation (Protected vs Target Files)

| File Path | Status | Action | Protection & Scope Notes |
|---|---|---|---|
| `client/src/components/ChessDashboard.tsx` | 🟡 Target File | **MODIFY** (Strictly isolated to icon import, UI state hooks, and `3.5` / `3.5.5` Controls Bar & Popup JSX) | **⚠️ PROTECTED SECTIONS (DO NOT TOUCH):**<br>• `chessRef`, `engineRef`, `loadPgn`, `makeAMove`, `onPieceDrop`, `handlePgnPaste`, `handleLinkImport`, `handleStartAnalysis`<br>• Top/Bottom Player Banners (`3.1`, `3.4`)<br>• Main Chessboard (`3.2`) & Eval Bar (`3.3`)<br>• Column 2 Move List (`4.x`)<br>• Column 3 AI Explanation & FEN/PGN/LINK (`5.x`) |
| `client/src/lib/engine.ts` | ✅ Working File | **NO CHANGE** | Stockfish Worker wrapper — **PROTECTED** |
| `client/src/lib/moveTree.ts` | ✅ Working File | **NO CHANGE** | Move recorder & PGN parser — **PROTECTED** |
| `client/src/components/MoveList.tsx` | ✅ Working File | **NO CHANGE** | Move List & Accuracy footer — **PROTECTED** |
| `client/src/components/VisualSettingsModal.tsx` | ✅ Working File | **NO CHANGE** | Global visual settings modal — **PROTECTED** |
| `client/src/components/HistoricalGames.tsx` | ✅ Working File | **NO CHANGE** | Historical games browser — **PROTECTED** |
| `client/src/app/page.tsx` | ✅ Working File | **NO CHANGE** | Top header & page shell — **PROTECTED** |

## Complexity Tracking

*Zero constitution violations. No third-party libraries added; pure React + Tailwind CSS implementation within existing component boundaries.*
