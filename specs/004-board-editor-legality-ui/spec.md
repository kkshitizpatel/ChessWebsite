# Feature Specification: Roomy 3.5.5 Chessboard Settings Popup UI & FIDE/Lichess Chess Legality Engine

**Feature Branch**: `004-board-editor-legality-ui`  
**Created**: 2026-10-13  
**Status**: Draft  
**Input**: User description: "3.5 + 3.5.5 #change #visual #size #logic #offline #exact — Target: 3.5.5 Chessboard Settings popup ka roomy/breathing UI design aur Lichess / Chess.com standard Chess Legality Engine integrate karna."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Roomy, High-Contrast 3.5.5 Settings Popup UI (Priority: P1)

A player clicks the `3.5.5` Settings button in the bottom control bar and sees a spacious, well-proportioned popup (`440px–460px` wide, `~670px–690px` high) floating parallel to the right side of the chessboard inside the `1366x768` viewport without covering the board or shifting Column 2/3. Every palette tool button has at least a `42px × 42px` frame with crisp `28px–32px` Lichess `'cburnett'` SVG piece icons, the Black Pieces Palette sits on a distinct contrasting slate surface (`#22272b` / `#1e2327`) so dark pieces never blend into the background, dropdowns are `38px` tall, and the `3x3` Time Control preset buttons are `40px` tall with `8px` equal gaps.

**Why this priority**: A roomy, high-contrast layout is essential so players can comfortably select and drag pieces on both desktop mice and touchscreens without cramped controls or dark-on-dark visibility issues.

**Independent Test**: Open `http://localhost:3000` at `1366x768` px, click `3.5.5 Settings`, and verify the popup width (`440px–460px`), height (`~670px–690px` within `768px` viewport with zero global vertical scroll), `42px × 42px` palette button frames, `28px–32px` piece icons, `#22272b` / `#1e2327` Black Palette contrast surface, `38px` dropdowns, and `40px` Time Control buttons with `8px` gaps.

**Acceptance Scenarios**:

1. **Given** the `1366x768` desktop dashboard, **When** the user opens the `3.5.5` Settings popup, **Then** the popup renders with a width between `440px` and `460px` and a height proportional to the board area (`~670px–690px`), floating to the right of the chessboard without overlapping the board or causing any global vertical scrollbar.
2. **Given** the open `3.5.5` Settings popup, **When** inspecting the Black and White piece palettes, **Then** each of the 8 tool buttons per row has at least a `42px × 42px` hit frame, Lichess `'cburnett'` SVG piece icons are `28px–32px` tall, the Black Pieces Palette row uses a contrasting surface (`#22272b` / `#1e2327`), and the active tool displays a green border highlight.
3. **Given** the open `3.5.5` Settings popup, **When** inspecting the form controls, **Then** the `"Level: 6"` badge is on a single non-wrapping line, `Turn to play` and `En passant rights` dropdowns are `38px` high, and the 9 Time Control preset buttons are `40px` high with `8px` equal gaps in a `3x3` grid.

---

### User Story 2 - Pointer-Events Board Editor Interactions (Lichess / Chess.com Style) (Priority: P2)

A player uses mouse or touch (`pointerdown`, `pointermove`, `pointerup`) to edit the board position: selecting the Hand tool to pick and move existing board pieces to legal squares, using Piece tools (`K, Q, R, B, N, P`) via either click-to-place on a square or drag-to-place from the palette onto a square, and removing pieces either by clicking them with the Trash tool or dragging any board piece outside the chessboard boundary.

**Why this priority**: Seamless touch/mouse/WebView position setup is the core interactive capability of the Board Editor (Constitution Principle IV).

**Independent Test**: Using both click/tap and pointer-drag, test placing pieces from the Black and White palettes onto board squares, moving pieces on the board with the Hand tool, deleting pieces by clicking with the Trash tool, and deleting pieces by dragging them outside the board boundary.

**Acceptance Scenarios**:

1. **Given** a Piece tool (`K, Q, R, B, N, P` of either color) is selected in the palette, **When** the user clicks/taps a legal target square on the chessboard OR drags the piece from the palette and releases (`pointerup`) over a legal target square, **Then** that piece is placed on the target square.
2. **Given** the Hand tool is active, **When** the user drags an existing piece on the chessboard to another legal square (`pointerdown` → `pointermove` → `pointerup`), **Then** the piece moves to the new square if the resulting position satisfies placement constraints.
3. **Given** the Trash tool is active, **When** the user clicks/taps any piece on the chessboard, **Then** that piece is immediately removed from the board.
4. **Given** any piece on the chessboard, **When** the user drags that piece outside the outer boundary of the chessboard and releases (`pointerup`), **Then** that piece is automatically deleted from the board.

