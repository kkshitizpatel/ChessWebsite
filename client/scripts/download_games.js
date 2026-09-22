const fs = require('fs');
const https = require('https');

// Top GM accounts on Lichess
const PLAYERS = [
  "DrNykterstein", // Magnus Carlsen
  "GMHikaru",      // Hikaru Nakamura
  "alireza2003",   // Alireza Firouzja
  "nihalsarin2004", // Nihal Sarin
  "RebeccaHarris", // Daniel Naroditsky
  "GataKamsky",    // Gata Kamsky
  "LyonBeast",     // Maxime Vachier-Lagrave
  "AnishGiri",     // Anish Giri
  "LevonAronian",  // Levon Aronian
  "Tigran_Petrosian" // Tigran Petrosian
];

const GAMES_PER_PLAYER = 100; // Download 100 games per player to get 1000 games total

async function downloadGames(username) {
  console.log(`Downloading games for ${username}...`);
  return new Promise((resolve, reject) => {
    const url = `https://lichess.org/api/games/user/${username}?max=${GAMES_PER_PLAYER}&pgnInJson=false&clocks=true&evals=false&opening=true`;
    
    https.get(url, { headers: { 'Accept': 'application/x-ndjson' } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error(`Failed to download for ${username}: ${res.statusCode}`);
          resolve([]);
          return;
        }
        
        const games = [];
        const lines = data.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            
            // Format to match our HistoricalGame interface
            games.push({
              id: parsed.id,
              white: {
                name: parsed.players.white.user?.name || "Unknown",
                rating: parsed.players.white.rating || 1500
              },
              black: {
                name: parsed.players.black.user?.name || "Unknown",
                rating: parsed.players.black.rating || 1500
              },
              winner: parsed.winner || (parsed.status === "draw" ? null : "unknown"),
              year: new Date(parsed.createdAt).getFullYear(),
              pgn: parsed.moves // Temporary: We are saving moves. We need to format to standard PGN later if needed, but our loadPgn currently expects PGN.
              // Wait, Lichess ndjson returns "moves": "e4 e5 Nf3...". 
              // chess.js can load SAN moves directly!
            });
          } catch (e) {
            console.error("Error parsing a line", e);
          }
        }
        resolve(games);
      });
    }).on('error', err => {
      console.error(err);
      resolve([]);
    });
  });
}

async function main() {
  let allGames = [];
  for (const player of PLAYERS) {
    const games = await downloadGames(player);
    allGames = allGames.concat(games);
    // Be nice to Lichess API
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // Actually, chess.js loadPgn expects standard PGN format. The Lichess ndjson only provides a string of moves.
  // Let's generate a full PGN string for each game so our app's `loadPgn` doesn't break.
  allGames = allGames.map(g => {
    const pgnHeader = `[Event "Lichess Game"]\n[Site "lichess.org"]\n[Date "${g.year}.??.??"]\n[White "${g.white.name}"]\n[Black "${g.black.name}"]\n[Result "${g.winner === 'white' ? '1-0' : g.winner === 'black' ? '0-1' : '1/2-1/2'}"]\n[WhiteElo "${g.white.rating}"]\n[BlackElo "${g.black.rating}"]\n\n`;
    g.pgn = pgnHeader + g.pgn;
    return g;
  });

  const outputPath = 'public/historical_games.json';
  fs.writeFileSync(outputPath, JSON.stringify(allGames, null, 2));
  console.log(`\n✅ Saved ${allGames.length} master games to ${outputPath}`);
}

main();
