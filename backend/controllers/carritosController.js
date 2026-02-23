exports.enviarCarrito = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { carrito_id, canal_envio } = req.body;

    if (!carrito_id) {
      return res.status(400).json({ ok: false, msg: "carrito_id requerido" });
    }

    await conn.beginTransaction();

    const [[carrito]] = await conn.query(
      "SELECT cliente_id FROM carritos WHERE id = ?",
      [carrito_id]
    );

    if (!carrito) {
      await conn.rollback();
      return res.status(404).json({ ok: false, msg: "Carrito no encontrado" });
    }

    await conn.query(
      `UPDATE carritos
       SET estado = 'enviado',
           canal_envio = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [canal_envio || "web", carrito_id]
    );

    const [nuevo] = await conn.query(
      `INSERT INTO carritos (cliente_id, estado)
       VALUES (?, 'activo')`,
      [carrito.cliente_id]
    );

    await conn.commit();

    res.json({
      ok: true,
      msg: "Carrito enviado y nuevo carrito creado",
      nuevo_carrito_id: nuevo.insertId
    });

  } catch (error) {
    await conn.rollback();
    console.error("Error enviarCarrito:", error);
    res.status(500).json({ ok: false });
  } finally {
    conn.release();
  }
};