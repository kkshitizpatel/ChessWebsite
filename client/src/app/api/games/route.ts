import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Using a static path to the database
const dbPath = path.join(process.cwd(), 'data', 'games.db');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const p1 = searchParams.get('p1')?.toLowerCase() || '';
    const p2 = searchParams.get('p2')?.toLowerCase() || '';
    const yearStart = parseInt(searchParams.get('yearStart') || '1800');
    const yearEnd = parseInt(searchParams.get('yearEnd') || '2026');
    const result = searchParams.get('result') || 'all';

    const db = new Database(dbPath, { readonly: true });

    let query = `
      SELECT * FROM games
      WHERE CAST(date AS INTEGER) >= ? AND CAST(date AS INTEGER) <= ?
    `;
    const params: any[] = [yearStart, yearEnd];

    if (p1 || p2) {
      // If both p1 and p2 are provided, match both
      if (p1 && p2) {
        query += ` AND ((LOWER(white) LIKE ? AND LOWER(black) LIKE ?) OR (LOWER(white) LIKE ? AND LOWER(black) LIKE ?))`;
        params.push(`%${p1}%`, `%${p2}%`, `%${p2}%`, `%${p1}%`);
      } else {
        // If only one is provided
        const p = p1 || p2;
        query += ` AND (LOWER(white) LIKE ? OR LOWER(black) LIKE ?)`;
        params.push(`%${p}%`, `%${p}%`);
      }
    }

    if (result !== 'all') {
      if (result === 'white') {
        query += ` AND result = 'white'`;
      } else if (result === 'black') {
        query += ` AND result = 'black'`;
      } else if (result === 'draw') {
        query += ` AND result = 'draw'`;
      }
    }

    query += ` ORDER BY date DESC LIMIT 1000`; // Limit to 1000 for safety

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);
    db.close();

    // Map back to JSON structure expected by frontend
    const mappedGames = rows.map((row: any) => ({
      id: row.id,
      white: { name: row.white, rating: row.whiteElo },
      black: { name: row.black, rating: row.blackElo },
      winner: row.result,
      year: parseInt(row.date),
      event: row.event,
      pgn: row.pgn
    }));

    return NextResponse.json(mappedGames);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
