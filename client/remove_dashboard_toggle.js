const fs = require('fs');
let c = fs.readFileSync('src/components/ChessDashboard.tsx', 'utf8');

// I added:
/*
                      <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input type="checkbox" checked={usePieceIcons} onChange={() => onTogglePieceIcons?.()} className="accent-primary w-4 h-4" />
                        <span className="text-sm font-semibold">Use Piece Icons in Moves</span>
                      </label>
*/

c = c.replace(/<label className="flex items-center gap-2 cursor-pointer mt-2">\s*<input type="checkbox" checked=\{usePieceIcons\} onChange=\{[^}]+\} className="accent-primary w-4 h-4" \/>\s*<span className="text-sm font-semibold">Use Piece Icons in Moves<\/span>\s*<\/label>/, '');

fs.writeFileSync('src/components/ChessDashboard.tsx', c, 'utf8');
console.log("Removed from ChessDashboard");
