# Quickstart Validation Guide: Legal-Style Outline Numbering & Accuracy Panel Polish

## Validation Scenarios

### 1. Legal Outline Numbering in Move List (`4.2`)
1. Play `1. e4 e5 2. Nf3 Nc6`.
2. Click `1. e4` to branch an alternative move: play `1... c5 2. Nf3 d6 3. d4`.
3. Verify:
   - Main line shows `1`, `2` integer move numbers.
   - The alternative variation rows display legal outline sequence: `1.1`, `1.2`, `1.3` (not `2.1` or `3.1`).
   - If a nested branch is added inside `1.1`, it displays `1.1.1`, `1.1.2`...

### 2. Player Names Multiline Wrap in Accuracy Panel (`4.6`)
1. Paste a PGN with long tournament player names:
   ```text
   [White "Tomashevsky, Evgeny"]
   [Black "Karjakin, Sergey"]
   1. e4 e5 2. Nf3 Nc6
   ```
2. Click `Start Analysis` or click `Accuracy` in the Move List header.
3. Verify:
   - "Tomashevsky, Evgeny" and "Karjakin, Sergey" wrap cleanly across 2 lines.
   - No `...` ellipsis truncation appears.

### 3. Enlarged Counts and Badges in Breakdown Table (`4.6`)
1. In the open Accuracy Panel, inspect the 9 breakdown rows (`Brilliant` through `Blunder`).
2. Verify:
   - Count numbers display at bold `15px` font size.
   - Circular badge icons display at enlarged `22px × 22px` frame size.
   - Whole site on `1366x768` has zero global vertical scrollbar.
