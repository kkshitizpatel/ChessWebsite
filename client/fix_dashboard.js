const fs = require('fs');

const fullCode = `"use client";

import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import {
  Target, Brain, SlidersHorizontal, ArrowUpDown,
  Crosshair, PenTool, RotateCcw, Trash2, Edit3,
  SkipBack, ArrowLeft, ArrowRight, SkipForward,
  Settings
} from "lucide-react";
import { Engine } from "../lib/engine";
import { MoveTree, MoveNode, createEmptyTree, parsePgnToTree, addMoveToTree } from "../lib/moveTree";
import { MoveList } from "./MoveList";
import { BOARD_THEMES } from "./VisualSettingsModal";

const ChessDashboard = forwardRef(function ChessDashboard(
  { boardTheme = "green", pieceStyle = "cburnett" }: { boardTheme?: string, pieceStyle?: string }, 
  ref: React.Ref<{ loadPgnExternal: (pgn: string) => void }>
) {

  // -- Chess instance lives in a ref so mutations are always fresh --
  const chessRef = useRef(new Chess());

  // -- FEN string in state ? triggers re-render on every move --
  const [fen, setFen] = useState<string>(() => chessRef.current.fen());
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [showSettings, setShowSettings] = useState(false);
  const [usePieceIcons, setUsePieceIcons] = useState(false);
  const [computerLevel, setComputerLevel] = useState(6);
  const [showBestMoveArrow, setShowBestMoveArrow] = useState(false);
  
  const [isCheck, setIsCheck] = useState(false);
  const [gameStatus, setGameStatus] = useState("active");
  const [whitePlayer, setWhitePlayer] = useState({ name: "White Player", rating: "1500" });
  const [blackPlayer, setBlackPlayer] = useState({ name: "Black Player", rating: "1500" });

  const [pgnInput, setPgnInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [importError, setImportError] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiModel, setAiModel] = useState("Gemini Flash");
  const [explanationLanguage, setExplanationLanguage] = useState("English");
  const [langSearch, setLangSearch] = useState("English");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  // Dummy analytics for the footer
  const [analysisReport, setAnalysisReport] = useState<any>(null);

  const filteredLangs = ["English", "Hindi", "Spanish", "French"].filter(l => l.toLowerCase().includes(langSearch.toLowerCase()));

  // -- Custom Move Tree --
  const [moveTree, setMoveTree] = useState<MoveTree>(createEmptyTree());
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [selectedMoves, setSelectedMoves] = useState<Set<string>>(new Set());

  // Refs for callbacks
  const moveTreeRef = useRef(moveTree);
  const currentNodeIdRef = useRef(currentNodeId);
  const engineRef = useRef<Engine | null>(null);
  const moveListRef = useRef<HTMLDivElement>(null);
  const loadPgnRef = useRef<((pgn: string) => void) | null>(null);

  useEffect(() => { moveTreeRef.current = moveTree; }, [moveTree]);
  useEffect(() => { currentNodeIdRef.current = currentNodeId; }, [currentNodeId]);

  // Init Stockfish once
  useEffect(() => {
    engineRef.current = new Engine();
    engineRef.current.init();
    return () => {
      if (engineRef.current) engineRef.current.quit();
    };
  }, []);

  // Material evaluation
  const [whiteCaptured, setWhiteCaptured] = useState<string[]>([]);
  const [blackCaptured, setBlackCaptured] = useState<string[]>([]);
  const [materialDiff, setMaterialDiff] = useState(0);

  useEffect(() => {
    const boardStr = fen.split(' ')[0];
    const startingCounts: Record<string, number> = { 'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1, 'P': 8, 'N': 2, 'B': 2, 'R': 2, 'Q': 1 };
    const values: Record<string, number> = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9 };
    const currentCounts: Record<string, number> = {};
    let whiteScore = 0;
    let blackScore = 0;
    for (const char of boardStr) {
      if (startingCounts[char]) {
        currentCounts[char] = (currentCounts[char] || 0) + 1;
        if (char === char.toUpperCase()) whiteScore += values[char];
        else blackScore += values[char];
      }
    }
    
    const wCap: string[] = [];
    const bCap: string[] = [];
    for (const [piece, count] of Object.entries(startingCounts)) {
      const current = currentCounts[piece] || 0;
      for (let i = 0; i < count - current; i++) {
        if (piece === piece.toUpperCase()) wCap.push(piece.toLowerCase());
        else bCap.push(piece);
      }
    }
    
    setWhiteCaptured(wCap);
    setBlackCaptured(bCap);
    setMaterialDiff(whiteScore - blackScore);
  }, [fen]);

  const goToMove = useCallback((nodeId: string | null) => {
    if (!nodeId) {
      chessRef.current.reset();
    } else {
      const node = moveTreeRef.current.nodes[nodeId];
      if (node) chessRef.current.load(node.fen);
    }
    setCurrentNodeId(nodeId);
    setFen(chessRef.current.fen());
    
    // Status update
    setIsCheck(chessRef.current.inCheck());
    if (chessRef.current.isCheckmate()) setGameStatus("checkmate");
    else if (chessRef.current.isStalemate()) setGameStatus("stalemate");
    else if (chessRef.current.isDraw()) setGameStatus("draw");
    else setGameStatus("active");
  }, []);

  const loadPgn = useCallback((pgnString: string) => {
    try {
      setImportError("");
      const tree = parsePgnToTree(pgnString);
      setMoveTree(tree);
      
      let lastNodeId: string | null = null;
      if (tree.rootIds.length > 0) {
        let curr = tree.rootIds[0];
        while (curr) {
          lastNodeId = curr;
          const children = tree.nodes[curr].childrenIds;
          if (children && children.length > 0) curr = children[0];
          else break;
        }
      }
      
      goToMove(lastNodeId);
      
      const tempChess = new Chess();
      tempChess.loadPgn(pgnString);
      const headers = tempChess.header();
      setWhitePlayer({
        name: headers?.White && headers.White !== "?" ? headers.White : "White Player",
        rating: headers?.WhiteElo && headers.WhiteElo !== "?" ? headers.WhiteElo : "1500"
      });
      setBlackPlayer({
        name: headers?.Black && headers.Black !== "?" ? headers.Black : "Black Player",
        rating: headers?.BlackElo && headers.BlackElo !== "?" ? headers.BlackElo : "1500"
      });
      setPgnInput("");
      setLinkInput("");
    } catch (err: any) {
      setImportError(err.message || "Failed to load PGN");
    }
  }, [goToMove]);

  loadPgnRef.current = loadPgn;
  useImperativeHandle(ref, () => ({ loadPgnExternal: loadPgn }));

  const handlePgnPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPgnInput(val);
    if (val.length > 10) loadPgn(val);
  };

  const handleLinkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLinkInput(val);
    if (!val.includes("lichess.org") && !val.includes("chess.com")) return;
    
    setIsImporting(true);
    setImportError("");
    setAiResponse("Fetching game from URL...");
    try {
      let pgn = "";
      
      if (val.includes("lichess.org/")) {
        const parts = val.split("/");
        let gameId = parts[parts.length - 1].split("#")[0];
        if (['black', 'white'].includes(gameId)) gameId = parts[parts.length - 2];
        const res = await fetch(\`https://lichess.org/game/export/\${gameId}\`);
        if (res.ok) {
          pgn = await res.text();
        } else {
          throw new Error("Failed to fetch from Lichess");
        }
      } else if (val.includes("chess.com/game/live/")) {
        // Just fail gracefully for chess.com if it requires puppeteer
        throw new Error("Chess.com import not fully supported yet");
      }
      
      if (pgn) loadPgn(pgn);
      setAiResponse("");
    } catch (err: any) {
      setImportError(err.message);
      setAiResponse("");
    } finally {
      setIsImporting(false);
    }
  };

  const clearBoard = useCallback(() => {
    chessRef.current.clear();
    setFen(chessRef.current.fen());
    setMoveTree(createEmptyTree());
    setCurrentNodeId(null);
    setGameStatus("active");
    setWhitePlayer({ name: "White Player", rating: "1500" });
    setBlackPlayer({ name: "Black Player", rating: "1500" });
    setAiResponse("");
    setShowSettings(false);
  }, []);

  const resetBoard = useCallback(() => {
    chessRef.current.reset();
    setFen(chessRef.current.fen());
    setMoveTree(createEmptyTree());
    setCurrentNodeId(null);
    setGameStatus("active");
    setWhitePlayer({ name: "White Player", rating: "1500" });
    setBlackPlayer({ name: "Black Player", rating: "1500" });
    setAiResponse("");
    setShowSettings(false);
  }, []);

  const makeAMove = useCallback(
    (move: { from: string; to: string; promotion?: string }) => {
      try {
        const result = chessRef.current.move(move);
        if (!result) return null;
        const newFen = chessRef.current.fen();
        
        const turn = chessRef.current.turn() === 'w' ? 'b' : 'w';
        
        let moveNum = 1;
        if (currentNodeIdRef.current) {
          const parentNode = moveTreeRef.current.nodes[currentNodeIdRef.current];
          if (parentNode) {
            moveNum = parentNode.turn === 'b' ? parentNode.moveNumber + 1 : parentNode.moveNumber;
          }
        }
        
        const { newTree, newNodeId } = addMoveToTree(
          moveTreeRef.current,
          currentNodeIdRef.current,
          result.san,
          newFen,
          moveNum,
          turn
        );
        
        setMoveTree(newTree);
        setCurrentNodeId(newNodeId);
        setFen(newFen);
        
        // Update Game Status
        setIsCheck(chessRef.current.inCheck());
        if (chessRef.current.isCheckmate()) {
          setGameStatus("checkmate");
        } else if (chessRef.current.isStalemate()) {
          setGameStatus("stalemate");
        } else if (chessRef.current.isDraw()) {
          setGameStatus("draw");
        } else {
          setGameStatus("active");
        }
        return result;
      } catch (e) {
        return null;
      }
    },
    []
  );

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: any) => {
      return makeAMove({ from: sourceSquare, to: targetSquare, promotion: "q" }) !== null;
    },
    [makeAMove]
  );

  const toggleMoveSelection = useCallback((nodeId: string) => {
    setSelectedMoves(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col xl:flex-row h-screen bg-[#111111] text-gray-200 overflow-hidden font-sans">
      
      {/* ----------- COLUMN 1: Chessboard ----------- */}
      <div className="flex-1 flex flex-col h-full relative">
        <div className="absolute top-4 right-4 z-50">
          <div className="relative">
            <button 
              onClick={() => setShowSettings(s => !s)} 
              className={\`w-8 h-8 rounded-full border border-surface-border flex items-center justify-center hover:bg-surface-elevated transition \${showSettings ? "text-white bg-surface-elevated" : "text-gray-400 hover:text-white"}\`}
              title="Settings"
            >
              <Settings size={16}/>
            </button>
            {showSettings && (
              <div className="absolute top-[calc(100%+8px)] right-0 w-[270px] bg-[#f5f5f5] text-gray-800 rounded-lg shadow-2xl z-50 border border-gray-300 overflow-hidden">
                <div className="p-3 bg-white border-b border-gray-200">
                  <label className="text-xs font-bold text-gray-500 block mb-2 text-center tracking-widest uppercase">Computer Level</label>
                  <div className="flex justify-between px-1 mb-1 text-xs font-semibold text-gray-700">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={computerLevel}
                    onChange={e => {
                      const lvl = Number(e.target.value);
                      setComputerLevel(lvl);
                      engineRef.current?.setSkillLevel(Math.round((lvl - 1) * 2.2));
                    }}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <p className="text-center text-xs text-gray-500 mt-1">Level: <strong>{computerLevel}</strong></p>
                </div>
                <div className="py-2 px-4 bg-white border-b border-gray-200 flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={showBestMoveArrow}
                      onChange={(e) => setShowBestMoveArrow(e.target.checked)}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm font-semibold">Show best move arrow</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={usePieceIcons}
                      onChange={(e) => setUsePieceIcons(e.target.checked)}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm font-semibold">Piece Notation (Icons)</span>
                  </label>
                </div>
                <div className="py-1">
                  <button onClick={() => { setBoardOrientation(o => o === "white" ? "black" : "white"); setShowSettings(false); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 text-sm w-full text-left transition">
                    <ArrowUpDown size={15} className="text-gray-500"/> Flip Board
                  </button>
                  <button onClick={resetBoard} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 text-sm w-full text-left transition">
                    <RotateCcw size={15} className="text-gray-500"/> Starting Position
                  </button>
                  <button onClick={clearBoard} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 text-sm w-full text-left transition">
                    <Trash2 size={15} className="text-gray-500"/> Clear Board
                  </button>
                  <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 text-sm w-full text-left transition text-primary">
                    <PenTool size={15} className="text-gray-500"/> Board Editor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-[800px] aspect-square">
            <Chessboard 
              position={fen} 
              onPieceDrop={onPieceDrop}
              boardOrientation={boardOrientation}
              customBoardStyle={{
                borderRadius: '4px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>
        </div>
      </div>

      {/* ----------- COLUMN 2: Move List ----------- */}
      <div className="hidden lg:flex w-[300px] xl:w-[330px] flex-col border-l border-surface-border bg-surface shrink-0">
        <div className="bg-surface-elevated text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 border-b border-surface-border shrink-0 flex justify-between">
          <span>Move List</span>
          <button onClick={() => goToMove(null)} className="hover:text-white"><SkipBack size={14}/></button>
        </div>
        
        <div ref={moveListRef} className="flex-1 overflow-y-auto bg-[#1a1a1a]">
          <MoveList 
            tree={moveTree} 
            currentNodeId={currentNodeId} 
            onMoveClick={goToMove} 
            selectedMoves={selectedMoves} 
            onToggleMove={toggleMoveSelection}
            onSetSelectedMoves={setSelectedMoves}
            usePieceIcons={usePieceIcons}
          />
        </div>
      </div>

      {/* ----------- COLUMN 3: AI Explanation ----------- */}
      <div className="hidden lg:flex flex-1 min-w-[260px] max-w-[400px] flex-col gap-3 p-3 bg-surface border-l border-surface-border">
        
        <div className="flex-1 bg-surface-elevated border border-surface-border rounded-md flex flex-col overflow-hidden">
          <div className="bg-surface-elevated px-3 py-2 border-b border-surface-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <Brain size={16} className="text-primary"/>
              <span className="text-sm font-bold">AI Explanation</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <select 
                className="bg-surface border border-surface-border text-[11px] text-gray-300 rounded px-1.5 py-0.5 outline-none"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
              >
                <option value="Gemini Flash">Gemini Flash</option>
                <option value="Llama 3">Llama 3</option>
              </select>

              {/* Searchable Language Picker */}
              <div className="relative">
                <input
                  type="text"
                  value={langSearch}
                  onChange={e => { setLangSearch(e.target.value); setShowLangDropdown(true); }}
                  onFocus={() => setShowLangDropdown(true)}
                  onBlur={() => setTimeout(() => setShowLangDropdown(false), 150)}
                  placeholder="Language..."
                  className="bg-surface border border-surface-border text-[11px] text-gray-300 rounded px-1.5 py-0.5 outline-none w-[90px] focus:border-primary"
                />
                {showLangDropdown && filteredLangs.length > 0 && (
                  <div className="absolute top-full right-0 mt-0.5 w-[160px] bg-[#1e1e1e] border border-surface-border rounded shadow-xl z-50 max-h-[180px] overflow-y-auto">
                    {filteredLangs.map(lang => (
                      <button
                        key={lang}
                        className={\`w-full text-left px-2.5 py-1.5 text-[11px] hover:bg-primary/20 transition \${lang === explanationLanguage ? "text-primary font-bold bg-primary/10" : "text-gray-300"}\`}
                        onMouseDown={() => {
                          setExplanationLanguage(lang);
                          setLangSearch(lang);
                          setShowLangDropdown(false);
                        }}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="flex items-center gap-1 bg-surface border border-surface-border hover:bg-surface-border text-gray-300 px-2 py-0.5 rounded text-[11px] transition">
                <Edit3 size={11}/> Notes
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed text-gray-300">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-primary animate-pulse">
                <Brain size={32}/>
                <p className="font-bold text-sm">Analyzing selected moves...</p>
              </div>
            ) : aiResponse ? (
              <div className="whitespace-pre-wrap text-sm">{aiResponse}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 gap-3">
                <Crosshair size={28} className="text-gray-600"/>
                <p className="text-sm">Select moves using checkboxes, then click <strong className="text-gray-300">Start Analysis</strong> for AI explanation.</p>
              </div>
            )}
          </div>
        </div>

        {/* FEN / PGN / Link */}
        <div className="bg-surface-elevated border border-surface-border rounded-md p-3 flex flex-col gap-2.5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 w-8">FEN</span>
            <input 
              type="text" 
              value={fen} 
              onChange={e => setFen(e.target.value)}
              onClick={e => (e.target as HTMLInputElement).select()} 
              className="flex-1 bg-surface border border-surface-border rounded px-2 py-1 text-[10px] font-mono text-gray-300 outline-none cursor-text focus:border-primary" 
              title="Click to select or paste new FEN"
            />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[10px] font-bold text-gray-400 w-8 pt-1">PGN</span>
            <textarea 
              value={pgnInput}
              onChange={handlePgnPaste}
              placeholder="Paste PGN here to load game..." 
              className="flex-1 bg-surface border border-surface-border rounded px-2 py-1 text-[10px] font-mono text-gray-300 outline-none focus:border-primary resize-none min-h-[44px]"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 w-8">LINK</span>
            <input 
              type="text" 
              value={linkInput}
              onChange={handleLinkImport}
              disabled={isImporting}
              placeholder={isImporting ? "Importing..." : "Paste chess.com / lichess link..."} 
              className={\`flex-1 bg-surface border border-surface-border rounded px-2 py-1 text-[10px] font-mono text-gray-300 outline-none focus:border-primary \${isImporting ? "opacity-50" : ""}\`}
            />
          </div>
          {importError && (
            <div className="text-red-400 text-[10px] font-bold mt-1 text-center bg-red-900/20 py-1 rounded">
              ?? {importError}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
});

export default ChessDashboard;
`

fs.writeFileSync('src/components/ChessDashboard.tsx', fullCode, 'utf8');
console.log('Fixed ChessDashboard.tsx successfully!');
