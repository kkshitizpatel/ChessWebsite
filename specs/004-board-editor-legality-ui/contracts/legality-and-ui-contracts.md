# UI & Legality Engine Contracts: `004-board-editor-legality-ui`

## 1. Visual & Dimensional Contract (`3.5.5` Settings Popup)

| Element | CSS / Dimension Contract | Requirement Reference |
|---|---|---|
| Popup Outer Container | `fixed z-50 w-[450px] max-h-[calc(100vh-24px)] overflow-y-auto bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e] p-4 flex flex-col gap-3` | `FR-001`, `FR-002` |
| Right-Side Floating Coordinates | `left = Math.min(rect.right + 12, window.innerWidth - 462)`, `bottom = Math.max(window.innerHeight - rect.bottom, 12)` | `FR-002` |
| `3.5.5.1` Level Badge | Single-line `whitespace-nowrap` (`Level: {computerLevel}`) | `FR-005` |
| `3.5.5.3` Black Palette Surface | `bg-[#1e2327] border border-[#2f373e] rounded-xl p-1.5 grid grid-cols-8 gap-1.5` | `FR-004` |
| `3.5.5.4` White Palette Surface | `bg-[#252429] border border-[#35343c] rounded-xl p-1.5 grid grid-cols-8 gap-1.5` | `FR-003` |
| Palette Tool Button Frame | `min-w-[42px] h-[44px] rounded-lg flex items-center justify-center touch-none select-none` | `FR-003` |
| `'cburnett'` SVG Piece Icon | `w-[30px] h-[30px] object-contain pointer-events-none select-none` (`28px–32px` range) | `FR-003` |
| Dropdown Controls (`3.5.5.5`, `3.5.5.7`) | `h-[38px] px-3 rounded-lg` | `FR-005` |
| Time Control Preset Grid (`3.5.5.8`) | `grid grid-cols-3 gap-2` (`8px` gap), each button `h-[40px]` | `FR-005` |

---

## 2. Legality Validator Contract (`client/src/lib/chessLegalityValidator.ts`)

```ts
export type PieceColor = "w" | "b";
export type PieceType = "k" | "q" | "r" | "b" | "n" | "p";
export type PieceCode =
  | "wK" | "wQ" | "wR" | "wB" | "wN" | "wP"
  | "bK" | "bQ" | "bR" | "bB" | "bN" | "bP";

export type BoardMap = Record<string, { color: PieceColor; type: PieceType; code: PieceCode }>;

export interface CastlingFlags {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export interface ActionValidationResult {
  allowed: boolean;
  reason: string | null;
}

export interface PositionValidationResult {
  isValid: boolean;
  reason: string | null;
  eligibleCastling: CastlingFlags;
  legalEpFiles: string[];
}
```

### Enforced Rules Contract
1. **Second King Block**: If `piece.type === 'k'` and another square on `board` already has `{ color: piece.color, type: 'k' }` (and is not `sourceSquare`), `validateEditorAction` returns `{ allowed: false, reason: "Only 1 King per side is allowed" }`.
2. **Touching Kings Block**: If placing/moving a King results in $\max(|\text{file}(wK)-\text{file}(bK)|, |\text{rank}(wK)-\text{rank}(bK)|) < 2$, `validateEditorAction` returns `{ allowed: false, reason: "Kings cannot be placed on adjacent squares" }`.
3. **Pawn Rank 1/8 Block**: If `piece.type === 'p'` and target square rank is `'1'` or `'8'`, `validateEditorAction` returns `{ allowed: false, reason: "Pawns cannot be placed on the 1st or 8th rank" }`.
4. **Max 8 Pawns Block**: If `piece.type === 'p'` and resulting count of pawns of `piece.color` $> 8$, `validateEditorAction` returns `{ allowed: false, reason: "Maximum 8 pawns per side allowed" }`.
5. **Promotion Math Quota & Max 16 Pieces Block**:
   $$\text{extra} = \max(0, Q - 1) + \max(0, R - 2) + \max(0, B - 2) + \max(0, N - 2)$$
   If $\text{extra} > 8 - P$ or total pieces of `piece.color` $> 16$, `validateEditorAction` returns `{ allowed: false, reason: "Promotion quota exceeded for remaining pawns" }`.
6. **Inactive King Check Block**:
   - In `validateBoardPosition(board, turn, ...)`: if the King of `inactiveColor = turn === 'w' ? 'b' : 'w'` is attacked by any piece of `turn`, returns `{ isValid: false, reason: "Opponent king cannot be in check" }`.
   - In `canSwitchTurn(board, nextTurn)`: if switching to `nextTurn` would make the newly inactive King attacked by `nextTurn`, blocks the turn switch and returns `{ allowed: false, reason: "Cannot switch turn: Opponent king would be in check" }`.
7. **Missing King / Impossible Check Guard**:
   - Missing White King → `{ isValid: false, reason: "Invalid position: White King is missing" }`
   - Missing Black King → `{ isValid: false, reason: "Invalid position: Black King is missing" }`
   - Active King checked by $> 2$ pieces or illegal double check → `{ isValid: false, reason: "Invalid position: Impossible check on active King" }`
