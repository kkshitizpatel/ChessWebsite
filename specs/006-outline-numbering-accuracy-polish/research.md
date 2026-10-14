# Phase 0 Research: Legal-Style Outline Numbering & Accuracy Panel Polish

## 1. Legal-Style Outline Numbering for Chess Variations
- **Decision**: When rendering variation lines in `MoveList.tsx`, assign outline numbers `${outlinePrefix}.${stepIndex}` (e.g. `1.1`, `1.2`, `1.3`... and `1.1.1`, `1.1.2`...) to variation moves while keeping standard sequential integers (`1`, `2`, `3`...) on the main line.
- **Rationale**: In complex chess game reviews and book annotations, sub-variations are commonly organized like legal documents where each progressive branch or move step increments a dotted outline counter. This prevents confusing jumps like `2.1` or `3.1` and clearly signals the variation depth to the reader.

## 2. Excel-Style Multiline Player Name Wrapping
- **Decision**: In `AccuracyReportPanel.tsx`, replace `truncate` with `whitespace-normal break-words leading-tight max-w-[110px]` and increase the header container to `min-h-[40px] py-1`.
- **Rationale**: Grandmaster and tournament player names from PGN files (e.g. "Tomashevsky, Evgeny", "Karjakin, Sergey", "Vachier-Lagrave, M.") frequently exceed 12 characters. Wrapping them onto 2 lines makes them 100% readable without shrinking the font or overflowing the Column 2 width.

## 3. Enlarged Metrics and Badge Visuals
- **Decision**: Provide an enlarged `size="lg"` badge variant (`w-[22px] h-[22px]`) in `MoveQualityBadge` and increase breakdown table counts to `text-[15px] font-bold`.
- **Rationale**: In the review breakdown panel, users need high-contrast visibility to quickly compare move qualities (e.g., White had 2 Blunders vs Black had 0).
