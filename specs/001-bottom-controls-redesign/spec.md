# Feature Specification: Bottom Control Bar & Chessboard Settings Redesign

**Feature Branch**: `001-bottom-controls-redesign`

**Created**: 2026-10-12

**Last Updated**: 2026-10-12

**Status**: Draft

**Input**: User description: "3.5 + 3.5.4 #change #visual #drag #size #remove #exact - Bottom Control Bar aur Chessboard Settings popup (slider icon) ka redesign. A) Bottom Control Bar (3.5) - symmetry: 1. Saare controls ek hi row me: 3.5.1 Playback (Start, Back, Forward, End), 3.5.2 Practice (target icon), 3.5.3 Start Analysis (green), 3.5.4 Settings (slider icon). 2. Har element ke beech gap bilkul barabar ho. Bar ke left aur right padding bhi barabar ho. Beech me koi bada khali gap nahi. 3. Sab buttons ki height same ho (40-44px). Start Analysis thoda chauda ho sakta hai, par height same rahe. 4. Sab icons ka size same ho (22-24px). Practice (target) icon baaki icons ke barabar karo. Settings icon bhi same size aur same visual weight ka ho. 5. Icons aur buttons vertically center aligned hon. B) 3.5.4 Popup - jagah: 1. Popup chessboard ke upar nahi khulna chahiye, board ka koi hissa dhakna nahi chahiye. 2. Popup chessboard ke right side me, board ke parallel khule, settings icon se anchored. 3. Popup Move List column ke upar overlay ho sakta hai (floating, z-index ke saath). Layout shift ya scroll nahi hona chahiye. 4. Bahar click karne par ya Escape se band ho. 5. Popup 1366x768 screen ke andar poora dikhe, kata hua nahi. C) 3.5.4 Popup - andar ka design: 1. Computer Level: label + slider + 'Level: N'. Default 6 rahe. 2. Show best move: toggle switch, label 'Show best move'. 3. Flip Board, Starting Position, Clear Board: sabke icon same size, same left alignment, rows ki height aur beech ka gap barabar. 4. Board Editor ko popup se hata do (#remove). 5. Popup ki width consistent rahe, item spacing symmetric ho. Rules: Sirf look/placement badlega. Logic, handlers aur engine connections jaise hain waise rahenge. Board, Move List, AI column (✅ Working) touch mat karna. Constitution Principle II follow karo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Symmetrical, Single-Row Bottom Control Bar (Priority: P1)

As a chess player analyzing a game on desktop at 1366x768 resolution, I want all bottom controls beneath the chessboard laid out in a single symmetrical, balanced row with equal inter-item spacing, uniform 40–44px button heights, and consistent 22–24px icon sizes, so that the control interface looks clean, professional, and visually harmonious without awkward gaps or mismatched icon scales.

**Why this priority**: The bottom control bar (3.5) is the primary interactive dock directly underneath the board. Correcting its alignment, eliminating the middle void, and matching button heights and icon scales transforms the foundational look and feel of Column 1.

**Independent Test**: Can be tested visually by inspecting the bottom bar below the board: Playback buttons (Start, Back, Forward, End), Practice button, Start Analysis button, and Settings button sit in a single row with equal horizontal gaps, equal left/right container padding, identical button heights (40–44px), matching 22–24px icons (including the enlarged Practice target and Settings slider icons), and perfect vertical center alignment.

**Acceptance Scenarios**:

1. **Given** the desktop viewport is at 1366x768 px, **When** viewing the bottom control bar (3.5), **Then** all four control sections (3.5.1 Playback group, 3.5.2 Practice button, 3.5.3 Start Analysis button, 3.5.4 Settings button) render in a single horizontal row with equal spacing between elements and equal padding on the left and right margins of the bar.
2. **Given** the bottom control bar renders, **When** inspecting button dimensions, **Then** all interactive buttons share an identical height (between 40px and 44px), with Start Analysis maintaining the same height while extending its width to accommodate text.
3. **Given** the bottom control bar renders, **When** inspecting icon dimensions, **Then** all icons across playback, practice (target), analysis (brain), and settings (sliders) share a consistent scale (22–24px) and matching visual stroke weight, with zero tiny or oversized outliers.
4. **Given** the bottom control bar renders, **When** inspecting vertical alignment, **Then** all buttons and icons are centered vertically along the exact same horizontal axis.

---

### User Story 2 - Right-Side Anchored Settings Flyout (Non-Obscuring) (Priority: P2)

