const pool = require("../config/db");

/**
 * Obtener o crear carrito activo
 */
exports.obtenerOCrearCarrito = async (req, res) => {




  // dentro de obtenerOCrearCarrito
const [result] = await pool.query(
  `INSERT INTO carritos (cliente_id, estado, last_activity)
   VALUES (?, 'activo', NOW())`,
  [cliente_id]
);

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
            // 🔄 marcar actividad al recuperar carrito activo
      await pool.query(
        `UPDATE carritos SET last_activity = NOW() WHERE id = ?`,
        [existente[0].id]
      );

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
   SET
     total = (
       SELECT IFNULL(SUM(subtotal), 0)
       FROM carrito_items
       WHERE carrito_id = ?
     ),
     last_activity = NOW(),
     fue_abandonado = 0
   WHERE id = ? AND estado = 'activo'`,
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
/**
 * Enviar carrito (CIERRA y CREA uno nuevo)
 */
exports.enviarCarrito = async (req, res) => {
  try {
    const { carrito_id, canal_envio } = req.body;

    if (!carrito_id) {
      return res.status(400).json({ ok: false, msg: "carrito_id requerido" });
    }

    // 1. Obtener carrito actual
    const [[carrito]] = await pool.query(
      "SELECT cliente_id FROM carritos WHERE id = ?",
      [carrito_id]
    );

    if (!carrito) {
      return res.status(404).json({ ok: false, msg: "Carrito no encontrado" });
    }

    // 2. Marcar carrito como enviado (cerrado)
    await pool.query(
      `
      UPDATE carritos
      SET estado = 'enviado',
          canal_envio = ?,
          updated_at = NOW()
      WHERE id = ?
      `,
      [canal_envio || "web", carrito_id]
    );

    // 3. Crear nuevo carrito activo para el cliente
    const [nuevo] = await pool.query(
      `
      INSERT INTO carritos (cliente_id, estado)
      VALUES (?, 'activo')
      `,
      [carrito.cliente_id]
    );

    res.json({
      ok: true,
      msg: "Carrito enviado y nuevo carrito creado",
      nuevo_carrito_id: nuevo.insertId
    });

  } catch (error) {
    console.error("Error enviarCarrito:", error);
    res.status(500).json({ ok: false });
  }
};

/**
 * Listar carritos - ADMIN
 */
/*exports.listarCarritosAdmin = async (req, res) => {
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
/*exports.listarDetalleCarritoAdmin = async (req, res) => {
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
};*/




exports.syncCarritoDesdeFrontend = async (req, res) => {
  try {
    const { cliente_id, items, canal_envio } = req.body;

    if (!cliente_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Carrito vacío o datos inválidos"
      });
    }

    // 1️⃣ Crear carrito ENVIADO
    const [result] = await pool.query(
      `INSERT INTO carritos (cliente_id, estado, total, canal_envio)
       VALUES (?, 'enviado', 0, ?)`,
      [cliente_id, canal_envio || "web"]
    );

    const carritoId = result.insertId;
    let total = 0;

    // 2️⃣ Insertar productos reales
    for (const item of items) {
      const precio = Number(item.precioUnitario || 0);
      const subtotal = precio * item.cantidad;
      total += subtotal;

   await pool.query(
  `INSERT INTO carrito_items
   (carrito_id, producto_id, nombre_producto, proveedor_id, precio, cantidad)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [
    carritoId,
    item.id,
    item.nombre,       // ✅ nombre_producto
    item.proveedorId,
    precio,
    item.cantidad
  ]
);
    }

    // 3️⃣ Actualizar total del carrito
    await pool.query(
      `UPDATE carritos SET total = ? WHERE id = ?`,
      [total, carritoId]
    );

    res.json({
      ok: true,
      carrito_id: carritoId
    });

  } catch (error) {
    console.error("❌ Error sync carrito:", error);
    res.status(500).json({ ok: false });
  }
};


exports.pingActividad = async (req, res) => {
  try {
    const { carrito_id } = req.body;

    if (!carrito_id) {
      return res.status(400).json({ ok: false });
    }

    await pool.query(
      `UPDATE carritos
       SET last_activity = NOW(),
           fue_abandonado = 0
       WHERE id = ? AND estado = 'activo'`,
      [carrito_id]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("pingActividad", e);
    res.status(500).json({ ok: false });
  }
};
