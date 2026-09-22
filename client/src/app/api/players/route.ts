import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

let db: any = null;

export async function GET(request: Request) {
  try {
    if (!db) {
      const dbPath = path.resolve(process.cwd(), '../data/games.db');
      db = new Database(dbPath, { fileMustExist: true });
    }

    const { searchParams } = new URL(request.url);
    const opponent = searchParams.get('opponent');

    if (opponent) {
      // Find all unique players who played against `opponent`
      // This means if opponent was white, we want the distinct black players, and vice versa.
      const query = `
        SELECT DISTINCT black as name FROM games WHERE white = ?
        UNION
        SELECT DISTINCT white as name FROM games WHERE black = ?
      `;
      const rows = db.prepare(query).all(opponent, opponent);
      return NextResponse.json({ players: rows.map((r: any) => r.name) });
    } else {
      // Return all unique players
      const query = `
        SELECT name FROM (
          SELECT DISTINCT white as name FROM games
          UNION
          SELECT DISTINCT black as name FROM games
        )
      `;
      const rows = db.prepare(query).all();
      return NextResponse.json({ players: rows.map((r: any) => r.name) });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
