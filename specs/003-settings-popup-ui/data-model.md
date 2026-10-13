# Data Model: 3.5 Bottom Control Bar & 3.5.5 Settings Popup UI

**Feature**: `003-settings-popup-ui`
**Created**: 2026-10-13
**Status**: Completed

## UI State Entities

### 1. BottomControlBarItems (`3.5.1` – `3.5.5`)

Ordered sequence of controls in the bottom bar:

| ID | Label / Title | Icon | Handler / State |
|---|---|---|---|
| `3.5.1` | Flip board | `ArrowUpDown` (22px) | Reuses `setBoardOrientation(o => o === "white" ? "black" : "white")` |
| `3.5.2` | Playback: Start, Back, Forward, End | `SkipBack`, `ArrowLeft`, `ArrowRight`, `SkipForward` (22px) | Reuses `goToMove(null)`, `goToPreviousMove`, `goToNextMove`, `goToEndMove` |
| `3.5.3` | Practice with Computer | `Target` (22px) | Reuses `isPracticing`, `setIsPracticing` |
| `3.5.4` | Start Analysis | `Brain` (22px) + label | Reuses `handleStartAnalysis`, `isAnalyzingLocal` |
| `3.5.5` | Chessboard Settings | `SlidersHorizontal` (22px) | Reuses `showSettings`, `setShowSettings` |

---

### 2. SettingsPopupUIState (`3.5.5.1` – `3.5.5.10`)

Local UI state for the 10 sections inside the 3.5.5 Settings Popup:

| ID | State Variable | Type | Default Value | Constraints / Options |
|---|---|---|---|---|
| `3.5.5.1` | `computerLevel` | `number` | `6` | Integer `1` to `10` |
| `3.5.5.2` | `showBestMoveArrow` | `boolean` | `false` | Toggle switch (`OFF` by default) |
| `3.5.5.3` & `3.5.5.4` | `activeEditorTool` | `string` | `'w-hand'` | `'b-hand' \| 'bK' \| 'bQ' \| 'bR' \| 'bB' \| 'bN' \| 'bP' \| 'b-trash' \| 'w-hand' \| 'wK' \| 'wQ' \| 'wR' \| 'wB' \| 'wN' \| 'wP' \| 'w-trash'` |
| `3.5.5.5` | `editorTurn` | `'w' \| 'b'` | `'w'` | Dropdown: `'w'` (`White to play`), `'b'` (`Black to play`) |
| `3.5.5.6` | `editorCastling` | `{ wK: boolean, wQ: boolean, bK: boolean, bQ: boolean }` | `{ wK: true, wQ: true, bK: true, bQ: true }` | 4 checkboxes (`White 0-0`, `White 0-0-0`, `Black 0-0`, `Black 0-0-0`) |
| `3.5.5.7` | `editorEnPassant` | `string` | `'-'` | `'-' \| 'a' \| 'b' \| 'c' \| 'd' \| 'e' \| 'f' \| 'g' \| 'h'` |
| `3.5.5.8` | `timeControlEnabled` | `boolean` | `true` | Toggle switch for Time Control section |
| `3.5.5.8` | `selectedTimePreset` | `string` | `'10 min'` | `'1 min' \| '1 + 1' \| '2 + 1' \| '3 min' \| '3 + 2' \| '5 min' \| '10 min' \| '10 + 5' \| '15 + 10'` |
| `3.5.5.9` | `resetBoard` | Action callback | Existing | Resets board to standard starting position |
| `3.5.5.10` | `clearBoard` | Action callback | Existing | Clears all pieces from board |
