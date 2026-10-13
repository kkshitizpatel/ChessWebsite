# Phase 0 Research: 3.5 Bottom Control Bar & 3.5.5 Settings Popup UI

**Feature**: `003-settings-popup-ui`
**Created**: 2026-10-13
**Status**: Completed

## Research Decisions & Architectural Safeguards

### 1. Floating Layer Positioning & Inner Scroll within 1366x768 Frame
- **Context**: The 3.5.5 Settings Popup now houses 10 sections (`3.5.5.1` to `3.5.5.10`), making it significantly taller (~640px natural height) than the earlier compact popup. It must open parallel to the right of the chessboard, never cover the board, never cause flex layout shift in Columns 1, 2, or 3, and stay 100% inside the 1366x768 viewport.
- **Decision**:
  - Render the popup in a `fixed` floating layer (`z-50`) anchored to the right of the 3.5.5 Settings button (`left: rect.right + 12`, `bottom: Math.max(window.innerHeight - rect.bottom, 12)`).
  - Constrain the popup's maximum height to `max-h-[calc(100vh-24px)]` (which is `744px` on a `768px` screen) with `overflow-y-auto` (`custom-scrollbar`).
  - Use compact, surgical vertical padding (`p-3 space-y-2.5`) so that at 768px height almost the entire panel is visible at once, while `overflow-y-auto` guarantees zero clipping if the viewport or browser chrome is slightly shorter.
- **Rationale**: Because Column 1 has `overflow-hidden`, `fixed` positioning anchored via `settingsBtnRef.current.getBoundingClientRect()` escapes parent clipping, prevents any flex reflow in Column 2/3, and keeps 0% of the chessboard covered.

### 2. Pointer Events Skeleton for Palette Tools (Principle IV / Android-Ready)
- **Context**: Constitution Principle IV (`#remember`) mandates that Board Editor and palette pieces drag-and-drop use Pointer Events (`onPointerDown`, `onPointerMove`, `onPointerUp`) rather than HTML5 `draggable` attributes so that mobile WebViews (Capacitor) and touch screens work seamlessly.
- **Decision**:
  - Attach `onPointerDown` (and `touch-none select-none` CSS classes) to each tool button in `3.5.5.3 Black Pieces Palette` and `3.5.5.4 White Pieces Palette`.
  - In this UI-spec phase, clicking/pressing a palette item (`onPointerDown`) updates the local `activeEditorTool` UI state (e.g., `'hand'`, `'bK'`, `'bQ'`, ..., `'wP'`, `'trash'`) so the green active highlight box moves to the selected tool, while providing the exact `PointerEvent` hook signature ready for full board-drop logic in the next phase.

### 3. Flip Board Relocation to 3.5.1 (Handler Reuse)
- **Context**: Previously, `Flip Board` was inside the settings popup. Now, `3.5.1 Flip board` is the left-most first button in the `3.5 Bottom Control Bar`.
- **Decision**:
  - Move the Flip Board `<button>` to be the very first child of the `3.5 Bottom Control Bar` flex container.
  - Reuse the exact existing handler: `onClick={() => setBoardOrientation(o => (o === "white" ? "black" : "white"))}`.
  - Style it identically to the other icon buttons in the Bottom Control Bar (`w-[42px] h-[42px]`, `ArrowUpDown` icon at `size={22} strokeWidth={2}`).

### 4. Lichess `cburnett` SVG Assets Reuse
- **Context**: `3.5.5.3` and `3.5.5.4` require `cburnett` SVG icons for `K, Q, R, B, N, P` alongside a `Hand` tool icon and `Trash` tool icon.
- **Decision**:
  - Reuse the existing `/pieces/cburnett/{bK,bQ,bR,bB,bN,bP}.svg` and `/pieces/cburnett/{wK,wQ,wR,wB,wN,wP}.svg` files already present in `client/public/pieces/cburnett/`.
  - Use Lucide's `Hand` icon and `Trash2` icon for the first and last buttons of each palette row.

### 5. Working Features Protection Verification (Principle II)
- **Context**: Must ensure Stockfish worker (`engine.ts`), move tree & SAN recorder (`moveTree.ts`, `MoveList.tsx`), FEN/PGN/Link parsers, Eval Bar, and AI Explanation column are untouched.
- **Decision**: All changes are strictly isolated to the UI state declarations and lines 442–586 of `client/src/components/ChessDashboard.tsx`. Zero other files are modified.
