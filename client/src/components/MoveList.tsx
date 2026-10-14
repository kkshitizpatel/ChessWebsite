import React from 'react';
import { MoveTree, MoveNode, MoveQuality } from '../lib/moveTree';
import { MOVE_QUALITY_CONFIG } from '../lib/moveAnalysisDispatcher';

interface MoveListProps {
  tree: MoveTree;
  currentNodeId: string | null;
  onMoveClick: (nodeId: string) => void;
  selectedMoves: Set<string>;
  onToggleMove: (nodeId: string) => void;
  onSetSelectedMoves?: (moves: Set<string>) => void;
  usePieceIcons?: boolean;
}

const pieceIconMapWhite: Record<string, string> = { N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔' };
const pieceIconMapBlack: Record<string, string> = { N: '♞', B: '♝', R: '♜', Q: '♛', K: '♚' };

const formatSan = (san: string, color: 'w' | 'b', useIcons: boolean) => {
  if (!useIcons || !san) return san;
  const map = color === 'w' ? pieceIconMapWhite : pieceIconMapBlack;
  if (['N', 'B', 'R', 'Q', 'K'].includes(san[0])) {
    return map[san[0]] + san.slice(1);
  }
  return san;
};

export function MoveQualityBadge({
  quality,
  size = 'sm',
}: {
  quality: MoveQuality;
  size?: 'sm' | 'md' | 'lg';
}) {
  const cfg = MOVE_QUALITY_CONFIG[quality];
  if (!cfg) return null;

  const dims =
    size === 'lg'
      ? 'w-[22px] h-[22px] text-[11px]'
      : size === 'md'
      ? 'w-[20px] h-[20px] text-[10px]'
      : 'w-[16px] h-[16px] text-[9px]';

  return (
    <span
      title={cfg.label}
      className={`inline-flex items-center justify-center rounded-full font-extrabold leading-none shrink-0 shadow-sm select-none ${dims} ${cfg.badgeBgClass}`}
    >
      {cfg.symbol}
    </span>
  );
}

type MoveRowItem = {
  key: string;
  moveNumber: number;
  displayLabel: string;
  depth: number;
  isVariationStart: boolean;
  whiteNode?: MoveNode;
  blackNode?: MoveNode;
  allIds: string[];
};

/**
 * Builds hierarchical move rows from a MoveTree with Legal Outline variation numbering.
 * - Main line rows (depth = 0) use integer move numbers (1, 2, 3...).
 * - Alternative branches (variations) at depth 1 use legal outline numbering (1.1, 1.2, 1.3...).
 * - Nested variations at depth 2 use 3-level outline numbering (1.1.1, 1.1.2...).
 */
function buildLichessVariationRows(tree: MoveTree): {
  rows: MoveRowItem[];
  allNodeIds: Set<string>;
} {
  const rows: MoveRowItem[] = [];
  const allNodeIds = new Set<string>();

  function emitLine(
    startNodeId: string,
    depth: number,
    siblingAlternativeIds: string[] = [],
    outlinePrefix: string = ''
  ) {
    let currId: string | undefined = startNodeId;
    let isFirstRowOfBranch = depth > 0;
    let pendingWhiteVariations: string[] = [...siblingAlternativeIds];
    let stepCounter = 1;
    const currentPrefix = depth === 0 ? '' : outlinePrefix || '1';

    while (currId) {
      const node: MoveNode | undefined = tree.nodes[currId];
      if (!node) break;
      allNodeIds.add(node.id);

      if (node.turn === 'w') {
        const wNode: MoveNode = node;
        const mainBlackId: string | undefined =
          wNode.childrenIds.length > 0 ? wNode.childrenIds[0] : undefined;
        const bNode: MoveNode | undefined = mainBlackId
          ? tree.nodes[mainBlackId]
          : undefined;
        const blackVariations: string[] =
          wNode.childrenIds.length > 1 ? wNode.childrenIds.slice(1) : [];

        // If there are alternative White moves (siblings of wNode) and wNode also has a Black reply,
        // emit the full row (wNode + bNode) and then render the White variations & Black variations below it
        // in Lichess sub-tree order.
        const rowIds = [wNode.id];
        if (bNode) {
          allNodeIds.add(bNode.id);
          rowIds.push(bNode.id);
        }

        const displayLabel =
          depth === 0 ? `${wNode.moveNumber}` : `${currentPrefix}.${stepCounter}`;
        const thisRowLabel = displayLabel;
        stepCounter++;

        rows.push({
          key: `${wNode.id}-${bNode?.id || 'none'}-d${depth}`,
          moveNumber: wNode.moveNumber,
          displayLabel,
          depth,
          isVariationStart: isFirstRowOfBranch,
          whiteNode: wNode,
          blackNode: bNode,
          allIds: rowIds,
        });
        isFirstRowOfBranch = false;

        // 1. Render any alternative White moves that branched at wNode's ply
        if (pendingWhiteVariations.length > 0) {
          for (const varWhiteId of pendingWhiteVariations) {
            const childPrefix = depth === 0 ? `${wNode.moveNumber}` : thisRowLabel;
            emitLine(varWhiteId, depth + 1, [], childPrefix);
          }
          pendingWhiteVariations = [];
        }

        // 2. Render any alternative Black replies to wNode (e.g. 1... f6 2. g3 g6)
        if (blackVariations.length > 0) {
          for (const varBlackId of blackVariations) {
            const childPrefix = depth === 0 ? `${wNode.moveNumber}` : thisRowLabel;
            emitLine(varBlackId, depth + 1, [], childPrefix);
          }
        }

        // 3. Advance to the next full move after bNode
        if (bNode && bNode.childrenIds.length > 0) {
          currId = bNode.childrenIds[0];
          pendingWhiteVariations =
            bNode.childrenIds.length > 1 ? bNode.childrenIds.slice(1) : [];
        } else {
          currId = undefined;
        }
      } else {
        // Line or variation starts on a Black half-move (e.g. "1... f6")
        const bNode = node;
        const displayLabel =
          depth === 0 ? `${bNode.moveNumber}...` : `${currentPrefix}.${stepCounter}`;
        const thisRowLabel = displayLabel;
        stepCounter++;

        rows.push({
          key: `bstart-${bNode.id}-d${depth}`,
          moveNumber: bNode.moveNumber,
          displayLabel,
          depth,
          isVariationStart: isFirstRowOfBranch,
          whiteNode: undefined,
          blackNode: bNode,
          allIds: [bNode.id],
        });
        isFirstRowOfBranch = false;

        // Render any alternative Black siblings if passed in
        if (pendingWhiteVariations.length > 0) {
          for (const varBlackId of pendingWhiteVariations) {
            const childPrefix = depth === 0 ? `${bNode.moveNumber}` : thisRowLabel;
            emitLine(varBlackId, depth + 1, [], childPrefix);
          }
          pendingWhiteVariations = [];
        }

        if (bNode.childrenIds.length > 0) {
          currId = bNode.childrenIds[0];
          pendingWhiteVariations =
            bNode.childrenIds.length > 1 ? bNode.childrenIds.slice(1) : [];
        } else {
          currId = undefined;
        }
      }
    }
  }

  if (tree.rootIds.length > 0) {
    emitLine(tree.rootIds[0], 0, tree.rootIds.slice(1), '');
  }

  return { rows, allNodeIds };
}

export function MoveList({
  tree,
  currentNodeId,
  onMoveClick,
  selectedMoves,
  onToggleMove,
  onSetSelectedMoves,
  usePieceIcons = false,
}: MoveListProps) {
  if (tree.rootIds.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-4 text-center h-full flex items-center justify-center">
        Play a move to start recording...
      </div>
    );
  }

  const { rows, allNodeIds } = buildLichessVariationRows(tree);

  const isAllSelected =
    allNodeIds.size > 0 &&
    Array.from(allNodeIds).every((id) => selectedMoves.has(id));

  const toggleAll = () => {
    if (onSetSelectedMoves) {
      if (isAllSelected) {
        onSetSelectedMoves(new Set());
      } else {
        onSetSelectedMoves(new Set(allNodeIds));
      }
    }
  };

  const renderMoveCell = (
    node: MoveNode | undefined,
    color: 'w' | 'b',
    isActive: boolean,
    isBlackStartPlaceholder: boolean
  ) => {
    if (!node) {
      if (isBlackStartPlaceholder) {
        return (
          <div className="flex-1 flex items-center justify-center px-1 select-none">
            <span className="text-[#6b6966] font-mono text-xs tracking-widest">
              ...
            </span>
          </div>
        );
      }
      return <div className="flex-1" />;
    }

    const qualityCfg = node.quality ? MOVE_QUALITY_CONFIG[node.quality] : null;
    const sanColorClass = qualityCfg
      ? qualityCfg.textClass
      : isActive
      ? 'text-white'
      : 'text-[#cfcdca]';

    const evalDisplay =
      node.evalText !== undefined
        ? node.evalText
        : node.eval !== undefined
        ? `${node.eval > 0 ? '+' : ''}${node.eval.toFixed(1)}`
        : null;

    return (
      <div
        onClick={() => onMoveClick(node.id)}
        className={`flex-1 min-w-0 flex items-center justify-between gap-1 px-1.5 py-1 rounded cursor-pointer transition-colors ${
          isActive
            ? 'bg-[#2c3325] ring-1 ring-[#7fa650]/50'
            : 'hover:bg-[#262421]'
        }`}
      >
        <div className="flex items-center gap-1 min-w-0">
          <span className={`font-bold truncate ${sanColorClass}`}>
            {formatSan(node.san, color, usePieceIcons)}
          </span>
          {node.quality && (
            <MoveQualityBadge quality={node.quality} size="sm" />
          )}
        </div>
        {evalDisplay !== null && (
          <span
            className={`text-[9px] font-mono px-1 py-0.5 rounded shrink-0 ${
              (node.eval ?? 0) >= 0 ? 'text-[#81b64c]' : 'text-[#ca3431]'
            } bg-[#2b2927]`}
          >
            {evalDisplay}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full text-[13px] bg-[#1f1d1b] overflow-hidden">
      {/* 4.1 Header */}
      <div className="flex items-center text-[10px] font-bold tracking-wider text-[#8b8986] px-3 py-2 border-b border-[#302e2b] bg-[#1a1917] sticky top-0 z-10 uppercase shrink-0">
        <div className="w-[58px] shrink-0 flex items-center justify-start pl-1">
          <div
            className="w-4 h-4 rounded-[4px] border border-[#3c3a38] flex items-center justify-center cursor-pointer transition-colors hover:border-[#8b8986] bg-[#1a1917]"
            onClick={toggleAll}
            title="Select all moves"
          >
            {isAllSelected && (
              <div className="w-full h-full bg-[#7fa650] rounded-[3px] flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 text-center">White</div>
        <div className="flex-1 text-center">Black</div>
      </div>

      {/* 4.2 Move Rows & Lichess Variation Sub-Trees */}
      <div className="flex-1 min-h-0 flex flex-col w-full p-2 gap-1 overflow-y-auto">
        {rows.map((row) => {
          const isWhiteActive = row.whiteNode?.id === currentNodeId;
          const isBlackActive = row.blackNode?.id === currentNodeId;
          const isRowActive = isWhiteActive || isBlackActive;

          const isChecked =
            row.allIds.length > 0 &&
            row.allIds.every((id) => selectedMoves.has(id));

          const indentPx = Math.min(row.depth * 12, 48);
          const isVariation = row.depth > 0;

          return (
            <div
              key={row.key}
              style={{ marginLeft: `${indentPx}px` }}
              className={`relative flex items-center min-h-[38px] px-1.5 rounded-md border transition-colors ${
                isChecked
                  ? 'border-[#6a9043] bg-[#22261d]'
                  : isVariation
                  ? 'border-[#2c2a28] border-l-2 border-l-[#5c6454] bg-[#171614]'
                  : 'border-[#302e2b] bg-[#1a1917]'
              }`}
            >
              {/* Active Marker (Thick left green border) */}
              {isRowActive && (
                <div className="absolute left-[-1px] top-[10%] bottom-[10%] w-[4px] bg-[#7fa650] rounded-r-md" />
              )}

              {/* 4.3 Checkbox */}
              <div className="w-[26px] shrink-0 flex items-center justify-center">
                <div
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-[#7fa650] bg-[#7fa650]'
                      : 'border-[#3c3a38] bg-transparent hover:border-[#8b8986]'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSetSelectedMoves) {
                      const newSet = new Set(selectedMoves);
                      if (isChecked) {
                        row.allIds.forEach((id) => newSet.delete(id));
                      } else {
                        row.allIds.forEach((id) => newSet.add(id));
                      }
                      onSetSelectedMoves(newSet);
                    } else {
                      row.allIds.forEach((id) => onToggleMove(id));
                    }
                  }}
                >
                  {isChecked && (
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              </div>

              {/* Move Number Badge (Standard 1, 2, 3... or Legal Outline 1.1, 1.2..., 1.1.1...) */}
              <div className="w-[36px] min-w-[36px] shrink-0 flex items-center justify-center">
                <div
                  className={`px-1 py-0.5 rounded text-[10px] font-bold font-mono whitespace-nowrap ${
                    isChecked
                      ? 'bg-[#313c23] text-[#7fa650]'
                      : isVariation
                      ? 'bg-[#252422] text-[#a09e9b]'
                      : 'bg-[#2b2927] text-[#8b8986]'
                  }`}
                >
                  {row.displayLabel}
                </div>
              </div>

              {/* White Move Slot */}
              {renderMoveCell(
                row.whiteNode,
                'w',
                isWhiteActive,
                !row.whiteNode && Boolean(row.blackNode)
              )}

              {/* Black Move Slot */}
              {renderMoveCell(row.blackNode, 'b', isBlackActive, false)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
