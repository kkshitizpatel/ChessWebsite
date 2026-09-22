import { parse } from '@mliebelt/pgn-parser';
import { Chess } from 'chess.js';

export type MoveNode = {
  id: string;
  san: string;
  fen: string;
  moveNumber: number;
  turn: 'w' | 'b';
  parentId: string | null;
  childrenIds: string[];
  clock?: string;
  eval?: number;
  quality?: string;
  isMate?: boolean;
};

export type MoveTree = {
  nodes: Record<string, MoveNode>;
  rootIds: string[]; // The very first moves of the game (usually just one, but could be multiple if variations start on move 1)
};

export function createEmptyTree(): MoveTree {
  return { nodes: {}, rootIds: [] };
}

// Generate a simple unique ID
function uuid() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Parses a PGN string using @mliebelt/pgn-parser and builds a flat MoveTree map.
 * Also generates the precise FEN for every node by walking a fresh chess.js instance.
 */
export function parsePgnToTree(pgnStr: string): MoveTree {
  const tree = createEmptyTree();
  if (!pgnStr.trim()) return tree;

  let ast: any;
  try {
    ast = (parse(pgnStr, { startRule: 'games' }) as any)[0];
  } catch (e) {
    console.error("Failed to parse PGN:", e);
    return tree;
  }

  if (!ast || !ast.moves || ast.moves.length === 0) return tree;

  const chess = new Chess();

  function walk(moves: any[], parentId: string | null, parentFen: string): string[] {
    const nodeIds: string[] = [];
    
    // We must process moves linearly. Each move's parent is the PREVIOUS move in the array.
    let currentParentId = parentId;
    let currentFen = parentFen;

    for (const move of moves) {
      // Load the board state BEFORE this move
      chess.load(currentFen);
      
      let san = move.notation.notation;
      let moveObj;
      try {
        moveObj = chess.move(san);
      } catch (e) {
        console.warn(`Invalid move in PGN: ${san} at FEN ${currentFen}`);
        continue;
      }

      const newFen = chess.fen();
      const nodeId = uuid();

      const node: MoveNode = {
        id: nodeId,
        san: moveObj.san,
        fen: newFen,
        moveNumber: move.moveNumber,
        turn: move.turn,
        parentId: currentParentId,
        childrenIds: [],
        clock: move.commentDiag?.clk,
      };

      tree.nodes[nodeId] = node;

      if (currentParentId) {
        tree.nodes[currentParentId].childrenIds.push(nodeId);
      } else {
        nodeIds.push(nodeId); // This is a root node
      }

      // Handle variations
      if (move.variations && move.variations.length > 0) {
        for (const variation of move.variations) {
          // Variations stem from the state BEFORE the current move
          // So their parent is the SAME as the current move's parent
          const variationRootIds = walk(variation, currentParentId, currentFen);
          
          if (currentParentId) {
            // we already linked it inside walk() if currentParentId exists
          } else {
            nodeIds.push(...variationRootIds);
          }
        }
      }

      // Prepare for the next move in the main array
      currentParentId = nodeId;
      currentFen = newFen;
    }

    return nodeIds;
  }

  // Ensure initial state is correct (could be standard start or a FEN tag)
  let startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  if (ast.tags?.FEN) {
    startFen = ast.tags.FEN;
  }
  
  tree.rootIds = walk(ast.moves, null, startFen);

  return tree;
}

export function addMoveToTree(
  tree: MoveTree,
  parentId: string | null,
  san: string,
  fen: string,
  moveNumber: number,
  turn: 'w' | 'b'
): { newTree: MoveTree; newNodeId: string } {
  // If the exact SAN already exists as a child, don't create a new one!
  if (parentId && tree.nodes[parentId]) {
    const existingChildId = tree.nodes[parentId].childrenIds.find(
      (cid) => tree.nodes[cid].san === san
    );
    if (existingChildId) {
      return { newTree: tree, newNodeId: existingChildId };
    }
  } else if (!parentId) {
    const existingRootId = tree.rootIds.find((rid) => tree.nodes[rid].san === san);
    if (existingRootId) {
      return { newTree: tree, newNodeId: existingRootId };
    }
  }

  const nodeId = uuid();
  const node: MoveNode = {
    id: nodeId,
    san,
    fen,
    moveNumber,
    turn,
    parentId,
    childrenIds: [],
  };

  const newNodes = { ...tree.nodes, [nodeId]: node };
  const newRootIds = [...tree.rootIds];

  if (parentId && newNodes[parentId]) {
    newNodes[parentId] = {
      ...newNodes[parentId],
      childrenIds: [...newNodes[parentId].childrenIds, nodeId],
    };
  } else if (!parentId) {
    newRootIds.push(nodeId);
  }

  return {
    newTree: { nodes: newNodes, rootIds: newRootIds },
    newNodeId: nodeId,
  };
}
