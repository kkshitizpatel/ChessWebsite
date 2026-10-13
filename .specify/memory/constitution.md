<!--
Sync Impact Report:
- Version change: 1.1.0 → 1.2.0
- List of modified principles:
  - I. Fixed Layout: Updated exception note to authorize 3.5 Bottom Control Bar and 3.5.5 Settings popup redesign (width 440-460px, airy padding, height within 768px bounds) under #change #visual #size, locking both upon final approval.
  - IV. Android-Ready Architecture (#remember): Added rule requiring Pointer Events (pointerdown, pointermove, pointerup) for Board interaction and drag-and-drop so it runs seamlessly on touch screens and mobile WebView.
  - VIII. Licenses and Dependencies: Updated Stockfish build to "stockfish-19-lite-single" (stockfish-19-lite-single.wasm / .js) (#offline execution, ~1.6MB lite NNUE, zero-server load) with no duplicates in /public/engine/; added Lichess 'cburnett' piece set commercial-OK open license rule (strictly avoiding NonCommercial NC licenses).
- Added sections:
  - XI. Chess Legality & Validation (FIDE / Lichess Standard — NON-NEGOTIABLE): Comprehensive custom legality and validation rules for Board Editor (3.5.5).
  - Governance: Replaced old deferred Board Editor note with integration of Board Editor inside 3.5.5 Chessboard Settings popup (sub-features 3.5.5.3 to 3.5.5.7).
- Removed sections:
  - Governance: Removed old "Board Editor deferred" note.
- Follow-up TODOs: None
-->

# ChessUnfold Constitution

Chess analysis website: board, Stockfish WASM analysis, move classification, accuracy report, and AI move explanations (Gemini / Llama 3 via Groq).

Companion file: `Site_Reference.md` is the live status tracker and the home of the Quick Prompt Tags. This constitution holds the rules. Both must be kept in sync.

---

## Core Principles

### I. Fixed Layout (NON-NEGOTIABLE)
- The desktop layout is locked to 1366x768 px.
- No global vertical scroll. Only inner scrolling is allowed (Move List column and AI column).
- No visual change is allowed unless the prompt carries `#change`, `#visual`, `#size`, `#drag`, `#add` or `#remove`. Default is `#no_change`.
- Exception Note: 3.5 Bottom Control Bar aur 3.5.5 Settings popup ka redesign (width 440-460px, airy padding, height within 768px bounds) `#change` `#visual` `#size` ke tahat authorized hai. Final approve hone ke baad 3.5 aur 3.5.5 ko `#lock` kiya jayega.

### II. Working Features Are Protected (NON-NEGOTIABLE)
- Any feature marked ✅ Working in `Site_Reference.md` must not be broken by work on another feature.
- Any feature marked `#lock` is frozen (visual + logic) until the user sends `#unlock`.
- If a prompt or a code change would touch a protected feature, the agent must STOP, warn, and wait for explicit permission.
- A change request must touch only the numbered feature IDs named in the prompt.

### III. Tag-Driven Change Control
- The Quick Prompt Tags in `Site_Reference.md` are binding instructions.
- `#exact`, `#example`, `#explain`: the agent first explains its understanding, waits for "Yes", then writes code. `#wait` means update the understanding and ask again, without code.
- `#skip`: the website must still run in a working state.
- Tags may be nested with `[]`, `{}`, `()`. The inner tag applies only to its own bracket.
- Features are referred to by their numbering (1.1, 3.5.5, 4.6.2 and so on).

### IV. Android-Ready Architecture (`#remember`)
- Code must stay cleanly structured so the site can be wrapped with Capacitor.
- Engine access must go through one abstraction layer so a native Stockfish plugin (multi-threaded, offline, DroidFish-level) can replace the WASM engine later.
- Avoid browser-only or desktop-only APIs that fail in a mobile WebView.
- Board interaction aur palette pieces ka drag-and-drop Pointer Events (`pointerdown`, `pointermove`, `pointerup`) se implement hona compulsory hai taaki touch screens aur mobile WebView me seamless chale, sirf desktop HTML5 drag-drop par depend nahi rahega.

### V. Online vs Offline Execution
- `#offline`: runs locally in the browser or device (for example Stockfish WASM analysis).
- `#online`: runs through an internet API (for example the AI explanation calls).
- Each feature declares which mode it uses. Do not mix them silently.

### VI. Analysis Correctness (NON-NEGOTIABLE)
Chess math must follow these formulas. Fixed centipawn thresholds are not allowed.
- `WinPercent = 50 + 50 * (2 / (1 + e^(-0.00368208 * cp)) - 1)`
- `Drop = WinPercentBefore - WinPercentAfter`
- `MoveAccuracy = 103.1668 * e^(-0.04354 * Drop) - 3.1669`, clamped to 0-100.
- Game accuracy is a consistency-weighted average, not a plain mean.
- Classification by Win% drop: Excellent 0-2%, Good 2-5%, Inaccuracy 5-10%, Mistake 10-20%, Blunder 20%+. Best means the engine's top move (PV).
- Brilliant: best move + piece sacrifice + position not already losing + not a forced or only move.
- Great: best move + sharp position where the second-best move is much worse.
- The eval gauge bar must also be Win% based, not linear.
- Reference test: the known test PGN (about 76% accuracy on Chess.com) must give a result close to 76%.

### VII. Secrets and Keys
- API keys (Groq, Gemini, Firebase) live only in `.env` / hosting environment variables, never in code.
- `.env` must be listed in `.gitignore`.
- AI calls must handle loading, error, and fallback states (Groq primary, Gemini fallback, or the user's selection).

### VIII. Licenses and Dependencies
- Prefer MIT / Apache / BSD libraries (chess.js, react-chessboard, and similar).
- Every new library needs a license check before adding. Avoid GPL libraries unless the user approves after a legal check. For example, `chessops` is GPL-3.0 and is not used.
- Stockfish itself is GPL-3.0. Keep it as an unmodified engine file loaded in a Web Worker, include its license and source link, and treat this as a pre-launch legal check item.
- Stockfish build `stockfish-19-lite-single` (`stockfish-19-lite-single.wasm` / `.js`) hi final hai (`#offline` execution, ~1.6MB lite NNUE, zero-server load). Engine Web Worker me `#offline` mode me chalega, single-threaded hoga, aur `/public/engine/` me koi duplicate engine file nahi hogi.
- Lichess `'cburnett'` piece set aur anya piece sets sirf commercial-OK open licenses wale use honge, proper attribution ke saath. NonCommercial (NC) licenses strictly avoid kiye jayenge.
- Game data: use only moves (facts) from public sources or officially open datasets. No copied commentary or third-party curated databases without a clear license.

### IX. Cost and Hosting Discipline
- Target: free-tier hosting (Cloudflare Pages) with ads allowed, plus Firebase free tier.
- Heavy assets (Stockfish WASM, piece sets, sounds) must be cacheable and compressed.
- Guest mode uses LocalStorage. Cloud save is optional and only after sign-in.

### X. Verify, Then Save
- After every change: re-check the ✅ features related to it, report with `#working` / `#not_working`, and fix in the same turn before moving on.
- Commit to Git after each feature reaches a working state, so we can revert.
- Update `Site_Reference.md` status after every change.
- Large features are split into small numbered chunks, one per prompt.

### XI. Chess Legality & Validation (FIDE / Lichess Standard — NON-NEGOTIABLE)
Board Editor (3.5.5) ke dwara board par sirf aur sirf legal chess positions hi setup ho sakti hain:
- Dono taraf (White & Black) ka theek 1 King hona anivarya hai (na kam, na zyada).
- Dono Kings touching/adjacent squares par prohibited hain (`distance >= 2 squares`).
- Rank 1 aur Rank 8 par Pawns completely block hain.
- Maximum 8 Pawns aur maximum 16 pieces total per color ki limit enforce hogi.
- Promotion Math limit: `(Extra Q + Extra R + Extra B + Extra N) <= (8 - current pawns)`.
- Inactive king check me nahi ho sakta; illegal turn switch block hoga.
- Castling rights checkbox tabhi enable honge jab King aur Rook apne home square par hon; piece hilne par auto-disable/uncheck hoga.
- En Passant dropdown me sirf legitimate capture wali file hi aayegi, warna `'-'` rahega.
- Invalid position hone par `'Start Analysis'` aur `'Practice'` buttons disabled rahenge aur inline reason show hoga.
- Sirf `chess.js` ke validation par depend nahi rehna hai, extra custom legality checks code me lagaye jayenge.

---

## Governance
- The user is the only authority to unlock, amend, or waive a principle.
- Amendments increase the version, state the reason, and update `Site_Reference.md` and any affected spec, plan, or task templates.
- A plan that conflicts with a principle must be revised, or must document an exception the user has approved.
- Board Editor ko 3.5.5 Chessboard Settings popup ke andar integrate kiya gaya hai (sub-features 3.5.5.3 se 3.5.5.7 ke roop me).

**Version**: 1.2.0 | **Ratified**: 2026-10-12 | **Last Amended**: 13 Oct 2026 (2026-10-13)
