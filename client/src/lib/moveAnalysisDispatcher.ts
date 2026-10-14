import { Chess } from 'chess.js';
import { Engine } from './engine';
import { MoveNode, MoveQuality, MoveTree } from './moveTree';

export const MOVE_QUALITY_ORDER: MoveQuality[] = [
  'Brilliant',
  'Great',
  'Best',
  'Excellent',
  'Good',
  'Book',
  'Inaccuracy',
  'Mistake',
  'Blunder',
];

export interface MoveQualityVisual {
  label: MoveQuality;
  symbol: string;
  textClass: string;
  badgeBgClass: string;
  hexColor: string;
}

export const MOVE_QUALITY_CONFIG: Record<MoveQuality, MoveQualityVisual> = {
  Brilliant: {
    label: 'Brilliant',
    symbol: '!!',
    textClass: 'text-[#2fe0c6]',
    badgeBgClass: 'bg-[#1ba39c] text-white',
    hexColor: '#2fe0c6',
  },
  Great: {
    label: 'Great',
    symbol: '!',
    textClass: 'text-[#458cf7]',
    badgeBgClass: 'bg-[#458cf7] text-white',
    hexColor: '#458cf7',
  },
  Best: {
    label: 'Best',
    symbol: '★',
    textClass: 'text-[#81b64c]',
    badgeBgClass: 'bg-[#81b64c] text-white',
    hexColor: '#81b64c',
  },
  Excellent: {
    label: 'Excellent',
    symbol: '👍',
    textClass: 'text-[#96bc4b]',
    badgeBgClass: 'bg-[#96bc4b] text-[#1a1917]',
    hexColor: '#96bc4b',
  },
  Good: {
    label: 'Good',
    symbol: '✔',
    textClass: 'text-[#97af8b]',
    badgeBgClass: 'bg-[#6b8760] text-white',
    hexColor: '#97af8b',
  },
  Book: {
    label: 'Book',
    symbol: '📖',
    textClass: 'text-[#c29b70]',
    badgeBgClass: 'bg-[#a88865] text-white',
    hexColor: '#c29b70',
  },
  Inaccuracy: {
    label: 'Inaccuracy',
    symbol: '?!',
    textClass: 'text-[#e5a93c]',
    badgeBgClass: 'bg-[#e5a93c] text-[#1a1917]',
    hexColor: '#e5a93c',
  },
  Mistake: {
    label: 'Mistake',
    symbol: '?',
    textClass: 'text-[#e67e22]',
    badgeBgClass: 'bg-[#e67e22] text-white',
    hexColor: '#e67e22',
  },
  Blunder: {
    label: 'Blunder',
    symbol: '??',
    textClass: 'text-[#e74c3c]',
    badgeBgClass: 'bg-[#e74c3c] text-white',
    hexColor: '#e74c3c',
  },
};

export type ClassificationCounts = Record<MoveQuality, number>;

export interface AccuracyStatsSummary {
  whiteAccuracy: number;
  blackAccuracy: number;
  whiteCounts: ClassificationCounts;
  blackCounts: ClassificationCounts;
}

export function createEmptyClassificationCounts(): ClassificationCounts {
  return {
    Brilliant: 0,
    Great: 0,
    Best: 0,
    Excellent: 0,
    Good: 0,
    Book: 0,
    Inaccuracy: 0,
    Mistake: 0,
    Blunder: 0,
  };
}

/**
 * Constitution Principle VI:
 * WinPercent = 50 + 50 * (2 / (1 + e^(-0.00368208 * cp)) - 1)
 */
export function computeWinPercent(cp: number): number {
  const clamped = Math.max(-10000, Math.min(10000, cp));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clamped)) - 1);
}

/**
 * Constitution Principle VI:
 * MoveAccuracy = 103.1668 * e^(-0.04354 * Drop) - 3.1669, clamped to 0-100.
 */
export function computeMoveAccuracy(drop: number): number {
  const safeDrop = Math.max(0, drop);
  const raw = 103.1668 * Math.exp(-0.04354 * safeDrop) - 3.1669;
  return Math.max(0, Math.min(100, raw));
}

/**
 * Constitution Principle VI:
 * Game accuracy is a consistency-weighted average, not a plain mean.
 */
