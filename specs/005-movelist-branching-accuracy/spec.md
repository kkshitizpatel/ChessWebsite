# Feature Specification: Column 2 Lichess PGN Tree Branching, Move Classification Badges & 4.6 Accuracy Summary Panel

**Feature Branch**: `005-movelist-branching-accuracy`

**Created**: 2026-10-13

**Status**: Draft

**Input**: User description: "4.2, 4.5, 4.6 #change #visual #logic #offline #exact — Target: Column 2 me Move List PGN tree branching ko Lichess standard par theek karna, 'Start Analysis' par move badges/colors render karna, aur Column 2 ke bottom green box me Accuracy Summary panel integrate karna."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lichess Standard PGN Tree Branching & Legitimate Move Numbering (Priority: P1)

A player records moves on the board or loads a PGN containing variations (alternative sub-lines). Instead of flat, invalid decimal move numbers (`1.1`, `2.1`, `3.1`), the Move List (`4.2`) displays the main line in clean standard algebraic rows (`1. e4 e5`, `2. Nf3 Nc6`) and renders alternative branches as visually indented variation sub-trees where move numbers strictly follow the legitimate chess full-move number and turn (e.g., `1... f6 2. g3 g6` or `2. Bc4 Nf6`), matching the Lichess / Chess.com tree standard.

**Why this priority**: Accurate move notation and variation hierarchy are foundational to reading, navigating, and selecting moves in Column 2 (`4.2`, `4.3`, `4.4`).

**Independent Test**: Can be independently tested by playing `1. e4 e5 2. Nf3`, jumping back to `1. e4`, and playing an alternative Black move `1... c5 2. Nf3 d6`. The variation appears inside a visually nested, indented sub-tree block with legitimate move numbers (`1... c5`, `2. Nf3 d6`) and zero decimal labels (`1.1`, `2.1`).

**Acceptance Scenarios**:

1. **Given** a game with a main line `1. e4 e5 2. Nf3 Nc6`, **When** the user jumps back to `1. e4` and plays an alternative Black move `c5` followed by `2. Nf3 d6`, **Then** the Move List renders the alternative line inside an indented variation container starting with `1... c5` (showing `...` in the White slot or variation continuation prefix) followed by `2. Nf3 d6`, without ever displaying `1.1` or `2.1`.
2. **Given** a variation starting on White's turn (e.g., alternative `2. Bc4` instead of `2. Nf3`), **When** rendered in the Move List, **Then** the variation block displays move number `2` with `Bc4` in the White column and continues subsequent moves (`2... Nf6 3. d3`) in order.
3. **Given** nested sub-variations (a variation inside another variation), **When** rendered in the Move List, **Then** each deeper variation level increases visual indentation (`depth` block) with a subtle left guide border while keeping legitimate chess move numbers.
4. **Given** any main-line or variation move row, **When** the user clicks a move SAN (`4.4`) or toggles its row checkbox (`4.3`), **Then** the board jumps to that exact node's FEN and move selection works identically across main lines and variations.

---

### User Story 2 - Move Classification Colors, Badges & Eval Scores on Start Analysis (Priority: P1)

When the user clicks `3.5.4 Start Analysis`, the offline Stockfish 19 engine (`stockfish-19-lite-single`) evaluates the game positions and classifies each move strictly according to Constitution Principle VI (Win% drop formulas, sacrifice detection for Brilliant, critical second-best gap for Great, and opening book detection). Each move in the Move List (`4.5`) displays its colored SAN text, its circular classification badge (`!!`, `!`, `★`, `👍`, `✔`, `📖`, `?!`, `?`, `??`) right next to the SAN, and its evaluation score badge (`+0.8`, `-1.2`).

**Why this priority**: Visual move classification and inline evaluation badges (`4.5`) are the core analysis feedback mechanism in the Move List after clicking `Start Analysis`.

**Independent Test**: Can be independently tested by playing or loading a game, clicking `3.5.4 Start Analysis`, and verifying that every analyzed move in Column 2 receives its classification text color, circular badge icon immediately adjacent to the SAN, and formatted evaluation pill (`+0.8`, `-1.2`).

**Acceptance Scenarios**:

1. **Given** an analyzed game in Column 2, **When** moves are classified by the Principle VI engine analyzer, **Then** each move renders with its exact visual styling:
   - **Brilliant (`!!`)**: Cyan-green SAN text (`#1ba39c` / `#2fe0c6`) + circular `'!!'` badge.
   - **Great (`!`)**: Blue SAN text (`#458cf7`) + circular `'!'` badge.
   - **Best (`★`)**: Solid green SAN text (`#81b64c`) + circular star (`★`) badge.
   - **Excellent (`👍`)**: Light green SAN text (`#96bc4b`) + circular thumbs-up (`👍`) badge.
   - **Good (`✔`)**: Muted green SAN text (`#97af8b`) + circular checkmark (`✔`) badge.
   - **Book (`📖`)**: Tan/Brown SAN text (`#c29b70`) + circular book (`📖`) badge.
   - **Inaccuracy (`?!`)**: Yellow SAN text (`#e5a93c`) + circular `'?!'` badge.
   - **Mistake (`?`)**: Orange SAN text (`#e67e22`) + circular `'?'` badge.
   - **Blunder (`??`)**: Red SAN text (`#e74c3c`) + circular `'??'` badge.
