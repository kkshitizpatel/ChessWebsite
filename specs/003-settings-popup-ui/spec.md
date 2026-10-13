# Feature Specification: 3.5 Bottom Control Bar & 3.5.5 Chessboard Settings Popup Complete UI

**Feature Branch**: `003-settings-popup-ui`

**Created**: 2026-10-13

**Status**: Draft (UI Specification Only — Business Logic Deferred)

**Input**: User description: "3.5 + 3.5.5 #change #visual #add #drag #size #exact Target: 3.5 Bottom Control Bar aur 3.5.5 Chessboard Settings popup ka complete UI spec banana. Sirf design, structure aur layout; business logic abhi shamil nahi hai. Requirements: 1. 3.5 Bottom Bar Structure: Order: 3.5.1 Flip board (left-most pehla button), 3.5.2 Playback buttons, 3.5.3 Practice with Computer (target icon size standard karein), 3.5.4 Start Analysis (green button), 3.5.5 Settings icon. Symmetry: Sabhi buttons ki height barabar, icons vertically centered, bar ke elements ke beech equal gaps. 2. 3.5.5 Settings Popup Layout: Placement: Board ke right side me parallel khule (board cover na ho). Boundary: 1366x768 frame ke andar fit rahe, zaroorat padne par popup ke andar inner-scroll ho. Outside click ya 'Escape' key se dismiss ho. 3. 3.5.5 Popup Content & Order: 3.5.5.1 Computer level: Slider (1-10) + 'Level: 6' badge single-line me. 3.5.5.2 Show best move: Toggle switch (default OFF). 3.5.5.3 Black Pieces Palette: Hand tool, K, Q, R, B, N, P, Trash tool (Lichess 'cburnett' SVG icons). 3.5.5.4 White Pieces Palette: Hand tool, K, Q, R, B, N, P, Trash tool (active tool highlight). 3.5.5.5 Turn to play: Dropdown (White / Black). 3.5.5.6 Castling rights: White [0-0, 0-0-0], Black [0-0, 0-0-0] checkboxes. 3.5.5.7 En passant rights: Dropdown ('-', a-h files). 3.5.5.8 Time control: Toggle + 9 preset buttons grid (1m, 1+1, 2+1, 3m, 3+2, 5m, 10m [selected], 10+5, 15+10). 3.5.5.9 Starting Position & 3.5.5.10 Clear Board buttons. Non-negotiable: 3.2 Main Board, Column 2 Move List, 3.3 Eval Bar, aur Column 3 AI components ko bilkul touch nahi karna hai."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Symmetrical Bottom Control Bar with Flip Board First (Priority: P1)

As a chess player using the desktop interface at 1366x768 resolution, I want the Bottom Control Bar (3.5) directly beneath the chessboard to display all controls in the exact order—Flip Board (3.5.1) first on the far left, followed by Playback buttons (3.5.2), Practice with Computer (3.5.3), Start Analysis (3.5.4), and Settings (3.5.5)—with identical button heights, vertically centered standardized icons, and equal gaps between every element, so that all primary board actions are symmetrically accessible in one row.

**Why this priority**: The Bottom Control Bar is the always-visible primary dock under the chessboard. Placing Flip Board as the left-most button (3.5.1) and enforcing strict visual symmetry across all 8 interactive controls establishes the core layout foundation.

**Independent Test**: Can be verified visually at 1366x768 resolution by inspecting the bottom control bar below the board and confirming the exact left-to-right button order (`Flip` → `Start` → `Back` → `Forward` → `End` → `Practice` → `Start Analysis` → `Settings`), equal heights (40–44px), equal inter-button gaps, equal left/right container padding, and uniform icon scales (22–24px).

**Acceptance Scenarios**:

1. **Given** the desktop interface is loaded at 1366x768 px, **When** inspecting the Bottom Control Bar (3.5) from left to right, **Then** the controls appear in the exact sequence: `3.5.1 Flip board` (left-most first button), `3.5.2 Playback buttons` (Start, Back, Forward, End), `3.5.3 Practice with Computer` (Target icon), `3.5.4 Start Analysis` (Green button), and `3.5.5 Chessboard Settings` (Slider icon).
2. **Given** the Bottom Control Bar is rendered, **When** measuring button dimensions and spacing, **Then** every button has the exact same height, all icons (including the standardized Practice target icon and Settings slider icon) share the same visual size and vertical center alignment, and the horizontal gap between every adjacent element is equal.

---

