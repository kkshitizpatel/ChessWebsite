# ChessUnfold — Site Status & Reference

> **Master Format**
> *Status Guide: ⬜ UI Only / Not Started | 🟡 Partial | ✅ Working*

## 🏗️ ARCHITECTURE GOAL & #remember
**Future Android App (Capacitor):** The website's codebase must be structured cleanly so that when it is converted to an Android App via Capacitor, it can leverage Native Plugins to run DroidFish-level advanced Stockfish offline analysis (using full device CPU/Multi-threading) and combine it with AI explanations seamlessly.

---

## 🛠️ QUICK PROMPT TAGS (Overrides)
**META-RULE:** If any future prompt or coding action threatens to break the rules of these tags (e.g., changing a `#lock`ed feature), I will STOP, warn you, and wait for your explicit permission before executing.

**SYNTAX RULE (Tag Scoping):** Tags can now take arguments and be nested using brackets `[]`, `{}`, `()` to define their scope, just like in code.
*Example:* `#explain[1.2 se 1.4 tk explain karna hai #skip{1.3 ko feature #online(ye online kam karega)}]`
*   This means the `#explain` tag applies to everything inside `[]`.
*   Inside it, the `#skip` tag applies only to what is inside `{}`.
*   And inside that, `#online` applies to what is inside `()`.

Use these tags in your prompt to easily control the changes:
- `#change` : Modify visuals (color, style, shape). Overrides "No visual change" rule.
- `#no_change` : Default. Only fix logic/code, keep exact same UI.
- `#drag` : Move or shift alignment of an icon, text, or column.
- `#size` : Make an element, text, or column larger/smaller.
- `#add` : Add a new visual element (button, icon, input) to the UI.
- `#remove` : Delete an element from the UI completely.
- `#logic` : Change background logic/formulas without touching the UI.
- `#lock` : Freeze a feature permanently (visual + logic). It will never be changed until unlocked.
- `#unlock` : Unfreeze a previously locked feature, allowing changes again.
- `#working` : Confirms that after my code changes, the feature is successfully working.
- `#not_working` : Indicates that my code changes failed, and the feature is still broken.
- `#problem` : Use this to report any bug, error, or issue you spot in the site.
- `#stop` : Stop working on the current feature/fix immediately and just update its status in the reference file.
- `#exact` : I will do exactly what your prompt, image, or file says. (Workflow: I will first explain what I understood -> Wait for your "Yes" -> Then write code).
- `#example` : Your prompt is a suggestion/example of how things should be done. (Workflow: I will first explain what I understood -> Wait for your "Yes" -> Then write code).
- `#skip` : Skip the problematic feature entirely and make sure the website runs and is in working condition anyhow.
- `#remember` : Core project vision and future target platforms. I will keep this context in mind for all future coding and architecture decisions.
- `#visual` : Focus strictly on how the UI looks on the screen (styling, locking design, placement). Logic/coding will be handled later.
- `#wait` : Used during the confirmation step of #exact/#example. It means the agent's understanding is close, but the user wants to add more points or clarify something. The agent must read the new points, update its understanding, and ask for confirmation again without writing code.
- `#online` : Feature/code must be built to run via an online server/internet API (backend processing).
- `#offline` : Feature/code must be built to run locally in the browser, utilizing the device's (computer/mobile) processing power.
- `#explain` : Before executing any code or changes, the agent must explain its detailed understanding of the prompt.

---

## 1. WEBSITE VIEW & GLOBAL RULES
| ID | Feature | Status | Notes |
|---|---|---|---|
| 1.1 | Screen size 1366x768 (locked) | ✅ Working | Strictly enforced |
| 1.2 | No visual change | ✅ Working | No unauthorized UI changes |
| 1.3 | No Global Vertical Scroll | ✅ Working | Outer page is locked |
| 1.4 | Inner Scrolling Only | ✅ Working | Only columns 2 & 3 scroll |

---

## 2. TOP HEADER
| ID | Feature | Status | Notes |
|---|---|---|---|
| 2.1 | Logo (ChessUnfold) | ✅ Working | Visual only |
| 2.2 | Nav Tabs (Analysis, Openings...) | ⬜ UI Only | Needs routing to other pages |
| 2.3 | Search Bar | ⬜ UI Only | No search logic yet |
| 2.4 | Settings Icon (Gear) | ⬜ UI Only | Needs global settings modal |
| 2.5 | Notifications Icon (Bell) | ⬜ UI Only | No notification system |
| 2.6 | User Profile Icon | ⬜ UI Only | No auth system yet |

---

