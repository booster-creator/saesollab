const Database = require('better-sqlite3');
const path = require('path');

// 데이터베이스 파일 경로 설정
const dbPath = path.join(__dirname, 'youtube.db');

// 데이터베이스 연결
const db = new Database(dbPath);

// 테이블 생성
db.exec(`
    CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT,
        url TEXT,
        transcript TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

console.log('Database initialized'); 