### User Story 2 - Right-Side Parallel Settings Popup with Inner Scroll & Dismissal (Priority: P2)

As a user opening the Chessboard Settings popup (3.5.5), I want the popup to open parallel to the right side of the chessboard without covering any part of the board, fit strictly inside the 1366x768 screen frame with smooth inner-scrolling if needed, and close on outside click or pressing the `Escape` key, so that I can view the entire chessboard while inspecting all settings and board editor tools.

**Why this priority**: Because the 3.5.5 popup now houses 10 sub-sections (including Piece Palettes, Position Rules, and Time Control grid), proper right-side parallel placement and bounded height with internal scrolling are essential to prevent viewport overflow or board obstruction.

**Independent Test**: Can be tested by clicking the 3.5.5 Settings button: verify the popup opens to the right of the chessboard (overlapping the Move List area), covers 0% of the board, stays 100% within the 1366x768 viewport height (using inner vertical scroll if content exceeds available height), and closes immediately on outside click or `Escape` key press.

**Acceptance Scenarios**:

1. **Given** the Settings popup (3.5.5) is closed, **When** the user clicks the 3.5.5 Settings icon, **Then** the popup opens parallel to the right edge of the chessboard without covering any board square, piece, or evaluation bar.
2. **Given** the Settings popup is open at 1366x768 px resolution, **When** viewing the full popup panel, **Then** the outer popup container stays completely within the 1366x768 viewport bounds (no clipped top/bottom edges and no global page scroll), providing smooth internal vertical scrolling (`overflow-y: auto`) inside the popup if needed.
3. **Given** the Settings popup is open, **When** the user clicks anywhere outside the popup or presses the `Escape` key, **Then** the popup dismisses immediately.

---

### User Story 3 - Complete 3.5.5 Popup Visual Sections & Reference Layout Match (Priority: P3)

As a user viewing the 3.5.5 Settings popup, I want all 10 visual controls (3.5.5.1 through 3.5.5.10) rendered in the exact vertical order and dark-card visual style shown in the reference design—including the single-line `Level: 6` badge, `Show best move` toggle, Black and White `cburnett` piece palettes with Hand and Trash tools, Turn/Castling/En-passant card, 9-preset Time Control grid, and side-by-side Starting Position / Clear Board buttons—so that the entire settings and board-setup interface looks cohesive and complete.

**Why this priority**: Delivers the complete UI structure for all 10 sub-features (`3.5.5.1` to `3.5.5.10`) matching the visual reference image while keeping business logic decoupled for subsequent tasks.

**Independent Test**: Open the 3.5.5 popup and visually inspect each section from top to bottom against the reference image: verify order, dark card containers, green accents, single-line badge formatting, SVG piece icons, form controls, 3x3 preset grid, and bottom 2-column action buttons.

**Acceptance Scenarios**:

1. **Given** the 3.5.5 popup is open, **When** inspecting **3.5.5.1 Computer level**, **Then** a dark card displays the uppercase label `COMPUTER LEVEL` on the left, a single-line non-wrapping `Level: 6` green-bordered badge on the right, scale numbers `1` through `10` (with `6` highlighted in green), and a range slider with a green circular thumb.
2. **Given** the 3.5.5 popup is open, **When** inspecting **3.5.5.2 Show best move**, **Then** a dark card displays the label `Show best move` on the left and a pill toggle switch on the right (defaulting to OFF).
3. **Given** the 3.5.5 popup is open, **When** inspecting **3.5.5.3 Black Pieces Palette** and **3.5.5.4 White Pieces Palette**, **Then** each section displays its label (`Black Pieces Palette` / `White Pieces Palette`) above a horizontal rounded bar containing 8 items in order: `Hand tool`, `King (K)`, `Queen (Q)`, `Rook (R)`, `Bishop (B)`, `Knight (N)`, `Pawn (P)` (using Lichess `cburnett` SVG icons), and `Trash tool`, with a green rounded highlight box indicating the active tool (e.g., Hand tool).
4. **Given** the 3.5.5 popup is open, **When** inspecting the Board State card (**3.5.5.5, 3.5.5.6, 3.5.5.7**), **Then** a unified dark card with subtle dividers displays:
   - **3.5.5.5 Turn to play**: Label on the left and a dropdown (`White to play` / `Black to play`) on the right.
   - **3.5.5.6 Castling rights**: Header `Castling rights`, followed by a `White` row (`0-0`, `0-0-0` checkboxes) and a `Black` row (`0-0`, `0-0-0` checkboxes) with green check styling.
   - **3.5.5.7 En passant rights**: Label on the left and a compact dropdown (`-`, `a`, `b`, `c`, `d`, `e`, `f`, `g`, `h`) on the right.
