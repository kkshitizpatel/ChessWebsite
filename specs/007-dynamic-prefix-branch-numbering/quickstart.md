# Quickstart & Verification Guide: Dynamic Parent-Prefix Move List Variation Numbering (4.2)

## Validation Scenarios

### Scenario 1: First-Level Variation from Move 2
1. Open the app at `http://localhost:3000`.
2. Play: `1. e4 e5 2. Nf3 Nc6`.
3. Click on Move 2 White (`2. Nf3`).
4. Play an alternative move on the board (e.g. `2. Bc4` or `2. d4`).
5. **Expected Outcome**:
   - The newly created branch row displays outline badge **`2.1`** (NOT `1.1`).
   - If continuing to play in this branch, the subsequent row displays **`2.2`**.

### Scenario 2: Black Alternative from Move 2
1. Play: `1. e4 e5 2. Nf3`.
2. Click on Move 2 White (`2. Nf3`).
3. Play alternative Black move `2... Nf6` (Petrov Defense instead of `2... Nc6`).
4. **Expected Outcome**:
   - The branch row displays outline badge **`2.1`**.
   - White's move slot displays `...`.
   - Black's move slot displays `Nf6`.
   - Visually renders as `2.1 ... Nf6`.

### Scenario 3: First-Level Variation from Move 3
1. Play: `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6`.
2. Click on Move 3 White (`3. Bb5`).
3. Play alternative move `3. d4`.
4. **Expected Outcome**:
   - The branch row displays outline badge **`3.1`** (NOT `1.1` or `2.1`).
   - Continuation moves in that branch display **`3.2`**, **`3.3`**.

### Scenario 4: Nested Sub-Variation (Depth = 2)
1. Within branch `2.1`, click on the first move.
2. Play an alternative move.
3. **Expected Outcome**:
   - The nested sub-variation row displays outline badge **`2.1.1`**.
   - Continuation move displays **`2.1.2`**.

### Scenario 5: Non-Regression Check
1. Click on any variation move. Confirm chessboard jumps to the exact position and FEN is correct.
2. Check that move selection checkboxes toggle properly.
3. Open 4.6 Accuracy Panel. Confirm full player names wrap, 15px counts, and 22px badges remain intact.
4. Verify 0px outer page scroll on 1366x768.
