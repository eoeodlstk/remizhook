import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// data 폴더가 없으면 생성 (Docker 볼륨 마운트용)
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'data.db');
const isNewDb = !fs.existsSync(dbPath);

// Database initialization
export const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database at', dbPath);
    }
});

// Create tables if they do not exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS crawling_point (
            site_key TEXT PRIMARY KEY,
            last_id INTEGER NOT NULL DEFAULT 0
        )
    `);

    // 최초 실행 시 data.json이 있으면 자동 마이그레이션
    if (isNewDb) {
        migrateFromJson();
    }
});

/**
 * data.json 파일이 존재하면 읽어서 SQLite로 마이그레이션합니다.
 * Docker 최초 실행 시 자동으로 호출됩니다.
 */
function migrateFromJson() {
    // data.json 경로 후보들 (Docker 마운트 위치 또는 프로젝트 루트)
    const candidates = [
        path.resolve(process.cwd(), 'data.json'),       // /app/data.json (Docker 마운트)
        path.resolve(process.cwd(), 'data', 'data.json') // /app/data/data.json
    ];

    const jsonPath = candidates.find(p => fs.existsSync(p));
    if (!jsonPath) {
        console.log('[마이그레이션] data.json 파일이 없습니다. 새 DB로 시작합니다.');
        return;
    }

    try {
        const raw = fs.readFileSync(jsonPath, 'utf-8');
        const jsonData: Record<string, number> = JSON.parse(raw);

        const stmt = db.prepare(`
            INSERT INTO crawling_point (site_key, last_id)
            VALUES (?, ?)
            ON CONFLICT(site_key)
            DO UPDATE SET last_id = excluded.last_id
        `);

        for (const [key, value] of Object.entries(jsonData)) {
            stmt.run(key, value);
            console.log(`[마이그레이션] ✅ ${key} = ${value}`);
        }

        stmt.finalize();
        console.log('[마이그레이션] 🎉 data.json → SQLite 마이그레이션 완료!');
    } catch (err) {
        console.error('[마이그레이션] data.json 읽기 실패:', err);
    }
}

/**
 * Gets the last successfully parsed ID for a specific site from SQLite.
 * If there is no record for the site, returns 0.
 */
export function getLastId(siteKey: string): Promise<number> {
    return new Promise((resolve, reject) => {
        db.get('SELECT last_id FROM crawling_point WHERE site_key = ?', [siteKey], (err, row: any) => {
            if (err) {
                console.error(`Error querying lastId for ${siteKey}:`, err);
                reject(err);
            } else {
                resolve(row ? row.last_id : 0);
            }
        });
    });
}

/**
 * Sets the last successfully parsed ID for a specific site in SQLite.
 * Uses UPSERT behavior to insert or update the value safely.
 */
export function setLastId(siteKey: string, lastId: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO crawling_point (site_key, last_id) 
            VALUES (?, ?) 
            ON CONFLICT(site_key) 
            DO UPDATE SET last_id = excluded.last_id
        `;
        db.run(query, [siteKey, lastId], function (err) {
            if (err) {
                console.error(`Error updating lastId for ${siteKey}:`, err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
