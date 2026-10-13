# Feature Specification: Show Best Move Arrow Toggle (3.5.4.2)

**Feature Branch**: `002-show-best-move`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "3.5.4.2 #add #logic #exact - Show best move toggle ko working banao. ON: engine ka top move (PV #1) board par arrow se dikhe (3.2 ka existing arrow system reuse karo). OFF: arrow na dikhe. Default OFF, selection LocalStorage me save ho. Practice with Computer (3.5.2) me ye hint ki tarah kaam kare. User move khele to arrow naye position ke hisaab se update ho. Engine: existing stockfish-18-lite-single, #offline. UI/design bilkul same rahe jo Prompt 2 me ban chuka hai (#no_change). Baaki 3.5.4.x aur ✅ Working features touch mat karna."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Best Move Arrow Display (Priority: P1)

As a chess player analyzing a position or playing on the board, I want to see an arrow pointing from the starting square to the target square of the engine's top move when the "Show best move" toggle is enabled, so that I immediately understand the objectively strongest move in the position.

**Why this priority**: Displaying the engine's top move (PV #1) on the board is the core value of feature 3.5.4.2. Without real-time arrow rendering, the toggle provides no user value.

**Independent Test**: Can be tested on the initial or any custom position by switching the toggle to ON: a clear arrow appears on the board indicating the engine's top move. Switching the toggle to OFF causes the arrow to immediately disappear.

**Acceptance Scenarios**:

1. **Given** the chessboard is in any legal, non-terminal position and the toggle is ON, **When** the engine finishes evaluating the current position, **Then** a visible arrow is drawn directly on the board from the source square to the destination square of the engine's top move (PV #1).
2. **Given** the best move arrow is currently visible on the board, **When** the user switches the "Show best move" toggle to OFF, **Then** the arrow disappears immediately without disturbing piece positions or evaluation stats.
3. **Given** the toggle is OFF, **When** the board position changes or the game advances, **Then** no best move arrow is rendered on the board.

---

### User Story 2 - Toggle Preference Local Storage Persistence (Priority: P2)

As a returning player, I want my preferred toggle state (ON or OFF) to be remembered between sessions, so that I don't have to reopen the settings popup and re-enable it every time I reload the application.

**Why this priority**: Preserves user choice seamlessly and ensures guest mode convenience without requiring account sign-in.

**Independent Test**: Can be tested by switching the toggle to ON, refreshing the browser page, and verifying that the toggle remains ON and the best move arrow renders automatically for the starting position.

**Acceptance Scenarios**:

1. **Given** a first-time user visits the site, **When** inspecting the settings, **Then** the "Show best move" toggle defaults to OFF.
2. **Given** the user turns the "Show best move" toggle ON, **When** the toggle is activated, **Then** the state is stored in browser local storage.
3. **Given** the user has previously enabled the toggle, **When** the page is reloaded, **Then** the toggle initializes as ON and the engine arrow appears automatically.

---

### User Story 3 - Reactive Position Updates & Practice Mode Hinting (Priority: P3)

As a player practicing against the computer (3.5.2) or stepping through a game with playback buttons (3.5.1), I want the best move arrow to automatically refresh for the new active board position whenever a move is made or historical moves are navigated, so that it serves as an interactive hint.

**Why this priority**: Chess analysis is dynamic; static arrows become invalid as soon as a move occurs. The arrow must stay synchronized with the active position in real-time.

**Independent Test**: Can be tested during Practice mode: make a move on the board, wait for computer response, and verify that the arrow updates promptly for the new position after each turn.

**Acceptance Scenarios**:

1. **Given** the toggle is ON and the player plays a move on the board, **When** the move is completed, **Then** the previous arrow is cleared and a new arrow appears showing the best move for the new position.
2. **Given** the user is in "Practice with Computer" mode (3.5.2) with the toggle ON, **When** it is the player's turn to move, **Then** the arrow points to the best move, serving as a live hint.
3. **Given** the user navigates backward or forward in the move list (3.5.1 / 4.4), **When** a historical move is viewed, **Then** the arrow reflects the best move for that specific historical board state.

