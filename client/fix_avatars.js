const fs = require('fs');
const lines = fs.readFileSync('src/components/ChessDashboard.tsx', 'utf8').split('\n');
lines[310] = lines[310].replace('??', '?');
lines[364] = lines[364].replace('??', '?');
lines[592] = lines[592].replace('??', '??');
fs.writeFileSync('src/components/ChessDashboard.tsx', lines.join('\n'), 'utf8');
console.log('Fixed avatars');