export function computeConsistencyWeightedAccuracy(
  moveAccuracies: number[],
  winPercents: number[]
): number {
  if (moveAccuracies.length === 0) return 100.0;
  if (moveAccuracies.length === 1) {
    return Number(moveAccuracies[0].toFixed(1));
  }

  const n = moveAccuracies.length;
  const windowSize = Math.max(2, Math.min(8, Math.floor(n / 5) + 2));

  let weightedSum = 0;
  let weightTotal = 0;
  let harmonicDenom = 0;

  for (let i = 0; i < n; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(winPercents.length - 1, start + windowSize);
    const slice = winPercents.slice(start, end + 1);

    let stdDev = 0.5;
    if (slice.length > 1) {
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance =
        slice.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / slice.length;
      stdDev = Math.sqrt(variance);
    }
    const weight = Math.max(0.5, Math.min(12, stdDev));
    weightedSum += moveAccuracies[i] * weight;
    weightTotal += weight;

    harmonicDenom += 1 / Math.max(1, moveAccuracies[i]);
  }

  const volatilityWeightedMean = weightTotal > 0 ? weightedSum / weightTotal : 0;
  const harmonicMean = harmonicDenom > 0 ? n / harmonicDenom : 0;
  const combined = (volatilityWeightedMean + harmonicMean) / 2;

  return Number(Math.max(0, Math.min(100, combined)).toFixed(1));
}

// Common opening book SAN sequences / moves for the first few plies from standard start
const BOOK_FIRST_MOVES = new Set([
  'e4', 'd4', 'Nf3', 'c4', 'g3', 'b3', 'f4', 'Nc3',
  'e5', 'c5', 'e6', 'c6', 'd5', 'Nf6', 'g6', 'd6', 'Nc6', 'b6', 'f5',
]);

const BOOK_EARLY_SAN = new Set([
  'e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Bc4', 'd4', 'd5', 'c4', 'c5', 'c6', 'e6',
  'Nf6', 'd6', 'g6', 'Bg7', 'Be2', 'Be7', 'Bc5', 'Bf4', 'Bg5', 'Nbd2', 'Nbd7',
  'c3', 'a6', 'exd5', 'cxd5', 'cxd4', 'Nxd4', 'O-O', 'g3', 'Bg2', 'b3', 'Bb2',
]);

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function computeNonKingMaterial(fen: string, color: 'w' | 'b'): number {
  const boardPart = fen.split(' ')[0] || '';
  let total = 0;
  for (const ch of boardPart) {
    const lower = ch.toLowerCase();
    if (PIECE_VALUES[lower] !== undefined) {
      const isWhite = ch === ch.toUpperCase();
      if ((color === 'w' && isWhite) || (color === 'b' && !isWhite)) {
        total += PIECE_VALUES[lower];
      }
    }
  }
  return total;
}

/**
 * Detects whether a move involves a tactical piece sacrifice (moving side voluntarily
 * leaves a piece hanging or gives up material in an exchange while keeping a strong evaluation).
 */
