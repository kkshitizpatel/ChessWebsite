const fs = require('fs');
let dash = fs.readFileSync('src/components/ChessDashboard.tsx', 'utf8');

// To ensure react-chessboard doesn't push its parent vertically, 
// we give its wrapper an absolute position trick inside a constrained container!
const target = `<div className="flex-1 flex items-center justify-center min-h-0 relative w-full">
          {/* Main Board Container */}
          <div className="h-full max-w-full aspect-square flex items-center justify-center relative mx-auto">
            
            <div className="w-full aspect-square relative z-10">`;

const replacement = `<div className="flex-1 flex items-center justify-center min-h-0 relative w-full">
          {/* Main Board Container */}
          <div className="h-full max-w-full aspect-square flex items-center justify-center relative mx-auto">
            
            <div className="absolute inset-0 z-10 flex justify-center items-center">
              <div className="h-full aspect-square max-w-full">`;

dash = dash.replace(target, replacement);

const target2 = `              <Chessboard 
                {...({position: fen} as any)} 
                onPieceDrop={onPieceDrop}
                boardOrientation={boardOrientation}
                customBoardStyle={{
                  borderRadius: '4px',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                }}
              />
            </div>
            
            {/* Evaluation Bar */}`;

const replacement2 = `              <Chessboard 
                {...({position: fen} as any)} 
                onPieceDrop={onPieceDrop}
                boardOrientation={boardOrientation}
                customBoardStyle={{
                  borderRadius: '4px',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                }}
              />
              </div>
            </div>
            
            {/* Evaluation Bar */}`;
            
dash = dash.replace(target2, replacement2);

fs.writeFileSync('src/components/ChessDashboard.tsx', dash, 'utf8');
console.log('Fixed aspect square using absolute trick');
