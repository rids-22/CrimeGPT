import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

let pgPool: Pool | null = null;
let sqliteDb: sqlite3.Database | null = null;
let isSQLite = false;

// Initialize Database Connection
export async function initDatabase() {
  const useSQLiteEnv = process.env.USE_SQLITE === 'true';
  const pgConnectionString = process.env.DATABASE_URL;

  if (useSQLiteEnv || (!pgConnectionString && !process.env.PGHOST)) {
    console.warn('⚠️ No PostgreSQL configuration found. Falling back to SQLite.');
    setupSQLite();
    return;
  }

  try {
    console.log('Connecting to PostgreSQL database...');
    pgPool = new Pool({
      connectionString: pgConnectionString,
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      port: parseInt(process.env.PGPORT || '5432'),
      // Set short connection timeout for fallback detection
      connectionTimeoutMillis: 3000,
    });
    
    // Test connection
    await pgPool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL successfully.');
    await runMigrationsPG();
  } catch (err: any) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    console.warn('⚠️ Falling back to SQLite database.');
    pgPool = null;
    setupSQLite();
  }
}

function setupSQLite() {
  isSQLite = true;
  const dbPath = path.join(__dirname, '..', '..', 'crimegpt.sqlite');
  
  // Ensure the database file's directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Failed to open SQLite database:', err.message);
    } else {
      console.log(`✅ Connected to SQLite database at: ${dbPath}`);
      // Enable foreign keys
      sqliteDb?.run('PRAGMA foreign_keys = ON;');
      runMigrationsSQLite();
    }
  });
}

// Unified Query Function
export async function query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
  if (isSQLite && sqliteDb) {
    // Convert PostgreSQL parameters ($1, $2, etc.) to SQLite parameters (?, ?, etc.)
    // Note: Replace $1, $2... with ?
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    
    return new Promise((resolve, reject) => {
      sqliteDb!.all(sqliteSql, params, (err, rows) => {
        if (err) {
          console.error(`SQLite query error: ${sqliteSql}`, err);
          reject(err);
        } else {
          resolve({ rows });
        }
      });
    });
  } else if (pgPool) {
    return pgPool.query(sql, params);
  } else {
    throw new Error('Database not initialized');
  }
}

// Helper for single row results
export async function queryOne(sql: string, params: any[] = []): Promise<any | null> {
  const result = await query(sql, params);
  return result.rows.length > 0 ? result.rows[0] : null;
}

// PostgreSQL Migrations
async function runMigrationsPG() {
  if (!pgPool) return;
  console.log('Running PostgreSQL table setup...');
  
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL,
      police_station VARCHAR(100),
      role_credential VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cases (
      id SERIAL PRIMARY KEY,
      case_number VARCHAR(50) UNIQUE NOT NULL,
      fir_number VARCHAR(50) UNIQUE NOT NULL,
      police_station VARCHAR(100) NOT NULL,
      date_of_incident DATE NOT NULL,
      crime_type VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      narrative_description TEXT NOT NULL,
      victim_name VARCHAR(100) NOT NULL,
      victim_address TEXT,
      victim_contact VARCHAR(20),
      accused_name VARCHAR(100) NOT NULL,
      accused_address TEXT,
      accused_photo_url TEXT,
      witness_name VARCHAR(100),
      witness_contact VARCHAR(20),
      status VARCHAR(20) DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id SERIAL PRIMARY KEY,
      case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      type VARCHAR(100) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS case_diary (
      id SERIAL PRIMARY KEY,
      case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      entry_type VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      officer_name VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      username VARCHAR(100) NOT NULL,
      action VARCHAR(100) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      modified_data TEXT
    );
  `;

  try {
    await pgPool.query(createTablesSQL);
    // Add role_credential if table exists from before
    await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS role_credential VARCHAR(100);');
    console.log('✅ PostgreSQL tables verified/created.');
    await seedDefaultUsers();
  } catch (err: any) {
    console.error('❌ Error creating PostgreSQL tables:', err.message);
  }
}

// SQLite Migrations
function runMigrationsSQLite() {
  if (!sqliteDb) return;
  console.log('Running SQLite table setup...');

  sqliteDb.serialize(() => {
    sqliteDb!.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        police_station TEXT,
        role_credential TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Try to run ALTER in case table existed before without column
    sqliteDb!.run(`ALTER TABLE users ADD COLUMN role_credential TEXT;`, (err) => {
      // Ignore "duplicate column name" error silently
    });

    sqliteDb!.run(`
      CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_number TEXT UNIQUE NOT NULL,
        fir_number TEXT UNIQUE NOT NULL,
        police_station TEXT NOT NULL,
        date_of_incident TEXT NOT NULL,
        crime_type TEXT NOT NULL,
        location TEXT NOT NULL,
        narrative_description TEXT NOT NULL,
        victim_name TEXT NOT NULL,
        victim_address TEXT,
        victim_contact TEXT,
        accused_name TEXT NOT NULL,
        accused_address TEXT,
        accused_photo_url TEXT,
        witness_name TEXT,
        witness_contact TEXT,
        status TEXT DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id)
      );
    `);

    sqliteDb!.run(`
      CREATE TABLE IF NOT EXISTS evidence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    sqliteDb!.run(`
      CREATE TABLE IF NOT EXISTS case_diary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        entry_type TEXT NOT NULL,
        description TEXT NOT NULL,
        officer_name TEXT NOT NULL
      );
    `);

    sqliteDb!.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        username TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        modified_data TEXT
      );
    `, (err) => {
      if (err) {
        console.error('❌ Error creating SQLite tables:', err.message);
      } else {
        console.log('✅ SQLite tables verified/created.');
        seedDefaultUsers();
      }
    });
  });
}

// Seed Initial Admin and Officers
async function seedDefaultUsers() {
  const bcrypt = require('bcryptjs');
  
  // Password is 'password123' for all seeded users
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('password123', salt);

  const defaultUsers = [
    { username: 'io_sharma', password_hash: hash, name: 'Inspector R. K. Sharma', role: 'IO', police_station: 'Chanakyapuri Police Station, New Delhi', role_credential: 'IO-10293' },
    { username: 'sho_singh', password_hash: hash, name: 'SHO Harbhajan Singh', role: 'SHO', police_station: 'Chanakyapuri Police Station, New Delhi', role_credential: 'PS-4001' },
    { username: 'legal_verma', password_hash: hash, name: 'Adv. Meera Verma', role: 'LEGAL_ADVISOR', police_station: 'District Court Prosecution Cell', role_credential: 'BC-1234/56' },
    { username: 'admin_crimegpt', password_hash: hash, name: 'System Admin', role: 'ADMIN', police_station: 'Police HQ IT Cell', role_credential: 'ADM-99182' }
  ];

  for (const user of defaultUsers) {
    try {
      const existing = await queryOne('SELECT id FROM users WHERE username = $1', [user.username]);
      if (!existing) {
        await query(
          'INSERT INTO users (username, password_hash, name, role, police_station, role_credential) VALUES ($1, $2, $3, $4, $5, $6)',
          [user.username, user.password_hash, user.name, user.role, user.police_station, user.role_credential]
        );
        console.log(`Seeded user: ${user.username} (${user.role})`);
      } else {
        // Update credentials if they are empty
        await query(
          'UPDATE users SET role_credential = $1 WHERE username = $2 AND (role_credential IS NULL OR role_credential = \'\')',
          [user.role_credential, user.username]
        );
      }
    } catch (err: any) {
      console.error(`Error seeding user ${user.username}:`, err.message);
    }
  }
}
