require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'road2career',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function setupDatabase() {
  // First connect to default postgres database to check/create the database
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    const adminClient = await adminPool.connect();
    const dbCheck = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [process.env.DB_NAME || 'road2career']);
    if (dbCheck.rows.length === 0) {
      console.log(`🔄 Creating database "${process.env.DB_NAME || 'road2career'}"...`);
      await adminClient.query(`CREATE DATABASE "${process.env.DB_NAME || 'road2career'}"`);
      console.log(`✅ Database created.`);
    }
    adminClient.release();
  } catch (err) {
    console.error('⚠️ Could not check/create database via default connection:', err.message);
  } finally {
    await adminPool.end();
  }

  // Now connect to target database
  const client = await pool.connect();
  try {
    console.log('🔄 Running schema...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    try {
      await client.query(schema);
      console.log('✅ Schema applied successfully');
    } catch (sErr) {
      console.log('ℹ️ Schema notice:', sErr.message);
    }

    console.log('🔄 Running seed data...');
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    try {
      await client.query(seed);
      console.log('✅ Seed data inserted successfully');
    } catch (sdErr) {
      console.log('ℹ️ Seed notice:', sdErr.message);
    }

    console.log('🎉 Database setup complete!');
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