2. **Given** any analyzed move node, **When** rendered in a Move List row, **Then** the circular classification badge appears immediately next to the SAN text, followed by the compact evaluation badge (`+0.8`, `-1.2`) without overflowing the move cell.

---

### User Story 3 - Column 2 Bottom 4.6 Accuracy Summary Panel (Priority: P1)

When `3.5.4 Start Analysis` completes (or when toggled by the user), the `4.6 Accuracy Summary Panel` opens in the bottom section of Column 2. It displays a photo-less header row (`Players`, dynamic White player name, dynamic Black player name), rounded Accuracy score cards for White and Black (calculated via the Principle VI consistency-weighted formula), a 9-row classification count breakdown table with centered circular badges (`Brilliant` through `Blunder`), and a top-right `'X'` close button that collapses the panel so the Move List expands back to full Column 2 height.

**Why this priority**: Delivers the complete game review summary (`4.6` and `4.6.1`–`4.6.10`) directly inside Column 2 while respecting the `1366x768` zero-global-scroll layout constraint.

**Independent Test**: Can be independently tested by running `Start Analysis` on a game, verifying that the `4.6 Accuracy Summary Panel` appears at the bottom of Column 2 with dynamic PGN player names (no avatars), White/Black accuracy cards, and all 9 classification rows, and then clicking the `'X'` close button to verify that the panel closes and the Move List expands to fill Column 2.

**Acceptance Scenarios**:

1. **Given** the initial page load before analysis has run, **When** viewing Column 2, **Then** the `4.6 Accuracy Summary Panel` is hidden/collapsed by default and the Move List occupies the full height of Column 2.
2. **Given** a game where `Start Analysis` completes, **When** the analysis finishes, **Then** the `4.6 Accuracy Summary Panel` automatically opens in the bottom half of Column 2 (`~320px` height) while the Move List remains scrollable above it (`flex-1 overflow-y-auto`) with zero global page scroll.
3. **Given** the open `4.6 Accuracy Summary Panel`, **When** viewing its header and accuracy row, **Then** it displays `"Players"` on the left, dynamic White and Black player names from PGN headers (without any photo or avatar icons), and rounded Accuracy Score Cards (e.g., `78.9` and `65.2`).
4. **Given** the open `4.6 Accuracy Summary Panel`, **When** viewing the breakdown table, **Then** it displays all 9 classification rows in order (`Brilliant`, `Great`, `Best`, `Excellent`, `Good`, `Book`, `Inaccuracy`, `Mistake`, `Blunder`) with `White count | [Centered Badge Icon] | Black count`.
5. **Given** the open `4.6 Accuracy Summary Panel`, **When** the user clicks the top-right `'X'` close button, **Then** the panel closes immediately and the Move List expands to take the full height of Column 2.

---

### Edge Cases

