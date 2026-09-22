const fs = require('fs');
const oldDash = fs.readFileSync('src/components/ChessDashboard.tsx', 'utf8');

const topCode = `"use client";

import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import {
  Target, Brain, SlidersHorizontal, ArrowUpDown,
  Crosshair, PenTool, RotateCcw, Trash2, Edit3,
  SkipBack, ArrowLeft, ArrowRight, SkipForward, Settings
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

`;

// Find the beginning of the return statement in the old file.
// The old file was corrupted and its top is missing, but it still has the JSX!
// The JSX starts with `<div className="flex flex-col xl:flex-row h-screen bg-[#111111] text-gray-200 overflow-hidden font-sans">` or similar?
// Let's find the first `return (` in the corrupted file!
let jsxIndex = oldDash.indexOf('return (');
if (jsxIndex === -1) jsxIndex = oldDash.indexOf('<div className="flex h-screen bg-surface');
if (jsxIndex === -1) jsxIndex = oldDash.indexOf('<div className="flex h-screen');
if (jsxIndex === -1) jsxIndex = oldDash.indexOf('<div');

// The corrupted file also has `              {showSettings && (` at the very top because it replaced the top with the gear popup!
// We can just find the main `return (`. Wait, the `return (` might be missing too!
// Let's just find the main container!
const mainContainerIndex = oldDash.indexOf('<div className="flex flex-col xl:flex-row');
let restOfFile = oldDash;
if (mainContainerIndex > -1) {
  restOfFile = '  return (\n    ' + oldDash.substring(mainContainerIndex);
} else {
  // Try finding '    <div className="flex h-screen w-full bg-[#111111] font-sans overflow-hidden">'
  const altIndex = oldDash.indexOf('<div className="flex h-screen');
  if (altIndex > -1) {
    restOfFile = '  return (\n    ' + oldDash.substring(altIndex);
  }
}

fs.writeFileSync('src/components/ChessDashboard.tsx', topCode + restOfFile, 'utf8');
console.log("Reconstructed ChessDashboard.tsx!");