---

### Edge Cases

- **Terminal Positions (Checkmate / Stalemate)**: When the game reaches checkmate or stalemate, no legal moves exist. The system MUST clear any active arrow and not attempt to request move suggestions.
- **Fast Navigation / Rapid Moves**: When the user rapidly steps through moves or drags pieces quickly, older asynchronous evaluation results MUST NOT overwrite the arrow for the currently active position.
- **Board Orientation Flip**: When the board is flipped (White vs Black perspective), the arrow coordinates MUST correctly match the board orientation without inversion errors.
- **LocalStorage Inaccessible**: If browser local storage is blocked (e.g., restricted private mode), the toggle MUST fall back gracefully to in-memory state without crashing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a stateful toggle for "Show best move" (3.5.4.2) within the Chessboard Settings popup.
- **FR-002**: The toggle MUST default to disabled (OFF) when no stored user preference exists.
- **FR-003**: System MUST persist the toggle state in browser local storage and restore it upon page load.
- **FR-004**: When the toggle is ON, the system MUST compute the top move (Principal Variation #1) for the active position using the offline Stockfish engine (`stockfish-18-lite-single`).
- **FR-005**: System MUST render an arrow on the chessboard (reusing the board's existing arrow rendering capability) connecting the source square and target square of the best move.
- **FR-006**: When the toggle is turned OFF, the system MUST immediately remove the best move arrow from the chessboard.
- **FR-007**: Whenever the active board position changes (player move, computer move, playback navigation, or board reset), the system MUST update the arrow to the top move of the new position.
- **FR-008**: In Practice with Computer mode (3.5.2), the system MUST render the best move arrow when it is the human player's turn, functioning as an interactive hint.
- **FR-009**: When the board position is terminal (checkmate or draw/stalemate), the system MUST clear the arrow and skip evaluation requests.
- **FR-010**: All engine evaluations for the arrow MUST run locally via Web Worker (#offline) without making network calls.
- **FR-011**: The visual design, placement, and styling of the toggle and surrounding controls MUST remain identical to the established design (#no_change).
- **FR-012**: System MUST NOT modify any other 3.5.4.x features, Move List, Evaluation Gauge, or AI Column logic.

### Key Entities

- **BestMoveArrow**: Visual directional indicator on the chessboard defined by a source square (e.g. `e2`), target square (e.g. `e4`), and styling color.
- **BestMovePreference**: Persistent boolean setting saved in local storage indicating whether the player wants real-time best move suggestions displayed on the board.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When toggled ON, the best move arrow appears on the chessboard within 500ms of any position change under standard offline engine evaluation depth.
- **SC-002**: When toggled OFF, the arrow disappears from the chessboard within 50ms.
- **SC-003**: 100% of user toggle preference changes persist across page reloads via local storage.
- **SC-004**: The arrow accurately points to the engine's primary move (PV #1) in 100% of tested legal non-terminal positions.
- **SC-005**: Zero network requests generated for arrow calculation (100% offline engine processing).
- **SC-006**: Zero layout shifts, visual styling changes, or regressions in existing board interaction and evaluation features.

## Assumptions

- **Engine Availability**: The offline Stockfish engine (`stockfish-18-lite-single`) is loaded and accessible via the existing Web Worker abstraction layer.
- **Board Component Arrow Support**: The underlying chessboard component supports dynamic arrow rendering via props (e.g., custom arrows list).
- **Evaluation Depth for Hints**: A fast, responsive search depth (e.g., depth 10–12 or computer skill level scaling) is used so hint arrows appear quickly without stalling the UI.
- **Single Hint Arrow**: Only the single highest-rated move (PV #1) is indicated by the arrow, preventing visual clutter on the board.
