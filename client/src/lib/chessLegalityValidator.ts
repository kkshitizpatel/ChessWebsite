export type PieceColor = "w" | "b";
export type PieceType = "k" | "q" | "r" | "b" | "n" | "p";
export type PieceCode =
  | "wK" | "wQ" | "wR" | "wB" | "wN" | "wP"
  | "bK" | "bQ" | "bR" | "bB" | "bN" | "bP";

export interface BoardPiece {
  color: PieceColor;
  type: PieceType;
  code: PieceCode;
}

export type BoardMap = Record<string, BoardPiece>;

export interface CastlingFlags {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export interface ActionValidationResult {
  allowed: boolean;
  reason: string | null;
}

export interface PositionValidationResult {
  isValid: boolean;
  reason: string | null;
  eligibleCastling: CastlingFlags;
  legalEpFiles: string[];
}

export const STANDARD_INITIAL_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
export const EMPTY_BOARD_FEN = "8/8/8/8/8/8/8/8 w - - 0 1";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export function pieceCodeToPiece(code: PieceCode): BoardPiece {
  const color = code[0] as PieceColor;
  const type = code[1].toLowerCase() as PieceType;
  return { color, type, code };
}

export function squareToCoords(square: string): [number, number] | null {
  if (square.length !== 2) return null;
  const fileIdx = FILES.indexOf(square[0] as (typeof FILES)[number]);
  const rankIdx = Number(square[1]) - 1;
  if (fileIdx < 0 || fileIdx > 7 || isNaN(rankIdx) || rankIdx < 0 || rankIdx > 7) {
    return null;
  }
  return [fileIdx, rankIdx];
}

export function coordsToSquare(fileIdx: number, rankIdx: number): string | null {
  if (fileIdx < 0 || fileIdx > 7 || rankIdx < 0 || rankIdx > 7) return null;
  return `${FILES[fileIdx]}${rankIdx + 1}`;
}

export function chebyshevDistance(sqA: string, sqB: string): number {
  const a = squareToCoords(sqA);
  const b = squareToCoords(sqB);
  if (!a || !b) return 99;
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
}

export function parseFenToEditorState(fen: string): {
  board: BoardMap;
  turn: PieceColor;
  castling: CastlingFlags;
  epFile: string;
} {
  const parts = fen.trim().split(/\s+/);
  const placement = parts[0] || "8/8/8/8/8/8/8/8";
  const turn: PieceColor = parts[1] === "b" ? "b" : "w";
  const castlingStr = parts[2] || "-";
  const epStr = parts[3] || "-";

  const board: BoardMap = {};
  const ranks = placement.split("/");
  for (let r = 0; r < Math.min(8, ranks.length); r++) {
    const rankNum = 8 - r;
    let fileIdx = 0;
    for (const ch of ranks[r]) {
      if (ch >= "1" && ch <= "8") {
        fileIdx += Number(ch);
      } else {
        const color: PieceColor = ch === ch.toUpperCase() ? "w" : "b";
        const lower = ch.toLowerCase() as PieceType;
        if (["k", "q", "r", "b", "n", "p"].includes(lower) && fileIdx < 8) {
          const code = `${color}${lower.toUpperCase()}` as PieceCode;
          const sq = `${FILES[fileIdx]}${rankNum}`;
          board[sq] = { color, type: lower, code };
        }
        fileIdx += 1;
      }
    }
  }

  const eligible = computeEligibleCastlingRights(board);
  const castling: CastlingFlags = {
    wK: castlingStr.includes("K") && eligible.wK,
    wQ: castlingStr.includes("Q") && eligible.wQ,
    bK: castlingStr.includes("k") && eligible.bK,
    bQ: castlingStr.includes("q") && eligible.bQ,
  };

  let epFile = "-";
  if (epStr.length === 2 && FILES.includes(epStr[0] as (typeof FILES)[number])) {
    const legalEp = computeLegalEnPassantFiles(board, turn);
    if (legalEp.includes(epStr[0])) {
      epFile = epStr[0];
    }
  }

  return { board, turn, castling, epFile };
}

export function computeEligibleCastlingRights(board: BoardMap): CastlingFlags {
  const wKingHome = board["e1"]?.code === "wK";
  const bKingHome = board["e8"]?.code === "bK";
  return {
    wK: wKingHome && board["h1"]?.code === "wR",
    wQ: wKingHome && board["a1"]?.code === "wR",
    bK: bKingHome && board["h8"]?.code === "bR",
    bQ: bKingHome && board["a8"]?.code === "bR",
  };
}

export function sanitizeCastlingFlags(
  current: CastlingFlags,
  eligible: CastlingFlags
): CastlingFlags {
  return {
    wK: current.wK && eligible.wK,
    wQ: current.wQ && eligible.wQ,
    bK: current.bK && eligible.bK,
    bQ: current.bQ && eligible.bQ,
  };
}

export function getAttackingSquares(
  board: BoardMap,
  targetSq: string,
  byColor: PieceColor
): string[] {
  const target = squareToCoords(targetSq);
  if (!target) return [];
  const [tf, tr] = target;
  const attackers: string[] = [];

  // 1. Pawn attacks
  const pawnSourceRank = byColor === "w" ? tr - 1 : tr + 1;
  for (const df of [-1, 1]) {
    const sq = coordsToSquare(tf + df, pawnSourceRank);
    if (sq && board[sq]?.color === byColor && board[sq]?.type === "p") {
      attackers.push(sq);
    }
  }

  // 2. Knight attacks
  const knightOffsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];
  for (const [df, dr] of knightOffsets) {
    const sq = coordsToSquare(tf + df, tr + dr);
    if (sq && board[sq]?.color === byColor && board[sq]?.type === "n") {
      attackers.push(sq);
    }
  }

