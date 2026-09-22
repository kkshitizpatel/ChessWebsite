import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

let db: any = null;

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!db) {
      const dbPath = path.resolve(process.cwd(), '../data/games.db');
      db = new Database(dbPath, { fileMustExist: true });
    }

    const row = db.prepare('SELECT * FROM games WHERE id = ?').get(id);
    
    if (!row) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Reconstruct PGN
    let pgn = '';
    if (row.event) pgn += `[Event "${row.event}"]\n`;
    if (row.site) pgn += `[Site "${row.site}"]\n`;
    if (row.date) pgn += `[Date "${row.date}"]\n`;
    if (row.white) pgn += `[White "${row.white}"]\n`;
    if (row.black) pgn += `[Black "${row.black}"]\n`;
    if (row.result) pgn += `[Result "${row.result}"]\n`;
    if (row.whiteElo) pgn += `[WhiteElo "${row.whiteElo}"]\n`;
    if (row.blackElo) pgn += `[BlackElo "${row.blackElo}"]\n`;
    if (row.eco) pgn += `[ECO "${row.eco}"]\n`;
    pgn += `\n${row.moves}`;

    return NextResponse.json({ pgn });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
