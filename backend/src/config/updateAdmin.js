require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./db');
const bcrypt = require('bcryptjs');

async function updateAdmin() {
  try {
    const hash = await bcrypt.hash('Admin@123', 10);
    console.log('Generated hash:', hash);

    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, is_active, is_email_verified)
       VALUES ('00000000-0000-0000-0000-000000000001', 'admin@road2career.com', $1, 'admin', true, true)
       ON CONFLICT (email) DO UPDATE SET password_hash = $1`,
      [hash]
    );

    await pool.query(
      `INSERT INTO student_profiles (user_id, first_name, last_name, bio)
       VALUES ('00000000-0000-0000-0000-000000000001', 'System', 'Admin', 'Platform Administrator')
       ON CONFLICT (user_id) DO NOTHING`
    );

    console.log('✅ Admin user updated successfully with password: Admin@123');
  } catch (err) {
    console.error('❌ Failed to update admin:', err);
  } finally {
    await pool.end();
  }
}

updateAdmin();
