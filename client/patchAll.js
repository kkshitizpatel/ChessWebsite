const fs = require('fs');

// 1. Patch VisualSettingsModal.tsx
let modal = fs.readFileSync('src/components/VisualSettingsModal.tsx', 'utf8');
modal = modal.replace(
  'setPieceStyle: (style: string) => void;',
  'setPieceStyle: (style: string) => void;\n  usePieceIcons: boolean;\n  setUsePieceIcons: (v: boolean) => void;'
);
modal = modal.replace(
  'setPieceStyle\n}: VisualSettingsModalProps) {',
  'setPieceStyle,\n  usePieceIcons,\n  setUsePieceIcons\n}: VisualSettingsModalProps) {'
);

const checkboxHtml = `
          {/* Piece Notation Toggle */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Notation</h3>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={usePieceIcons}
                  onChange={(e) => setUsePieceIcons(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-surface-border rounded-full peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full transition-transform peer-checked:translate-x-4 peer-checked:bg-white"></div>
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition">Use Piece Icons in Move List</span>
            </label>
          </div>
`;

modal = modal.replace(
  '<h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Piece Style</h3>',
  checkboxHtml + '\n\n          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Piece Style</h3>'
);
fs.writeFileSync('src/components/VisualSettingsModal.tsx', modal, 'utf8');

// 2. Patch page.tsx
let page = fs.readFileSync('src/app/page.tsx', 'utf8');
page = page.replace(
  'const [pieceStyle, setPieceStyle] = useState("cburnett");',
  'const [pieceStyle, setPieceStyle] = useState("cburnett");\n  const [usePieceIcons, setUsePieceIcons] = useState(false);'
);
page = page.replace(
  'if (p) setPieceStyle(p);',
  'if (p) setPieceStyle(p);\n    const icons = localStorage.getItem("chess_usePieceIcons");\n    if (icons === "true") setUsePieceIcons(true);'
);
page = page.replace(
  'setPieceStyle(p);\n    localStorage.setItem("chess_pieceStyle", p);\n  };',
  'setPieceStyle(p);\n    localStorage.setItem("chess_pieceStyle", p);\n  };\n\n  const handleSetUsePieceIcons = (v: boolean) => {\n    setUsePieceIcons(v);\n    localStorage.setItem("chess_usePieceIcons", v.toString());\n  };'
);
page = page.replace(
  'setPieceStyle={handleSetPieceStyle}',
  'setPieceStyle={handleSetPieceStyle}\n        usePieceIcons={usePieceIcons}\n        setUsePieceIcons={handleSetUsePieceIcons}'
);
page = page.replace(
  'pieceStyle={pieceStyle}',
  'pieceStyle={pieceStyle}\n                usePieceIcons={usePieceIcons}'
);
fs.writeFileSync('src/app/page.tsx', page, 'utf8');

// 3. Patch ChessDashboard.tsx
let dash = fs.readFileSync('src/components/ChessDashboard.tsx', 'utf8');
dash = dash.replace(
  '{ boardTheme = "green", pieceStyle = "cburnett" }: { boardTheme?: string, pieceStyle?: string }',
  '{ boardTheme = "green", pieceStyle = "cburnett", usePieceIcons = false }: { boardTheme?: string, pieceStyle?: string, usePieceIcons?: boolean }'
);
dash = dash.replace(
  'const [usePieceIcons, setUsePieceIcons] = useState(false);\n',
  ''
);

// We need to carefully remove the checkbox from the Sliders popup.
const dashLines = dash.split('\n');
const newDashLines = [];
let skip = false;
for (let i = 0; i < dashLines.length; i++) {
  if (dashLines[i].includes('Piece Notation (Icons)')) {
     // Skip backward to the <label> tag!
     let j = newDashLines.length - 1;
     while (!newDashLines[j].includes('<label')) {
       newDashLines.pop();
       j--;
     }
     newDashLines.pop(); // Pop the <label> itself
     // Skip forward past the </label>
     while (!dashLines[i].includes('</label>')) {
       i++;
     }
     continue;
  }
  newDashLines.push(dashLines[i]);
}
fs.writeFileSync('src/components/ChessDashboard.tsx', newDashLines.join('\n'), 'utf8');

console.log("Patches applied.");