5. **Given** the 3.5.5 popup is open, **When** inspecting **3.5.5.8 Time control**, **Then** a dark card displays the uppercase header `TIME CONTROL` with a toggle switch on the right, and a 3x3 grid of 9 preset buttons below: `1 min`, `1 + 1`, `2 + 1`, `3 min`, `3 + 2`, `5 min`, `10 min` (highlighted with green border and green text as selected default), `10 + 5`, and `15 + 10`.
6. **Given** the 3.5.5 popup is open, **When** inspecting the bottom row (**3.5.5.9 & 3.5.5.10**), **Then** two equal-width side-by-side dark buttons are displayed: `Starting Position` (with reset icon) on the left and `Clear Board` (with trash icon) on the right.

---

### Edge Cases

- **Single-Line Level Badge (`Level: 6`)**: In the reference screenshot, `Level:` and `6` wrapped onto two lines inside a narrow badge. The UI specification MUST enforce single-line rendering (`whitespace-nowrap`) so `Level: 6` always stays on a single line for all values `1` to `10`.
- **Popup Height vs 768px Viewport**: Because the popup contains 10 rich UI sections, its natural height may approach ~620–680px. The popup container MUST enforce a `max-height` (e.g., `max-h-[calc(100vh-32px)]` or `max-h-[720px]`) with smooth internal scrolling (`overflow-y-auto`) so it never overflows the 1366x768 desktop screen.
- **Black Piece Visibility on Dark Palette Bar**: Black `cburnett` SVG pieces (`bK`, `bQ`, `bR`, `bB`, `bN`, `bP`) rendered on a dark background need a slightly lighter slate pill background (`#252429` / `#2a2930`) or subtle light outline/drop-shadow so black pieces remain clearly distinguishable.
- **Click Inside Dropdowns/Sliders**: Interacting with native or custom dropdowns (`Turn to play`, `En passant rights`) inside the popup MUST NOT trigger the outside-click dismissal handler.

## Requirements *(mandatory)*

### Functional Requirements

#### 1. 3.5 Bottom Control Bar Structure & Symmetry
- **FR-001**: System MUST render the Bottom Control Bar (3.5) with controls in the exact left-to-right order:
  1. `3.5.1` Flip board (left-most button)
  2. `3.5.2` Playback buttons (`Start`, `Back`, `Forward`, `End`)
  3. `3.5.3` Practice with Computer (Target icon)
  4. `3.5.4` Start Analysis (Primary green button with Brain icon + label)
  5. `3.5.5` Chessboard Settings (Slider icon, right-most button)
- **FR-002**: System MUST enforce identical button height across all buttons in the 3.5 Bottom Control Bar, vertically centered icons, standardized icon dimensions (including the Practice target icon), equal horizontal gaps between all elements, and equal left/right bar padding.

#### 2. 3.5.5 Settings Popup Layout & Dismissal
- **FR-003**: System MUST open the 3.5.5 Settings popup parallel to the right side of the chessboard, floating over the Move List column (`z-50`), covering 0% of the chessboard or evaluation gauge bar.
- **FR-004**: System MUST constrain the 3.5.5 Settings popup strictly within the 1366x768 viewport boundaries, enabling internal vertical scrolling (`overflow-y-auto`) within the popup container if content height exceeds available vertical space, without causing global page scroll or layout shift.
- **FR-005**: System MUST dismiss the 3.5.5 Settings popup when the user clicks outside the popup boundary or presses the `Escape` key.

