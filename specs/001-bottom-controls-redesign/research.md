# Phase 0 Research: Bottom Control Bar & Chessboard Settings Redesign

**Feature**: `001-bottom-controls-redesign`
**Created**: 2026-10-12
**Status**: Completed

## Research Topics & Decisions

### 1. Zero New Dependencies & Styling System Reuse
- **Context**: The user explicitly required: "Koi nayi library add mat karna. Site me jo styling system abhi chal rahi hai wahi use karo."
- **Decision**: Exclusively reuse existing Tailwind CSS v4 utility classes and Lucide React icons (`lucide-react`) already present in `client/package.json`.
- **Existing Tokens Reused**:
  - Surfaces: `bg-surface-elevated` (`#1E1E1E`), `bg-surface` (`#121212`), `bg-surface-high` (`#2a2a2a`)
  - Borders: `border-surface-border` (`#302E2B`)
  - Accents: `bg-primary` / `text-primary` (`#81B64C` / `#9fd668`)
  - Typography: `text-gray-200`, `text-gray-400`, `text-xs font-bold uppercase tracking-wider`
- **Alternatives Considered**:
  - Radix UI Popover / Headless UI: Rejected because user strictly prohibited adding any new libraries.

### 2. Floating Positioning for Settings Popup (Flyout Over Move List)
- **Context**: The popup must NOT cover any part of the chessboard. It must open parallel to the board on the right side, anchored to the settings icon, floating over the Move List column without causing any layout shift or scroll.
- **Decision**: Anchor the popup container using `absolute` positioning relative to the settings button wrapper or bottom controls dock with `z-50`. By setting `left-full bottom-0 ml-3` (or `bottom-[calc(100%+8px)] right-0` clamped), it projects into the whitespace / top layer above the Move List column. Since it is absolutely positioned, it is removed from the normal layout flow, guaranteeing 0px layout shift for Columns 1, 2, and 3.
- **Alternatives Considered**:
  - Centered Modal Dialog: Rejected because it obscures the center of the board and breaks the requirement to keep the board fully visible.
  - Inline accordion expansion: Rejected because expanding inline shifts the chessboard upward or pushes the bottom bar out of the 1366x768 locked layout.

### 3. Dismissal Interaction (Outside Click & Escape Key)
- **Context**: The popup must close when clicking outside or pressing Escape.
- **Decision**: Use a standard React `ref` (`popupRef = useRef<HTMLDivElement>(null)`) combined with a `useEffect` hook that listens for `pointerdown` and `keydown` (`e.key === 'Escape'`). Clicks containing `popupRef.current.contains(e.target)` are ignored; all other clicks invoke `setShowSettings(false)`. Event listeners are cleanly removed on unmount.
- **Alternatives Considered**:
  - Full-screen invisible backdrop (`<div className="fixed inset-0" onClick={...} />`): While effective, an invisible backdrop can swallow click events intended for the board or move list. An event listener attached to `document` allows normal interaction while cleanly dismissing the flyout.

### 4. Symmetrical Alignment & Icon Scale in Bottom Bar (3.5)
- **Context**: Currently, playback buttons sit far left and utility buttons sit far right (`justify-between`), creating an empty void in the middle. The Practice target icon is small (16px) compared to playback buttons.
- **Decision**: 
  - Restructure the toolbar into a unified flex container with equal gaps (`gap-2.5` or `gap-3`) and equal horizontal padding (`px-3 py-1.5`).
  - Standardize all button heights to `42px` (`h-[42px]`) with rounded corners (`rounded-lg`).
  - Scale all icons to a consistent `22px` (`size={22}`) with matching `strokeWidth={2}`: Playback (`SkipBack`, `ArrowLeft`, `ArrowRight`, `SkipForward`), Practice (`Target`), Start Analysis (`Brain`), Settings (`SlidersHorizontal`).
  - Vertically center all elements with `items-center`.
- **Alternatives Considered**:
  - Keeping two separate flex groups with `justify-between`: Rejected because the user explicitly stated "Beech me koi bada khali gap nahi. Har element ke beech gap bilkul barabar ho."

### 5. Popup Internal Design & Board Editor Removal
- **Context**: The popup must contain Computer Level slider (default 6), Show best move toggle switch, and Flip/Reset/Clear options, while Board Editor must be removed.
- **Decision**:
  - 3.5.4.1 Computer Level: Styled range slider with dark track, green accent thumb, and clear "Level: {computerLevel}" badge.
  - 3.5.4.2 Show Best Move: Custom accessible toggle switch component rendered with Tailwind (`w-9 h-5 bg-surface-high rounded-full` with sliding green dot).
  - 3.5.4.3, 3.5.4.4, 3.5.4.5: Clean icon-label action buttons with uniform height, left alignment, and subtle hover tints.
  - 3.6.5 Board Editor: Completely deleted from JSX markup.