---

### User Story 3 - FIDE / Lichess Chess Legality Engine & Global Sync (Priority: P3)

As the player edits the board or changes Turn, Castling, or En Passant controls, the FIDE/Lichess Legality Engine enforces all chess composition rules in real time: preventing duplicate Kings, adjacent Kings, Rank 1/8 pawns, >8 pawns, >16 pieces, and over-quota promoted pieces; dynamically enabling/disabling castling checkboxes (`3.5.5.6`) and en passant files (`3.5.5.7`) based on exact piece coordinates; blocking illegal turn switches (`3.5.5.5`); syncing live FEN to Column 3 (`5.3.1`); resetting the Move List (`Column 2`); and disabling `3.5.4 Start Analysis` and `3.5.3 Practice` with an inline warning banner whenever the board position is incomplete or invalid (such as after clicking `3.5.5.10 Clear Board`).

**Why this priority**: Enforces Constitution Principle XI so no illegal or crash-inducing FEN can ever be passed to the Stockfish engine or AI coach.

**Independent Test**: Test each legality rule (2nd King block, adjacent Kings block, Rank 1/8 pawn block, 9th pawn block, promotion quota math block, inactive King in check block, dynamic castling auto-uncheck/disable when King/Rook moves, dynamic en passant file calculation, Clear Board invalid guard, and Starting Position full reset).

**Acceptance Scenarios**:

1. **Given** a White King (or Black King) is already on the board, **When** the user attempts to place or drop a second King of the same color from the palette, **Then** the placement is blocked so a side never has more than 1 King.
2. **Given** both Kings are on the board, **When** the user attempts to place or move a King onto a square adjacent to the opposing King (Chebyshev distance $< 2$), **Then** the placement/move is rejected and snaps back.
3. **Given** a Pawn tool is selected or a Pawn is being moved on the board, **When** the user attempts to place or drop the Pawn on Rank 1 or Rank 8, or attempts to add a 9th Pawn of the same color, **Then** the placement/drop is rejected and snaps back.
4. **Given** a side already has pieces on the board, **When** the user attempts to add a Queen, Rook, Bishop, or Knight that would cause $\max(0, Q - 1) + \max(0, R - 2) + \max(0, B - 2) + \max(0, N - 2) > 8 - \text{current\_pawns}$ or total pieces $> 16$, **Then** the placement is blocked with a clear inline reason.
5. **Given** the board position is being edited, **When** the White King is not on `e1` or the White Rook is not on `h1` (`a1`), or the Black King is not on `e8` or the Black Rook is not on `h8` (`a8`), **Then** the corresponding castling checkbox (`White 0-0`, `White 0-0-0`, `Black 0-0`, `Black 0-0-0`) is automatically unchecked and disabled (greyed out).
6. **Given** any board position and active turn, **When** evaluating En Passant rights (`3.5.5.7`), **Then** only files (`a–h`) where a legitimate en passant capture is physically possible for the active side are selectable; if none exist, the dropdown is locked to `'-'` and disabled.
7. **Given** the user toggles `3.5.5.5 Turn to play`, **When** switching the turn would result in the newly inactive side's King being in check, **Then** the turn switch is blocked and an inline reason is displayed.
8. **Given** the user clicks `3.5.5.10 Clear Board` (or creates a position with a missing King or inactive King in check), **Then** `3.5.4 Start Analysis` and `3.5.3 Practice with Computer` are disabled, an inline warning banner displays the exact invalidity reason near the board, Column 3 FEN (`5.3.1`) updates live, and clicking `3.5.5.9 Starting Position` restores the standard initial FEN with all 4 castling rights enabled and clears the warning.

---

### Edge Cases

- **Replacing a Piece on an Occupied Square**: When placing a palette piece onto a square already occupied by another piece, the legality engine evaluates the resulting board state *after* replacing the occupant (except that an existing King cannot be overwritten if doing so would violate King rules, and a 2nd King of the same color is always blocked).
- **Pawn Deletion Reducing Promotion Quota**: If a player already has promoted pieces on the board (e.g., 2 Queens and 7 Pawns, which uses $1 \le 8 - 7 = 1$ promoted slot) and tries to add an 8th Pawn, adding the 8th Pawn would make $\text{extra pieces} = 1 > 8 - 8 = 0$, so the 8th Pawn placement is blocked until the extra Queen is removed.
- **Board Flip Compatibility**: All square hit-testing for Pointer Events (click-to-place, drag-to-place from palette, Hand drag on board, and drag-outside-to-delete) works identically whether the board orientation is `white` or `black` (`3.5.1 Flip board`).