- **Black-First Variations (`1... c5`)**: When a variation branches off a White move (so the first move of the variation is a Black half-move), the variation row must display the move number (`1...`) and place the Black move in the Black column (or show `...` in the White slot) rather than misaligning it into the White column.
- **Long Player Names in 4.6 Header**: If PGN `[White]` or `[Black]` names are long, they must truncate cleanly with an ellipsis (`truncate`) so the Column 2 width is never stretched.
- **Zero-Move or Unanalyzed Game**: Clicking `Start Analysis` on a game with moves triggers Stockfish evaluation for all moves in the active line/tree before opening the `4.6` Accuracy Summary Panel; if all moves are Book moves or only 1 side has moved, accuracy defaults gracefully (`100.0` or `0.0`) without `NaN`.
- **1366x768 Viewport Budget**: Both the Move List (`flex-1 min-h-0 overflow-y-auto`) and the `4.6 Accuracy Summary Panel` (`h-[320px] shrink-0`) must fit strictly inside Column 2's flex container so outer page overflow remains locked (`overflow-hidden`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove flat decimal variation numbering (`1.1`, `2.1`, `3.1`) from `MoveList` (`4.2`) and instead render main-line moves with standard integer move numbers (`1`, `2`, `3`...) and variations as visually indented sub-tree blocks using legitimate chess move numbers (`1... f6`, `2. g3 g6`).
- **FR-002**: System MUST classify every analyzed move on `3.5.4 Start Analysis` using local Stockfish 19 (`stockfish-19-lite-single`, `#offline`) and Constitution Principle VI formulas:
  - `WinPercent = 50 + 50 * (2 / (1 + e^(-0.00368208 * cp)) - 1)`
  - `Drop = WinPercentBefore - WinPercentAfter` (from the moving player's perspective)
  - `MoveAccuracy = clamp(103.1668 * e^(-0.04354 * Drop) - 3.1669, 0, 100)`
  - Game Accuracy = consistency-weighted average of move accuracies per player.
- **FR-003**: System MUST render the 9 move classifications in `MoveList` (`4.5`) with their exact color and circular badge next to the move SAN and evaluation pill (`+0.8`, `-1.2`):
  - `Brilliant`: `#2fe0c6` / `#1ba39c` text + `'!!'` badge
  - `Great`: `#458cf7` text + `'!'` badge
  - `Best`: `#81b64c` text + `'★'` star badge
  - `Excellent`: `#96bc4b` text + `'👍'` thumbs-up badge
  - `Good`: `#97af8b` text + `'✔'` checkmark badge
  - `Book`: `#c29b70` text + `'📖'` book badge
  - `Inaccuracy`: `#e5a93c` text + `'?!'` badge
  - `Mistake`: `#e67e22` text + `'?'` badge
  - `Blunder`: `#e74c3c` text + `'??'` badge
- **FR-004**: System MUST provide the `4.6 Accuracy Summary Panel` at the bottom of Column 2, hidden by default until `Start Analysis` completes (or toggled by the user), featuring a top-right `'X'` close button that collapses the panel and restores full Column 2 height to the Move List.
- **FR-005**: The `4.6 Accuracy Summary Panel` MUST display:
  - A photo-less header row with `"Players"` on the left, dynamic White player name in the middle column, and dynamic Black player name in the right column.
  - Rounded Accuracy score cards for White and Black (`0.0`–`100.0`, formatted to 1 decimal place).
  - A 9-row breakdown table (`Brilliant`, `Great`, `Best`, `Excellent`, `Good`, `Book`, `Inaccuracy`, `Mistake`, `Blunder`) showing `White count | Centered Classification Badge | Black count`.
- **FR-006**: Column 2 MUST remain a `flex-col` container where the Move List (`flex-1 min-h-0 overflow-y-auto`) and the `4.6 Accuracy Summary Panel` (`~320px` height when open) fit strictly within the `1366x768` desktop layout with zero global vertical scroll (Principle I).

### Key Entities

- **MoveClassification (`MoveQuality`)**: One of `'Brilliant' | 'Great' | 'Best' | 'Excellent' | 'Good' | 'Book' | 'Inaccuracy' | 'Mistake' | 'Blunder'`, stored on each analyzed `MoveNode` along with `eval` (in pawns from White's perspective) and `accuracy` (`0`–`100`).
- **VariationRenderBlock**: Hierarchical representation of main-line rows and indented sub-variation blocks derived from `MoveTree`, preserving legitimate move numbers (`moveNumber`) and turn alignment (`w` / `b`).
- **AccuracySummaryStats**: Aggregated per-side (`white` and `black`) consistency-weighted accuracy percentage (`0.0`–`100.0`) and move counts for each of the 9 classification categories (`4.6.1`–`4.6.10`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `0` instances of decimal variation numbers (`1.1`, `2.1`, `3.1`) appear anywhere in the Move List (`4.2`); 100% of main-line and variation moves display legitimate chess move numbers.
- **SC-002**: 100% of moves analyzed via `Start Analysis` display their colored SAN text, circular classification badge (`!!`, `!`, `★`, `👍`, `✔`, `📖`, `?!`, `?`, `??`), and evaluation score (`+0.8`, `-1.2`) inline in the Move List (`4.5`).
- **SC-003**: The `4.6 Accuracy Summary Panel` opens automatically upon analysis completion in the bottom container of Column 2 (`~320px` height), displays photo-less dynamic player names, White/Black accuracy cards, and all 9 breakdown rows, and closes cleanly via the `'X'` button.
- **SC-004**: The entire application remains locked within the `1366x768` viewport with `0px` global vertical scroll both when the `4.6 Accuracy Summary Panel` is open and when it is closed.

## Assumptions

- When the user clicks `3.5.4 Start Analysis`, if moves in the current game have not yet been evaluated by Stockfish 19 (`#offline`), the system evaluates all moves in the game and computes their Principle VI classifications and accuracy stats before (or while) presenting the `4.6` Accuracy Summary Panel and AI explanation.
- Opening book moves in standard starting positions (first few known theory plies with minimal Win% drop) are classified as `Book` (`📖`).
