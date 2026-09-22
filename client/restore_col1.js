const fs = require('fs');

const col1Code = `      {/* ----------- COLUMN 1: Chessboard ----------- */}
      <div className="flex-1 flex flex-col h-full relative px-4 lg:px-8 py-6 max-w-[900px] mx-auto w-full">
        
        {/* Top Player (Black) */}
        <div className="flex justify-between items-end mb-2">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 bg-surface-elevated rounded flex items-center justify-center text-xl shadow-sm border border-surface-border">
              ??
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-200">{blackPlayer.name}</span>
                <span className="text-xs bg-surface-elevated px-1.5 py-0.5 rounded text-gray-400 font-mono">{blackPlayer.rating}</span>
              </div>
              <div className="flex items-center min-h-[20px]">
                <div className="flex text-gray-400 text-lg">
                  {whiteCaptured.map((p, i) => {
                    const iconMap: Record<string, string> = { 'p':'?', 'n':'?', 'b':'?', 'r':'?', 'q':'?' };
                    return <span key={i} className="-ml-1">{iconMap[p] || p}</span>;
                  })}
                </div>
                {materialDiff < 0 && <span className="ml-2 text-xs font-bold text-gray-400">+{Math.abs(materialDiff)}</span>}
              </div>
            </div>
          </div>
          <div className="bg-surface-elevated px-3 py-1.5 rounded font-mono text-xl text-gray-200 border border-surface-border shadow-sm">
            10:00
          </div>
        </div>

        {/* Board & Eval Bar Area */}
        <div className="flex-1 flex items-center justify-center min-h-0 relative w-full">
          {/* Main Board Container */}
          <div className="w-full h-full max-h-full aspect-square flex items-center relative">
            
            <div className="w-full aspect-square relative z-10">
              <Chessboard 
                {...({position: fen} as any)} 
                onPieceDrop={onPieceDrop}
                boardOrientation={boardOrientation}
                customBoardStyle={{
                  borderRadius: '4px',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                }}
              />
            </div>
            
            {/* Evaluation Bar */}
            <div className="absolute -right-8 top-0 bottom-0 w-4 bg-[#2a2a2a] rounded-sm overflow-hidden flex flex-col justify-end border border-surface-border">
              {/* Dummy eval bar fill - would be dynamic in real implementation */}
              <div className="w-full bg-gray-200 transition-all duration-300" style={{ height: '50%' }}></div>
            </div>
          </div>
        </div>

        {/* Bottom Player (White) */}
        <div className="flex justify-between items-start mt-2">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 bg-surface-elevated rounded flex items-center justify-center text-xl shadow-sm border border-surface-border">
              ??
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-200">{whitePlayer.name}</span>
                <span className="text-xs bg-surface-elevated px-1.5 py-0.5 rounded text-gray-400 font-mono">{whitePlayer.rating}</span>
              </div>
              <div className="flex items-center min-h-[20px]">
                <div className="flex text-gray-400 text-lg">
                  {blackCaptured.map((p, i) => {
                    const iconMap: Record<string, string> = { 'p':'?', 'n':'?', 'b':'?', 'r':'?', 'q':'?' };
                    return <span key={i} className="-ml-1">{iconMap[p] || p}</span>;
                  })}
                </div>
                {materialDiff > 0 && <span className="ml-2 text-xs font-bold text-gray-400">+{materialDiff}</span>}
              </div>
            </div>
          </div>
          <div className="bg-surface-elevated px-3 py-1.5 rounded font-mono text-xl text-gray-200 border border-surface-border shadow-sm">
            10:00
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mt-4 flex items-center justify-between bg-surface-elevated rounded-lg p-2 border border-surface-border">
          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            <button onClick={() => goToMove(null)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface text-gray-400 hover:text-white transition"><SkipBack size={16}/></button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface text-gray-400 hover:text-white transition"><ArrowLeft size={16}/></button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface text-gray-400 hover:text-white transition"><ArrowRight size={16}/></button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface text-gray-400 hover:text-white transition"><SkipForward size={16}/></button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface text-gray-400 hover:text-white transition" title="Practice against computer">
              <Target size={16}/>
            </button>
            
            <button className="flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-[#111] px-4 py-1.5 rounded-full font-bold text-sm transition-all shadow-[0_0_10px_rgba(150,168,115,0.2)]">
              <Brain size={16}/> Start Analysis
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowSettings(s => !s)} 
                className={\`w-8 h-8 rounded-full border border-surface-border flex items-center justify-center hover:bg-surface transition \${showSettings ? "text-white bg-surface" : "text-gray-400 hover:text-white"}\`}
                title="Board Settings"
              >
                <SlidersHorizontal size={14}/>
              </button>
              {showSettings && (
                <div className="absolute bottom-[calc(100%+12px)] right-0 w-[270px] bg-[#f5f5f5] text-gray-800 rounded-lg shadow-2xl z-50 border border-gray-300 overflow-hidden">
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
        </div>
      </div>`;

let fileContent = fs.readFileSync('src/components/ChessDashboard.tsx', 'utf8');

// Find the start and end of Column 1
const startIdx = fileContent.indexOf('{/* ----------- COLUMN 1: Chessboard ----------- */}');
if (startIdx === -1) {
  console.log("Could not find start");
  process.exit(1);
}

const endIdx = fileContent.indexOf('{/* ----------- COLUMN 2: Move List ----------- */}');
if (endIdx === -1) {
  console.log("Could not find end");
  process.exit(1);
}

const newContent = fileContent.substring(0, startIdx) + col1Code + '\n\n      ' + fileContent.substring(endIdx);
fs.writeFileSync('src/components/ChessDashboard.tsx', newContent, 'utf8');
console.log("Successfully replaced Column 1");
