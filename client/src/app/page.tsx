"use client";

import { useState, useRef, useEffect } from "react";
import ChessDashboard from "@/components/ChessDashboard";
import HistoricalGames from "@/components/HistoricalGames";
import { VisualSettingsModal } from "@/components/VisualSettingsModal";
import { Bell, User, Menu, LineChart, BookOpen, Presentation, Search, Settings } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [showHistorical, setShowHistorical] = useState(false);
  const [isVisualSettingsOpen, setIsVisualSettingsOpen] = useState(false);
  const [boardTheme, setBoardTheme] = useState("green");
  const [pieceStyle, setPieceStyle] = useState("cburnett");
  const [usePieceIcons, setUsePieceIcons] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("chess_boardTheme");
    const p = localStorage.getItem("chess_pieceStyle");
    if (t) setBoardTheme(t);
    if (p) setPieceStyle(p);
    const icons = localStorage.getItem("chess_usePieceIcons");
    if (icons === "true") setUsePieceIcons(true);
  }, []);

  const handleSetBoardTheme = (t: string) => {
    setBoardTheme(t);
    localStorage.setItem("chess_boardTheme", t);
  };

  const handleSetPieceStyle = (p: string) => {
    setPieceStyle(p);
    localStorage.setItem("chess_pieceStyle", p);
  };

  const handleSetUsePieceIcons = (v: boolean) => {
    setUsePieceIcons(v);
    localStorage.setItem("chess_usePieceIcons", v.toString());
  };

  const dashboardRef = useRef<{ loadPgnExternal: (pgn: string) => void }>(null);

  const handleLoadHistoricalGame = (pgn: string) => {
    if (dashboardRef.current) {
      dashboardRef.current.loadPgnExternal(pgn);
    }
    setShowHistorical(false);
    setActiveTab("analysis");
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="bg-surface-elevated border-b border-surface-border shrink-0">
        <div className="flex justify-between items-center px-4 md:px-6 py-2.5">
          {/* Logo and Main Nav */}
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2 tracking-tight">
              <span className="text-2xl">♞</span> ChessUnfold
            </h1>
            
            <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold">
              <button 
                onClick={() => setActiveTab("analysis")}
                className={`flex items-center gap-2 px-3 py-2 transition-colors ${activeTab === "analysis" ? "text-primary border-b-2 border-primary -mb-[2px]" : "text-foreground hover:bg-surface-border rounded-md"}`}
              >
                <LineChart size={18} /> Analysis
              </button>
              <button 
                onClick={() => setActiveTab("openings")}
                className={`flex items-center gap-2 px-3 py-2 transition-colors ${activeTab === "openings" ? "text-primary border-b-2 border-primary -mb-[2px]" : "text-foreground hover:bg-surface-border rounded-md"}`}
              >
                <BookOpen size={18} /> Openings
              </button>
              <button 
                onClick={() => setActiveTab("study")}
                className={`flex items-center gap-2 px-3 py-2 transition-colors ${activeTab === "study" ? "text-primary border-b-2 border-primary -mb-[2px]" : "text-foreground hover:bg-surface-border rounded-md"}`}
              >
                <Presentation size={18} /> Study
              </button>
              <button 
                onClick={() => setShowHistorical(true)}
                className={`flex items-center gap-2 px-3 py-2 transition-colors ${activeTab === "historical" ? "text-primary border-b-2 border-primary -mb-[2px]" : "text-foreground hover:bg-surface-border rounded-md"}`}
              >
                <span className="opacity-70">⌛</span> Historical
              </button>
            </nav>
          </div>

          {/* Search, Notifications, Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-surface border border-surface-border rounded-full py-1.5 pl-9 pr-4 text-sm w-48 focus:outline-none focus:border-primary text-foreground placeholder:text-gray-500"
              />
            </div>
            {/* Settings Icon */}
            <button 
              onClick={() => setIsVisualSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-surface-border transition" 
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-surface-border transition">
              <Bell size={20} />
            </button>
            <button className="p-1.5 rounded-full border border-surface-border hover:border-gray-500 transition">
              <div className="w-7 h-7 bg-surface-border rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-300" />
              </div>
            </button>
            <button className="lg:hidden p-2 text-gray-400 hover:text-white rounded-md">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1366px] mx-auto overflow-hidden">
        <ChessDashboard 
          ref={dashboardRef} 
          boardTheme={boardTheme} 
          pieceStyle={pieceStyle}
          usePieceIcons={usePieceIcons} 
          onTogglePieceIcons={() => handleSetUsePieceIcons(!usePieceIcons)}
        />
      </main>

      {/* Historical Games Modal */}
      {showHistorical && (
        <HistoricalGames 
          onClose={() => setShowHistorical(false)} 
          onLoadGame={handleLoadHistoricalGame} 
        />
      )}

      {/* Visual Settings Modal */}
      <VisualSettingsModal 
        isOpen={isVisualSettingsOpen} 
        onClose={() => setIsVisualSettingsOpen(false)}
        boardTheme={boardTheme}
        setBoardTheme={handleSetBoardTheme}
        pieceStyle={pieceStyle}
        setPieceStyle={handleSetPieceStyle}
        usePieceIcons={usePieceIcons}
        setUsePieceIcons={handleSetUsePieceIcons}
      />
    </div>
  );
}
