const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "appuser",
  password: "app1234",
  database: "proveedordb",
  port: 3308,
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
