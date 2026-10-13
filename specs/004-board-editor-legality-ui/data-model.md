# Phase 1 Data Model: Roomy 3.5.5 Settings Popup UI & FIDE/Lichess Chess Legality Engine

**Feature**: `004-board-editor-legality-ui`  
**Date**: 2026-10-13

## Entities

### 1. `BoardPiece` & `BoardMap`
Represents pieces on the 64 squares (`a1` through `h8`) independent of `chess.js` instance constraints so intermediate states (like Clear Board) can be represented cleanly.

| Field | Type | Description |
|---|---|---|
| `color` | `'w' \| 'b'` | Piece color (`'w'` = White, `'b'` = Black) |
| `type` | `'k' \| 'q' \| 'r' \| 'b' \| 'n' \| 'p'` | Lowercase piece symbol |
| `code` | `'wK' \| 'wQ' \| 'wR' \| 'wB' \| 'wN' \| 'wP' \| 'bK' \| 'bQ' \| 'bR' \| 'bB' \| 'bN' \| 'bP'` | Combined piece code matching Lichess `'cburnett'` SVG filename |

`BoardMap = Record<string, BoardPiece>` (keys are algebraic squares `'a1'..'h8'`).

---

### 2. `CastlingRightsState` & `CastlingEligibility`
Tracks both user-checked state and home-square eligibility for `3.5.5.6 Castling rights`.

| Field | Home Squares Required | Description |
|---|---|---|
| `wK` (`White 0-0`) | `board['e1'] === 'wK' && board['h1'] === 'wR'` | White kingside castling |
| `wQ` (`White 0-0-0`) | `board['e1'] === 'wK' && board['a1'] === 'wR'` | White queenside castling |
| `bK` (`Black 0-0`) | `board['e8'] === 'bK' && board['h8'] === 'bR'` | Black kingside castling |
| `bQ` (`Black 0-0-0`) | `board['e8'] === 'bK' && board['a8'] === 'bR'` | Black queenside castling |

**Invariant**: For each key $k \in \{\text{wK}, \text{wQ}, \text{bK}, \text{bQ}\}$, if `eligibility[k] === false`, then `castling[k]` is immediately forced to `false` and its checkbox is `disabled`.

---

### 3. `EnPassantEligibility`
Computed dynamically from `board` and `turn` for `3.5.5.7 En passant rights`.

- **`turn === 'w'`**: File $f \in \{\text{'a'}..\text{'h'}\}$ is eligible iff:
  1. `board[f + '5']` is a Black pawn (`bP`),
  2. `board[f + '6']` and `board[f + '7']` are empty, AND
  3. At least one adjacent file $f' \in \{f-1, f+1\}$ has a White pawn (`wP`) on `board[f' + '5']`.
  - Corresponding FEN en passant target square: `f + '6'`.
- **`turn === 'b'`**: File $f \in \{\text{'a'}..\text{'h'}\}$ is eligible iff:
  1. `board[f + '4']` is a White pawn (`wP`),
  2. `board[f + '3']` and `board[f + '2']` are empty, AND
  3. At least one adjacent file $f' \in \{f-1, f+1\}$ has a Black pawn (`bP`) on `board[f' + '4']`.
  - Corresponding FEN en passant target square: `f + '3'`.

**Invariant**: If `eligibleFiles.length === 0` or the currently selected file is not in `eligibleFiles`, `editorEnPassant` resets to `'-'`. When `eligibleFiles.length === 0`, the dropdown is `disabled`.

---

### 4. `LegalityValidationResult`
Returned by `chessLegalityValidator.ts`:

| Field | Type | Description |
|---|---|---|
| `isValid` | `boolean` | `true` iff the position satisfies all FIDE/Lichess legality rules for play/analysis |
| `reason` | `string \| null` | Human-readable inline banner message when `isValid === false` (e.g., `"Invalid position: White King is missing"`) |
| `eligibleCastling` | `CastlingRightsState` | Which castling checkboxes are allowed to be enabled |
| `legalEpFiles` | `string[]` | Subset of `['a'..'h']` that can legally be selected for en passant |

---

### 5. `PointerDragState`
Tracks active Pointer Events drag operation (`pointerdown` → `pointermove` → `pointerup`):

| Field | Type | Description |
|---|---|---|
| `active` | `boolean` | Whether a pointer drag is in progress |
| `source` | `'palette' \| 'board'` | Whether the piece originated from a palette button or a board square |
| `sourceSquare` | `string \| null` | Origin square (`'a1'..'h8'`) when `source === 'board'` |
| `piece` | `PieceCode` | The piece being dragged (`'wK'..'bP'`) |
| `clientX` | `number` | Current pointer X coordinate for floating ghost preview |
| `clientY` | `number` | Current pointer Y coordinate for floating ghost preview |
