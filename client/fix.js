const fs = require('fs');

// 1. Fix MoveList.tsx UTF-8 encoding
let moveList = fs.readFileSync('src/components/MoveList.tsx', 'utf8');
moveList = moveList.replace(/N: '\?', B: '\?', R: '\?', Q: '\?', K: '\?'/g, "N: '?', B: '?', R: '?', Q: '?', K: '?'");
moveList = moveList.replace(/pieceIconMapWhite: Record<string, string> = \{ N: '?', B: '?', R: '?', Q: '?', K: '?' \};/, "pieceIconMapWhite: Record<string, string> = { N: '?', B: '?', R: '?', Q: '?', K: '?' };");
fs.writeFileSync('src/components/MoveList.tsx', moveList, 'utf8');

// 2. Fix ChessDashboard.tsx
let dash = fs.readFileSync('src/components/ChessDashboard.tsx', 'utf8');

// Replace history().length with parent-based moveNumber
const historyCalc = `const moveNum = Math.ceil(chessRef.current.history().length / 2);`;
const properCalc = `let moveNum = 1;
        if (currentNodeIdRef.current) {
          const parentNode = moveTreeRef.current.nodes[currentNodeIdRef.current];
          if (parentNode) {
            moveNum = parentNode.turn === 'b' ? parentNode.moveNumber + 1 : parentNode.moveNumber;
          }
        }`;
dash = dash.replace(historyCalc, properCalc);

// Move Settings to the top gear icon
// First, extract the popup HTML
const popupStart = dash.indexOf('{showSettings && (');
const popupEndStr = `{/* Moves / Engine Output Placeholder */}`;
const popupEnd = dash.indexOf(popupEndStr);
const popupHtml = dash.substring(popupStart, popupEnd).trim();

// Remove popup and SlidersHorizontal onClick from the old place
dash = dash.replace(popupHtml, '');
dash = dash.replace(`onClick={() => setShowSettings(s => !s)}\n                title="Board Settings"`, '');

// Now find the top gear icon
const topGear = `<button className="w-8 h-8 rounded-full border border-surface-border flex items-center justify-center hover:bg-surface-elevated transition text-gray-400 hover:text-white"><Settings size={16}/></button>`;
const newTopGear = `<div className="relative">
          <button onClick={() => setShowSettings(s => !s)} className={\`w-8 h-8 rounded-full border border-surface-border flex items-center justify-center hover:bg-surface-elevated transition \${showSettings ? "text-white bg-surface-elevated" : "text-gray-400 hover:text-white"}\`}>
            <Settings size={16}/>
          </button>
          ${popupHtml.replace('bottom-0 left-[calc(100%+14px)]', 'top-[calc(100%+8px)] right-0')}
        </div>`;

dash = dash.replace(topGear, newTopGear);

fs.writeFileSync('src/components/ChessDashboard.tsx', dash, 'utf8');

console.log("Fixes applied.");

