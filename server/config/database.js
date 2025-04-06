const mysql = require('mysql2');

// Configura los parámetros de la base de datos
const connection = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,     // Ajusta el límite según tus necesidades
  queueLimit: 0
});

module.exports = connection;