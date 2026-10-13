# UI Contracts: 3.5 Bottom Control Bar & 3.5.5 Settings Popup

**Feature**: `003-settings-popup-ui`
**Created**: 2026-10-13
**Status**: Completed

## 1. Bottom Control Bar (`3.5`) Contract

### Container Layout
- **Classes**: `mt-3 flex items-center justify-between bg-surface-elevated rounded-xl px-3.5 py-2 border border-surface-border shrink-0`
- **Button Height**: `42px` (`h-[42px]`) across all 8 buttons.
- **Icon Size**: `22px` (`size={22} strokeWidth={2}`) across all buttons.

### Exact Button Sequence (Left to Right)
```text
[ 3.5.1 Flip ] [ |< Start ] [ < Back ] [ > Forward ] [ >| End ] [ 3.5.3 Practice ] [ 3.5.4 Start Analysis ] [ 3.5.5 Settings ]
```

1. **3.5.1 Flip board**: `<button onClick={() => setBoardOrientation(o => o === "white" ? "black" : "white")} ...><ArrowUpDown size={22} /></button>`
2. **3.5.2 Playback (4 buttons)**: `SkipBack`, `ArrowLeft`, `ArrowRight`, `SkipForward` (`w-[42px] h-[42px]`)
3. **3.5.3 Practice with Computer**: `Target` (`w-[42px] h-[42px]`)
4. **3.5.4 Start Analysis**: `Brain` + `"Start Analysis"` (`h-[42px] px-4`)
5. **3.5.5 Settings**: `SlidersHorizontal` (`w-[42px] h-[42px]`)

---

## 2. Settings Popup (`3.5.5`) Contract

### Floating Container & Scroll Boundary
- **Positioning**: `fixed z-50 w-[330px] max-h-[calc(100vh-24px)] overflow-y-auto custom-scrollbar`
- **Anchor Calculation**:
  - `left = Math.min(rect.right + 12, window.innerWidth - 344)`
  - `bottom = Math.max(window.innerHeight - rect.bottom, 12)`
- **Visual Shell**: `bg-[#121212] border border-[#2a2a2a] rounded-2xl p-3 flex flex-col gap-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)]`

### Internal Sections Contract (Top to Bottom)

1. **3.5.5.1 Computer Level Card**:
   - Container: `bg-[#181818] border border-[#2a2a2a] rounded-xl p-3`
   - Header Row: `COMPUTER LEVEL` (`text-[11px] font-bold tracking-wider uppercase text-gray-400`) + single-line badge `Level: {computerLevel}` (`whitespace-nowrap text-xs font-bold text-primary bg-primary/10 border border-primary/30 px-2.5 py-0.5 rounded-md font-mono`)
   - Scale Row: `1..10` (`text-[11px] font-mono`), active level highlighted in `text-primary font-bold`
   - Slider: `<input type="range" min="1" max="10" ... />` with green thumb (`accent-primary`)
2. **3.5.5.2 Show Best Move Card**:
   - Container: `bg-[#181818] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 flex items-center justify-between`
   - Label: `Show best move` (`text-sm font-bold text-gray-100`)
   - Control: Pill toggle switch (`w-10 h-5 rounded-full`), default OFF (`false`)
3. **3.5.5.3 Black Pieces Palette**:
   - Label: `Black Pieces Palette` (`text-xs font-medium text-gray-400 mb-1`)
   - Bar: `bg-[#242329] border border-[#34333a] rounded-xl p-1 flex items-center justify-between`
   - 8 Tools (with `onPointerDown` handler + `touch-none`): `Hand`, `bK`, `bQ`, `bR`, `bB`, `bN`, `bP` (`/pieces/cburnett/b*.svg`), `Trash2`
4. **3.5.5.4 White Pieces Palette**:
   - Label: `White Pieces Palette` (`text-xs font-medium text-gray-400 mb-1`)
   - Bar: `bg-[#242329] border border-[#34333a] rounded-xl p-1 flex items-center justify-between`
   - 8 Tools (with `onPointerDown` handler + `touch-none`): `Hand` (default active highlight: `bg-primary/20 border border-primary text-primary`), `wK`, `wQ`, `wR`, `wB`, `wN`, `wP` (`/pieces/cburnett/w*.svg`), `Trash2`
5. **Board State Card (`3.5.5.5`, `3.5.5.6`, `3.5.5.7`)**:
   - Container: `bg-[#181818] border border-[#2a2a2a] rounded-xl p-3 flex flex-col gap-2.5 divide-y divide-[#262626]`
   - **3.5.5.5 Turn to play**: Flex row with label `Turn to play` and `<select>` (`White to play`, `Black to play`)
   - **3.5.5.6 Castling rights**: Header `Castling rights`, `White` row (`0-0`, `0-0-0` checkboxes), `Black` row (`0-0`, `0-0-0` checkboxes) with green accent checkmarks
   - **3.5.5.7 En passant rights**: Flex row with label `En passant rights` and `<select>` (`'-'`, `'a'`..`'h'`)
6. **3.5.5.8 Time Control Card**:
   - Container: `bg-[#181818] border border-[#2a2a2a] rounded-xl p-3`
   - Header Row: `TIME CONTROL` (`text-[11px] font-bold tracking-wider uppercase text-gray-400`) + pill toggle switch
   - 3x3 Preset Grid (`grid grid-cols-3 gap-1.5 mt-2.5`):
     - `1 min`, `1 + 1`, `2 + 1`, `3 min`, `3 + 2`, `5 min`, `10 min` (default selected: `border-primary bg-primary/15 text-primary font-bold`), `10 + 5`, `15 + 10`
7. **3.5.5.9 & 3.5.5.10 Bottom Action Row**:
   - Container: `grid grid-cols-2 gap-2`
   - Left (`3.5.5.9`): `Starting Position` button (`RotateCcw` icon + label, reuses `resetBoard`)
   - Right (`3.5.5.10`): `Clear Board` button (`Trash2` icon + label, reuses `clearBoard`)
