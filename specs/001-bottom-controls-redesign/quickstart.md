# Quickstart Validation Guide: Bottom Controls & Settings Flyout

**Feature**: `001-bottom-controls-redesign`
**Created**: 2026-10-12
**Status**: Ready for Verification

## Prerequisites
- Development server running at `http://localhost:3000`.
- Browser window sized to desktop resolution (1366x768 px).

## Validation Scenarios

### Scenario 1: Symmetrical Single-Row Bottom Control Bar
1. Open `http://localhost:3000` in the browser.
2. Inspect the bottom controls bar directly underneath the chessboard.
3. **Verify**:
   - All buttons (Start, Back, Forward, End, Practice, Start Analysis, Settings) form a single horizontal row.
   - The gap between each button is equal and symmetric.
   - Left and right padding of the container are identical.
   - Button heights are identical across all buttons (42px).
   - Icons across all buttons (including Practice target and Settings sliders) have matching 22px size.
   - Start Analysis button has the same height as icon buttons while accommodating text cleanly.

### Scenario 2: Settings Flyout Right-Side Floating Overlay
1. Click the Settings icon button (slider icon) in the bottom bar.
2. **Verify**:
   - The settings popup opens floating to the right of the board, parallel to the board edge.
   - **Critical check**: 0% of the chessboard or pieces are covered or obscured.
   - The popup overlays the Move List column without shifting column widths or adding scrollbars.
   - Entire popup is visible within the 1366x768 screen boundary.

### Scenario 3: Outside Click & Escape Key Dismissal
1. With the settings popup open, press the `Escape` key on the keyboard.
2. **Verify**: Popup immediately closes.
3. Re-open the popup, then click anywhere on the background, board, or move list.
4. **Verify**: Popup immediately closes upon outside click.

### Scenario 4: Settings Flyout Internal Controls & Board Editor Absence
1. Open the settings popup.
2. **Verify**:
   - Background is dark (`#1E1E1E`), border is subtle (`#302E2B`).
   - Computer Level slider is dark themed with green accent, showing current level (defaults to 6).
   - "Show best move" is displayed as a toggle switch.
   - Flip Board, Starting Position, and Clear Board buttons are left-aligned with matching icon sizes and uniform row heights.
   - **Board Editor button is completely absent**.

### Scenario 5: Protected Feature Verification (Principle II)
1. Verify that making moves on the board works normally.
2. Verify that Move List records SAN moves and evaluation indicators without error.
3. Verify that Start Analysis and Evaluation Gauge continue functioning.
