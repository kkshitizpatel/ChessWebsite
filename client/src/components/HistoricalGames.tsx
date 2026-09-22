"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, Loader2, ChevronDown, ChevronUp, Filter } from "lucide-react";
import Fuse from "fuse.js";

interface HistoricalGamesProps {
  onClose: () => void;
  onLoadGame: (pgn: string) => void;
}

export default function HistoricalGames({ onClose, onLoadGame }: HistoricalGamesProps) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [tournament, setTournament] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [result, setResult] = useState("All Results");
  const [showFilters, setShowFilters] = useState(false);
  const [showResultDropdown, setShowResultDropdown] = useState(false);
  
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fuse.js states
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [opponents, setOpponents] = useState<string[]>([]);
  const [p1Focus, setP1Focus] = useState(false);
  const [p2Focus, setP2Focus] = useState(false);

  useEffect(() => {
    // Fetch all players on mount
    fetch('/api/players').then(res => res.json()).then(data => {
      if (data.players) setAllPlayers(data.players);
    }).catch(console.error);
    fetchGames();
  }, []);

  // Fetch opponents when p1 changes and matches exactly a player, or just fetch if p1 loses focus
  // To strictly follow the dependent requirement: if p1 is not empty, fetch opponents
  useEffect(() => {
    if (p1.length > 2) {
      // Find exact or closest match to fetch opponents for
      // Or just wait until they select from the dropdown. 
      // Actually, if we fetch opponents of `p1`, we should do it when p1 is set from the dropdown.
    }
  }, [p1]);

  const handleP1Select = async (name: string) => {
    setP1(name);
    setP1Focus(false);
    // Fetch opponents of this player
    try {
      const res = await fetch(`/api/players?opponent=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.players) {
        setOpponents(data.players);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fuseAll = useMemo(() => new Fuse(allPlayers, { threshold: 0.3 }), [allPlayers]);
  const fuseOpponents = useMemo(() => new Fuse(opponents.length > 0 ? opponents : allPlayers, { threshold: 0.3 }), [opponents, allPlayers]);

  const p1Results = p1 ? fuseAll.search(p1).map(r => r.item).slice(0, 50) : allPlayers.slice(0, 50);
  const p2Results = p2 ? fuseOpponents.search(p2).map(r => r.item).slice(0, 50) : (opponents.length > 0 ? opponents : allPlayers).slice(0, 50);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (p1) params.append("p1", p1);
      if (p2) params.append("p2", p2);
      if (tournament) params.append("tournament", tournament);
      if (yearFrom) params.append("yearFrom", yearFrom);
      if (yearTo) params.append("yearTo", yearTo);
      if (result !== "All Results") params.append("result", result);

      const res = await fetch(`/api/historical?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = async (id: string) => {
    try {
      const res = await fetch(`/api/historical/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.pgn) {
          onLoadGame(data.pgn);
          onClose();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const clearFilters = () => {
    setP1(""); setP2(""); setTournament(""); setYearFrom(""); setYearTo(""); setResult("All Results");
    setOpponents([]);
  };

  // Close dropdowns on outside click
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setP1Focus(false);
        setP2Focus(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" ref={wrapperRef}>
      <div className="bg-[#21201d] w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-[#363430]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161512] border-b border-[#363430] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#272522] rounded-lg text-[#81b64c]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Master Games Database</h2>
              <p className="text-xs text-[#8b8985]">Search from over 2 million professional grandmaster games.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8b8985] hover:text-white transition-colors"><X size={24} /></button>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#272522] px-6 py-4 border-b border-[#363430] flex flex-col gap-3 shrink-0">
          <div className="flex flex-col lg:flex-row items-center gap-3 w-full">
            <div className="relative flex-1 w-full">
              <input 
                value={p1} 
                onChange={e => setP1(e.target.value)} 
                onFocus={() => { setP1Focus(true); setP2Focus(false); }}
                className="w-full bg-[#1a1917] text-white text-sm placeholder-[#8b8985] rounded-lg border border-[#363430] px-3.5 py-2.5 focus:outline-none focus:border-[#81b64c] focus:ring-1 focus:ring-[#81b64c] transition-colors" 
                placeholder="Player 1 (e.g. Carlsen)" 
                type="text" 
              />
              {p1Focus && p1Results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1917] border border-[#363430] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  {p1Results.map(name => (
                    <div key={name} onClick={() => handleP1Select(name)} className="px-4 py-2 text-sm text-[#e2e0dc] hover:bg-[#2d2b27] hover:text-white cursor-pointer transition-colors">
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative flex-1 w-full">
              <input 
                value={p2} 
                onChange={e => setP2(e.target.value)} 
                onFocus={() => { setP2Focus(true); setP1Focus(false); }}
                className="w-full bg-[#1a1917] text-white text-sm placeholder-[#8b8985] rounded-lg border border-[#363430] px-3.5 py-2.5 focus:outline-none focus:border-[#81b64c] focus:ring-1 focus:ring-[#81b64c] transition-colors" 
                placeholder="Player 2 (e.g. Firouzja)" 
                type="text" 
              />
              {p2Focus && p2Results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1917] border border-[#363430] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  {p2Results.map(name => (
                    <div key={name} onClick={() => { setP2(name); setP2Focus(false); }} className="px-4 py-2 text-sm text-[#e2e0dc] hover:bg-[#2d2b27] hover:text-white cursor-pointer transition-colors">
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative flex-1 w-full">
              <input value={tournament} onChange={e=>setTournament(e.target.value)} className="w-full bg-[#1a1917] text-white text-sm placeholder-[#8b8985] rounded-lg border border-[#363430] px-3.5 py-2.5 focus:outline-none focus:border-[#81b64c] focus:ring-1 focus:ring-[#81b64c] transition-colors" placeholder="Tournament (e.g. Candidates)" type="text" />
            </div>
            <button onClick={() => { setP1Focus(false); setP2Focus(false); fetchGames(); }} className="w-full lg:w-auto px-6 py-2.5 bg-[#81b64c] hover:bg-[#98c863] text-[#111] font-semibold text-sm rounded-lg flex items-center justify-center space-x-2 transition-all">
              <Search size={16} strokeWidth={2.5} /><span>Search</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-1.5 text-xs font-semibold text-[#81b64c] hover:underline focus:outline-none">
              <Filter size={14} /><span>Filters</span>{showFilters ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </button>
            <button onClick={clearFilters} className="text-xs text-[#8b8985] hover:text-white transition-colors">Clear all</button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-end gap-4 pt-1">
              <div className="relative w-36">
                <label className="block text-[11px] font-medium text-[#8b8985] mb-1">Year from</label>
                <input value={yearFrom} onChange={e=>setYearFrom(e.target.value)} className="w-full bg-[#1a1917] text-xs text-white rounded-md border border-[#363430] px-3 py-1.5 focus:border-[#81b64c] focus:ring-0" type="number" placeholder="2000" />
              </div>
              <div className="relative w-36">
                <label className="block text-[11px] font-medium text-[#8b8985] mb-1">Year to</label>
                <input value={yearTo} onChange={e=>setYearTo(e.target.value)} className="w-full bg-[#1a1917] text-xs text-white rounded-md border border-[#363430] px-3 py-1.5 focus:border-[#81b64c] focus:ring-0" type="number" placeholder="2026" />
              </div>
              <div className="relative w-48">
                <label className="block text-[11px] font-medium text-[#8b8985] mb-1">Game Result</label>
                <button onClick={() => setShowResultDropdown(!showResultDropdown)} className="w-full bg-[#1a1917] text-xs text-white rounded-md border border-[#363430] px-3 py-1.5 flex items-center justify-between text-left hover:border-[#8b8985]">
                  <span className="truncate">{result}</span><ChevronDown size={14} className="text-[#8b8985] ml-1"/>
                </button>
                {showResultDropdown && (
                  <div className="absolute z-30 left-0 mt-1 w-48 bg-[#1e1d1a] border border-[#3e3b36] rounded-md shadow-2xl py-1 text-xs">
                    {["All Results", "White Wins (1-0)", "Black Wins (0-1)", "Draw (1/2-1/2)"].map(opt => (
                      <div key={opt} onClick={() => {setResult(opt); setShowResultDropdown(false);}} className="block px-3 py-1.5 text-[#e2e0dc] hover:bg-[#2d2b27] hover:text-white cursor-pointer transition-colors">
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#363430]/50 relative" onScroll={() => { setP1Focus(false); setP2Focus(false); }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#21201d]/50 backdrop-blur-sm z-10">
              <Loader2 className="w-8 h-8 text-[#81b64c] animate-spin" />
            </div>
          )}
          {!loading && games.length === 0 && (
            <div className="p-8 text-center text-[#8b8985]">No games found matching your criteria.</div>
          )}
          {games.map((g, idx) => {
            const year = g.date ? g.date.substring(0,4) : '????';
            return (
              <article key={idx} onClick={() => handleGameClick(g.id)} className="px-6 py-3.5 flex items-center justify-between hover:bg-[#272522]/60 transition-colors group cursor-pointer">
                <div className="flex items-center space-x-6 min-w-0">
                  <span className="text-xs font-semibold text-[#8b8985] w-10 flex-shrink-0">{year}</span>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm flex-shrink-0"></span>
                      <span className="font-medium text-white group-hover:text-[#81b64c] transition-colors">{g.white}</span>
                      <span className="text-xs text-[#8b8985] font-normal">({g.whiteElo || 'N/A'})</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#52504c] border border-gray-600 flex-shrink-0"></span>
                      <span className="font-medium text-[#e2e0dc]">{g.black}</span>
                      <span className="text-xs text-[#8b8985] font-normal">({g.blackElo || 'N/A'})</span>
                      {g.eco && <span className="ml-2 text-[10px] uppercase font-bold text-[#8b8985] bg-[#1d1c1a] px-1.5 py-0.5 rounded border border-[#31302c]">{g.eco}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {g.event && <span className="hidden md:inline-block text-xs text-[#8b8985] bg-[#272522] px-2 py-1 rounded truncate max-w-[200px]">{g.event}</span>}
                  <span className="px-2.5 py-1 bg-[#1a1917] border border-[#363430] rounded text-xs font-bold font-mono tracking-tight text-white group-hover:border-[#8b8985]">
                    {g.result || '*'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
