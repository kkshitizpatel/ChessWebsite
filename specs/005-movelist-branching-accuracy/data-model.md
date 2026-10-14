# Phase 1 Data Model: Column 2 Lichess PGN Tree Branching, Move Classification Badges & 4.6 Accuracy Summary Panel

## 1. `MoveQuality` & Extended `MoveNode` (`client/src/lib/moveTree.ts`)

```ts
export type MoveQuality =
  | 'Brilliant'
  | 'Great'
  | 'Best'
  | 'Excellent'
  | 'Good'
  | 'Book'
  | 'Inaccuracy'
  | 'Mistake'
  | 'Blunder';

export type MoveNode = {
  id: string;
  san: string;
  fen: string;
  moveNumber: number;
  turn: 'w' | 'b';
  parentId: string | null;
  childrenIds: string[];
  clock?: string;
  eval?: number;          // Evaluation in pawns from White's perspective (e.g. +0.8, -1.2)
  evalText?: string;      // Formatted display string (e.g. "+0.8", "-1.2", "M3", "-M2")
  quality?: MoveQuality;  // Principle VI classification assigned on Start Analysis
  accuracy?: number;      // Per-move accuracy (0 - 100)
  winDrop?: number;       // Win% drop (0 - 100)
  isMate?: boolean;
};
```

## 2. `MoveListRowItem` (`client/src/components/MoveList.tsx`)

```ts
export type MoveListRowItem = {
  key: string;
  moveNumber: number;
  displayMoveNumber: string; // e.g. "1", "2" for normal rows; "1..." for Black-first variation start
  depth: number;             // 0 = main line, 1+ = indented variation level
  isVariationStart: boolean; // True on the first row of a variation branch
  whiteNode?: MoveNode;
  blackNode?: MoveNode;
  allIds: string[];
};
```

## 3. `AccuracyStatsSummary` (`client/src/lib/moveAnalysisDispatcher.ts`)

```ts
export type ClassificationCounts = Record<MoveQuality, number>;

export type AccuracyStatsSummary = {
  whiteAccuracy: number; // Consistency-weighted accuracy (0.0 - 100.0)
  blackAccuracy: number; // Consistency-weighted accuracy (0.0 - 100.0)
  whiteCounts: ClassificationCounts;
  blackCounts: ClassificationCounts;
};
```