## 3. COLUMN 1: CHESSBOARD AREA
| ID | Feature | Status | Notes |
|---|---|---|---|
| 3.1 | Top Player Banner (Avatar, Name, Rating) | ✅ Working | Flips with board orientation |
| 3.1.1 | Dynamic Name & Rating | ✅ Working | Reads PGN headers [White]/[Black]/[WhiteElo]/[BlackElo] |
| 3.1.2 | Captured Pieces (Live UI) | ✅ Working | Shows ♟♞♝♜♛ icons of captured pieces |
| 3.1.3 | Live Material Advantage (+ Score) | ✅ Working | Shows +X based on piece values (P=1, N/B=3, R=5, Q=9) |
| 3.1.4 | Clock Time | ✅ Working | Displays player clock, parses [%clk] from PGN |
| 3.2 | Main Chessboard (Piece move, drag & drop) | ✅ Working | Shows arrows, handles drag/drop, flips correctly |
| 3.3 | Evaluation Gauge Bar (Right side of board) | ✅ Working | Win% based math, visually scales perfectly |
| 3.4 | Bottom Player Banner (Avatar, Name, Rating) | ✅ Working | Flips with board orientation |
| 3.4.1 | Dynamic Name & Rating | ✅ Working | Reads PGN headers [White]/[Black]/[WhiteElo]/[BlackElo] |
| 3.4.2 | Captured Pieces (Live UI) | ✅ Working | Shows ♟♞♝♜♛ icons of captured pieces |
| 3.4.3 | Live Material Advantage (+ Score) | ✅ Working | Shows +X based on piece values (P=1, N/B=3, R=5, Q=9) |
| 3.4.4 | Clock Time | ✅ Working | Displays player clock, parses [%clk] from PGN |
| 3.5.1 | Playback Buttons | ✅ Working | Start/Back/Forward/End wired |
| 3.5.2 | Practice with Computer | ✅ Working | Button toggles practice mode against engine |
| 3.5.3 | Start Analysis Button | ✅ Working | Sends selected moves to AI API |
| 3.5.4 | Chessboard Settings Button | ✅ Working | Toggles popup |
| 3.6.1 | Computer Level Slider | ✅ Working | Updates Engine Skill (1-10) |
| 3.6.2 | Flip Board Option | ✅ Working | Toggles orientation |
| 3.6.3 | Starting Position Option | ✅ Working | Resets board |
| 3.6.4 | Clear Board Option | ✅ Working | Empties board |
| 3.6.5 | Board Editor Option | ⬜ UI Only | Needs custom position editor |

---

## 4. COLUMN 2: MOVE LIST
| ID | Feature | Status | Notes |
|---|---|---|---|
| 4.1 | Move List Header | ✅ Working | Visuals complete |
| 4.2 | Move Rows | ✅ Working | Auto-records SAN moves |
| 4.3 | Move Selection Checkboxes | ✅ Working | Allows multi-select for AI |
| 4.4 | Move Click | ✅ Working | Navigates history |
| 4.5 | Move Evaluation UI | ✅ Working | Eval scores and icons matching quality |
| 4.6 | Accuracy Footer | ✅ Working | |
| 4.6.1 | Accuracy | ✅ Working | Consistency-weighted average (WinPercent drop based) |
| 4.6.2 | Brilliant | ✅ Working | Best move + sacrifice + not losing + not forced |
| 4.6.3 | Great | ✅ Working | Best move + sharp/critical position (2nd best is much worse) |
| 4.6.4 | Best | ✅ Working | Engine's top move (PV) |
| 4.6.5 | Excellent | ✅ Working | WinPercent drop 0-2% |
| 4.6.6 | Good | ✅ Working | WinPercent drop 2-5% |
| 4.6.7 | Book | ✅ Working | Opening book moves |
| 4.6.8 | Inaccuracy | ✅ Working | WinPercent drop 5-10% |
| 4.6.9 | Mistake | ✅ Working | WinPercent drop 10-20% |
| 4.6.10 | Blunder | ✅ Working | WinPercent drop 20%+ |

---

## 5. COLUMN 3: AI EXPLANATION & UTILITIES
| ID | Feature | Status | Notes |
|---|---|---|---|
| 5.1.1 | AI Model Selector | ✅ Working | Supports Gemini Flash and Llama 3 (via Groq) |
| 5.1.2 | Language Selector | ✅ Working | 30+ languages, searchable autocomplete |
| 5.1.3 | Notes Button | ⬜ UI Only | Needs a modal to save user notes |
| 5.2 | AI Output Box | ✅ Working | Calls API, shows markdown or mock response |
| 5.3.1 | FEN Input | ✅ Working | Now shows inline error if invalid |
| 5.3.2 | PGN Textarea | ✅ Working | Paste PGN to load game on board |
| 5.3.3 | LINK Input | ✅ Working | Now shows inline error if link fails |