  // 3. King attacks
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const sq = coordsToSquare(tf + df, tr + dr);
      if (sq && board[sq]?.color === byColor && board[sq]?.type === "k") {
        attackers.push(sq);
      }
    }
  }

  // 4. Orthogonal rays (Rook / Queen)
  const orthoDirs = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ];
  for (const [df, dr] of orthoDirs) {
    let cf = tf + df;
    let cr = tr + dr;
    while (cf >= 0 && cf <= 7 && cr >= 0 && cr <= 7) {
      const sq = coordsToSquare(cf, cr)!;
      const occupant = board[sq];
      if (occupant) {
        if (
          occupant.color === byColor &&
          (occupant.type === "r" || occupant.type === "q")
        ) {
          attackers.push(sq);
        }
        break;
      }
      cf += df;
      cr += dr;
    }
  }

  // 5. Diagonal rays (Bishop / Queen)
  const diagDirs = [
    [1, 1], [1, -1], [-1, 1], [-1, -1],
  ];
  for (const [df, dr] of diagDirs) {
    let cf = tf + df;
    let cr = tr + dr;
    while (cf >= 0 && cf <= 7 && cr >= 0 && cr <= 7) {
      const sq = coordsToSquare(cf, cr)!;
      const occupant = board[sq];
      if (occupant) {
        if (
          occupant.color === byColor &&
          (occupant.type === "b" || occupant.type === "q")
        ) {
          attackers.push(sq);
        }
        break;
      }
      cf += df;
      cr += dr;
    }
  }

  return attackers;
}

export function isSquareAttacked(
  board: BoardMap,
  targetSq: string,
  byColor: PieceColor
): boolean {
  return getAttackingSquares(board, targetSq, byColor).length > 0;
}

export function computeLegalEnPassantFiles(
  board: BoardMap,
  turn: PieceColor
): string[] {
  const legalFiles: string[] = [];

  for (let fi = 0; fi < 8; fi++) {
    const file = FILES[fi];
    if (turn === "w") {
      // Black pawn must have just moved from <file>7 to <file>5, leaving <file>6 and <file>7 empty
      const pawnSq = `${file}5`;
      const targetSq = `${file}6`;
      const originSq = `${file}7`;
      if (board[pawnSq]?.code !== "bP") continue;
      if (board[targetSq] || board[originSq]) continue;

      const adjFiles = [fi - 1, fi + 1]
        .filter(idx => idx >= 0 && idx <= 7)
        .map(idx => FILES[idx]);

      const hasAdjacentWhitePawn = adjFiles.some(
        af => board[`${af}5`]?.code === "wP"
      );
      if (hasAdjacentWhitePawn) {
        legalFiles.push(file);
      }
    } else {
      // White pawn must have just moved from <file>2 to <file>4, leaving <file>3 and <file>2 empty
      const pawnSq = `${file}4`;
      const targetSq = `${file}3`;
      const originSq = `${file}2`;
      if (board[pawnSq]?.code !== "wP") continue;
      if (board[targetSq] || board[originSq]) continue;

      const adjFiles = [fi - 1, fi + 1]
        .filter(idx => idx >= 0 && idx <= 7)
        .map(idx => FILES[idx]);

      const hasAdjacentBlackPawn = adjFiles.some(
        af => board[`${af}4`]?.code === "bP"
      );
      if (hasAdjacentBlackPawn) {
        legalFiles.push(file);
      }
    }
  }

  return legalFiles;
}

