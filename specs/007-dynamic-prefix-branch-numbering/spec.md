# Feature Specification: Dynamic Parent-Prefix Move List Variation Numbering (4.2)

**Feature Branch**: `007-dynamic-prefix-branch-numbering`

**Created**: 2026-10-13

**Status**: Draft

**Input**: User description: "4.2 #logic #no_change #exact Target: Move List me alternative branches/sub-lines ke index generator ko fix karna taaki har branch apne parent move number ka dynamic prefix le, hardcoded '1.1' reset bug ko remove kiya ja sake. UI layout aur styling exact wahi rahegi (#no_change)."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dynamic Parent Prefix for Primary Variations (`Depth = 1`) (Priority: P1) 🎯 MVP

As a chess player exploring alternative moves in the analysis Move List (`4.2`), I want variations branching from Main Move $N$ to automatically inherit move number $N$ as their outline prefix ($N.1, N.2, N.3...$) instead of resetting to a hardcoded '1.1', so that I can immediately tell which main-line move the variation branched from.

**Why this priority**: Essential chess notation correctness. Currently, every variation at depth 1 resets to `1.1` regardless of whether it branches from Move 1, Move 2, or Move 20, creating severe notation confusion during game analysis.

**Independent Test**: Load or play a game to move 3 (`1. e4 e5 2. Nf3 Nc6 3. Bb5 a6`). At move 2, play an alternative move (e.g. `2. d4`). Verify that the first move of this branch displays `2.1`, the next displays `2.2`, and at move 3 an alternative displays `3.1`, `3.2`...

**Acceptance Scenarios**:

1. **Given** a main line game at Move 1 (`1. e4 e5`), **When** user branches an alternative move at Move 1 (e.g. `1. d4`), **Then** the variation row receives outline badge `1.1`, and subsequent moves in that variation follow `1.2`, `1.3`...
2. **Given** a main line game at Move 2 (`2. Nf3 Nc6`), **When** user branches an alternative move at Move 2 (e.g. `2. Bc4` or `2... Nf6`), **Then** the variation row receives outline badge `2.1` (NOT `1.1`), and subsequent moves in that variation follow `2.2`, `2.3`...
3. **Given** a main line game at Move 3 (`3. Bb5 a6`), **When** user branches an alternative move at Move 3, **Then** the variation row receives outline badge `3.1`, and subsequent moves in that branch follow `3.2`, `3.3`...
4. **Given** any general Move $N$, **When** user creates an alternative branch from Move $N$, **Then** the branch moves are sequentially labeled `N.1`, `N.2`, `N.3`...

---

### User Story 2 - Recursive Parent Prefix for Nested Variations (`Depth >= 2`) (Priority: P1)

As a chess player analyzing deep opening branches with sub-variations, I want nested sub-trees to recursively inherit their parent branch label prefix (e.g., `2.1.1`, `2.1.2` when branching from `2.1`), so that multi-level branching follows the standard legal outline hierarchical notation.

**Why this priority**: Supports rigorous multi-level game exploration where players branch variations within variations.

**Independent Test**: In a variation row labeled `2.1`, play an alternative sub-move. Verify the newly branched nested row displays `2.1.1`, and its continuation displays `2.1.2`.

**Acceptance Scenarios**:

1. **Given** an existing variation row with outline badge `2.1`, **When** user plays an alternative move at that ply, **Then** the child nested variation row receives badge `2.1.1`.
2. **Given** a continuation move inside the nested variation starting at `2.1.1`, **When** subsequent moves are played in that branch, **Then** the next row displays `2.1.2`, `2.1.3`...
3. **Given** an existing variation row with outline badge `3.2`, **When** a sub-variation branches from it, **Then** the nested variation receives badge `3.2.1`, `3.2.2`...

---

### User Story 3 - Black Turn Ellipsis & Non-Regression Safeguards (Priority: P1)

As a chess player navigating through variations, I want Black-first variations to clearly preserve the ellipsis placeholder (`...`) in White's slot, and I want all move selection checkboxes (`4.3`), board click jumps (`4.4`), classification icons (`4.5`), and visual layout to remain 100% preserved.

**Why this priority**: Ensures zero regressions in working functionality (Principle II) and maintains clear notation formatting for Black-first branch points.

**Independent Test**: Branch an alternative Black reply at Move 2 (`2... Nf6` instead of `2... Nc6`). Verify the variation row displays `2.1`, shows `...` in White's move slot, renders `Nf6` in Black's move slot, and clicking `Nf6` jumps the board to the correct position with correct FEN.

**Acceptance Scenarios**:

