# Tasks: Legal-Style Move List Outline Numbering & Accuracy Panel Name Wrap and Enlarged Badges

**Input**: Design documents from `/specs/006-outline-numbering-accuracy-polish/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/ui-polish-contracts.md](contracts/ui-polish-contracts.md)

**Organization**: Tasks are grouped into sequential phases mapping to the foundational badge sizing, the 3 P1 User Stories, and layout verification.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Exact file paths are included in every task description.

---

## Phase 1: Foundational Badge Sizing & Data Model

**Purpose**: Equip `MoveQualityBadge` with an enlarged variant so both `MoveList.tsx` and `AccuracyReportPanel.tsx` can consume it seamlessly.

- [X] T001 Extend `MoveQualityBadge` in `client/src/components/MoveList.tsx` to support `size="lg"` with a `22px × 22px` frame (`w-[22px] h-[22px] text-[11px]`) alongside standard `size="sm"` (`16px`) and `size="md"` (`20px`)

---

## Phase 2: User Story 1 - Legal-Style Outline Numbering for Variations in Move List (`4.2`) (Priority: P1) 🎯 MVP

**Goal**: Implement hierarchical legal outline numbering in `MoveList.tsx` so main line moves display standard integers (`1`, `2`, `3`...), primary variations display `1.1`, `1.2`, `1.3`..., and nested variations display `1.1.1`, `1.1.2`...

**Independent Test**: Play or load a game with multiple branches (e.g., alternative move at ply 2 or ply 4). Verify main line rows show `1`, `2`, `3`..., the first sub-line displays `1.1`, `1.2`, `1.3`... sequentially, and any nested variation displays `1.1.1`, `1.1.2`...

- [X] T002 [US1] Update `buildLichessVariationRows` in `client/src/components/MoveList.tsx` with an outline numbering traversal that tracks `(depth, outlinePrefix, stepIndex)`: assigning `${node.moveNumber}` to main-line rows (`depth === 0`), `${outlinePrefix}.${stepIndex}` (e.g. `1.1`, `1.2`, `1.3`...) to primary variation rows (`depth === 1`), and 3-level outline labels (e.g. `1.1.1`, `1.1.2`...) to nested variation rows (`depth === 2`)
- [X] T003 [US1] Verify and style outline number badges in `client/src/components/MoveList.tsx` ensuring move row selection (`4.3`), board click navigation (`4.4`), and inline classification badges (`4.5`) work seamlessly with outline numbering

---

## Phase 3: User Story 2 - Accuracy Panel Header Player Names Excel-Style Text Wrap (`4.6`) (Priority: P1)

**Goal**: Eliminate `truncate` ellipsis clipping in the `4.6 Accuracy Summary Panel` header so full tournament player names wrap across 2 lines naturally (`whitespace-normal`, `break-words`).

**Independent Test**: Load a PGN with long player names (e.g. "Tomashevsky, Evgeny" and "Karjakin, Sergey"). Open the Accuracy Summary Panel and verify both names wrap onto 2 lines with zero "..." truncation.

- [X] T004 [US2] Update the player names header row in `client/src/components/AccuracyReportPanel.tsx` by replacing `truncate` with `whitespace-normal break-words leading-tight max-w-[110px]`, adjusting the header container to `min-h-[40px] py-1`, and preserving clean alignment with the `"Players"` label and `'X'` close button

---

## Phase 4: User Story 3 - Accuracy Panel Enlarged Classification Counts & Badges (`4.6`) (Priority: P1)

**Goal**: Enlarge the breakdown table metrics in `AccuracyReportPanel.tsx` so counts render at `15px–16px` font size and center badges render at `22px × 22px`.

**Independent Test**: Open the Accuracy Summary Panel after running analysis. Verify White and Black counts render in bold `15px` font and centered circular badges render at `22px × 22px`.

- [X] T005 [US3] Enlarge White and Black count font sizes from `text-[12px]` to `text-[15px] font-bold font-mono` in `client/src/components/AccuracyReportPanel.tsx`
- [X] T006 [US3] Update centered classification badge instances in `client/src/components/AccuracyReportPanel.tsx` to use `size="lg"` (`w-[22px] h-[22px]`), adjust row heights to `min-h-[26px] py-0.5`, and set panel container to `h-[340px] shrink-0`

---

## Phase 5: Polish & Layout Verification (Principle I & II)

**Purpose**: Verify zero global vertical scroll on `1366x768`, ensure Column 1 and Column 3 are 100% untouched, and update reference documentation.

- [X] T007 Verify TypeScript compilation, responsive sizing in Column 2, and zero global vertical scroll on `1366x768` layout in `client/src/components/ChessDashboard.tsx`
- [X] T008 Update `Site_Reference.md` and `Site_Reference.txt` to confirm complete working status of legal outline numbering (`4.2`) and multiline wrapped enlarged accuracy panel (`4.6`)

---

## Dependencies & Execution Order

- **Phase 1 (`T001`)**: Shared badge sizing foundation.
- **Phase 2 (`T002`–`T003`)**: User Story 1 (`4.2` Move List outline numbering).
- **Phase 3 (`T004`)**: User Story 2 (`4.6` Player names multiline wrap).
- **Phase 4 (`T005`–`T006`)**: User Story 3 (`4.6` Enlarged counts and badges).
- **Phase 5 (`T007`–`T008`)**: Final verification and reference sync.