export function buildFenFromEditorState(
  board: BoardMap,
  turn: PieceColor,
  castling: CastlingFlags,
  epFile: string
): string {
  const rows: string[] = [];
  for (let rank = 8; rank >= 1; rank--) {
    let rowStr = "";
    let emptyCount = 0;
    for (let fi = 0; fi < 8; fi++) {
      const sq = `${FILES[fi]}${rank}`;
      const piece = board[sq];
      if (!piece) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rowStr += String(emptyCount);
          emptyCount = 0;
        }
        const ch =
          piece.color === "w"
            ? piece.type.toUpperCase()
            : piece.type.toLowerCase();
        rowStr += ch;
      }
    }
    if (emptyCount > 0) {
      rowStr += String(emptyCount);
    }
    rows.push(rowStr);
  }

  const eligibleCastling = computeEligibleCastlingRights(board);
  const safeCastling = sanitizeCastlingFlags(castling, eligibleCastling);
  let castlingStr = "";
  if (safeCastling.wK) castlingStr += "K";
  if (safeCastling.wQ) castlingStr += "Q";
  if (safeCastling.bK) castlingStr += "k";
  if (safeCastling.bQ) castlingStr += "q";
  if (!castlingStr) castlingStr = "-";

  const legalEpFiles = computeLegalEnPassantFiles(board, turn);
  let epSquare = "-";
  if (epFile !== "-" && legalEpFiles.includes(epFile)) {
    epSquare = `${epFile}${turn === "w" ? "6" : "3"}`;
  }

  return `${rows.join("/")} ${turn} ${castlingStr} ${epSquare} 0 1`;
}

function checkColorMaterialAndQuotas(
  board: BoardMap,
  color: PieceColor
): ActionValidationResult {
  const colorName = color === "w" ? "White" : "Black";
  const counts: Record<PieceType, number> = {
    k: 0,
    q: 0,
    r: 0,
    b: 0,
    n: 0,
    p: 0,
  };
  let total = 0;

  for (const [sq, p] of Object.entries(board)) {
    if (p.color !== color) continue;
    counts[p.type]++;
    total++;
    if (p.type === "p") {
      const rank = sq[1];
      if (rank === "1" || rank === "8") {
        return {
          allowed: false,
          reason: "Pawns cannot be placed on Rank 1 or Rank 8.",
        };
      }
    }
  }

  if (counts.k > 1) {
    return {
      allowed: false,
      reason: `${colorName} already has a King on the board (only 1 King allowed).`,
    };
  }

  if (counts.p > 8) {
    return {
      allowed: false,
      reason: `Maximum 8 ${colorName} pawns allowed.`,
    };
  }

  if (total > 16) {
    return {
      allowed: false,
      reason: `Maximum 16 ${colorName} pieces allowed.`,
    };
  }

  const extraPromoted =
    Math.max(0, counts.q - 1) +
    Math.max(0, counts.r - 2) +
    Math.max(0, counts.b - 2) +
    Math.max(0, counts.n - 2);
  const remainingPawnQuota = 8 - counts.p;

  if (extraPromoted > remainingPawnQuota) {
    return {
      allowed: false,
      reason: `${colorName} promotion quota exceeded: extra pieces (${extraPromoted}) > remaining pawn quota (${remainingPawnQuota}).`,
    };
  }

  return { allowed: true, reason: null };
}

export function validateEditorAction(
  board: BoardMap,
  pieceCode: PieceCode,
  targetSquare: string,
  sourceSquare?: string | null
): ActionValidationResult {
  if (!squareToCoords(targetSquare)) {
    return { allowed: false, reason: "Invalid target square." };
  }

  const piece = pieceCodeToPiece(pieceCode);

  // Immediate Rank 1 / Rank 8 pawn check
  if (piece.type === "p" && (targetSquare[1] === "1" || targetSquare[1] === "8")) {
    return {
      allowed: false,
      reason: "Pawns cannot be placed on Rank 1 or Rank 8.",
    };
  }

  // Simulate new board map
  const nextBoard: BoardMap = { ...board };
  if (sourceSquare && sourceSquare !== targetSquare) {
    delete nextBoard[sourceSquare];
  }
  nextBoard[targetSquare] = piece;

  // Check material & promotion quotas for both colors
  const whiteQuota = checkColorMaterialAndQuotas(nextBoard, "w");
  if (!whiteQuota.allowed) return whiteQuota;

  const blackQuota = checkColorMaterialAndQuotas(nextBoard, "b");
  if (!blackQuota.allowed) return blackQuota;

  // Check non-adjacent Kings if both Kings exist on nextBoard
  let wKingSq: string | null = null;
  let bKingSq: string | null = null;
  for (const [sq, p] of Object.entries(nextBoard)) {
    if (p.code === "wK") wKingSq = sq;
    if (p.code === "bK") bKingSq = sq;
  }

  if (wKingSq && bKingSq && chebyshevDistance(wKingSq, bKingSq) < 2) {
    return {
      allowed: false,
      reason: "Kings cannot be placed on adjacent (touching) squares.",
    };
  }

  return { allowed: true, reason: null };
}

