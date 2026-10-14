# Variation Numbering Contracts: Dynamic Parent Prefix (4.2)

## 1. Move Row Display Label Contract

| Branch Origin | Depth | Parent Label / Move # | Move Index in Branch | Resulting Badge Label (`displayLabel`) | Example Visual Display |
|---|---|---|---|---|---|
| Main Line Row 1 | 0 | Move 1 | 1 | `1` | `1  e4  e5` |
| Main Line Row 2 | 0 | Move 2 | 2 | `2` | `2  Nf3  Nc6` |
| Main Line Row 3 | 0 | Move 3 | 3 | `3` | `3  Bb5  a6` |
| Branch at Move 1 (White Alt) | 1 | 1 | 1 | `1.1` | `1.1  d4  d5` |
| Continuation in 1.1 | 1 | 1 | 2 | `1.2` | `1.2  c4  e6` |
| Branch at Move 2 (White Alt) | 1 | 2 | 1 | `2.1` | `2.1  Bc4  Bc5` |
| Continuation in 2.1 | 1 | 2 | 2 | `2.2` | `2.2  c3  Nf6` |
| Branch at Move 2 (Black Alt) | 1 | 2 | 1 | `2.1` | `2.1  ...  Nf6` |
| Continuation in 2.1 (Black Alt) | 1 | 2 | 2 | `2.2` | `2.2  d3  Bc5` |
| Branch at Move 3 (White Alt) | 1 | 3 | 1 | `3.1` | `3.1  d4  exd4` |
| Nested Sub-Branch at 2.1 | 2 | `2.1` | 1 | `2.1.1` | `2.1.1  ...  e6` |
| Continuation in 2.1.1 | 2 | `2.1` | 2 | `2.1.2` | `2.1.2  d4  d5` |

## 2. Dynamic Prefix Calculation Formula

```ts
// When emitting variations from a main-line move (depth === 0):
const childPrefix = depth === 0 ? `${node.moveNumber}` : thisRowLabel;

// When rendering a variation row (depth > 0):
const displayLabel = depth === 0 ? `${node.moveNumber}` : `${currentPrefix}.${stepCounter}`;
```

## 3. Preservation Invariants

- Main game moves: Always standard sequential integers (`1`, `2`, `3`...).
- Checkbox multiselect: `row.allIds.every(id => selectedMoves.has(id))` completely preserved.
- Jump to board position: `onMoveClick(node.id)` completely preserved.
- Inline classification badges: `MoveQualityBadge` (`size="sm"`) completely preserved.
- 4.6 Accuracy Panel: completely preserved.