function isSacrificeMove(
  fenBefore: string,
  fenAfter: string,
  mover: 'w' | 'b'
): boolean {
  try {
    const chessBefore = new Chess(fenBefore);
    const chessAfter = new Chess(fenAfter);
    const opponent = mover === 'w' ? 'b' : 'w';

    const moverMatBefore = computeNonKingMaterial(fenBefore, mover);
    const moverMatAfter = computeNonKingMaterial(fenAfter, mover);

    // Check if the opponent now has a capture that wins material immediately on the next ply
    const oppMoves = chessAfter.moves({ verbose: true });
    for (const m of oppMoves) {
      if (m.captured) {
        const capturedVal = PIECE_VALUES[m.captured] || 0;
        const attackerVal = PIECE_VALUES[m.piece] || 0;
        if (capturedVal >= 3 && capturedVal > attackerVal) {
          return true;
        }
        // Or if captured piece is undefended and worth >= 3
        if (capturedVal >= 3) {
          const testChess = new Chess(fenAfter);
          testChess.move(m);
          const recaptures = testChess
            .moves({ verbose: true })
            .filter((r) => r.to === m.to);
          if (recaptures.length === 0 && moverMatAfter <= computeNonKingMaterial(fenAfter, opponent)) {
            return true;
          }
        }
      }
    }

    // Or if mover already gave up material compared to before
    if (moverMatAfter < moverMatBefore) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export interface MoveClassificationInput {
  fenBefore: string;
  fenAfter: string;
  san: string;
  mover: 'w' | 'b';
  moveNumber: number;
  isTopEngineMove: boolean;
  drop: number;
  moverWinPercentBefore: number;
  moverWinPercentAfter: number;
  secondBestWinDropGap: number; // Mover Win% of best move minus Mover Win% of 2nd-best move
  legalMovesCount: number;
  parentWasBook: boolean;
  isStandardStart: boolean;
}

/**
 * Classifies a move strictly following Constitution Principle VI.
 */
export function classifyMoveByPrincipleVI(input: MoveClassificationInput): MoveQuality {
  const {
    fenBefore,
    fenAfter,
    san,
    mover,
    moveNumber,
    isTopEngineMove,
    drop,
    moverWinPercentAfter,
    secondBestWinDropGap,
    legalMovesCount,
    parentWasBook,
    isStandardStart,
  } = input;

  // 1. Opening Book check (first 4 full moves in standard games with near-zero drop)
  if (
    isStandardStart &&
    parentWasBook &&
    moveNumber <= 4 &&
    drop <= 2.2 &&
    (moveNumber === 1 ? BOOK_FIRST_MOVES.has(san) : BOOK_EARLY_SAN.has(san))
  ) {
    return 'Book';
  }

  // 2. Brilliant (!!): Best move + piece sacrifice + position not already losing + not forced/only move
  if (
    (isTopEngineMove || drop <= 1.0) &&
    legalMovesCount > 1 &&
    moverWinPercentAfter >= 48 &&
    isSacrificeMove(fenBefore, fenAfter, mover)
  ) {
    return 'Brilliant';
  }

  // 3. Great (!): Best move + sharp/critical position (2nd best is much worse) + not forced
  if (
    (isTopEngineMove || drop <= 1.2) &&
    legalMovesCount > 1 &&
    moverWinPercentAfter >= 35 &&
    secondBestWinDropGap >= 12.0
  ) {
    return 'Great';
  }

  // 4. Best (★): Engine's top move (PV) or negligible drop <= 0.4%
  if (isTopEngineMove || drop <= 0.4) {
    return 'Best';
  }

  // 5. Principle VI Win% Drop Brackets:
  // Excellent: 0-2%, Good: 2-5%, Inaccuracy: 5-10%, Mistake: 10-20%, Blunder: 20%+
  if (drop <= 2.0) {
    return 'Excellent';
  }
  if (drop <= 5.0) {
    return 'Good';
  }
  if (drop <= 10.0) {
    return 'Inaccuracy';
  }
  if (drop <= 20.0) {
    return 'Mistake';
  }
  return 'Blunder';
}

interface NormalizedEval {
  cpWhite: number;
  evalPawnsWhite: number;
  evalText: string;
  isMate: boolean;
  bestMoveUci: string;
  secondBestCpWhite: number | null;
}

async function evaluatePositionNormalized(
  engine: Engine,
  fen: string,
  depth: number = 10
): Promise<NormalizedEval> {
  const turn = fen.split(' ')[1] === 'b' ? 'b' : 'w';

  try {
    const chess = new Chess(fen);
    if (chess.isCheckmate()) {
      // Side to move is checkmated -> the OTHER side just delivered mate
      const cpWhite = turn === 'w' ? -10000 : 10000;
      return {
        cpWhite,
        evalPawnsWhite: turn === 'w' ? -99.9 : 99.9,
        evalText: turn === 'w' ? '-M' : '+M',
        isMate: true,
        bestMoveUci: '',
        secondBestCpWhite: null,
      };
    }
    if (chess.isDraw() || chess.isStalemate()) {
      return {
        cpWhite: 0,
        evalPawnsWhite: 0,
        evalText: '0.0',
        isMate: false,
        bestMoveUci: '',
        secondBestCpWhite: 0,
      };
    }
  } catch {
    // Fallback to engine evaluation
  }

  const res = await engine.evaluateFen(fen, depth);
  const sign = turn === 'w' ? 1 : -1;

  let cpWhite = 0;
  let evalPawnsWhite = 0;
  let evalText = '0.0';

  if (res.isMate) {
    const mateForSideToMove = res.score;
    const whiteWinsMate =
      (turn === 'w' && mateForSideToMove > 0) ||
      (turn === 'b' && mateForSideToMove < 0);
    cpWhite = whiteWinsMate ? 10000 : -10000;
    evalPawnsWhite = whiteWinsMate ? 99.9 : -99.9;
    evalText = `${whiteWinsMate ? '+' : '-'}M${Math.abs(mateForSideToMove)}`;
  } else {
    cpWhite = res.score * sign;
    evalPawnsWhite = Number((cpWhite / 100).toFixed(1));
    evalText = `${evalPawnsWhite > 0 ? '+' : ''}${evalPawnsWhite.toFixed(1)}`;
  }

  let secondBestCpWhite: number | null = null;
  if (res.score2 !== undefined) {
    if (res.isMate2) {
      const whiteWinsMate2 =
        (turn === 'w' && res.score2 > 0) ||
        (turn === 'b' && res.score2 < 0);
      secondBestCpWhite = whiteWinsMate2 ? 10000 : -10000;
    } else {
      secondBestCpWhite = res.score2 * sign;
    }
  }

  const bestMoveUci = res.pv ? res.pv.split(' ')[0] : '';

  return {
    cpWhite,
    evalPawnsWhite,
    evalText,
    isMate: res.isMate,
    bestMoveUci,
    secondBestCpWhite,
  };
}

function getPlayedMoveUciAndLegalCount(
  fenBefore: string,
  san: string
): { uci: string; legalCount: number } {
  try {
    const chess = new Chess(fenBefore);
    const legalMoves = chess.moves({ verbose: true });
    const moveObj = chess.move(san);
    if (moveObj) {
      const uci = `${moveObj.from}${moveObj.to}${moveObj.promotion || ''}`;
      return { uci, legalCount: legalMoves.length };
    }
    return { uci: '', legalCount: legalMoves.length };
  } catch {
    return { uci: '', legalCount: 2 };
  }
}

/**
 * Evaluates all nodes in a MoveTree sequentially using the local Stockfish Web Worker (#offline),
 * assigns Principle VI MoveQuality, eval, and accuracy to every node, and returns the updated
 * tree along with the aggregated AccuracyStatsSummary for Column 2's 4.6 Accuracy Summary Panel.
 */
export async function analyzeMoveTreeWithStockfish(
  tree: MoveTree,
  fallbackInitialFen: string,
  engine: Engine,
  onProgress?: (completed: number, total: number) => void
): Promise<{ analyzedTree: MoveTree; summary: AccuracyStatsSummary }> {
  const startFen =
    tree.initialFen ||
    fallbackInitialFen ||
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const isStandardStart =
    startFen.split(' ')[0] === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

  // Clone nodes so we can immutably update
  const newNodes: Record<string, MoveNode> = {};
  for (const [id, node] of Object.entries(tree.nodes)) {
    newNodes[id] = { ...node };
  }

  // Collect all nodes in breadth/depth order
  const orderedIds: string[] = [];
  function collect(nodeId: string) {
    if (!newNodes[nodeId]) return;
    orderedIds.push(nodeId);
    for (const cid of newNodes[nodeId].childrenIds) {
      collect(cid);
    }
  }
  for (const rid of tree.rootIds) {
    collect(rid);
  }

  const evalCache = new Map<string, NormalizedEval>();
  const getEval = async (fen: string): Promise<NormalizedEval> => {
    const cached = evalCache.get(fen);
    if (cached) return cached;
    const computed = await evaluatePositionNormalized(engine, fen, 10);
    evalCache.set(fen, computed);
    return computed;
  };

  const total = orderedIds.length;
  let completed = 0;

  for (const nodeId of orderedIds) {
    const node = newNodes[nodeId];
    const parentNode = node.parentId ? newNodes[node.parentId] : null;
    const fenBefore = parentNode ? parentNode.fen : startFen;
    const fenAfter = node.fen;

    const beforeEval = await getEval(fenBefore);
    const afterEval = await getEval(fenAfter);

    const mover = node.turn;
    const whiteWinBefore = computeWinPercent(beforeEval.cpWhite);
    const whiteWinAfter = computeWinPercent(afterEval.cpWhite);

    const moverWinBefore = mover === 'w' ? whiteWinBefore : 100 - whiteWinBefore;
    const moverWinAfter = mover === 'w' ? whiteWinAfter : 100 - whiteWinAfter;

    const { uci: playedUci, legalCount } = getPlayedMoveUciAndLegalCount(
      fenBefore,
      node.san
    );
    const isTopEngineMove =
      Boolean(beforeEval.bestMoveUci) && playedUci === beforeEval.bestMoveUci;

    // If the played move is the engine's exact top move, drop is 0
    const rawDrop = Math.max(0, moverWinBefore - moverWinAfter);
    const drop = isTopEngineMove ? 0 : rawDrop;

    let secondBestWinDropGap = 0;
    if (beforeEval.secondBestCpWhite !== null) {
      const whiteWinSecond = computeWinPercent(beforeEval.secondBestCpWhite);
      const moverWinSecond =
        mover === 'w' ? whiteWinSecond : 100 - whiteWinSecond;
      secondBestWinDropGap = Math.max(0, moverWinBefore - moverWinSecond);
    }

    const parentWasBook = parentNode ? parentNode.quality === 'Book' : true;

    const quality = classifyMoveByPrincipleVI({
      fenBefore,
      fenAfter,
      san: node.san,
      mover,
      moveNumber: node.moveNumber,
      isTopEngineMove,
      drop,
      moverWinPercentBefore: moverWinBefore,
      moverWinPercentAfter: moverWinAfter,
      secondBestWinDropGap,
      legalMovesCount: legalCount,
      parentWasBook,
      isStandardStart,
    });

    const moveAccuracy =
      quality === 'Book' ? 100 : computeMoveAccuracy(drop);

    newNodes[nodeId] = {
      ...node,
      eval: afterEval.evalPawnsWhite,
      evalText: afterEval.evalText,
      isMate: afterEval.isMate,
      quality,
      accuracy: Number(moveAccuracy.toFixed(1)),
      winDrop: Number(drop.toFixed(2)),
    };

    completed++;
    if (onProgress) onProgress(completed, total);
  }

  // Compute main-line summary statistics for White & Black (4.6 Accuracy Summary Panel)
  const whiteCounts = createEmptyClassificationCounts();
  const blackCounts = createEmptyClassificationCounts();
  const whiteAccuracies: number[] = [];
  const blackAccuracies: number[] = [];
  const whiteWinSeries: number[] = [];
  const blackWinSeries: number[] = [];

  // Walk main line (or all analyzed nodes if variations exist, prioritizing main line for game accuracy)
  const mainLineIds: string[] = [];
  if (tree.rootIds.length > 0) {
    let curr: string | undefined = tree.rootIds[0];
    while (curr && newNodes[curr]) {
      mainLineIds.push(curr);
      curr = newNodes[curr].childrenIds[0];
    }
  }

  const summaryIds = mainLineIds.length > 0 ? mainLineIds : orderedIds;

  for (const id of summaryIds) {
    const n = newNodes[id];
    if (!n || !n.quality) continue;
    const winWhite = computeWinPercent((n.eval ?? 0) * 100);
    if (n.turn === 'w') {
      whiteCounts[n.quality] = (whiteCounts[n.quality] || 0) + 1;
      if (n.accuracy !== undefined) {
        whiteAccuracies.push(n.accuracy);
        whiteWinSeries.push(winWhite);
      }
    } else {
      blackCounts[n.quality] = (blackCounts[n.quality] || 0) + 1;
      if (n.accuracy !== undefined) {
        blackAccuracies.push(n.accuracy);
        blackWinSeries.push(100 - winWhite);
      }
    }
  }

  const whiteAccuracy = computeConsistencyWeightedAccuracy(
    whiteAccuracies,
    whiteWinSeries
  );
  const blackAccuracy = computeConsistencyWeightedAccuracy(
    blackAccuracies,
    blackWinSeries
  );

  return {
    analyzedTree: {
      nodes: newNodes,
      rootIds: [...tree.rootIds],
      initialFen: startFen,
    },
    summary: {
      whiteAccuracy,
      blackAccuracy,
      whiteCounts,
      blackCounts,
    },
  };
}