export function canSwitchTurn(
  board: BoardMap,
  nextTurn: PieceColor
): ActionValidationResult {
  const newlyInactiveColor: PieceColor = nextTurn === "w" ? "b" : "w";
  const targetKingCode: PieceCode = newlyInactiveColor === "w" ? "wK" : "bK";
  let inactiveKingSq: string | null = null;

  for (const [sq, p] of Object.entries(board)) {
    if (p.code === targetKingCode) {
      inactiveKingSq = sq;
      break;
    }
  }

  if (inactiveKingSq && isSquareAttacked(board, inactiveKingSq, nextTurn)) {
    const sideName = newlyInactiveColor === "w" ? "White" : "Black";
    return {
      allowed: false,
      reason: `Cannot switch turn: ${sideName} King would be left in check.`,
    };
  }

  return { allowed: true, reason: null };
}

export function validateBoardPosition(
  board: BoardMap,
  turn: PieceColor
): PositionValidationResult {
  const eligibleCastling = computeEligibleCastlingRights(board);
  const legalEpFiles = computeLegalEnPassantFiles(board, turn);

  let wKingSq: string | null = null;
  let bKingSq: string | null = null;
  let wKingCount = 0;
  let bKingCount = 0;

  for (const [sq, p] of Object.entries(board)) {
    if (p.code === "wK") {
      wKingSq = sq;
      wKingCount++;
    } else if (p.code === "bK") {
      bKingSq = sq;
      bKingCount++;
    }
  }

  if (wKingCount === 0 && bKingCount === 0) {
    return {
      isValid: false,
      reason: "Invalid position: Both Kings are missing",
      eligibleCastling,
      legalEpFiles,
    };
  }
  if (wKingCount === 0) {
    return {
      isValid: false,
      reason: "Invalid position: White King is missing",
      eligibleCastling,
      legalEpFiles,
    };
  }
  if (bKingCount === 0) {
    return {
      isValid: false,
      reason: "Invalid position: Black King is missing",
      eligibleCastling,
      legalEpFiles,
    };
  }
  if (wKingCount > 1 || bKingCount > 1) {
    return {
      isValid: false,
      reason: "Invalid position: Exactly 1 King per side is required",
      eligibleCastling,
      legalEpFiles,
    };
  }

  if (wKingSq && bKingSq && chebyshevDistance(wKingSq, bKingSq) < 2) {
    return {
      isValid: false,
      reason: "Invalid position: Kings cannot touch each other",
      eligibleCastling,
      legalEpFiles,
    };
  }

  const whiteQuota = checkColorMaterialAndQuotas(board, "w");
  if (!whiteQuota.allowed) {
    return {
      isValid: false,
      reason: `Invalid position: ${whiteQuota.reason}`,
      eligibleCastling,
      legalEpFiles,
    };
  }

  const blackQuota = checkColorMaterialAndQuotas(board, "b");
  if (!blackQuota.allowed) {
    return {
      isValid: false,
      reason: `Invalid position: ${blackQuota.reason}`,
      eligibleCastling,
      legalEpFiles,
    };
  }

  // Inactive side King cannot be in check
  const inactiveColor: PieceColor = turn === "w" ? "b" : "w";
  const inactiveKingSq = inactiveColor === "w" ? wKingSq! : bKingSq!;
  if (isSquareAttacked(board, inactiveKingSq, turn)) {
    return {
      isValid: false,
      reason: `Invalid position: ${
        inactiveColor === "w" ? "White" : "Black"
      } King (opponent) cannot be in check`,
      eligibleCastling,
      legalEpFiles,
    };
  }

  // Active side King cannot be in impossible multiple check
  const activeKingSq = turn === "w" ? wKingSq! : bKingSq!;
  const checkers = getAttackingSquares(board, activeKingSq, inactiveColor);
  if (checkers.length > 2) {
    return {
      isValid: false,
      reason: "Invalid position: Impossible triple check on King",
      eligibleCastling,
      legalEpFiles,
    };
  }
  if (checkers.length === 2) {
    const t1 = board[checkers[0]]?.type;
    const t2 = board[checkers[1]]?.type;
    // Two non-sliding pieces (pawn/knight) or two identical sliders (2 queens, 2 rooks, 2 bishops) can never deliver a legal double check
    const bothNonSliders =
      (t1 === "p" || t1 === "n") && (t2 === "p" || t2 === "n");
    const duplicateSliders =
      (t1 === "q" && t2 === "q") ||
      (t1 === "r" && t2 === "r") ||
      (t1 === "b" && t2 === "b");
    if (bothNonSliders || duplicateSliders) {
      return {
        isValid: false,
        reason: "Invalid position: Impossible simultaneous double check",
        eligibleCastling,
        legalEpFiles,
      };
    }
  }

  return {
    isValid: true,
    reason: null,
    eligibleCastling,
    legalEpFiles,
  };
}
