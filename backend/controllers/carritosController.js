const pool = require("../config/db");

/**
 * Obtener o crear carrito activo
 */
exports.obtenerOCrearCarrito = async (req, res) => {
  try {
    const { cliente_id } = req.body;

    if (!cliente_id) {
      return res.status(400).json({ ok: false, msg: "cliente_id requerido" });
    }

    const [existente] = await pool.query(
      "SELECT * FROM carritos WHERE cliente_id = ? AND estado = 'activo' LIMIT 1",
      [cliente_id]
    );

    if (existente.length > 0) {
      return res.json({ ok: true, carrito: existente[0] });
    }

    const [result] = await pool.query(
      "INSERT INTO carritos (cliente_id, estado) VALUES (?, 'activo')",
      [cliente_id]
    );

    const [nuevo] = await pool.query(
      "SELECT * FROM carritos WHERE id = ?",
      [result.insertId]
    );

    res.json({ ok: true, carrito: nuevo[0] });
  } catch (error) {
    console.error("Error obtenerOCrearCarrito:", error);
    res.status(500).json({ ok: false });
  }
};

/**
 * Agregar item al carrito
 */
exports.agregarItem = async (req, res) => {
  try {
    const {
      carrito_id,
      producto_id,
      nombre_producto,
      precio,
      cantidad
    } = req.body;

    if (!carrito_id || !producto_id || !nombre_producto || !precio) {
      return res.status(400).json({ ok: false, msg: "Datos incompletos" });
    }

    const qty = cantidad || 1;

    await pool.query(
      `INSERT INTO carrito_items 
       (carrito_id, producto_id, nombre_producto, precio, cantidad)
       VALUES (?, ?, ?, ?, ?)`,
      [carrito_id, producto_id, nombre_producto, precio, qty]
    );

    await pool.query(
      `UPDATE carritos 
       SET total = (
         SELECT IFNULL(SUM(subtotal), 0)
         FROM carrito_items
         WHERE carrito_id = ?
       )
       WHERE id = ?`,
      [carrito_id, carrito_id]
    );

    res.json({ ok: true, msg: "Producto agregado al carrito" });
  } catch (error) {
    console.error("Error agregarItem:", error);
    res.status(500).json({ ok: false });
  }
};

/**
 * Enviar carrito
 */
exports.enviarCarrito = async (req, res) => {
  try {
    const { carrito_id, canal_envio } = req.body;

    await pool.query(
      "UPDATE carritos SET estado = 'enviado', canal_envio = ? WHERE id = ?",
      [canal_envio || "web", carrito_id]
    );

    res.json({ ok: true, msg: "Carrito enviado" });
  } catch (error) {
    console.error("Error enviarCarrito:", error);
    res.status(500).json({ ok: false });
  }
};

/**
 * Listar carritos - ADMIN
 */
exports.listarCarritosAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id AS carrito_id,
        c.estado,
        c.total,
        c.canal_envio,
        c.created_at,
        c.updated_at,
        cl.id AS cliente_id,
        cl.nombre,
        cl.telefono,
        cl.direccion,
        CASE 
          WHEN c.estado = 'enviado' THEN 'enviado'
          WHEN c.estado = 'activo'
            AND c.updated_at < (NOW() - INTERVAL 30 MINUTE)
            THEN 'abandonado'
          ELSE 'activo'
        END AS estado_admin
      FROM carritos c
      JOIN clientes cl ON cl.id = c.cliente_id
      
    `);

    res.json({ ok: true, carritos: rows });
  } catch (error) {
    console.error("Error listarCarritosAdmin:", error);
    res.status(500).json({ ok: false });
  }
};

/**
 * Detalle de un carrito (ADMIN)
 */
exports.listarDetalleCarritoAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const [items] = await pool.query(
      `
      SELECT 
        id,
        producto_id,
        nombre_producto,
        precio,
        cantidad,
        subtotal
      FROM carrito_items
      WHERE carrito_id = ?
      ORDER BY id ASC
      `,
      [id]
    );

    res.json({
      ok: true,
      carrito_id: id,
      items
    });
  } catch (error) {
    console.error("Error listarDetalleCarritoAdmin:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener el detalle del carrito"
    });
  }
};


