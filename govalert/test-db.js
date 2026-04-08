const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',          // 👈 Replace with your MySQL root password if set
  database: 'gov_alert'
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Failed to connect to database:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL database!");
  connection.end();
});