As a chess player adjusting board options, I want the Chessboard Settings popup to open on the right side of the chessboard (parallel to the board and anchored to the settings icon), floating over the Move List column rather than covering the chessboard, and closing cleanly on an outside click or Escape key, so that my view of the active position is never blocked.

**Why this priority**: Opening the popup over the board obscures pieces and board squares, causing immediate usability disruption during analysis. Anchoring it to the right as an overlay flyout preserves full board visibility.

**Independent Test**: Can be tested by clicking the settings slider icon: the popup opens floating to the right of the board, parallel to the board edge, anchored to the settings button, overlapping the Move List with high z-index without shifting or pushing any column layout. Pressing the Escape key or clicking outside the popup immediately closes it.

**Acceptance Scenarios**:

1. **Given** the chessboard is visible, **When** the user clicks the settings button (3.5.4), **Then** the settings popup opens floating to the right of the board, anchored near the settings icon, leaving 100% of the chessboard squares and pieces completely uncovered and unobstructed.
2. **Given** the settings popup opens, **When** rendered on screen, **Then** it floats over the Move List area with an overlay z-index, causing zero layout shift, zero column width changes, and zero scrollbar appearances in any container.
3. **Given** the settings popup is open, **When** the user clicks anywhere outside the popup container or presses the `Escape` key on the keyboard, **Then** the popup closes immediately.
4. **Given** the desktop view is locked to 1366x768 px, **When** the popup is opened, **Then** the entire popup is contained within the visible viewport boundaries, with no clipped, cut off, or overflowing edges.

---

### User Story 3 - Refined Inner Settings Flyout Design (Priority: P3)

As a user customizing engine skill and board actions, I want the inside of the settings popup to display a dark-themed Computer Level slider (defaulting to 6), a modern "Show best move" toggle switch, symmetrically aligned board utility rows (Flip Board, Starting Position, Clear Board), and no deprecated Board Editor item, so that all available board settings are cohesive, readable, and easy to interact with.

**Why this priority**: Elevates the visual quality inside the popup to match the dark theme and green accent of the rest of the application, while executing the required removal of the deferred Board Editor item.

**Independent Test**: Can be tested by opening the popup and verifying: Computer Level displays label, slider, and "Level: 6" text; "Show best move" is a stylized toggle switch; Flip Board, Starting Position, and Clear Board share identical icon sizes, left alignment, row heights, and gaps; Board Editor is completely absent.

**Acceptance Scenarios**:

