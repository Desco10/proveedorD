const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data");

// ===================================
// PRUEBA DE LECTURA DE JSON
// ===================================
router.get("/", (req, res) => {

    const proveedorSlug = req.query.proveedor;
    const productoSlug = req.query.producto;

    const proveedores = JSON.parse(
        fs.readFileSync(
            path.join(DATA_PATH, "proveedores.json"),
            "utf8"
        )
    );

    const proveedor = proveedores.find(
        p => p.slug === proveedorSlug
    );

    if (!proveedor) {

        return res.json({
            ok: false,
            paso: "proveedor",
            mensaje: "Proveedor no encontrado"
        });

    }

    const productos = JSON.parse(
        fs.readFileSync(
            path.join(
                DATA_PATH,
                `productos_proveedor_${proveedor.id}.json`
            ),
            "utf8"
        )
    );

    const crearSlug = texto =>
        texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const producto = productos.find(p => {

        const slug = p.slug || crearSlug(p.nombre);

        return slug === productoSlug;

    });

    if (!producto) {

        return res.json({
            ok: false,
            paso: "producto",
            mensaje: "Producto no encontrado"
        });

    }

    res.json({

        ok: true,

        proveedor,

        producto

    });

});

module.exports = router;