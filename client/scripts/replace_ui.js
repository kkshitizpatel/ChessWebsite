const fs = require('fs');
let code = fs.readFileSync('src/components/ChessDashboard.tsx', 'utf8');

const replacement = `        <div className="bg-surface-elevated text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 border-b border-surface-border shrink-0 flex justify-between">
          <span>Move List</span>
          <div className="flex items-center gap-2">
            <button onClick={() => goToMove(null)} className="hover:text-white"><SkipBack size={14}/></button>
          </div>
        </div>
        
        <div ref={moveListRef} className="flex-1 overflow-y-auto bg-[#1a1a1a]">
          <MoveList 
            tree={moveTree} 
            currentNodeId={currentNodeId} 
            onMoveClick={goToMove} 
            selectedMoves={selectedMoves} 
            onToggleMove={toggleMoveSelection} 
          />
        </div>
        
        {/* 4.6 Accuracy Footer */}
        <div className="h-1.5 w-full flex">
          <div className="h-full bg-white" style={{ width: '50%' }}></div>
          <div className="h-full bg-black" style={{ width: '50%' }}></div>
        </div>`;

const startIdx = code.indexOf('<div className="grid grid-cols-[36px_1fr_1fr] bg-surface-elevated');
if (startIdx !== -1) {
  const endIdx = code.indexOf('COLUMN 3: AI Explanation');
  if (endIdx !== -1) {
    const endDivIdx = code.lastIndexOf('</div>', endIdx); 
    
    code = code.substring(0, startIdx) + replacement + '\n' + code.substring(endDivIdx);
    fs.writeFileSync('src/components/ChessDashboard.tsx', code);
    console.log('Successfully replaced move list UI');
  } else {
    console.log('could not find column 3');
  }
} else {
  console.log('could not find start marker');
}
