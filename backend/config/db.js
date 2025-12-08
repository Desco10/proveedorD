const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "proveedordb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(() => console.log("Conexión a MySQL exitosa"))
  .catch(err => console.error("Error conexión MySQL:", err));

module.exports = pool;
