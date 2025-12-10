const db = require("../config/db");

// Expresiones regulares de validación profesional
const regexCedula = /^[0-9]{6,10}$/;
const regexTelefono = /^3[0-9]{9}$/; // Teléfonos celulares Colombia
const regexNombre = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ ]{3,50}$/;
const regexDireccion = /^[a-zA-Z0-9 #\-\.,]{5,80}$/;

// Sanitizador
function sanitize(str) {
    return String(str).trim();
}

module.exports = {

    // ================================
    // REGISTRAR CLIENTE (PROFESIONAL)
    // ================================
    registrarCliente: async (req, res) => {
        try {
            let { nombre, cedula, telefono, direccion } = req.body;

            // Sanitizar datos
            nombre = sanitize(nombre);
            cedula = sanitize(cedula);
            telefono = sanitize(telefono);
            direccion = sanitize(direccion);

            // Validaciones
            if (!regexNombre.test(nombre)) {
                return res.status(400).json({ ok: false, msg: "Nombre inválido." });
            }

            if (!regexCedula.test(cedula)) {
                return res.status(400).json({ ok: false, msg: "Cédula inválida." });
            }

            if (!regexTelefono.test(telefono)) {
                return res.status(400).json({ ok: false, msg: "Teléfono inválido. Debe ser un celular colombiano." });
            }

            if (!regexDireccion.test(direccion)) {
                return res.status(400).json({ ok: false, msg: "Dirección inválida." });
            }

            // Validar duplicados
            const [existe] = await db.query("SELECT id FROM clientes WHERE cedula = ?", [cedula]);

            if (existe.length > 0) {
                return res.status(400).json({ ok: false, msg: "La cédula ya está registrada." });
            }

            // Insertar cliente
            await db.query(
                "INSERT INTO clientes (nombre, cedula, telefono, direccion) VALUES (?, ?, ?, ?)",
                [nombre, cedula, telefono, direccion]
            );

            return res.json({ ok: true, msg: "Cliente registrado correctamente." });

        } catch (error) {
            console.error("Error registrarCliente:", error);
            return res.status(500).json({ ok: false, msg: "Error en el servidor." });
        }
    },


    // ===========================================
    // AUTOLOGIN / VALIDAR CÉDULA (YA FUNCIONA)
    // ===========================================
    validarCedula: async (req, res) => {
        try {
            const { cedula } = req.body;

            const [cliente] = await db.query("SELECT * FROM clientes WHERE cedula = ?", [cedula]);

            if (cliente.length === 0) {
                return res.json({ ok: false });
            }

            return res.json({ ok: true, cliente: cliente[0] });

        } catch (error) {
            console.error("Error validarCedula:", error);
            return res.status(500).json({ ok: false, msg: "Error en el servidor." });
        }
    },


    // ===========================================
    // VALIDACIÓN PROFESIONAL COMPLETA (NUEVO)
    // ===========================================
    validarDatosCliente: async (req, res) => {
        try {
            let { nombre, cedula, telefono, direccion } = req.body;

            nombre = sanitize(nombre);
            cedula = sanitize(cedula);
            telefono = sanitize(telefono);
            direccion = sanitize(direccion);

            if (!regexNombre.test(nombre)) {
                return res.status(400).json({ ok: false, msg: "Nombre inválido." });
            }

            if (!regexCedula.test(cedula)) {
                return res.status(400).json({ ok: false, msg: "Cédula inválida." });
            }

            if (!regexTelefono.test(telefono)) {
                return res.status(400).json({ ok: false, msg: "Teléfono inválido." });
            }

            if (!regexDireccion.test(direccion)) {
                return res.status(400).json({ ok: false, msg: "Dirección inválida." });
            }

            return res.json({ ok: true, msg: "Datos válidos." });

        } catch (error) {
            console.error("Error validarDatosCliente:", error);
            return res.status(500).json({ ok: false, msg: "Error en el servidor." });
        }
    }

};
