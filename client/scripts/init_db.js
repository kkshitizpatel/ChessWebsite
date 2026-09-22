const fs = require('fs');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/games.db');
const jsonPath = path.join(__dirname, '../public/historical_games.json');

// Connect to SQLite
const db = new Database(dbPath);

console.log('Connected to SQLite database.');

// Create the table
db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    white TEXT,
    black TEXT,
    whiteElo INTEGER,
    blackElo INTEGER,
    result TEXT,
    date TEXT,
    event TEXT,
    pgn TEXT
  );
`);

console.log('Created games table.');

// Read the JSON file
if (fs.existsSync(jsonPath)) {
  const games = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  const insert = db.prepare(`
    INSERT OR REPLACE INTO games (id, white, black, whiteElo, blackElo, result, date, event, pgn)
    VALUES (@id, @white, @black, @whiteElo, @blackElo, @result, @date, @event, @pgn)
  `);

  const insertMany = db.transaction((gamesArray) => {
    for (const game of gamesArray) {
      insert.run({
        id: game.id || null,
        white: game.white?.name || null,
        black: game.black?.name || null,
        whiteElo: game.white?.rating || null,
        blackElo: game.black?.rating || null,
        result: game.winner || null,
        date: game.year ? game.year.toString() : null,
        event: 'Lichess Game',
        pgn: game.pgn || null
      });
    }
  });

  insertMany(games);
  
  console.log(`Successfully inserted ${games.length} games into the database!`);
} else {
  console.log('historical_games.json not found! Cannot populate database.');
}

db.close();
