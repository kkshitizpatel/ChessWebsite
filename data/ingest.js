const fs = require('fs');
const readline = require('readline');
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('games.db');

db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event TEXT,
    site TEXT,
    date TEXT,
    white TEXT,
    black TEXT,
    result TEXT,
    whiteElo TEXT,
    blackElo TEXT,
    eco TEXT,
    moves TEXT
  );
  
  CREATE INDEX IF NOT EXISTS idx_white ON games(white);
  CREATE INDEX IF NOT EXISTS idx_black ON games(black);
  CREATE INDEX IF NOT EXISTS idx_event ON games(event);
  CREATE INDEX IF NOT EXISTS idx_date ON games(date);
`);

const insertStmt = db.prepare(`
  INSERT INTO games (event, site, date, white, black, result, whiteElo, blackElo, eco, moves)
  VALUES (@event, @site, @date, @white, @black, @result, @whiteElo, @blackElo, @eco, @moves)
`);

async function processPgn(filePath) {
  console.log(`Processing ${filePath}...`);
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let currentGame = {};
  let movesLines = [];
  let inMoves = false;
  let count = 0;

  db.exec('BEGIN TRANSACTION');

  for await (const line of rl) {
    const trimmed = line.trim();
    
    if (trimmed === '') {
      if (inMoves) {
        currentGame.moves = movesLines.join(' ');
        try {
          insertStmt.run({
            event: currentGame.Event || '',
            site: currentGame.Site || '',
            date: currentGame.Date || '',
            white: currentGame.White || '',
            black: currentGame.Black || '',
            result: currentGame.Result || '',
            whiteElo: currentGame.WhiteElo || '',
            blackElo: currentGame.BlackElo || '',
            eco: currentGame.ECO || '',
            moves: currentGame.moves
          });
          count++;
          if (count % 5000 === 0) {
            console.log(`Inserted ${count} games from ${filePath}...`);
          }
        } catch (e) {
          // ignore
        }
        
        currentGame = {};
        movesLines = [];
        inMoves = false;
      }
      continue;
    }

    if (trimmed.startsWith('[')) {
      const match = trimmed.match(/\[(\w+)\s+"(.*)"\]/);
      if (match) {
        currentGame[match[1]] = match[2];
      }
    } else {
      inMoves = true;
      movesLines.push(trimmed);
    }
  }

  if (inMoves) {
    currentGame.moves = movesLines.join(' ');
    insertStmt.run({
      event: currentGame.Event || '',
      site: currentGame.Site || '',
      date: currentGame.Date || '',
      white: currentGame.White || '',
      black: currentGame.Black || '',
      result: currentGame.Result || '',
      whiteElo: currentGame.WhiteElo || '',
      blackElo: currentGame.BlackElo || '',
      eco: currentGame.ECO || '',
      moves: currentGame.moves
    });
    count++;
  }

  db.exec('COMMIT');
  console.log(`Finished ${filePath}. Total games: ${count}`);
}

async function run() {
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.pgn'));
  for (const file of files) {
    // Only process if we haven't processed it before (we can check by checking DB, but to be safe let's clear DB or just accept all since DB is new-ish, but wait we already have Carlsen/Kasparov).
    // Actually, I'll just skip Carlsen and Kasparov since they are already done, or just truncate and re-do.
    // Better to re-do if we just truncate to avoid duplicates.
    // But since it's fast, let's just accept all and truncate first.
    // Wait, let's NOT truncate, just skip Carlsen/Kasparov.
    if (file === 'Carlsen.pgn' || file === 'Kasparov.pgn') {
      console.log(`Skipping ${file} as it is already ingested.`);
      continue;
    }
    await processPgn(file);
  }
  console.log('All done!');
  const row = db.prepare("SELECT COUNT(*) as c FROM games").get();
  console.log("Total games in DB:", row.c);
}

run().catch(console.error);