## Requirements *(mandatory)*

### Functional Requirements

#### A) UI Layout & Popup Dimensions (`#size #visual`)
- **FR-001**: The `3.5.5` Settings Popup container MUST have a roomy width of `440px–460px` and a height proportional to the board area (`~670px–690px`), constrained within the `1366x768` viewport (`max-h-[calc(100vh-24px)] overflow-y-auto`) so it never triggers a global vertical scrollbar.
- **FR-002**: The popup MUST float parallel to the right side of the chessboard without covering the chessboard (`3.2`) and without causing any flex layout shift in Column 2 (`Move List`) or Column 3 (`AI Coach`), dismissing on outside pointer click or `Escape` key.
- **FR-003**: Each tool button in `3.5.5.3 Black Pieces Palette` and `3.5.5.4 White Pieces Palette` MUST have a minimum frame size of `42px × 42px`, and the Lichess `'cburnett'` SVG piece icons MUST render at `28px–32px` height.
- **FR-004**: The `3.5.5.3 Black Pieces Palette` bar MUST use a distinct dark-contrast surface (`#22272b` / `#1e2327`) so black piece icons have clear visual separation, and the currently selected tool MUST display a green border highlight.
- **FR-005**: In `3.5.5.1 Computer Level`, the `"Level: 6"` badge MUST remain on a single non-wrapping line; `3.5.5.5 Turn to play` and `3.5.5.7 En passant rights` dropdowns MUST have `38px` height; and the `3.5.5.8 Time Control` `3x3` preset buttons MUST have `40px` height with `8px` equal gaps.

#### B) Board Interaction (`#drag #logic #offline`)
- **FR-006**: All palette-to-board and board-square editor interactions MUST be implemented using standard Pointer Events (`pointerdown`, `pointermove`, `pointerup`) without relying on desktop-only HTML5 drag-and-drop.
- **FR-007**: Selecting the Hand tool (`b-hand` / `w-hand`) MUST allow picking and dragging existing board pieces to legal squares on the chessboard.
- **FR-008**: Selecting any Piece tool (`K, Q, R, B, N, P` for Black or White) MUST support both click-to-place on any target board square and drag-to-place (with a floating drag preview) from the palette onto a target board square.
- **FR-009**: Selecting the Trash tool (`b-trash` / `w-trash`) MUST remove any board piece upon click/tap, and dragging any board piece outside the chessboard boundary and releasing (`pointerup`) MUST automatically delete that piece.

#### C) FIDE / Lichess Chess Legality Engine (`Principle XI`)
- **FR-010**: **King Rules**:
  - A valid position for analysis/practice MUST contain exactly 1 White King and 1 Black King; attempting to place/drop a 2nd King of a color when 1 is already present on the board MUST be blocked.
  - Both Kings MUST never occupy adjacent/touching squares (Chebyshev distance $\max(|\Delta \text{file}|, |\Delta \text{rank}|) \ge 2$); any placement or move that puts Kings adjacent MUST be rejected.
  - The inactive side's King (the player whose turn it is NOT) MUST NOT be in check; switching `3.5.5.5 Turn to play` MUST be blocked with an inline reason if the switch would leave the newly inactive King in check.
- **FR-011**: **Pawn Rules**:
  - Placing or moving a Pawn (White or Black) onto Rank 1 or Rank 8 MUST be strictly blocked (snap back / reject).
  - Each color MUST NOT exceed 8 Pawns on the board; attempting to place a 9th Pawn MUST be blocked.
- **FR-012**: **Promotion Math & Piece Count Quota**:
  - Total pieces per color MUST NOT exceed 16.
  - Promoted piece count per color MUST satisfy:
    $$\max(0, Q - 1) + \max(0, R - 2) + \max(0, B - 2) + \max(0, N - 2) \le 8 - \text{current\_pawns}$$
    Any piece placement or pawn addition that violates this inequality MUST be blocked with an inline reason.
