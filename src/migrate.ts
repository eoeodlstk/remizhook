import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data.db');
const db = new sqlite3.Database(dbPath);

// 기존 data.json에서 가져온 데이터
const existingData: Record<string, number> = {
    "ppomppu_computer": 687620,
    "foppomppu_computer": 126840,
    "foppomppu_digital": 84789,
    "quasa_digital": 1929156,
    "ruri_digital": 102203,
    "coolnjoy_digital": 3437869,
    "deal_digital": 29284,
    "fodeal_digital": 12369,
    "hotdeal_chanel": 164104719,
    "zod_digital": 5293720
};

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS crawling_point (
            site_key TEXT PRIMARY KEY,
            last_id INTEGER NOT NULL DEFAULT 0
        )
    `);

    const stmt = db.prepare(`
        INSERT INTO crawling_point (site_key, last_id)
        VALUES (?, ?)
        ON CONFLICT(site_key)
        DO UPDATE SET last_id = excluded.last_id
    `);

    for (const [key, value] of Object.entries(existingData)) {
        stmt.run(key, value);
        console.log(`✅ ${key} = ${value} 삽입 완료`);
    }

    stmt.finalize();
    console.log('\n🎉 모든 데이터 마이그레이션 완료!');
});

db.close();
