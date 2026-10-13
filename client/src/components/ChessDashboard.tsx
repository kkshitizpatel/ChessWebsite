"use client";

import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import {
  Target, Brain, SlidersHorizontal, ArrowUpDown,
  Crosshair, PenTool, RotateCcw, Trash2, Edit3,
  SkipBack, ArrowLeft, ArrowRight, SkipForward, User, Hand
} from "lucide-react";
import { Engine } from "../lib/engine";
import { MoveTree, createEmptyTree, parsePgnToTree, addMoveToTree, exportTreeToPgn } from "../lib/moveTree";
import { MoveList } from "./MoveList";
import { BOARD_THEMES } from "./VisualSettingsModal";

const ChessDashboard = forwardRef(function ChessDashboard(
  { boardTheme = "green", pieceStyle = "cburnett", usePieceIcons = false, onTogglePieceIcons }: { boardTheme?: string, pieceStyle?: string, usePieceIcons?: boolean, onTogglePieceIcons?: () => void },
  ref: React.Ref<{ loadPgnExternal: (pgn: string) => void }>
) {

  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState<string>(() => chessRef.current.fen());
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [showSettings, setShowSettings] = useState(false);
  const [computerLevel, setComputerLevel] = useState(6);
  const [showBestMoveArrow, setShowBestMoveArrow] = useState(false);
  const [gameStatus, setGameStatus] = useState("active");
  const [whitePlayer, setWhitePlayer] = useState({ name: "White Player", rating: "1500" });
  const [blackPlayer, setBlackPlayer] = useState({ name: "Black Player", rating: "1500" });
  const [pgnInput, setPgnInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [importError, setImportError] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isAnalyzing] = useState(false);
  const [aiModel, setAiModel] = useState("Gemini Flash");
  const [explanationLanguage, setExplanationLanguage] = useState("English");
  const [langSearch, setLangSearch] = useState("English");
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const filteredLangs = ["English", "Hindi", "Spanish", "French"].filter(
    l => l.toLowerCase().includes(langSearch.toLowerCase())
  );

  const [moveTree, setMoveTree] = useState<MoveTree>(createEmptyTree());
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [selectedMoves, setSelectedMoves] = useState<Set<string>>(new Set());

  const moveTreeRef = useRef(moveTree);
  const currentNodeIdRef = useRef(currentNodeId);
  const engineRef = useRef<Engine | null>(null);
  const moveListRef = useRef<HTMLDivElement>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(400);

  useEffect(() => { moveTreeRef.current = moveTree; }, [moveTree]);
  useEffect(() => { currentNodeIdRef.current = currentNodeId; }, [currentNodeId]);

  const customPieces = React.useMemo(() => {
    const pieceIds = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
    const custom: any = {};
    pieceIds.forEach(p => {
      custom[p] = (props: any) => (
        <img style={{ width: '100%', height: '100%' }} src={`/pieces/${pieceStyle}/${p}.svg`} alt={p} />
      );
    });
    return custom;
  }, [pieceStyle]);

  // ResizeObserver - perfectly fit board to available space
  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setBoardWidth(Math.floor(Math.min(width, height)) - 4);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    engineRef.current = new Engine();
    return () => { if (engineRef.current) engineRef.current.quit(); };
  }, []);

  const [whiteCaptured, setWhiteCaptured] = useState<string[]>([]);
  const [blackCaptured, setBlackCaptured] = useState<string[]>([]);
  const [materialDiff, setMaterialDiff] = useState(0);

  useEffect(() => {
    const boardStr = fen.split(' ')[0];
    const startingCounts: Record<string, number> = { 'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1, 'P': 8, 'N': 2, 'B': 2, 'R': 2, 'Q': 1 };
    const currentCounts: Record<string, number> = {};
    let whiteScore = 0, blackScore = 0;
    const values: Record<string, number> = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9 };
    for (const char of boardStr) {
      if (startingCounts[char]) {
        currentCounts[char] = (currentCounts[char] || 0) + 1;
        if (char === char.toUpperCase()) whiteScore += values[char];
        else blackScore += values[char];
      }
    }
    const wCap: string[] = [], bCap: string[] = [];
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
    if (!nodeId) { chessRef.current.reset(); }
    else {
      const node = moveTreeRef.current.nodes[nodeId];
      if (node) chessRef.current.load(node.fen);
    }
    setCurrentNodeId(nodeId);
    setFen(chessRef.current.fen());
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
          if (children && children.length > 0) curr = children[0]; else break;
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
      setPgnInput(""); setLinkInput("");
    } catch (err: any) { setImportError(err.message || "Failed to load PGN"); }
  }, [goToMove]);

  useImperativeHandle(ref, () => ({ loadPgnExternal: loadPgn }));

  const handlePgnPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value; setPgnInput(val);
    if (val.length > 10) loadPgn(val);
  };

  const handleLinkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; setLinkInput(val);
    if (!val.includes("lichess.org") && !val.includes("chess.com")) return;
    setIsImporting(true); setImportError(""); setAiResponse("Fetching game...");
    try {
      let pgn = "";
      if (val.includes("lichess.org/")) {
        const parts = val.split("/");
        let gameId = parts[parts.length - 1].split("#")[0];
        if (['black', 'white'].includes(gameId)) gameId = parts[parts.length - 2];
        const res = await fetch(`https://lichess.org/game/export/${gameId}`);
        if (res.ok) pgn = await res.text(); else throw new Error("Failed to fetch from Lichess");
      }
      if (pgn) loadPgn(pgn); setAiResponse("");
    } catch (err: any) { setImportError(err.message); setAiResponse(""); }
    finally { setIsImporting(false); }
  };

  const clearBoard = useCallback(() => {
    chessRef.current.clear(); setFen(chessRef.current.fen());
    setMoveTree(createEmptyTree()); setCurrentNodeId(null); setGameStatus("active");
    setWhitePlayer({ name: "White Player", rating: "1500" });
    setBlackPlayer({ name: "Black Player", rating: "1500" });
    setAiResponse(""); setShowSettings(false);
  }, []);

  const resetBoard = useCallback(() => {
    chessRef.current.reset(); setFen(chessRef.current.fen());
    setMoveTree(createEmptyTree()); setCurrentNodeId(null); setGameStatus("active");
    setWhitePlayer({ name: "White Player", rating: "1500" });
    setBlackPlayer({ name: "Black Player", rating: "1500" });
    setAiResponse(""); setShowSettings(false);
  }, []);

  const makeAMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    try {
      const result = chessRef.current.move(move);
      if (!result) return null;
      const newFen = chessRef.current.fen();
      const turn = chessRef.current.turn() === 'w' ? 'b' : 'w';
      let moveNum = 1;
      if (currentNodeIdRef.current) {
        const parentNode = moveTreeRef.current.nodes[currentNodeIdRef.current];
        if (parentNode) moveNum = parentNode.turn === 'b' ? parentNode.moveNumber + 1 : parentNode.moveNumber;
      }
      const { newTree, newNodeId } = addMoveToTree(
        moveTreeRef.current, currentNodeIdRef.current, result.san, newFen, moveNum, turn
      );
      setMoveTree(newTree); setCurrentNodeId(newNodeId); setFen(newFen);
      if (chessRef.current.isCheckmate()) setGameStatus("checkmate");
      else if (chessRef.current.isStalemate()) setGameStatus("stalemate");
      else if (chessRef.current.isDraw()) setGameStatus("draw");
      else setGameStatus("active");
      return result;
    } catch (e) { return null; }
  }, []);

  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }: any) => {
    return makeAMove({ from: sourceSquare, to: targetSquare, promotion: "q" }) !== null;
  }, [makeAMove]);

  const toggleMoveSelection = useCallback((nodeId: string) => {
    setSelectedMoves(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
      return next;
    });
  }, []);

  const goToPreviousMove = useCallback(() => {
    if (!currentNodeId) return;
    const node = moveTree.nodes[currentNodeId];
    if (node) goToMove(node.parentId);
  }, [currentNodeId, moveTree, goToMove]);

  const goToNextMove = useCallback(() => {
    if (currentNodeId) {
      const node = moveTree.nodes[currentNodeId];
      if (node && node.childrenIds.length > 0) goToMove(node.childrenIds[0]);
    } else if (moveTree.rootIds.length > 0) {
      goToMove(moveTree.rootIds[0]);
    }
  }, [currentNodeId, moveTree, goToMove]);

  const goToEndMove = useCallback(() => {
    let curr: string | null = currentNodeId ? (moveTree.nodes[currentNodeId]?.childrenIds[0] || null) : (moveTree.rootIds[0] || null);
    let last: string | null = currentNodeId;
    while (curr) {
      last = curr;
      const node = moveTree.nodes[curr];
      curr = (node && node.childrenIds.length > 0) ? node.childrenIds[0] : null;
    }
    if (last !== currentNodeId) goToMove(last);
  }, [currentNodeId, moveTree, goToMove]);

  const [isPracticing, setIsPracticing] = useState(false);
  const [isAnalyzingLocal, setIsAnalyzingLocal] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const settingsPopupRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState<{ left: number; bottom: number }>({ left: 600, bottom: 12 });
  const [activeEditorTool, setActiveEditorTool] = useState<string>("w-hand");
  const [editorTurn, setEditorTurn] = useState<"w" | "b">("w");
  const [editorCastling, setEditorCastling] = useState<{ wK: boolean; wQ: boolean; bK: boolean; bQ: boolean }>({
    wK: true,
    wQ: true,
    bK: true,
    bQ: true,
  });
  const [editorEnPassant, setEditorEnPassant] = useState<string>("-");
  const [timeControlEnabled, setTimeControlEnabled] = useState<boolean>(false);
  const [selectedTimePreset, setSelectedTimePreset] = useState<string>("10 min");

  const updatePopupPos = useCallback(() => {
    if (settingsBtnRef.current) {
      const rect = settingsBtnRef.current.getBoundingClientRect();
      const left = Math.min(rect.right + 12, window.innerWidth - 344);
      const bottom = Math.max(window.innerHeight - rect.bottom, 12);
      setPopupPos({ left, bottom });
    }
  }, []);

  useEffect(() => {
    if (!showSettings) return;
    updatePopupPos();
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        settingsPopupRef.current && !settingsPopupRef.current.contains(target) &&
        settingsBtnRef.current && !settingsBtnRef.current.contains(target)
      ) {
        setShowSettings(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSettings(false);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePopupPos);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePopupPos);
    };
  }, [showSettings, updatePopupPos]);

  
  useEffect(() => {
    if (!isPracticing || !engineRef.current || gameStatus !== "active") return;
    const currentTurn = chessRef.current.turn() === 'w' ? 'white' : 'black';
    if (currentTurn !== boardOrientation) {
      const timer = setTimeout(async () => {
        const evalResult = await engineRef.current.evaluateFen(fen, computerLevel * 2); 
        const bestMove = evalResult.pv?.split(' ')[0];
        if (bestMove) {
          const from = bestMove.slice(0, 2);
          const to = bestMove.slice(2, 4);
          const promotion = bestMove.length > 4 ? bestMove[4] : undefined;
          makeAMove({ from, to, promotion });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [fen, isPracticing, boardOrientation, gameStatus, computerLevel, makeAMove]);

  const handleStartAnalysis = async () => {
    setIsAnalyzingLocal(true);
    setAiResponse("Evaluating position with Stockfish 18...");
    
    try {
      // 1. First get Stockfish evaluation
      let engineInfo = "";
      if (engineRef.current) {
        const evalResult = await engineRef.current.evaluateFen(fen, 14);
        const scoreStr = evalResult.isMate ? `Mate in ${Math.abs(evalResult.score)}` : `${(evalResult.score / 100).toFixed(2)}`;
        engineInfo = `Stockfish Eval: ${scoreStr} | Best Move: ${evalResult.pv ? evalResult.pv.split(' ')[0] : 'N/A'}`;
        setAiResponse(engineInfo + "\n\nGenerating AI explanation...");
      }

      // 2. Fetch AI Explanation
      const selectedArr = Array.from(selectedMoves);
      const moveSubset = selectedArr.length > 0 ? selectedArr.join(", ") : "Current Position";
      
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pgn: exportTreeToPgn(moveTreeRef.current, { white: whitePlayer.name, black: blackPlayer.name, date: new Date().toISOString().split("T")[0] }),
          selectedMoves: moveSubset,
          language: explanationLanguage,
          model: aiModel,
          engineInfo // Pass engine info to AI if the backend supports it, or just use it here
        })
      });
      
      const data = await res.json();
      if (data.explanation) {
        setAiResponse(`${engineInfo}\n\n${data.explanation}`);
      } else {
        setAiResponse(`${engineInfo}\n\nError: Could not get AI explanation.`);
      }
    } catch (err) {
      setAiResponse("Error during analysis. Please try again.");
    } finally {
      setIsAnalyzingLocal(false);
    }
  };

  // Chess piece unicode icons for captured pieces display
  const capIconMap: Record<string, string> = { 'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛' };

  return (
    <div className="flex h-full bg-[#111111] text-gray-200 overflow-hidden font-sans">

      {/* ===== COLUMN 1: CHESSBOARD ===== */}
      <div className="flex-1 flex flex-col min-w-0 px-6 py-4 min-h-0 overflow-hidden">

        {/* Black Player Header */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center shrink-0">
              <User size={15} className="text-gray-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-200">{blackPlayer.name}</span>
                <span className="text-[11px] text-gray-500 font-mono bg-surface-elevated px-1.5 py-0.5 rounded">{blackPlayer.rating}</span>
              </div>
              <div className="flex items-center gap-0.5 text-sm text-gray-400 min-h-[18px]">
                {whiteCaptured.map((p, i) => <span key={i}>{capIconMap[p] || p}</span>)}
                {materialDiff < 0 && <span className="ml-1 text-[11px] font-bold">+{Math.abs(materialDiff)}</span>}
              </div>
            </div>
          </div>
          <div className="bg-surface-elevated border border-surface-border rounded px-3 py-1 font-mono text-lg text-gray-200 shrink-0">10:00</div>
        </div>

        {/* Chess Board — fills remaining height, always square */}
        <div ref={boardContainerRef} className="flex-1 min-h-0 flex items-center justify-center relative">
          <div style={{ width: boardWidth, height: boardWidth, position: 'relative', flexShrink: 0 }}>
            <Chessboard
              options={{
                position: fen,
                onPieceDrop: onPieceDrop,
                boardOrientation: boardOrientation,
                darkSquareStyle: { backgroundColor: BOARD_THEMES[boardTheme]?.dark || '#779556' },
                lightSquareStyle: { backgroundColor: BOARD_THEMES[boardTheme]?.light || '#ebecd0' },
                pieces: customPieces,
                boardStyle: {
                  borderRadius: '4px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                }
              }}
            />
            {/* Eval Bar */}
            <div className="absolute -right-5 top-0 bottom-0 w-3 bg-[#2a2a2a] rounded overflow-hidden flex flex-col justify-end">
              <div className="w-full bg-gray-100 transition-all duration-500" style={{ height: '50%' }} />
            </div>
          </div>
        </div>

        {/* White Player Header */}
        <div className="flex items-center justify-between mt-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center shrink-0">
              <User size={15} className="text-gray-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-200">{whitePlayer.name}</span>
                <span className="text-[11px] text-gray-500 font-mono bg-surface-elevated px-1.5 py-0.5 rounded">{whitePlayer.rating}</span>
              </div>
              <div className="flex items-center gap-0.5 text-sm text-gray-400 min-h-[18px]">
                {blackCaptured.map((p, i) => <span key={i}>{capIconMap[p] || p}</span>)}
                {materialDiff > 0 && <span className="ml-1 text-[11px] font-bold">+{materialDiff}</span>}
              </div>
            </div>
          </div>
          <div className="bg-surface-elevated border border-surface-border rounded px-3 py-1 font-mono text-lg text-gray-200 shrink-0">10:00</div>
        </div>

        {/* Controls Bar */}
        <div className="mt-3 flex items-center justify-between bg-surface-elevated rounded-xl px-3 py-2 border border-surface-border shrink-0">
          <button
            onClick={() => setBoardOrientation(o => (o === "white" ? "black" : "white"))}
            className="w-[42px] h-[42px] flex items-center justify-center rounded-lg bg-surface/60 border border-surface-border/60 hover:bg-surface hover:border-surface-border text-gray-300 hover:text-white transition shrink-0"
            title="Flip board"
          >
            <ArrowUpDown size={22} strokeWidth={2} />
          </button>
          <button
            onClick={() => goToMove(null)}
            className="w-[42px] h-[42px] flex items-center justify-center rounded-lg bg-surface/60 border border-surface-border/60 hover:bg-surface hover:border-surface-border text-gray-300 hover:text-white transition shrink-0"
            title="Start"
          >
            <SkipBack size={22} strokeWidth={2} />
          </button>
          <button
            onClick={goToPreviousMove}
            className="w-[42px] h-[42px] flex items-center justify-center rounded-lg bg-surface/60 border border-surface-border/60 hover:bg-surface hover:border-surface-border text-gray-300 hover:text-white transition shrink-0"
            title="Back"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <button
            onClick={goToNextMove}
            className="w-[42px] h-[42px] flex items-center justify-center rounded-lg bg-surface/60 border border-surface-border/60 hover:bg-surface hover:border-surface-border text-gray-300 hover:text-white transition shrink-0"
            title="Forward"
          >
            <ArrowRight size={22} strokeWidth={2} />
          </button>
          <button
            onClick={goToEndMove}
            className="w-[42px] h-[42px] flex items-center justify-center rounded-lg bg-surface/60 border border-surface-border/60 hover:bg-surface hover:border-surface-border text-gray-300 hover:text-white transition shrink-0"
            title="End"
          >
            <SkipForward size={22} strokeWidth={2} />
          </button>
          <button
            onClick={() => setIsPracticing(p => !p)}
            className={`w-[42px] h-[42px] flex items-center justify-center rounded-lg border transition shrink-0 ${
              isPracticing
                ? "text-primary bg-primary/20 border-primary/50 shadow-[0_0_10px_rgba(129,182,76,0.2)]"
                : "bg-surface/60 border-surface-border/60 text-gray-300 hover:text-white hover:bg-surface hover:border-surface-border"
            }`}
            title="Practice with computer"
          >
            <Target size={22} strokeWidth={2} />
          </button>
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzingLocal}
            className="h-[42px] px-3.5 flex items-center justify-center gap-2 bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-[#111] rounded-lg font-bold text-sm whitespace-nowrap transition-all shadow-[0_0_12px_rgba(129,182,76,0.2)] disabled:opacity-50 shrink-0"
          >
            <Brain size={22} strokeWidth={2} className="shrink-0" />
            <span>{isAnalyzingLocal ? "Analyzing..." : "Start Analysis"}</span>
          </button>
          <div className="relative flex items-center shrink-0">
            <button
              ref={settingsBtnRef}
              onClick={() => {
                updatePopupPos();
                setShowSettings(s => !s);
              }}
              className={`w-[42px] h-[42px] rounded-lg border flex items-center justify-center transition shrink-0 ${
                showSettings
                  ? "text-primary bg-primary/20 border-primary/50 shadow-[0_0_10px_rgba(129,182,76,0.2)]"
                  : "bg-surface/60 border-surface-border/60 text-gray-300 hover:text-white hover:bg-surface hover:border-surface-border"
              }`}
              title="Board Settings"
            >
              <SlidersHorizontal size={22} strokeWidth={2} />
            </button>
            {showSettings && (
              <div
                ref={settingsPopupRef}
                style={{ left: `${popupPos.left}px`, bottom: `${popupPos.bottom}px` }}
                className="fixed w-[330px] max-h-[calc(100vh-24px)] overflow-y-auto bg-[#1e1e1e] text-gray-200 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-50 border border-[#2e2e2e] p-3 flex flex-col gap-2.5"
              >
                {/* 3.5.5.1 Computer Level */}
                <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-gray-300 tracking-wider uppercase">Computer Level</label>
                    <span className="text-xs font-bold text-primary font-mono bg-primary/15 px-2.5 py-0.5 rounded-md border border-primary/30 whitespace-nowrap">
                      Level: {computerLevel}
                    </span>
                  </div>
                  <div className="flex justify-between px-1 mb-1 text-[11px] font-mono text-gray-400">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <span key={n} className={n === computerLevel ? "text-primary font-bold" : ""}>{n}</span>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={computerLevel}
                    onChange={e => {
                      const lvl = Number(e.target.value);
                      setComputerLevel(lvl);
                      engineRef.current?.setSkillLevel(Math.round((lvl - 1) * 2.2));
                    }}
                    className="w-full h-1.5 accent-primary cursor-pointer"
                  />
                </div>

                {/* 3.5.5.2 Show Best Move */}
                <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-200">Show best move</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showBestMoveArrow}
                    onClick={() => setShowBestMoveArrow(v => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      showBestMoveArrow ? "bg-primary" : "bg-[#2a2a2a] border border-surface-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform duration-200 ${
                        showBestMoveArrow ? "translate-x-4 bg-[#111]" : "translate-x-0.5 bg-gray-400"
                      }`}
                    />
                  </button>
                </div>

                {/* 3.5.5.3 Black Pieces Palette */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-gray-300 px-0.5">Black Pieces Palette</span>
                  <div className="bg-[#252429] border border-[#35343c] rounded-xl p-1 grid grid-cols-8 gap-1">
                    <button
                      type="button"
                      onPointerDown={e => {
                        e.preventDefault();
                        setActiveEditorTool("b-hand");
                      }}
                      onPointerMove={e => {
                        if (e.buttons > 0) e.preventDefault();
                      }}
                      className={`h-8 rounded-lg flex items-center justify-center transition touch-none select-none ${
                        activeEditorTool === "b-hand"
                          ? "bg-primary/20 border border-primary text-primary shadow-[0_0_8px_rgba(129,182,76,0.25)]"
                          : "border border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                      }`}
                      title="Move / Drag Piece"
                    >
                      <Hand size={18} strokeWidth={2} />
                    </button>
                    {(["bK", "bQ", "bR", "bB", "bN", "bP"] as const).map(piece => (
                      <button
                        key={piece}
                        type="button"
                        onPointerDown={e => {
                          e.preventDefault();
                          setActiveEditorTool(piece);
                        }}
                        onPointerMove={e => {
                          if (e.buttons > 0) e.preventDefault();
                        }}
                        className={`h-8 rounded-lg flex items-center justify-center transition touch-none select-none ${
                          activeEditorTool === piece
                            ? "bg-primary/20 border border-primary shadow-[0_0_8px_rgba(129,182,76,0.25)]"
                            : "border border-transparent hover:bg-white/5"
                        }`}
                        title={piece}
                      >
                        <img
                          src={`/pieces/cburnett/${piece}.svg`}
                          alt={piece}
                          className="w-6 h-6 object-contain pointer-events-none select-none"
                          draggable={false}
                        />
                      </button>
                    ))}
                    <button
                      type="button"
                      onPointerDown={e => {
                        e.preventDefault();
                        setActiveEditorTool("b-trash");
                      }}
                      onPointerMove={e => {
                        if (e.buttons > 0) e.preventDefault();
                      }}
                      className={`h-8 rounded-lg flex items-center justify-center transition touch-none select-none ${
                        activeEditorTool === "b-trash"
                          ? "bg-primary/20 border border-primary text-primary shadow-[0_0_8px_rgba(129,182,76,0.25)]"
                          : "border border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                      }`}
                      title="Delete Piece"
                    >
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* 3.5.5.4 White Pieces Palette */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-gray-300 px-0.5">White Pieces Palette</span>
                  <div className="bg-[#252429] border border-[#35343c] rounded-xl p-1 grid grid-cols-8 gap-1">
                    <button
                      type="button"
                      onPointerDown={e => {
                        e.preventDefault();
                        setActiveEditorTool("w-hand");
                      }}
                      onPointerMove={e => {
                        if (e.buttons > 0) e.preventDefault();
                      }}
                      className={`h-8 rounded-lg flex items-center justify-center transition touch-none select-none ${
                        activeEditorTool === "w-hand"
                          ? "bg-primary/20 border border-primary text-primary shadow-[0_0_8px_rgba(129,182,76,0.25)]"
                          : "border border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                      }`}
                      title="Move / Drag Piece"
                    >
                      <Hand size={18} strokeWidth={2} />
                    </button>
                    {(["wK", "wQ", "wR", "wB", "wN", "wP"] as const).map(piece => (
                      <button
                        key={piece}
                        type="button"
                        onPointerDown={e => {
                          e.preventDefault();
                          setActiveEditorTool(piece);
                        }}
                        onPointerMove={e => {
                          if (e.buttons > 0) e.preventDefault();
                        }}
                        className={`h-8 rounded-lg flex items-center justify-center transition touch-none select-none ${
                          activeEditorTool === piece
                            ? "bg-primary/20 border border-primary shadow-[0_0_8px_rgba(129,182,76,0.25)]"
                            : "border border-transparent hover:bg-white/5"
                        }`}
                        title={piece}
                      >
                        <img
                          src={`/pieces/cburnett/${piece}.svg`}
                          alt={piece}
                          className="w-6 h-6 object-contain pointer-events-none select-none"
                          draggable={false}
                        />
                      </button>
                    ))}
                    <button
                      type="button"
                      onPointerDown={e => {
                        e.preventDefault();
                        setActiveEditorTool("w-trash");
                      }}
                      onPointerMove={e => {
                        if (e.buttons > 0) e.preventDefault();
                      }}
                      className={`h-8 rounded-lg flex items-center justify-center transition touch-none select-none ${
                        activeEditorTool === "w-trash"
                          ? "bg-primary/20 border border-primary text-primary shadow-[0_0_8px_rgba(129,182,76,0.25)]"
                          : "border border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                      }`}
                      title="Delete Piece"
                    >
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* 3.5.5.5 Turn to Play, 3.5.5.6 Castling Rights, 3.5.5.7 En Passant Rights */}
                <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-2.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-200">Turn to play</span>
                    <select
                      value={editorTurn}
                      onChange={e => setEditorTurn(e.target.value as "w" | "b")}
                      className="bg-[#242424] border border-[#3a3a3a] text-gray-200 text-xs font-medium rounded-lg px-2.5 py-1 focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="w">White to play</option>
                      <option value="b">Black to play</option>
                    </select>
                  </div>

                  <div className="border-t border-[#262626]" />

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-gray-200">Castling rights</span>
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span className="w-12 text-gray-400">White</span>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span>0-0</span>
                        <input
                          type="checkbox"
                          checked={editorCastling.wK}
                          onChange={e => setEditorCastling(c => ({ ...c, wK: e.target.checked }))}
                          className="w-4 h-4 accent-primary rounded cursor-pointer"
                        />
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span>0-0-0</span>
                        <input
                          type="checkbox"
                          checked={editorCastling.wQ}
                          onChange={e => setEditorCastling(c => ({ ...c, wQ: e.target.checked }))}
                          className="w-4 h-4 accent-primary rounded cursor-pointer"
                        />
                      </label>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span className="w-12 text-gray-400">Black</span>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span>0-0</span>
                        <input
                          type="checkbox"
                          checked={editorCastling.bK}
                          onChange={e => setEditorCastling(c => ({ ...c, bK: e.target.checked }))}
                          className="w-4 h-4 accent-primary rounded cursor-pointer"
                        />
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span>0-0-0</span>
                        <input
                          type="checkbox"
                          checked={editorCastling.bQ}
                          onChange={e => setEditorCastling(c => ({ ...c, bQ: e.target.checked }))}
                          className="w-4 h-4 accent-primary rounded cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-[#262626]" />

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-200">En passant rights</span>
                    <select
                      value={editorEnPassant}
                      onChange={e => setEditorEnPassant(e.target.value)}
                      className="bg-[#242424] border border-[#3a3a3a] text-gray-200 text-xs font-medium rounded-lg px-2.5 py-1 min-w-[64px] text-center focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {["-", "a", "b", "c", "d", "e", "f", "g", "h"].map(file => (
                        <option key={file} value={file}>{file}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3.5.5.8 Time Control */}
                <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-2.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300 tracking-wider uppercase">Time Control</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={timeControlEnabled}
                      onClick={() => setTimeControlEnabled(v => !v)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        timeControlEnabled ? "bg-primary" : "bg-[#2a2a2a] border border-surface-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform duration-200 ${
                          timeControlEnabled ? "translate-x-4 bg-[#111]" : "translate-x-0.5 bg-gray-400"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["1 min", "1 + 1", "2 + 1", "3 min", "3 + 2", "5 min", "10 min", "10 + 5", "15 + 10"].map(preset => {
                      const isSelected = selectedTimePreset === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setSelectedTimePreset(preset)}
                          className={`h-7 rounded-lg text-xs border transition flex items-center justify-center ${
                            isSelected
                              ? "bg-primary/20 border-primary text-primary font-bold shadow-[0_0_8px_rgba(129,182,76,0.2)]"
                              : "bg-[#222222] border-[#333333] text-gray-300 font-medium hover:text-white hover:border-[#444444]"
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3.5.5.9 Starting Position & 3.5.5.10 Clear Board */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={resetBoard}
                    className="flex items-center justify-center gap-2 px-2.5 h-9 rounded-xl bg-[#161616] border border-[#2a2a2a] hover:bg-[#222222] hover:border-[#3a3a3a] text-gray-200 hover:text-white text-xs font-semibold transition whitespace-nowrap"
                  >
                    <RotateCcw size={15} className="text-gray-300 shrink-0" />
                    <span>Starting Position</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearBoard}
                    className="flex items-center justify-center gap-2 px-2.5 h-9 rounded-xl bg-[#161616] border border-[#2a2a2a] hover:bg-[#222222] hover:border-[#3a3a3a] text-gray-200 hover:text-white text-xs font-semibold transition whitespace-nowrap"
                  >
                    <Trash2 size={15} className="text-gray-300 shrink-0" />
                    <span>Clear Board</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ===== COLUMN 2: MOVE LIST ===== */}
      <div className="hidden lg:flex w-[300px] xl:w-[330px] flex-col border-x border-surface-border bg-surface shrink-0">
        <div className="bg-surface-elevated text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 border-b border-surface-border shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span>Move List</span>
            
          </div>
          <button onClick={() => goToMove(null)} className="hover:text-white"><SkipBack size={14}/></button>
        </div>
        <div ref={moveListRef} className="flex-1 overflow-y-auto">
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

      {/* ===== COLUMN 3: AI EXPLANATION ===== */}
      <div className="hidden lg:flex flex-1 min-w-[260px] max-w-[400px] flex-col gap-3 p-3 bg-surface border-l border-surface-border">

        <div className="flex-1 bg-surface-elevated border border-surface-border rounded-md flex flex-col overflow-hidden min-h-0">
          <div className="bg-surface-elevated px-3 py-2 border-b border-surface-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-primary"/>
              <span className="text-sm font-bold">AI Explanation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <select className="bg-surface border border-surface-border text-[11px] text-gray-300 rounded px-1.5 py-0.5 outline-none" value={aiModel} onChange={e => setAiModel(e.target.value)}>
                <option value="Gemini Flash">Gemini Flash</option>
                <option value="Llama 3">Llama 3</option>
              </select>
              <div className="relative">
                <input type="text" value={langSearch}
                  onChange={e => { setLangSearch(e.target.value); setShowLangDropdown(true); }}
                  onFocus={() => setShowLangDropdown(true)}
                  onBlur={() => setTimeout(() => setShowLangDropdown(false), 150)}
                  placeholder="Language..."
                  className="bg-surface border border-surface-border text-[11px] text-gray-300 rounded px-1.5 py-0.5 outline-none w-[90px] focus:border-primary" />
                {showLangDropdown && filteredLangs.length > 0 && (
                  <div className="absolute top-full right-0 mt-0.5 w-[160px] bg-[#1e1e1e] border border-surface-border rounded shadow-xl z-50 max-h-[180px] overflow-y-auto">
                    {filteredLangs.map(lang => (
                      <button key={lang}
                        className={`w-full text-left px-2.5 py-1.5 text-[11px] hover:bg-primary/20 transition ${lang === explanationLanguage ? "text-primary font-bold bg-primary/10" : "text-gray-300"}`}
                        onMouseDown={() => { setExplanationLanguage(lang); setLangSearch(lang); setShowLangDropdown(false); }}>
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
            {isAnalyzingLocal ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-primary animate-pulse">
                <Brain size={32}/><p className="font-bold text-sm">Analyzing selected moves...</p>
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

        {/* FEN / PGN / LINK */}
        <div className="bg-surface-elevated border border-surface-border rounded-md p-3 flex flex-col gap-2.5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 w-8">FEN</span>
            <input type="text" value={fen} onChange={e => setFen(e.target.value)}
              onClick={e => (e.target as HTMLInputElement).select()}
              className="flex-1 bg-surface border border-surface-border rounded px-2 py-1 text-[10px] font-mono text-gray-300 outline-none cursor-text focus:border-primary" />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[10px] font-bold text-gray-400 w-8 pt-1">PGN</span>
            <textarea value={pgnInput} onChange={handlePgnPaste} placeholder="Paste PGN here to load game..."
              className="flex-1 bg-surface border border-surface-border rounded px-2 py-1 text-[10px] font-mono text-gray-300 outline-none focus:border-primary resize-none min-h-[44px]" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 w-8">LINK</span>
            <input type="text" value={linkInput} onChange={handleLinkImport} disabled={isImporting}
              placeholder={isImporting ? "Importing..." : "Paste chess.com / lichess link..."}
              className={`flex-1 bg-surface border border-surface-border rounded px-2 py-1 text-[10px] font-mono text-gray-300 outline-none focus:border-primary ${isImporting ? "opacity-50" : ""}`} />
          </div>
          {importError && (
            <div className="text-red-400 text-[10px] font-bold mt-1 text-center bg-red-900/20 py-1 rounded">
              ⚠️ {importError}
            </div>
          )}
        </div>

      </div>

    </div>
  );
});

export default ChessDashboard;
