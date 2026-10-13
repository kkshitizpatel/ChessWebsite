# Data Model: Bottom Control Bar & Chessboard Settings

**Feature**: `001-bottom-controls-redesign`
**Created**: 2026-10-12
**Status**: Completed

## State Entities & Models

### 1. BottomControlBarState (View Model)

Represents the state of interactive controls in the bottom dock.

| Field | Type | Default | Description |
|---|---|---|---|
| `isPracticing` | `boolean` | `false` | Indicates whether practice mode against computer is active |
| `isAnalyzingLocal` | `boolean` | `false` | Indicates whether local engine analysis is currently running |
| `showSettings` | `boolean` | `false` | Controls visibility of the Chessboard Settings flyout |
| `hasPreviousMove` | `boolean` | Derived | Whether back navigation is available |
| `hasNextMove` | `boolean` | Derived | Whether forward navigation is available |

### 2. ChessboardSettingsState (Domain & View State)

Holds user preferences and action triggers for board utilities.

| Field | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `computerLevel` | `number` | `6` | Integer, 1 to 10 | Stockfish engine skill level |
| `showBestMoveArrow` | `boolean` | `false` | `true` or `false` | Display top engine move arrow on the board |
| `boardOrientation` | `'white' \| 'black'` | `'white'` | String literal | Perspective of the chessboard display |

### 3. FlyoutPositioningContract

Defines how the settings flyout is anchored in the DOM to avoid covering the board.

| Property | Value / Specification |
|---|---|
| `position` | `absolute` |
| `anchor` | Bottom-right of Column 1 controls container / Settings button |
| `placement` | Floating overlay projecting rightward over Column 2 (Move List) |
| `z-index` | `z-50` |
| `dismissTriggers` | Pointer click outside container ref, `Escape` key press, board flip click |
