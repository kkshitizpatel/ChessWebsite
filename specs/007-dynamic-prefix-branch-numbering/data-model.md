# Data Model: Dynamic Parent-Prefix Move List Variation Numbering (4.2)

## 1. Entities

### `MoveNode` (Existing in `client/src/lib/moveTree.ts`)
```ts
export interface MoveNode {
  id: string;
  parentId: string | null;
  moveNumber: number;      // 1-indexed full move count (e.g. 1, 2, 3...)
  turn: 'w' | 'b';         // 'w' for White, 'b' for Black
  san: string;             // Standard Algebraic Notation (e.g. "e4", "Nf3")
  fen: string;             // Board position FEN string
  childrenIds: string[];   // [0] = main line branch; [1..n] = alternative variations
  eval?: number;
  evalText?: string;
  quality?: MoveQuality;
}
```

### `MoveRowItem` (Projection in `client/src/components/MoveList.tsx`)
```ts
export type MoveRowItem = {
  key: string;              // React unique key
  moveNumber: number;       // Base move number (integer)
  displayLabel: string;     // Formatted outline badge label (e.g. "1", "2.1", "2.1.1")
  depth: number;            // 0 = main line, 1 = variation, 2 = sub-variation
  isVariationStart: boolean;// True for the initial row of a branch
  whiteNode?: MoveNode;     // White move node (if present in this row)
  blackNode?: MoveNode;     // Black move node (if present in this row)
  allIds: string[];         // Node IDs included in this row
};
```

## 2. Traversal State Parameters

In recursive helper `emitLine`:
```ts
function emitLine(
  startNodeId: string,
  depth: number,
  siblingAlternativeIds: string[] = [],
  outlinePrefix: string = ''
): void
```

- **`startNodeId`**: The root node of the current branch or line.
- **`depth`**: Tree nesting depth (`0` = main line, `1` = variation, `2+` = nested variation).
- **`siblingAlternativeIds`**: Alternative moves branching at the same ply.
- **`outlinePrefix`**:
  - If `depth === 0`: `""`
  - If `depth === 1`: `${parentMoveNumber}` (e.g., `"1"`, `"2"`, `"3"`, `"N"`)
  - If `depth >= 2`: `${parentRowLabel}` (e.g., `"2.1"`, `"2.1.1"`)
- **`stepCounter`**: Initialized to `1` at the start of each line, incremented after every emitted row in that branch.
