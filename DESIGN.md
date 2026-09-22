---
name: Grandmaster Logic
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c2c9b6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8c9381'
  outline-variant: '#42493a'
  surface-tint: '#9fd668'
  primary: '#9fd668'
  on-primary: '#1c3700'
  primary-container: '#81b64c'
  on-primary-container: '#244400'
  inverse-primary: '#3b6a00'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#ffade6'
  on-tertiary: '#5d0450'
  tertiary-container: '#ea84cf'
  on-tertiary-container: '#6c165d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#baf381'
  primary-fixed-dim: '#9fd668'
  on-primary-fixed: '#0e2000'
  on-primary-fixed-variant: '#2b5000'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffd7ef'
  tertiary-fixed-dim: '#ffade6'
  on-tertiary-fixed: '#3a0031'
  on-tertiary-fixed-variant: '#792268'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  surface-elevated: '#1E1E1E'
  surface-border: '#302E2B'
  evaluation-positive: '#81B64C'
  evaluation-negative: '#FA412D'
  evaluation-neutral: '#45433F'
  board-wood-dark: '#B58863'
  board-wood-light: '#F0D9B5'
  board-modern-dark: '#769656'
  board-modern-light: '#EEEED2'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  notation-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
  notation-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  panel-padding: 20px
  desktop-margin: 32px
  mobile-margin: 16px
---

## Brand & Style

The design system is engineered for deep focus and high-performance cognitive work. The brand personality is **Analytical, Authoritative, and Professional**, positioning the platform as a tool for serious improvement rather than casual play.

The design style is a blend of **Modern Corporate** and **Minimalism**, characterized by a dark-mode-first interface that reduces eye strain during long sessions. It utilizes a "data-centric" aesthetic where density is managed through strict visual hierarchies and surgical precision in spacing. The UI should feel like a high-end dashboard—efficient, responsive, and devoid of unnecessary decoration.

## Colors

The palette is anchored in deep charcoals to create a cinematic, focused environment. 

- **Primary (Engine Green):** Used for positive engine evaluations, "Great Moves," and primary action buttons.
- **Surface & Backgrounds:** The base layer uses `#121212`. Secondary containers like side panels use `#1E1E1E` to create depth without relying on heavy borders.
- **Evaluation Signals:** High-saturation `#FA412D` is reserved strictly for blunders and errors to provide immediate visual feedback.
- **Chess Boards:** Support for multiple themes is required, with "Modern Forest" (derived from the brand green) serving as the default experience.

## Typography

This design system utilizes **Inter** for all UI controls and general prose to ensure maximum legibility and a contemporary feel. 

**JetBrains Mono** is specified for algebraic notation, FEN strings, and engine depth stats. This monospaced choice ensures that move lists remain perfectly aligned and readable, even at high density. 

Use `label-caps` for table headers and section titles within the analysis panels to differentiate functional metadata from interactive content.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The chess board maintains a fixed aspect ratio (1:1) while the side panels for move lists and engine output expand to fill the remaining horizontal real estate.

- **Desktop (1280px+):** A 3-column configuration. Left: Evaluation bar and engine stats. Center: The board. Right: Analysis panel (moves, coach, tabs).
- **Tablet:** Two-column layout. The board sits above or beside a combined analysis panel.
- **Mobile:** Single column. The board is pinned to the top, with analysis controls and move lists accessible via a swipe-up bottom sheet or tabs below the board.

A strict **4px grid** governs all internal spacing to maintain the mathematical precision required for a data-heavy interface.

## Elevation & Depth

This system uses **Tonal Layering** rather than traditional drop shadows. 

- **Level 0 (Base):** `#121212` for the main app background.
- **Level 1 (Panels):** `#1E1E1E` for the analysis sidebar and navigation docks.
- **Level 2 (Active States):** Subtle `1px` inner-borders using `#302E2B` to define interactive areas like text inputs and active tab indicators.

The **Evaluation Bar** uses a subtle inner glow to represent the engine's "current thought," but otherwise, the UI remains flat to keep the user's focus entirely on the board and the data.

## Shapes

The design system employs a **Soft (0.25rem)** roundedness level. This choice strikes a balance between the precision of sharp corners and the modern feel of rounded edges.

- **Board Squares:** Must remain sharp (`0px`) to preserve the geometric integrity of the game.
- **Action Buttons & Chips:** Use the standard `0.25rem` radius.
- **Control Tabs:** Top-only rounding for the active tab to create a physical "folder" metaphor.

## Components

### Buttons
- **Primary:** Background `Engine Green`, text black, bold weight. Used for "Start Analysis" or "Play Move."
- **Secondary:** Transparent with a `#302E2B` border. Used for navigation (Flip Board, Settings).
- **Icon Buttons:** No background until hover; use `secondary-text` color.

### Analysis Side Panel
- **Move List:** Alternating background shades for move pairs (White/Black). The "Current Move" should have an `Engine Green` left-accent border.
- **Evaluation Bar:** A vertical bar (100% height of board) showing the swing between White and Black. Use a CSS transition of `300ms ease-in-out` for value updates.

### Input Fields
- **FEN/PGN Boxes:** Use monospaced font, dark background (`#121212`), and a subtle border. Include a "Copy" icon button inside the field trailing edge.

### Tabs
- **Tabbed Interface:** Flat design. Active tab is indicated by a primary green underline and a slightly lighter surface color.

### Coach Messages
- **Cards:** Use `Level 2` elevation with a color-coded left border (Green for "Best Move," Red for "Blunder," Blue for "Interesting").