1. **Given** a variation branching on Black's turn at Move $N$ (e.g., Move 2), **Then** the row displays badge `N.1`, displays `...` in the White move column, and places Black's move in the Black move column.
2. **Given** the updated outline numbering, **When** user clicks any variation move, **Then** the board instantly updates to the corresponding FEN position (`4.4`) with correct eval and active highlight.
3. **Given** the updated outline numbering, **When** user toggles checkboxes (`4.3`), **Then** multi-select for AI analysis functions identically across main lines and variations.
4. **Given** the 1366x768 locked layout, **Then** zero visual styling changes, zero layout shifts, and zero outer vertical scroll occur (`#no_change`, Principle I).
5. **Given** the website architecture, **Then** Column 1 (Board/Engine), Column 3 (AI Panel), and 4.6 Accuracy Panel remain completely untouched (`#no_change`, Principle II).

---

### Edge Cases

- **Root Alternative Move**: When an alternative is played at Move 1 (e.g. `1. d4` vs `1. e4`), the parent move number is 1, so the branch is labeled `1.1`, `1.2`...
- **Multiple Sibling Alternatives at Same Move**: If White plays `2. Nf3`, and user analyzes alternative `2. Bc4` and also another alternative `2. d4`: both originate from Move 2 and are formatted under prefix `2.` (`2.1`, `2.2`... or sibling branches).
- **Deep Nesting (Depth >= 3)**: If a sub-variation branches from `2.1.1`, its badge inherits `2.1.1.1`, `2.1.1.2`... cleanly without text truncation.
- **Transposition or Empty Children**: When a line terminates, step counters reset properly for subsequent separate branches without cross-branch contamination.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST determine the outline prefix of each variation branch dynamically from its parent move number $N$ (`depth = 1` $\rightarrow$ prefix `N`), strictly prohibiting hardcoded `"1"` as the universal prefix.
- **FR-002**: First-level variations originating from Move $N$ MUST be formatted as $N.1, N.2, N.3...$ for consecutive moves along that branch.
- **FR-003**: Nested variations (`depth >= 2`) MUST derive their prefix from their direct parent row's outline label $\text{ParentPrefix}$ and format as $\text{ParentPrefix}.1, \text{ParentPrefix}.2...$.
- **FR-004**: Variations starting on Black's turn MUST render the dynamic outline badge ($N.1$), an ellipsis placeholder (`...`) in White's cell, and Black's move in Black's cell.
- **FR-005**: Main line moves (`depth = 0`) MUST continue to display standard sequential integers (`1`, `2`, `3`...).
- **FR-006**: Move selection checkboxes (`4.3`), board click navigation (`4.4`), classification badges (`4.5`), and FEN generation MUST remain fully functional without behavioral regression.
- **FR-007**: System MUST NOT modify any UI layout, container dimensions, colors, borders, Column 1, Column 3, or Accuracy Panel (`#no_change`).

---

### Key Entities

- **`MoveNode`**: Tree node representing a half-move, containing `id`, `parentId`, `moveNumber`, `turn`, `san`, `fen`, `childrenIds`.
- **`MoveRowItem`**: Representation of a rendered move row containing `key`, `moveNumber`, `displayLabel` (e.g., `"1"`, `"2.1"`, `"2.1.1"`), `depth`, `isVariationStart`, `whiteNode`, `blackNode`, `allIds`.
- **`outlinePrefix`**: Hierarchical string representing the parent outline path (e.g. `""` for main line, `"2"` for first-level variation from move 2, `"2.1"` for nested sub-variation).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of first-level variations originating from Move $N$ display badge $N.1$ on their initial move row (verified for $N = 1, 2, 3...$).
- **SC-002**: 100% of nested variations originating from row $P$ display badge $P.1$ on their initial move row (e.g. `2.1.1` from `2.1`).
- **SC-003**: 0 hardcoded `'1.1'` reset occurrences when variations branch from moves $N > 1$.
- **SC-004**: 0 regressions in move selection checkboxes, move history navigation, or FEN updates.
- **SC-005**: 0px layout shift, 0 visual style modifications, and 0 global page scroll on 1366x768 (`#no_change`).

---

## Assumptions

- Main line moves always have `moveNumber >= 1`.
- The parent node of any variation at `depth = 1` belongs to the main line with known `moveNumber`.
- For `depth >= 2`, the parent row label is uniquely known at the branching point.
- Visual badge container width (`w-[36px] min-w-[36px]`) and font styles implemented in feature 006 accommodate outline strings up to 6 characters (e.g., `2.1.1`) cleanly.
