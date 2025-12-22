const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "proveedordb",
  port: 3307,               // ← CAMBIO ÚNICO Y CLAVE
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => {
    console.log("Conexión a MySQL exitosa");
    conn.release();
  })
  .catch(err => {
    console.error("Error conexión MySQL:", err);
  });

module.exports = pool;
