const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

(async () => {
  const pool = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234', // Match your MySQL password
    database: 'gov_alert'
  });
  try {
    const hashedPassword = await bcrypt.hash('ruj$junehtrm', 10);
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'ali@example.com']);
    console.log('Password hashed successfully for ali@example.com');
  } catch (err) {
    console.error('Error updating password:', err);
  } finally {
    await pool.end();
  }
})();