- **FR-013**: **Dynamic Castling Rights (`3.5.5.6`)**:
  - `White 0-0` is enabled ONLY when White King is on `e1` AND White Rook is on `h1`.
  - `White 0-0-0` is enabled ONLY when White King is on `e1` AND White Rook is on `a1`.
  - `Black 0-0` is enabled ONLY when Black King is on `e8` AND Black Rook is on `h8`.
  - `Black 0-0-0` is enabled ONLY when Black King is on `e8` AND Black Rook is on `a8`.
  - Whenever a King or respective Rook moves off its home square or is deleted, its corresponding castling checkbox MUST immediately auto-uncheck and become disabled (greyed out).
- **FR-014**: **Dynamic En Passant Rights (`3.5.5.7`)**:
  - A file (`a–h`) in the En Passant dropdown is selectable ONLY when:
    - For `White to play`: a Black pawn is on Rank 5 of that file, Rank 6 (and Rank 7) of that file is empty, and at least one White pawn is on Rank 5 of an adjacent file (`file ± 1`).
    - For `Black to play`: a White pawn is on Rank 4 of that file, Rank 3 (and Rank 2) of that file is empty, and at least one Black pawn is on Rank 4 of an adjacent file (`file ± 1`).
  - If no file satisfies these conditions, the En Passant dropdown MUST lock to `'-'` and be disabled. Changes to board pieces or turn MUST auto-recalculate En Passant options immediately.
- **FR-015**: **Actions, Live FEN Sync & Invalid State Guard**:
  - `3.5.5.9 Starting Position` MUST reset the board to `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`, set Turn to `White`, check and enable all 4 castling rights, set En Passant to `'-'`, and clear the Move List.
  - `3.5.5.10 Clear Board` MUST empty all board squares (`8/8/8/8/8/8/8/8 w - - 0 1`), uncheck and disable all castling rights, lock En Passant to `'-'`, clear the Move List, and activate the Invalid State Guard.
  - Every board edit or control change MUST immediately sync the 6-field FEN to Column 3's FEN Input (`5.3.1`) and reset Column 2's Move List (`[SetUp "1"]`, `[FEN "..."]`).
  - Whenever the current board state is invalid/incomplete (e.g., missing King, inactive King in check, impossible multiple check), `3.5.4 Start Analysis` and `3.5.3 Practice with Computer` MUST be disabled and an inline warning banner MUST display the specific reason.

### Key Entities

- **EditorBoardState**: Represents the 64-square piece map (`square -> { type, color }`), active turn (`'w' | 'b'`), castling availability/state (`{ wK, wQ, bK, bQ }`), en passant target (`'-'` or `'a3'..'h6'`), derived 6-field FEN string, and legality validation result (`{ isValid: boolean, reason: string | null, actionFeedback: string | null }`).
- **LegalityValidator**: Pure offline validation module enforcing FIDE/Lichess composition rules (1 King per side, Chebyshev King distance $\ge 2$, no pawns on Rank 1/8, max 8 pawns, promotion quota math, max 16 pieces per side, inactive King not in check, legal active check count, home-square castling eligibility, and legal en passant file detection).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The `3.5.5` Settings Popup renders at `440px–460px` width and `~670px–690px` height within the `1366x768` viewport with `0px` global vertical scroll, `>= 42px × 42px` palette button frames, and `28px–32px` piece icons.
- **SC-002**: 100% of illegal placement attempts (2nd King of same color, touching Kings with distance $< 2$, Pawns on Rank 1 or 8, $> 8$ Pawns, promoted pieces exceeding $8 - \text{current\_pawns}$, or $> 16$ total pieces per side) are blocked immediately in $< 16\text{ ms}$.
- **SC-003**: 100% of castling checkboxes (`3.5.5.6`) and en passant files (`3.5.5.7`) dynamically enable, disable, and auto-reset in real time whenever pieces or turn change.
- **SC-004**: Whenever the board is cleared (`3.5.5.10`) or placed into an incomplete/invalid state, `3.5.4 Start Analysis` and `3.5.3 Practice with Computer` are 100% disabled with a human-readable inline warning reason, and `5.3.1` FEN input stays synchronized in real time.

## Assumptions

- When the `3.5.5` Settings Popup is open (or when an editor tool other than default play is used), pointer interactions on the board operate in Board Editor mode; when the popup is closed and the position is valid, normal chess move play/analysis resumes seamlessly from the custom FEN.
- Attempting an illegal drop/click (such as dropping a Pawn on Rank 1/8 or adding a 2nd King) leaves the previous valid board squares unchanged and shows a brief inline feedback message explaining which rule blocked the action.
