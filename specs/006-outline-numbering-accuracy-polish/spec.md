# Feature Specification: Legal-Style Move List Outline Numbering & Accuracy Panel Name Wrap and Enlarged Badges

**Feature Branch**: `006-outline-numbering-accuracy-polish`

**Created**: 2026-10-13

**Status**: Draft

**Input**: User description: "4.2, 4.6 #change #visual #size #logic #exact — Target: Move List me variation branching numbering ko legal-style outline format me theek karna, aur 4.6 Accuracy Panel me player names ko text-wrap karke counts/icons ka size bada karna. Baaki saare working features completely untouched rahenge (#no_change)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Legal-Style Outline Numbering for Variations in Move List (Priority: P1)

When viewing moves in Column 2 (`4.2`), the main game line continues to display standard sequential move numbers (`1`, `2`, `3`, ... `10`). When an alternative variation or sub-line is played from any move, its moves are numbered using a clean legal outline numbering hierarchy:
- The first step of a primary sub-variation receives the prefix `1.1`.
- Subsequent moves along that sub-variation or sibling alternatives increment sequentially (`1.2`, `1.3`, `1.4`, etc.) rather than jumping to `2.1` or `3.1`.
- If a nested branch stems from within an existing sub-variation, it follows a 3-level outline hierarchy (`1.1.1`, `1.1.2`, etc.).
All SAN text, move row checkboxes (`4.3`), board click navigation (`4.4`), and move classification badges/colors (`4.5`) remain 100% intact.

**Why this priority**: Delivers the exact legal-style outline indexing requested by the user, making multi-branch chess variations intuitive and structured.

**Independent Test**: Load or play a game with alternative branches (e.g., branching off move 1 or move 2). Verify the main line has integer numbers `1`, `2`, `3`..., the first sub-line displays `1.1`, `1.2`, `1.3`..., and any deeper nested sub-variation displays `1.1.1`, `1.1.2`...

**Acceptance Scenarios**:

1. **Given** a game on the board, **When** moves in the main line are displayed, **Then** the move number badges show standard integers (`1`, `2`, `3`...).
2. **Given** an alternative branch branching off a move, **When** rendered in the Move List, **Then** the first move row of the sub-variation displays `1.1` in its move number badge, and subsequent moves in that line follow `1.2`, `1.3`, `1.4`... sequentially.
3. **Given** a nested sub-branch branching off an existing sub-variation, **When** rendered in the Move List, **Then** the nested moves display `1.1.1`, `1.1.2`... in legal outline format.
4. **Given** any move row with outline numbering, **When** the user clicks the row or toggles its checkbox, **Then** board jump navigation (`4.4`) and selection (`4.3`) continue to work seamlessly.

---

### User Story 2 - Accuracy Panel Header Player Names Excel-Style Text Wrap (Priority: P1)

In the `4.6 Accuracy Summary Panel` at the bottom of Column 2, player names (e.g., "Tomashevsky, E" and "Karjakin, Sergey") often get clipped with an ellipsis ("Tomashevs...", "Karjakin,Se..."). The truncation/ellipsis (`truncate`) is replaced with Excel-style text wrapping (`whitespace-normal`, `break-words`). Full player names wrap naturally across up to 2 lines within their allocated column space so both names are clearly visible and legible without any truncation.

**Why this priority**: Guarantees full legibility of official tournament player names from PGN headers without cutting off grandmaster surnames.

**Independent Test**: Load a PGN with long player names (e.g., "Tomashevsky, Evgeny" and "Karjakin, Sergey"). Open the `4.6` Accuracy Summary Panel. Verify both names display in full across 2 wrapped lines without any "..." ellipsis clipping.

**Acceptance Scenarios**:

1. **Given** a game with long player names loaded from PGN, **When** the `4.6 Accuracy Summary Panel` is open, **Then** both White and Black player names wrap across multiple lines (`whitespace-normal`, `break-words`) instead of being truncated with an ellipsis.
2. **Given** wrapped player names, **When** rendered in the panel header, **Then** the header row adjusts cleanly to accommodate the wrapped text while keeping the left `"Players"` label and the top-right `'X'` close button perfectly aligned.

---

### User Story 3 - Accuracy Panel Enlarged Classification Counts & Badges (Priority: P1)

