const fs = require('fs');

// 1. Fix Unicode in MoveList.tsx
let ml = fs.readFileSync('src/components/MoveList.tsx', 'utf8');
ml = ml.replace(/const pieceIconMapWhite: Record<string, string> = {.*?};/s, "const pieceIconMapWhite: Record<string, string> = { N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔' };");
ml = ml.replace(/const pieceIconMapBlack: Record<string, string> = {.*?};/s, "const pieceIconMapBlack: Record<string, string> = { N: '♞', B: '♝', R: '♜', Q: '♛', K: '♚' };");
fs.writeFileSync('src/components/MoveList.tsx', ml, 'utf8');

// 2. Add exportTreeToPgn to moveTree.ts
let mt = fs.readFileSync('src/lib/moveTree.ts', 'utf8');
if (!mt.includes('export function exportTreeToPgn')) {
  mt += `
export function exportTreeToPgn(tree: MoveTree, headers: Record<string, string> = {}): string {
  let pgn = "";
  for (const [key, val] of Object.entries(headers)) {
    pgn += \`[\${key} "\${val}"]\\n\`;
  }
  if (Object.keys(headers).length > 0) pgn += "\\n";

  function traverse(nodeId: string, isMainLine: boolean = true): string {
    const node = tree.nodes[nodeId];
    if (!node) return "";
    
    let res = "";
    if (node.turn === 'w') {
      res += \`\${node.moveNumber}. \${node.san} \`;
    } else {
      if (isMainLine && tree.nodes[node.parentId || ""]?.turn !== 'w') {
        res += \`\${node.moveNumber}... \${node.san} \`;
      } else {
        res += \`\${node.san} \`;
      }
    }

    if (node.childrenIds.length > 0) {
      const mainChild = node.childrenIds[0];
      res += traverse(mainChild, true);
      
      for (let i = 1; i < node.childrenIds.length; i++) {
        const varChild = node.childrenIds[i];
        const varNode = tree.nodes[varChild];
        let varStr = "";
        if (varNode.turn === 'w') {
           varStr = traverse(varChild, false);
        } else {
           varStr = \`\${varNode.moveNumber}... \${traverse(varChild, false)}\`;
        }
        res += \`(\${varStr.trim()}) \`;
      }
    }
    return res;
  }

  for (const rootId of tree.rootIds) {
    pgn += traverse(rootId, true);
  }
  
  return pgn.trim();
}
`;
  fs.writeFileSync('src/lib/moveTree.ts', mt, 'utf8');
}

// 3. Update ChessDashboard.tsx
let cd = fs.readFileSync('src/components/ChessDashboard.tsx', 'utf8');
// Fix capIconMap
cd = cd.replace(/const capIconMap: Record<string, string> = {.*?};/s, "const capIconMap: Record<string, string> = { 'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛' };");

// Fix MoveList prop
cd = cd.replace(/<MoveList\s+tree=\{moveTree\}\s+currentNodeId=\{currentNodeId\}\s+onMoveClick=\{goToMove\}\s+selectedMoves=\{selectedMoves\}\s+onToggleMove=\{toggleMoveSelection\}\s*\/>/m, `<MoveList
              tree={moveTree}
              currentNodeId={currentNodeId}
              onMoveClick={goToMove}
              selectedMoves={selectedMoves}
              onToggleMove={toggleMoveSelection}
              usePieceIcons={usePieceIcons}
            />`);

// Fix AI Payload & Import
if (!cd.includes('exportTreeToPgn')) {
  cd = cd.replace(
    'import { MoveTree, createEmptyTree, parsePgnToTree, addMoveToTree } from "../lib/moveTree";',
    'import { MoveTree, createEmptyTree, parsePgnToTree, addMoveToTree, exportTreeToPgn } from "../lib/moveTree";'
  );
}

cd = cd.replace(
  'pgn: chessRef.current.pgn(),',
  'pgn: exportTreeToPgn(moveTreeRef.current, { white: whitePlayer.name, black: blackPlayer.name, date: new Date().toISOString().split("T")[0] }),'
);

// Remove stupid toggle from MoveList Header
const headerToggleRegex = /\{onTogglePieceIcons && \([\s\S]*?<button[\s\S]*?onClick=\{onTogglePieceIcons\}[\s\S]*?title="Toggle Piece Icons"[\s\S]*?<\/button>\s*\)\}/;
cd = cd.replace(headerToggleRegex, '');

fs.writeFileSync('src/components/ChessDashboard.tsx', cd, 'utf8');

console.log("All fixed.");
