const fs = require('fs');
let dash = fs.readFileSync('src/components/ChessDashboard.tsx', 'utf8');
dash = dash.replace('<div className="w-full h-full max-h-full aspect-square flex items-center relative">', '<div className="h-full max-w-full aspect-square flex items-center justify-center relative mx-auto">');
fs.writeFileSync('src/components/ChessDashboard.tsx', dash, 'utf8');
console.log('Fixed aspect square');
