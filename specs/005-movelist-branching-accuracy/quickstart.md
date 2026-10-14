# Quickstart Validation Guide: Column 2 Lichess PGN Tree Branching, Move Classification Badges & 4.6 Accuracy Summary Panel

## Prerequisites
- Run the Next.js development server from `client/`:
  ```powershell
  npm.cmd run dev
  ```
- Open `http://localhost:3000` at `1366x768` viewport resolution.

## Validation Scenarios

### 1. Lichess PGN Tree Branching (`4.2`)
1. Play `1. e4 e5 2. Nf3 Nc6` on the board.
2. Click `1. e4` in the Move List to jump back to move 1 after White's move.
3. Play an alternative Black reply `1... c5` followed by `2. Nf3 d6`.
4. **Expected**:
   - Main line shows `1. e4 e5` and `2. Nf3 Nc6` with integer move numbers `1` and `2`.
   - The alternative branch appears as an indented variation block below move 1, starting with `1...` (`...` in White slot, `c5` in Black slot) followed by `2. Nf3 d6`.
   - Zero decimal move labels (`1.1`, `2.1`) appear anywhere.

### 2. Move Classification Visuals on Start Analysis (`4.5`)
1. Play or paste a PGN game into `5.3.2 PGN Textarea`.
2. Click `3.5.4 Start Analysis` (Green Button).
3. **Expected**:
   - Local Stockfish evaluates the game moves and assigns classifications (`Brilliant` `!!`, `Great` `!`, `Best` `★`, `Excellent` `👍`, `Good` `✔`, `Book` `📖`, `Inaccuracy` `?!`, `Mistake` `?`, `Blunder` `??`).
   - Each move SAN in Column 2 renders in its classification color with its circular badge icon immediately adjacent to the SAN and its eval score badge (`+0.8`, `-1.2`).

### 3. Column 2 Bottom `4.6 Accuracy Summary Panel`
1. When `Start Analysis` finishes, inspect the bottom half of Column 2.
2. **Expected**:
   - The `4.6 Accuracy Summary Panel` opens automatically (`~320px` height) at the bottom of Column 2.
   - Header displays `"Players"`, dynamic White player name, and dynamic Black player name (with zero avatars/photos).
   - Accuracy score cards display White and Black consistency-weighted accuracies (e.g., `78.9`, `65.2`).
   - All 9 classification rows (`Brilliant` through `Blunder`) display `White count | [Badge Icon] | Black count`.
   - Clicking the top-right `'X'` button closes the panel and expands the Move List back to full Column 2 height.
   - Outer page (`1366x768`) has zero global vertical scrollbar at all times.
