# Tasks: Bottom Control Bar & Chessboard Settings Redesign

**Feature Branch**: `001-bottom-controls-redesign` | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Phase 1: Setup (Safety & Environment Validation)

**Purpose**: Validate execution boundaries and ensure dev environment is active.

- [X] T001 Verify active Next.js development server running at http://localhost:3000 in client/
- [X] T002 Establish safety boundary in client/src/components/ChessDashboard.tsx lines 403-469 per plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure prerequisites for Bottom Bar and Settings Flyout.

- [X] T003 Verify and import all required Lucide icons (SkipBack, ArrowLeft, ArrowRight, SkipForward, Target, Brain, SlidersHorizontal, ArrowUpDown, RotateCcw, Trash2) in client/src/components/ChessDashboard.tsx
- [X] T004 Setup settingsRef and document event listener hooks for outside-click and Escape key dismissal in client/src/components/ChessDashboard.tsx

**Checkpoint**: Foundation ready — User story implementation can now begin.

---

## Phase 3: User Story 1 - Symmetrical, Single-Row Bottom Control Bar (Priority: P1) 🎯 MVP

**Goal**: Transform bottom control bar into a single balanced horizontal dock with equal spacing, uniform 42px button height, and 22px icon scaling.

**Independent Test**: Load http://localhost:3000 at 1366x768 px and verify all controls (Playback, Practice, Start Analysis, Settings) form a single row with equal inter-button gaps, matching 42px height, 22px icons, and vertical centering.

### Implementation for User Story 1

- [X] T005 [US1] Restructure controls container into a single horizontal flex row with balanced spacing and equal padding in client/src/components/ChessDashboard.tsx
- [X] T006 [US1] Standardize playback buttons (Start, Back, Forward, End) to 42px height and 22px icons in client/src/components/ChessDashboard.tsx
- [X] T007 [US1] Standardize Practice button (3.5.2) to 42px height and resize Target icon to 22px with active state styling in client/src/components/ChessDashboard.tsx
- [X] T008 [US1] Standardize Start Analysis button (3.5.3) to 42px height and 22px Brain icon in client/src/components/ChessDashboard.tsx
- [X] T009 [US1] Standardize Settings button (3.5.4) to 42px height and 22px SlidersHorizontal icon in client/src/components/ChessDashboard.tsx

**Checkpoint**: User Story 1 complete — Bottom control bar is fully balanced, symmetrical, and independently testable.

---

## Phase 4: User Story 2 - Right-Side Anchored Settings Flyout (Priority: P2)

**Goal**: Reposition the settings popup to float to the right of the chessboard over the Move List column with zero board coverage and instant dismissal.

**Independent Test**: Click settings button; verify popup renders parallel to board over Move List column without obscuring board squares or pieces, and closes on outside click or Escape key.

### Implementation for User Story 2

- [X] T010 [US2] Reposition settings popup container to absolute right-anchored flyout over Move List column in client/src/components/ChessDashboard.tsx
- [X] T011 [US2] Attach settingsRef and wire outside-click and Escape key dismissal handlers in client/src/components/ChessDashboard.tsx
- [X] T012 [US2] Apply dark surface styling (bg-surface-elevated, border-surface-border, shadow-2xl, rounded-xl) to popup container in client/src/components/ChessDashboard.tsx

**Checkpoint**: User Story 2 complete — Settings flyout floats over Move List, never covers chessboard, and dismisses smoothly.

---

## Phase 5: User Story 3 - Refined Inner Settings Flyout Design (Priority: P3)

**Goal**: Style internal settings controls with dark theme, green accents, toggle switch, and complete removal of the deferred Board Editor.

**Independent Test**: Open popup; verify Computer Level slider with level badge, Show best move toggle switch, aligned board action rows, and zero trace of Board Editor.

### Implementation for User Story 3

- [X] T013 [US3] Style Computer Level control (3.5.4.1) with uppercase label, green accent slider, and current level badge in client/src/components/ChessDashboard.tsx
- [X] T014 [US3] Replace checkbox with modern toggle switch component for Show best move (3.5.4.2) in client/src/components/ChessDashboard.tsx
- [X] T015 [US3] Style Flip Board (3.5.4.3), Starting Position (3.5.4.4), and Clear Board (3.5.4.5) as uniform left-aligned rows with 18px icons in client/src/components/ChessDashboard.tsx
- [X] T016 [US3] Remove Board Editor button completely from popup markup (#remove) in client/src/components/ChessDashboard.tsx

**Checkpoint**: User Story 3 complete — Flyout interior is fully dark-themed, consistent with Move List cards, and Board Editor is removed.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Layout validation, protected feature regression check, and reference status update.

- [X] T017 Verify zero layout shift, zero scrollbars, and strict fit within 1366x768 locked layout per quickstart.md in client/src/components/ChessDashboard.tsx
- [X] T018 Verify all protected features (Board 3.2, Eval Bar 3.3, Banners 3.1 & 3.4, Move List 4.x, AI Column 5.x) remain 100% functional per Constitution Principle II
- [X] T019 Update Site_Reference.md status for 3.5.4 (Redesign) from ⬜ Not Started to ✅ Working
