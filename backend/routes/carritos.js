const express = require("express");
const router = express.Router();
const carritosController = require("../controllers/carritosController");

// CLIENTE
router.post("/obtener-o-crear", carritosController.obtenerOCrearCarrito);
router.post("/agregar-item", carritosController.agregarItem);
router.post("/enviar", carritosController.enviarCarrito);
router.post("/sync", carritosController.syncCarritoDesdeFrontend);


router.post("/sync", async (req, res) => {
  try {
    const { cliente_id, items, canal_envio } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ ok: false, msg: "Carrito vacío" });
    }

    // 1️⃣ crear carrito
    const [result] = await db.query(
      `INSERT INTO carritos (cliente_id, estado_cliente, canal_envio)
       VALUES (?, 'activo', ?)`,
      [cliente_id, canal_envio]
    );

    const carritoId = result.insertId;

    let total = 0;

    // 2️⃣ insertar items
    for (const item of items) {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;

      await db.query(
        `INSERT INTO carrito_items
         (carrito_id, producto_id, nombre, precio, cantidad, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          carritoId,
          item.id,
          item.nombre,
          item.precio,
          item.cantidad,
          subtotal
        ]
      );
    }

    // 3️⃣ actualizar total
    await db.query(
      `UPDATE carritos SET total = ? WHERE id = ?`,
      [total, carritoId]
    );

    res.json({ ok: true, carrito_id: carritoId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error });
  }
});



module.exports = router;
