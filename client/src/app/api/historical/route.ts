import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

let db: any = null;

export async function GET(request: Request) {
  try {
    if (!db) {
      // Path to the games.db in the data folder
      const dbPath = path.resolve(process.cwd(), '../data/games.db');
      db = new Database(dbPath, { fileMustExist: true });
    }

    const { searchParams } = new URL(request.url);
    const p1 = searchParams.get('p1') || '';
    const p2 = searchParams.get('p2') || '';
    const tournament = searchParams.get('tournament') || '';
    const yearFrom = searchParams.get('yearFrom');
    const yearTo = searchParams.get('yearTo');
    const result = searchParams.get('result');

    let query = 'SELECT id, event, site, date, white, black, result, whiteElo, blackElo, eco FROM games WHERE 1=1';
    const params: any[] = [];

    if (p1 && p2) {
      query += ' AND ((white LIKE ? AND black LIKE ?) OR (white LIKE ? AND black LIKE ?))';
      params.push(`%${p1}%`, `%${p2}%`, `%${p2}%`, `%${p1}%`);
    } else if (p1) {
      query += ' AND (white LIKE ? OR black LIKE ?)';
      params.push(`%${p1}%`, `%${p1}%`);
    } else if (p2) {
      query += ' AND (white LIKE ? OR black LIKE ?)';
      params.push(`%${p2}%`, `%${p2}%`);
    }

    if (tournament) {
      query += ' AND event LIKE ?';
      params.push(`%${tournament}%`);
    }

    if (yearFrom) {
      query += ' AND CAST(SUBSTR(date, 1, 4) AS INTEGER) >= ?';
      params.push(parseInt(yearFrom));
    }
    if (yearTo) {
      query += ' AND CAST(SUBSTR(date, 1, 4) AS INTEGER) <= ?';
      params.push(parseInt(yearTo));
    }

    if (result && result !== 'All Results') {
      if (result.includes('1-0')) {
        query += ' AND result = "1-0"';
      } else if (result.includes('0-1')) {
        query += ' AND result = "0-1"';
      } else if (result.includes('1/2')) {
        query += ' AND result = "1/2-1/2"';
      }
    }

    query += ' ORDER BY date DESC LIMIT 50';

    const rows = db.prepare(query).all(...params);
    return NextResponse.json({ games: rows });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