In the `4.6 Accuracy Summary Panel` breakdown table, the move classification counts and centered icon badges are enlarged (#size):
- Classification counts (0, 1, 2, 5, etc.) are increased to a bold font size of `15px - 16px`.
- Center column classification badge frames (`!!`, `!`, `★`, `👍`, `✔`, `📖`, `?!`, `?`, `??`) are enlarged to `~22px - 24px` with proportionally scaled symbols and colors for high visibility.
- Clean column alignment with the header accuracy score cards (e.g., 99.5, 98.6) is preserved.

**Why this priority**: Enhances visual contrast and readability of review stats at a glance on desktop and touch displays.

**Independent Test**: Run `Start Analysis` on a game. Open the `4.6` Accuracy Summary Panel. Verify the breakdown table numbers render at `15px - 16px` font size and centered circular badges render at `22px - 24px` frame size.

**Acceptance Scenarios**:

1. **Given** the `4.6 Accuracy Summary Panel`, **When** viewing the 9 breakdown rows, **Then** White and Black count numbers render at `15px–16px` (`text-[15px]` / `text-[16px] font-bold`).
2. **Given** the center badges in the breakdown table, **When** rendered, **Then** each circular badge has a frame size of `22px–24px` (`w-[22px] h-[22px]` to `w-[24px] h-[24px]`) with crisp, vibrant colors and symbols.
3. **Given** enlarged counts and badges, **When** displayed inside the `~320px` panel, **Then** the rows remain fully visible within Column 2 without causing any outer page scrollbar (Principle I).

---

### Edge Cases

- **Very Long Player Names**: Player names exceeding 25 characters wrap cleanly using `break-words` and `leading-tight` without overlapping adjacent score columns or the `'X'` button.
- **Multiple Sub-Lines at Same Ply**: If a move has multiple alternative branches (e.g. 2 different variations at ply 3), the first sub-branch receives `1.1`, `1.2`... and sibling sub-branches receive `2.1`, `2.2`... (or outline sequence `1.1`, `1.2`, `1.3`) maintaining legal hierarchical outline clarity.
- **Fixed Layout Boundary (Principle I)**: Column 2 wrapper retains `h-full flex flex-col overflow-hidden` and `MoveList` maintains `flex-1 min-h-0 overflow-y-auto`, ensuring the `1366x768` page frame has zero global vertical scroll.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render main game moves in `MoveList` (`4.2`) with standard sequential integers (`1`, `2`, `3`...).
- **FR-002**: System MUST format alternative variation branches in `MoveList` (`4.2`) using legal outline numbering where the first variation move begins with `1.1`, and subsequent moves or alternatives in that line increment sequentially (`1.2`, `1.3`...); deeper nested variations MUST increment in 3-part outline format (`1.1.1`, `1.1.2`...).
- **FR-003**: System MUST remove `truncate` / ellipsis styling from player names in the `4.6 Accuracy Summary Panel` header and apply Excel-style multiline wrapping (`whitespace-normal`, `break-words`, `leading-tight`).
- **FR-004**: System MUST enlarge classification count numbers in the `4.6 Accuracy Summary Panel` breakdown table to `15px–16px` bold font size.
- **FR-005**: System MUST enlarge the center column classification badge icons in the `4.6 Accuracy Summary Panel` to a frame size of `22px–24px`.
- **FR-006**: All changes MUST be strictly confined to Column 2 (`4.2` and `4.6`); Column 1 (Board Area, Eval Bar, Bottom Controls) and Column 3 (AI Coach) MUST remain 100% untouched (#no_change).

### Key Entities

- **OutlineNumberingState**: Hierarchical outline numbering tracking tuple `(depth, branchIndex, stepIndex)` that maps tree nodes to legal outline strings (`"1.1"`, `"1.2"`, `"1.1.1"`).
- **AccuracyHeaderPlayerDisplay**: Flexible text-wrap container for White and Black player names with bounded 2-line height and centered alignment.
- **EnlargedBadgeVisualConfig**: Extended badge styling providing `lg` badge variant (`22px–24px`) alongside standard inline `sm` badge (`16px`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In `MoveList` (`4.2`), 100% of main line moves display standard integers (`1`, `2`, `3`...), and 100% of sub-variation moves follow legal outline numbering (`1.1`, `1.2`, `1.3`... and `1.1.1`, `1.1.2`...).
- **SC-002**: 0% of player names in the `4.6 Accuracy Summary Panel` are clipped by ellipsis; names wrap cleanly across up to 2 lines.
- **SC-003**: Breakdown table count numbers render at $\ge 15\text{px}$ font size, and classification badge frames render at $\ge 22\text{px} \times 22\text{px}$.
- **SC-004**: The page strictly maintains `0px` global vertical scroll within the `1366x768` locked desktop layout (Principle I).

## Assumptions

- Standard games with no variations will display standard move numbers `1`, `2`, `3`... without any outline decimals.
- Outline numbering applies to variation moves regardless of whether the branch begins on White's or Black's half-move.
- All existing move click handlers (`4.4`), selection checkboxes (`4.3`), and classification color badges (`4.5`) continue functioning with zero regressions.
