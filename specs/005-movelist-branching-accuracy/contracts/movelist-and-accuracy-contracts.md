# UI & Analysis Contracts: Column 2 Move List & 4.6 Accuracy Summary Panel

## 1. Classification Visual Contract (`4.5` & `4.6`)

| Classification (`MoveQuality`) | SAN Text Class | Badge Symbol | Badge Styling | Principle VI Rule |
|---|---|---|---|---|
| `Brilliant` | `text-[#2fe0c6]` | `!!` | `bg-[#1ba39c] text-white` | Best move + piece sacrifice + not losing + not forced |
| `Great` | `text-[#458cf7]` | `!` | `bg-[#458cf7] text-white` | Best move + sharp position (2nd best $\ge 12\%$ worse Win%) |
| `Best` | `text-[#81b64c]` | `★` | `bg-[#81b64c] text-white` | Engine top move (PV) or $\text{Drop} \le 0.5\%$ |
| `Excellent` | `text-[#96bc4b]` | `👍` | `bg-[#96bc4b] text-[#1a1917]` | Win% drop $0\text{–}2\%$ |
| `Good` | `text-[#97af8b]` | `✔` | `bg-[#6b8760] text-white` | Win% drop $2\text{–}5\%$ |
| `Book` | `text-[#c29b70]` | `📖` | `bg-[#a88865] text-white` | Opening theory move |
| `Inaccuracy` | `text-[#e5a93c]` | `?!` | `bg-[#e5a93c] text-[#1a1917]` | Win% drop $5\text{–}10\%$ |
| `Mistake` | `text-[#e67e22]` | `?` | `bg-[#e67e22] text-white` | Win% drop $10\text{–}20\%$ |
| `Blunder` | `text-[#e74c3c]` | `??` | `bg-[#e74c3c] text-white` | Win% drop $\ge 20\%$ |

## 2. `AccuracyReportPanel` Component Contract (`client/src/components/AccuracyReportPanel.tsx`)

```ts
export interface AccuracyReportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  whiteName: string;
  blackName: string;
  whiteAccuracy: number;
  blackAccuracy: number;
  statsSummary: AccuracyStatsSummary;
}
```
- **Positioning**: Mounted at the bottom of Column 2 (`h-[320px] shrink-0`).
- **Header**: `"Players"` | `whiteName` (text only, no avatar) | `blackName` (text only, no avatar) | `'X'` close button (`onClose`).
- **Accuracy Cards**: White accuracy box (`whiteAccuracy.toFixed(1)`) and Black accuracy box (`blackAccuracy.toFixed(1)`).
- **Breakdown Rows**: 9 rows (`Brilliant`, `Great`, `Best`, `Excellent`, `Good`, `Book`, `Inaccuracy`, `Mistake`, `Blunder`) formatted as `Category Label | White Count | [Badge] | Black Count`.
