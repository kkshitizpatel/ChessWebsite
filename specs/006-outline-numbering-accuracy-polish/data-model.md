# Phase 1 Data Model: Legal-Style Move List Outline Numbering & Accuracy Panel Polish

## 1. MoveRowItem with Outline Label (`client/src/components/MoveList.tsx`)

```ts
export type MoveRowItem = {
  key: string;
  moveNumber: number;
  displayLabel: string;      // "1", "2" for main line; "1.1", "1.2" for variations; "1.1.1" for nested
  depth: number;             // 0 = main line, 1 = variation, 2 = nested variation
  isVariationStart: boolean;
  whiteNode?: MoveNode;
  blackNode?: MoveNode;
  allIds: string[];
};
```

## 2. Extended Badge Props (`client/src/components/MoveList.tsx`)

```ts
export interface MoveQualityBadgeProps {
  quality: MoveQuality;
  size?: 'sm' | 'md' | 'lg'; // sm: 16px (inline move list), md: 20px, lg: 22px-24px (Accuracy summary table)
}
```
