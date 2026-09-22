const fs = require('fs');
const { execSync } = require('child_process');

const players = [
  "Erigaisi", "Abdusattorov", "Giri", "VachierLagrave", "Karjakin", 
  "Vidit", "Rapport", "Mamedyarov", "Grischuk", "Korchnoi", "Keres", 
  "Ivanchuk", "Bronstein", "Euwe", "Larsen", "Marshall", "Reshevsky"
];

async function run() {
  for (const p of players) {
    const url = `https://www.pgnmentor.com/players/${p}.zip`;
    const zipDest = `${p}.zip`;
    console.log(`Downloading ${p}...`);
    try {
      execSync(`powershell -Command "Invoke-WebRequest -Uri '${url}' -OutFile '${zipDest}' -UserAgent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'"`);
      
      console.log(`Downloaded ${p}. Extracting...`);
      execSync(`powershell -Command "Expand-Archive -Path '${zipDest}' -DestinationPath '.' -Force"`);
      console.log(`Extracted ${p}.`);
    } catch (e) {
      console.log(`Could not download ${p}: ${e.message}`);
    }
  }
}

run();
