import Database from "better-sqlite3";
import path from "path";
import { seedDemo } from "./seed";

let db;

export function getDb() {
  if (db) return db;
  const dbPath = path.join(process.cwd(), "data", "utar.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS shop (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT '',
      tone_notes TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER,
      variants TEXT NOT NULL DEFAULT '',
      stock TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      content TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS past_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_msg TEXT NOT NULL,
      seller_reply TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      message TEXT NOT NULL,
      needs_human INTEGER NOT NULL DEFAULT 0,
      reason TEXT,
      matched_json TEXT NOT NULL DEFAULT '[]',
      drafts_json TEXT NOT NULL DEFAULT '[]',
      model TEXT NOT NULL DEFAULT '',
      latency_ms INTEGER
    );
  `);
  const row = db.prepare("SELECT COUNT(*) AS n FROM products").get();
  if (row.n === 0) seedDemo(db);
  return db;
}

export function getShop() {
  const db = getDb();
  let shop = db.prepare("SELECT * FROM shop WHERE id = 1").get();
  if (!shop) {
    db.prepare("INSERT INTO shop (id, name, tone_notes) VALUES (1, '', '')").run();
    shop = db.prepare("SELECT * FROM shop WHERE id = 1").get();
  }
  return shop;
}

export function getCatalog() {
  const db = getDb();
  return {
    shop: getShop(),
    products: db.prepare("SELECT * FROM products ORDER BY id").all(),
    rules: db.prepare("SELECT * FROM rules ORDER BY id").all(),
    pastReplies: db.prepare("SELECT * FROM past_replies ORDER BY id").all(),
  };
}
