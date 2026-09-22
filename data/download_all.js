const fs = require('fs');
const { execSync } = require('child_process');

const players = [
  "Steinitz", "Lasker", "Capablanca", "Alekhine", "Botvinnik", "Fischer", 
  "Karpov", "Kramnik", "Anand", "Ding", "Gukesh", "Tal", "Morphy", 
  "Rubinstein", "PolgarJ", "Nakamura", "Caruana", "Nepomniachtchi", 
  "Praggnanandhaa", "Anderssen", "So", "Aronian", "Firouzja", "Spassky", 
  "Petrosian", "Smyslov", "Chigorin", "Pillsbury", "Tarrasch", "Nimzowitsch"
];

async function run() {
  for (const p of players) {
    const url = `https://www.pgnmentor.com/players/${p}.zip`;
    const zipDest = `${p}.zip`;
    console.log(`Downloading ${p}...`);
    try {
      // Use powershell's Invoke-WebRequest with a Chrome User Agent
      execSync(`powershell -Command "Invoke-WebRequest -Uri '${url}' -OutFile '${zipDest}' -UserAgent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'"`);
      
      console.log(`Downloaded ${p}. Extracting...`);
      execSync(`powershell -Command "Expand-Archive -Path '${zipDest}' -DestinationPath '.' -Force"`);
      console.log(`Extracted ${p}.`);
    } catch (e) {
      console.log(`Could not download ${p}: ${e.message}`);
    }
  }
}

run();
