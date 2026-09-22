import React from 'react';
import { MoveTree, MoveNode } from '../lib/moveTree';

interface MoveListProps {
  tree: MoveTree;
  currentNodeId: string | null;
  onMoveClick: (nodeId: string) => void;
  selectedMoves: Set<string>;
  onToggleMove: (nodeId: string) => void;
  onSetSelectedMoves?: (moves: Set<string>) => void;
  usePieceIcons?: boolean;
}

const pieceIconMapWhite: Record<string, string> = { N: '?', B: '?', R: '?', Q: '?', K: '?' };
const pieceIconMapBlack: Record<string, string> = { N: '?', B: '?', R: '?', Q: '?', K: '?' };

const formatSan = (san: string, color: 'w'|'b', useIcons: boolean) => {
  if (!useIcons || !san) return san;
  const map = color === 'w' ? pieceIconMapWhite : pieceIconMapBlack;
  if (['N', 'B', 'R', 'Q', 'K'].includes(san[0])) {
    return map[san[0]] + san.slice(1);
  }
  return san;
};

export function MoveList({ tree, currentNodeId, onMoveClick, selectedMoves, onToggleMove, onSetSelectedMoves, usePieceIcons = false }: MoveListProps) {
  if (tree.rootIds.length === 0) {
    return <div className="text-gray-500 text-sm p-4 text-center h-full flex items-center justify-center">Play a move to start recording...</div>;
  }

  type Row = { moveNumber: number, label: string, depth: number, whiteNode?: MoveNode, blackNode?: MoveNode, allIds: string[] };
  const rows: Row[] = [];
  const allNodeIds = new Set<string>();

  function traceLine(startNodeId: string, labelPrefix: string) {
    let currId: string | undefined = startNodeId;
    let currentRow: Row | null = null;
    
    const depth = labelPrefix ? labelPrefix.split('.').length : 0;

    while (currId) {
      const node: MoveNode = tree.nodes[currId];
      if (!node) break;
      allNodeIds.add(node.id);
      
      const label = labelPrefix ? `${node.moveNumber}.${labelPrefix}` : `${node.moveNumber}`;

      if (node.turn === 'w') {
        currentRow = {
           moveNumber: node.moveNumber,
           label: label,
           depth: depth,
           whiteNode: node,
           allIds: [node.id]
        };
        rows.push(currentRow);
      } else {
        if (!currentRow || currentRow.blackNode) {
           currentRow = {
             moveNumber: node.moveNumber,
             label: label,
             depth: depth,
             blackNode: node,
             allIds: [node.id]
           };
           rows.push(currentRow);
        } else {
           currentRow.blackNode = node;
           currentRow.allIds.push(node.id);
        }
      }
      
      // Process variations recursively
      for (let i = 1; i < node.childrenIds.length; i++) {
         const newPrefix = labelPrefix ? `${labelPrefix}.${i}` : `${i}`;
         traceLine(node.childrenIds[i], newPrefix);
      }
      
      // Continue main line
      currId = node.childrenIds.length > 0 ? node.childrenIds[0] : undefined;
    }
  }

  // Start from roots
  for (let i = 0; i < tree.rootIds.length; i++) {
    traceLine(tree.rootIds[i], i === 0 ? "" : `${i}`);
  }

  const isAllSelected = allNodeIds.size > 0 && Array.from(allNodeIds).every(id => selectedMoves.has(id));

  const toggleAll = () => {
    if (onSetSelectedMoves) {
      if (isAllSelected) {
        onSetSelectedMoves(new Set());
      } else {
        onSetSelectedMoves(new Set(allNodeIds));
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full text-[13px] bg-[#1f1d1b] overflow-hidden">
      {/* Header */}
      <div className="flex items-center text-[10px] font-bold tracking-wider text-[#8b8986] px-4 py-2 border-b border-[#302e2b] bg-[#1a1917] sticky top-0 z-10 uppercase">
        <div className="w-[60px] shrink-0 flex items-center justify-center">
          <div 
            className="w-4 h-4 rounded-[4px] border border-[#3c3a38] flex items-center justify-center cursor-pointer transition-colors hover:border-[#8b8986] bg-[#1a1917]"
            onClick={toggleAll}
          >
            {isAllSelected && (
              <div className="w-full h-full bg-[#7fa650] rounded-[3px] flex items-center justify-center">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex justify-center"><div className="w-[80px] text-center">White</div></div>
        <div className="flex-1 flex justify-center"><div className="w-[80px] text-center">Black</div></div>
      </div>
      
      {/* Move Rows */}
      <div className="flex flex-col w-full p-2 gap-1 overflow-y-auto">
        {rows.map((row, idx) => {
          const isWhiteActive = row.whiteNode?.id === currentNodeId;
          const isBlackActive = row.blackNode?.id === currentNodeId;
          const isRowActive = isWhiteActive || isBlackActive;
          
          const isChecked = row.allIds.length > 0 && row.allIds.every(id => selectedMoves.has(id));

          return (
            <div 
              key={idx} 
              className={`relative flex items-center h-10 px-2 rounded-md border transition-colors
                ${isChecked ? 'border-[#6a9043] bg-[#22261d]' : 'border-[#302e2b] bg-[#1a1917]'}
              `}
              style={{ marginLeft: `${row.depth * 12}px` }}
            >
              {/* Active Marker (Thick left green border) */}
              {isRowActive && (
                <div className="absolute left-[-1px] top-[10%] bottom-[10%] w-[4px] bg-[#7fa650] rounded-r-md"></div>
              )}

              {/* Checkbox */}
              <div className="w-[30px] shrink-0 flex items-center justify-center">
                <div 
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors
                    ${isChecked ? 'border-[#7fa650] bg-[#7fa650]' : 'border-[#3c3a38] bg-transparent hover:border-[#8b8986]'}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSetSelectedMoves) {
                      const newSet = new Set(selectedMoves);
                      if (isChecked) {
                        row.allIds.forEach(id => newSet.delete(id));
                      } else {
                        row.allIds.forEach(id => newSet.add(id));
                      }
                      onSetSelectedMoves(newSet);
                    } else {
                      row.allIds.forEach(id => onToggleMove(id));
                    }
                  }}
                >
                  {isChecked && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
              </div>

              {/* Move Number Badge */}
              <div className="w-[30px] shrink-0 flex items-center justify-center">
                <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold 
                  ${isChecked ? 'bg-[#313c23] text-[#7fa650]' : 'bg-[#2b2927] text-[#8b8986]'}`}
                >
                  {row.label}
                </div>
              </div>
              
              {/* White Move */}
              <div className="flex-1 flex items-center justify-center gap-2 cursor-pointer" onClick={() => row.whiteNode && onMoveClick(row.whiteNode.id)}>
                <div className="w-[80px] flex items-center justify-between">
                  {row.whiteNode ? (
                    <>
                      <span className={`font-bold ${isWhiteActive ? 'text-white' : 'text-[#cfcdca]'}`}>{formatSan(row.whiteNode.san, 'w', usePieceIcons)}</span>
                      {row.whiteNode.eval !== undefined && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded
                          ${row.whiteNode.eval >= 0 ? 'text-[#81b64c]' : 'text-[#ca3431]'} bg-[#2b2927]
                        `}>
                          {row.whiteNode.eval > 0 ? '+' : ''}{row.whiteNode.eval.toFixed(1)}
                        </span>
                      )}
                    </>
                  ) : null}
                </div>
              </div>

              {/* Black Move */}
              <div className="flex-1 flex items-center justify-center gap-2 cursor-pointer" onClick={() => row.blackNode && onMoveClick(row.blackNode.id)}>
                <div className="w-[80px] flex items-center justify-between">
                  {row.blackNode ? (
                    <>
                      <span className={`font-bold ${isBlackActive ? 'text-white' : 'text-[#cfcdca]'}`}>{formatSan(row.blackNode.san, 'b', usePieceIcons)}</span>
                      {row.blackNode.eval !== undefined && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded
                          ${row.blackNode.eval >= 0 ? 'text-[#81b64c]' : 'text-[#ca3431]'} bg-[#2b2927]
                        `}>
                          {row.blackNode.eval > 0 ? '+' : ''}{row.blackNode.eval.toFixed(1)}
                        </span>
                      )}
                    </>
                  ) : null}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