#### 3. 3.5.5 Popup Content & Visual Order
- **FR-006**: System MUST render **3.5.5.1 Computer level** at the top of the popup inside a rounded dark card featuring an uppercase `COMPUTER LEVEL` label on the left, a single-line `Level: 6` badge (`whitespace-nowrap`) on the right, numbers `1`–`10` (with the selected level highlighted in green), and a horizontal range slider (1–10) with a green circular thumb.
- **FR-007**: System MUST render **3.5.5.2 Show best move** as a rounded dark card row containing the label `Show best move` on the left and a toggle switch on the right (default state: OFF).
- **FR-008**: System MUST render **3.5.5.3 Black Pieces Palette** with the label `Black Pieces Palette` above a rounded horizontal bar containing 8 evenly spaced buttons: `Hand tool`, `bK`, `bQ`, `bR`, `bB`, `bN`, `bP` (using Lichess `cburnett` SVG assets), and `Trash tool`.
- **FR-009**: System MUST render **3.5.5.4 White Pieces Palette** with the label `White Pieces Palette` above a rounded horizontal bar containing 8 evenly spaced buttons: `Hand tool`, `wK`, `wQ`, `wR`, `wB`, `wN`, `wP` (using Lichess `cburnett` SVG assets), and `Trash tool`, supporting a green bordered highlight box for the active tool.
- **FR-010**: System MUST render a unified Board State dark card containing:
  - **3.5.5.5 Turn to play**: Label `Turn to play` and a dropdown with options `White to play` and `Black to play`.
  - **3.5.5.6 Castling rights**: Label `Castling rights` with two rows—`White` (`0-0`, `0-0-0` checkboxes) and `Black` (`0-0`, `0-0-0` checkboxes) styled with green checkmarks when checked.
  - **3.5.5.7 En passant rights**: Label `En passant rights` and a compact dropdown with options `'-'` and files `'a'` through `'h'`.
- **FR-011**: System MUST render **3.5.5.8 Time control** inside a rounded dark card with an uppercase `TIME CONTROL` header, a right-aligned toggle switch, and a 3x3 grid of 9 preset buttons: `1 min`, `1 + 1`, `2 + 1`, `3 min`, `3 + 2`, `5 min`, `10 min` (default selected state with green border and green text), `10 + 5`, and `15 + 10`.
- **FR-012**: System MUST render **3.5.5.9 Starting Position** and **3.5.5.10 Clear Board** at the bottom of the popup as two equal-width side-by-side buttons with icons (`RotateCcw` and `Trash2`) and labels.

#### 4. Scope & Protected Features (Non-Negotiable)
- **FR-013**: This specification covers UI design, structure, and visual state only; deep board-editor business logic, custom legality validation (Principle XI), and Stockfish best-move arrow wiring are out of scope for this visual phase.
- **FR-014**: System MUST preserve existing working handlers for Flip Board (3.5.1), Playback (3.5.2), Practice (3.5.3), Start Analysis (3.5.4), Computer Level (3.5.5.1), Starting Position (3.5.5.9), and Clear Board (3.5.5.10).
- **FR-015**: System MUST NOT modify `3.2 Main Chessboard`, `3.3 Evaluation Gauge Bar`, `Column 2 Move List`, or `Column 3 AI Explanation` components (Constitution Principle II).

### Key Entities

- **BottomControlBar (3.5)**: Single-row horizontal toolbar under the board housing `3.5.1` Flip Board through `3.5.5` Settings button.
- **ChessboardSettingsPopup (3.5.5)**: Right-anchored floating panel containing engine level, best move toggle, black/white piece palettes, turn/castling/en-passant controls, time control grid, and board reset/clear actions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% match with the required control order in 3.5 (`Flip` → `Start` → `Back` → `Forward` → `End` → `Practice` → `Start Analysis` → `Settings`) and 3.5.5 (`3.5.5.1` through `3.5.5.10`).
- **SC-002**: `Level: 6` badge renders on 1 single line (`0` line wraps) across all levels `1`–`10`.
- **SC-003**: 0% of the chessboard or evaluation bar is covered when the 3.5.5 popup is open.
- **SC-004**: 100% of the popup fits within the 1366x768 desktop viewport without causing outer page scrollbars or layout shifts.
- **SC-005**: 0 regressions or modifications to protected components (`3.2 Board`, `3.3 Eval Bar`, `Column 2 Move List`, `Column 3 AI Column`).

## Assumptions

- **Existing SVG Assets**: Lichess `cburnett` SVG piece files (`/pieces/cburnett/wK.svg` ... `bP.svg`) are already available in `client/public/pieces/cburnett/`.
- **UI State Defaults**:
  - `3.5.5.1 Computer level`: Default `6`
  - `3.5.5.2 Show best move`: Default `OFF` (`false`)
  - `3.5.5.3 / 3.5.5.4 Piece Palettes`: Default active tool is `Hand tool`
  - `3.5.5.5 Turn to play`: Default `White to play` (or synced with current turn)
  - `3.5.5.6 Castling rights`: Default all 4 checked (`0-0`, `0-0-0` for White and Black)
  - `3.5.5.7 En passant rights`: Default `'-'`
  - `3.5.5.8 Time control`: Toggle default `ON`, preset default `10 min` selected
