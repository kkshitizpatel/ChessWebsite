const fs = require('fs');
const https = require('https');
const path = require('path');

const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
const sets = [
  { name: 'neo', source: 'california' }, 
  { name: 'cburnett', source: 'cburnett' }, 
  { name: 'alpha', source: 'alpha' }, 
  { name: 'merida', source: 'merida' }, 
  { name: 'kosal', source: 'kosal' }
];
const baseDir = path.join(__dirname, '../public/pieces');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  for (const set of sets) {
    const setDir = path.join(baseDir, set.name);
    if (!fs.existsSync(setDir)) {
      fs.mkdirSync(setDir);
    }
    
    for (const piece of pieces) {
      const url = `https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/${set.source}/${piece}.svg`;
      const dest = path.join(setDir, `${piece}.svg`);
      try {
        await download(url, dest);
        console.log(`Downloaded ${set.name}/${piece}.svg`);
      } catch (err) {
        console.error(err.message);
      }
    }
  }
}

main();
