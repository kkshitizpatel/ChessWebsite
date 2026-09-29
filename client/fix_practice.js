const fs = require('fs');
let c = fs.readFileSync('src/components/ChessDashboard.tsx', 'utf8');

c = c.replace(
  'setAiResponse("Evaluating position with Stockfish 16.1...");',
  'setAiResponse("Evaluating position with Stockfish 18...");'
);

const hookCode = `
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
`;

if (!c.includes('if (!isPracticing || !engineRef.current || gameStatus !== "active") return;')) {
  c = c.replace(
    'const handleStartAnalysis = async () => {',
    hookCode + '\n  const handleStartAnalysis = async () => {'
  );
}

fs.writeFileSync('src/components/ChessDashboard.tsx', c, 'utf8');
console.log("Updated stockfish text and added practice hook");
