# UI Contracts: Bottom Controls & Settings Flyout

**Feature**: `001-bottom-controls-redesign`
**Created**: 2026-10-12
**Status**: Completed

## 1. Bottom Control Bar Component Contract

### Visual Specification
- **Container**: `flex items-center justify-center gap-3 px-3 py-2 bg-surface-elevated rounded-xl border border-surface-border shrink-0`
- **Button Height**: Exactly `42px` (`h-[42px]`) across all items.
- **Icon Sizing**: Exactly `22px` (`size={22}`) with `strokeWidth={2}` across all items.
- **Vertical Alignment**: Centered on horizontal axis (`items-center`).

### Control Items Layout
```text
[ |< Start ] [ < Back ] [ > Forward ] [ >| End ]   [ Target: Practice ]   [ Brain: Start Analysis ]   [ Sliders: Settings ]
```

| ID | Control | Type | Dimensions | Icon & Size | State Indication |
|---|---|---|---|---|---|
| **3.5.1** | Playback: Start | Icon Button | `w-[42px] h-[42px]` | `SkipBack` (22px) | Hover: `hover:bg-surface hover:text-white` |
| **3.5.1** | Playback: Back | Icon Button | `w-[42px] h-[42px]` | `ArrowLeft` (22px) | Hover: `hover:bg-surface hover:text-white` |
| **3.5.1** | Playback: Forward | Icon Button | `w-[42px] h-[42px]` | `ArrowRight` (22px) | Hover: `hover:bg-surface hover:text-white` |
| **3.5.1** | Playback: End | Icon Button | `w-[42px] h-[42px]` | `SkipForward` (22px) | Hover: `hover:bg-surface hover:text-white` |
| **3.5.2** | Practice with Computer | Icon Button | `w-[42px] h-[42px]` | `Target` (22px) | Active: `text-primary bg-primary/20 border-primary/40` |
| **3.5.3** | Start Analysis | Primary Button | `px-5 h-[42px]` | `Brain` (22px) | Primary Green: `bg-primary/20 text-primary hover:bg-primary hover:text-black` |
| **3.5.4** | Board Settings | Icon Button | `w-[42px] h-[42px]` | `SlidersHorizontal` (22px) | Active: `text-white bg-surface` |

---

## 2. Chessboard Settings Flyout Contract

### Container Specification
- **Positioning**: `absolute bottom-0 left-[calc(100%+12px)] w-[270px] z-50`
- **Placement Logic**: Floats horizontally to the right of Column 1, overlaying Column 2 (Move List) without modifying document flow or column layout.
- **Visual Styling**:
  - Background: `bg-surface-elevated` (`#1E1E1E`)
  - Border: `border border-surface-border` (`#302E2B`)
  - Shadow: `shadow-2xl shadow-black/60`
  - Rounded: `rounded-xl`
  - Padding: Symmetric `p-3 space-y-3`

### Internal Control Specification

#### 3.5.4.1 Computer Level Slider
- **Label**: `text-xs font-bold uppercase tracking-wider text-gray-400`
- **Slider Track & Thumb**: Styled range input with accent green (`accent-[#81B64C]`), width 100%.
- **Level Badge**: `text-xs font-semibold text-gray-300 text-center` displaying "Level: {computerLevel}".

#### 3.5.4.2 Show Best Move Toggle
- **Label**: "Show best move" (`text-sm font-medium text-gray-200`)
- **Control**: Toggle switch widget (pill container with sliding circle) replacing basic checkbox.

#### 3.5.4.3 – 3.5.4.5 Action Buttons
- **Options**:
  - 3.5.4.3: Flip Board (`ArrowUpDown`, 18px)
  - 3.5.4.4: Starting Position (`RotateCcw`, 18px)
  - 3.5.4.5: Clear Board (`Trash2`, 18px)
- **Styling**: `flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-surface transition w-full text-left`

#### Excluded Elements
- **Board Editor**: Excluded completely from flyout DOM.
