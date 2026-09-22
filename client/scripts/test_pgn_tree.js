const { parse } = require('@mliebelt/pgn-parser');
const { Chess } = require('chess.js');

const pgnStr = '1. e4 {[%clk 0:03:00]} 1... e5 {[%clk 0:02:50]} (1... c5 2. Nf3)';

const ast = parse(pgnStr)[0];

function walkTree(moves, chess) {
  const result = [];
  
  for (const move of moves) {
    // Make the move on the board
    let moveObj;
    try {
      moveObj = chess.move(move.notation.notation);
    } catch (e) {
      console.error('Invalid move', move.notation.notation, chess.fen());
      continue;
    }

    const node = {
      san: moveObj.san,
      fen: chess.fen(),
      moveNumber: move.moveNumber,
      turn: move.turn,
      clock: move.commentDiag?.clk,
      variations: []
    };
    
    // Handle variations
    if (move.variations && move.variations.length > 0) {
      // Remember the FEN BEFORE the move was made to explore variations
      // Wait, variations in PGN are alternatives to THIS move, 
      // so they stem from the position BEFORE this move!
      
      // We need to undo the move to get the parent position
      chess.undo();
      const parentFen = chess.fen();
      
      for (const variation of move.variations) {
        // Load parent FEN
        chess.load(parentFen);
        // Recursively walk variation
        node.variations.push(walkTree(variation, chess));
      }
      
      // Restore back to the main line (re-apply the move)
      chess.load(parentFen);
      chess.move(move.notation.notation);
    }
    
    result.push(node);
  }
  
  return result;
}

const chess = new Chess();
const tree = walkTree(ast.moves, chess);

console.dir(tree, { depth: null });