1. **Given** the popup is open, **When** viewing the Computer Level section (3.5.4.1), **Then** it displays a clean section label, a dark-themed slider with green accent tracking, and a dynamic "Level: N" indicator (defaulting to level 6).
2. **Given** the popup is open, **When** viewing the "Show best move" control (3.5.4.2), **Then** it renders with the label "Show best move" and a modern toggle switch (replacing standard checkbox) indicating active/inactive states clearly.
3. **Given** the popup is open, **When** viewing the board action items (3.5.4.3 Flip Board, 3.5.4.4 Starting Position, 3.5.4.5 Clear Board), **Then** all three options feature uniform icon sizes, consistent left alignment, equal row heights, equal inter-row spacing, and smooth dark-surface hover states.
4. **Given** the governance decision to defer the Board Editor, **When** inspecting the popup, **Then** the Board Editor option is completely removed (#remove) from the popup interface.
5. **Given** the popup renders, **When** inspecting its container, **Then** it maintains a consistent width, symmetric internal padding, rounded corners, subtle dark borders (`#302E2B`), and dark surface background (`#1E1E1E` / surface-elevated).

---

### Edge Cases

- **Viewport Right Boundary Clamping**: If the right-floating popup approaches the outer boundary of the Move List / screen at 1366x768, the popup position MUST be constrained so that no part of the flyout extends offscreen or creates horizontal page scroll.
- **Escape Key Listener Cleanup**: When the popup closes via click or unmount, the global `Escape` key event listener MUST be cleanly removed from the `window` object to prevent memory leaks or redundant trigger calls.
- **Click-Inside Protection**: Clicks originating from inside the popup (such as dragging the range slider or clicking the toggle switch) MUST NOT trigger the outside-click dismissal handler.
- **Fast Repeated Toggles**: Clicking the settings button while the popup is already open MUST cleanly close the popup without flickering or desynchronizing open/closed state.

## Requirements *(mandatory)*

### Functional Requirements

#### Bottom Control Bar (3.5)
- **FR-001**: System MUST place all bottom controls—3.5.1 Playback buttons (Start, Back, Forward, End), 3.5.2 Practice button, 3.5.3 Start Analysis button, and 3.5.4 Settings button—within a single horizontal flex row.
- **FR-002**: System MUST render equal horizontal spacing (gaps) between adjacent control elements and equal padding on the left and right edges of the bottom bar, eliminating large vacant center gaps.
- **FR-003**: System MUST enforce a uniform button height of 40px to 44px across all buttons in the bottom control bar, with Start Analysis maintaining the identical height while supporting wider width for label text.
- **FR-004**: System MUST render all icons in the bottom bar with an identical scale of 22px to 24px and matching visual weight, specifically resizing the Practice target icon and Settings slider icon to match playback and analysis icons.
- **FR-005**: System MUST vertically center-align all buttons and icons along a single horizontal axis.

#### Settings Popup Placement (3.5.4)
- **FR-006**: System MUST anchor the Settings popup to open on the right side of the chessboard, parallel to the board edge, without overlapping, covering, or obscuring any chessboard squares or pieces.
- **FR-007**: System MUST render the Settings popup as a floating overlay positioned above the Move List column using an elevated z-index, introducing zero layout shift, zero column reflow, and zero scrollbars.
- **FR-008**: System MUST dismiss the Settings popup immediately when a pointer click occurs outside the popup boundary or when the user presses the `Escape` key.
- **FR-009**: System MUST position the Settings popup entirely within the 1366x768 desktop viewport without clipping or truncation.

#### Settings Popup Internal Design (3.5.4.1 – 3.5.4.5)
- **FR-010**: System MUST render the Computer Level control (3.5.4.1) with a descriptive label, a stylized range slider, and a "Level: N" value display, defaulting to level 6.
- **FR-011**: System MUST render the "Show best move" control (3.5.4.2) using a modern toggle switch with the label "Show best move".
- **FR-012**: System MUST render Flip Board (3.5.4.3), Starting Position (3.5.4.4), and Clear Board (3.5.4.5) with uniform icon sizes, identical left alignment, uniform row heights, and equal inter-row spacing.
- **FR-013**: System MUST remove the Board Editor option from the Settings popup entirely (#remove).
- **FR-014**: System MUST style the Settings popup with dark theme surfaces (`#1E1E1E`), subtle borders (`#302E2B`), rounded card corners, and primary green accents consistent with the Move List column.

#### Integrity & Non-Negotiables
- **FR-015**: System MUST preserve all existing event handlers, engine connections, board orientation state, practice mode logic, and move navigation functions without modification.
- **FR-016**: System MUST NOT modify components, markup, or styling of the Main Chessboard, Move List column, or AI Explanation column (Constitution Principle II).

### Key Entities

- **BottomControlBar**: Symmetrical single-row toolbar housing playback buttons, practice toggle, analysis button, and settings trigger with uniform button heights and icon scales.
- **ChessboardSettingsFlyout**: Right-side floating popover anchored near the settings button, positioned over the Move List column, providing engine skill, best move toggle, and board orientation/reset actions without blocking the board.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of controls in the bottom bar (3.5.1, 3.5.2, 3.5.3, 3.5.4) reside in a single balanced row with equal inter-item spacing and equal left/right padding.
- **SC-002**: 100% of buttons in the bottom bar have an identical height between 40px and 44px.
- **SC-003**: 100% of icons in the bottom bar measure between 22px and 24px in rendered dimension.
- **SC-004**: 0% of the chessboard surface area is covered or obscured when the settings popup is open.
- **SC-005**: Opening the settings popup causes 0px layout shift in Column 1, Column 2, or Column 3.
- **SC-006**: Pressing `Escape` or clicking outside the popup closes it within 100ms.
- **SC-007**: Board Editor option is 100% removed from the popup.
- **SC-008**: 100% compliance with 1366x768 desktop locked viewport (zero global or outer scrollbars).
- **SC-009**: 100% preservation of existing working feature behaviors (Constitution Principle II).

## Assumptions

- **Target Resolution**: Fixed 1366x768 px desktop viewport.
- **Flyout Overlay Placement**: The Move List column provides ample horizontal canvas directly to the right of Column 1 for hosting the floating flyout overlay.
- **No Logic Modification**: State hooks (`computerLevel`, `showBestMoveArrow`, `isPracticing`, `isAnalyzingLocal`, `boardOrientation`) remain unchanged in their underlying React state mechanics; only their presentation and visual hierarchy are updated.
- **Event Listeners**: Standard React refs with `document.addEventListener('pointerdown')` and `window.addEventListener('keydown')` provide robust click-outside and Escape key handling.
