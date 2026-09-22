const fs = require('fs');
let dash = fs.readFileSync('src/components/ChessDashboard.tsx', 'utf8');
dash = dash.replace(
  "const iconMap: Record<string, string> = { 'p':'?', 'n':'?', 'b':'?', 'r':'?', 'q':'?' };",
  "const iconMap: Record<string, string> = { 'p':'?', 'n':'?', 'b':'?', 'r':'?', 'q':'?' };"
);
dash = dash.replace(
  "const iconMap: Record<string, string> = { 'p':'?', 'n':'?', 'b':'?', 'r':'?', 'q':'?' };",
  "const iconMap: Record<string, string> = { 'p':'?', 'n':'?', 'b':'?', 'r':'?', 'q':'?' };"
);
fs.writeFileSync('src/components/ChessDashboard.tsx', dash, 'utf8');
console.log('Fixed icons');
