/*
=========================================================
 DescoApp - Remisiones de compra
 Archivo: backend/routes/remisiones.js

 Expone dos funciones (se montan manualmente en server.js):

   crearRemision  -> POST /api/remisiones
       Recibe { cliente, proveedores, total }, genera un
       número de remisión consecutivo (REM-000001, REM-000002...),
       guarda el detalle en data/remisiones/{numero}.json,
       y responde { numero, url }.

   verRemision    -> GET /remision/:numero
       Lee data/remisiones/{numero}.json y muestra una
       página HTML con el detalle de la compra, más un
       botón para descargarla como imagen (opcional).
=========================================================*/

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const REMISIONES_DIR = path.join(DATA_DIR, "remisiones");
const CONTADOR_FILE = path.join(REMISIONES_DIR, "_contador.json");
const INDICE_FILE = path.join(REMISIONES_DIR, "_indice_carritos.json");
const SITE_URL = "https://descoapp.com";

// Asegura que la carpeta de remisiones exista
function asegurarCarpeta() {
  if (!fs.existsSync(REMISIONES_DIR)) {
    fs.mkdirSync(REMISIONES_DIR, { recursive: true });
  }
}

function escapeHtml(texto = "") {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// =====================
// Consecutivo real, guardado en disco (no en localStorage)
// =====================
function siguienteNumeroRemision() {
  asegurarCarpeta();

  let contador = 0;
  if (fs.existsSync(CONTADOR_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONTADOR_FILE, "utf8"));
      contador = Number(data.ultimo) || 0;
    } catch (e) {
      contador = 0;
    }
  }

  contador++;
  fs.writeFileSync(CONTADOR_FILE, JSON.stringify({ ultimo: contador }, null, 2));

  return "REM-" + String(contador).padStart(6, "0");
}

// =====================
// Índice: carrito_id -> numero_remision
// (permite al dashboard encontrar la remisión de un carrito
//  sin tocar la base de datos)
// =====================
function leerIndice() {
  if (!fs.existsSync(INDICE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(INDICE_FILE, "utf8"));
  } catch (e) {
    return {};
  }
}

function guardarEnIndice(carritoId, numero) {
  if (!carritoId) return;
  asegurarCarpeta();
  const indice = leerIndice();
  indice[String(carritoId)] = numero;
  fs.writeFileSync(INDICE_FILE, JSON.stringify(indice, null, 2));
}

// =====================
// POST /api/remisiones
// =====================
function crearRemision(req, res) {
  try {
    const { cliente, proveedores, total, carritoId } = req.body;

    if (!Array.isArray(proveedores) || proveedores.length === 0) {
      return res.status(400).json({ ok: false, message: "Faltan productos para generar la remisión." });
    }

    asegurarCarpeta();

    const numero = siguienteNumeroRemision();

    const registro = {
      numero,
      fecha: new Date().toISOString(),
      cliente: cliente || {},
      proveedores,
      total: total || 0,
      carritoId: carritoId || null
    };

    const archivo = path.join(REMISIONES_DIR, `${numero}.json`);
    fs.writeFileSync(archivo, JSON.stringify(registro, null, 2));

    if (carritoId) {
      guardarEnIndice(carritoId, numero);
    }

    return res.json({
      ok: true,
      numero,
      url: `${SITE_URL}/remision/${numero}`
    });
  } catch (err) {
    console.error("Error creando remisión:", err);
    return res.status(500).json({ ok: false, message: "Error interno generando la remisión." });
  }
}

// =====================
// GET /remision/:numero
// =====================
function verRemision(req, res) {
  const { numero } = req.params;

  // Validación simple del formato esperado (REM-000001)
  if (!/^REM-\d{6}$/.test(numero)) {
    return res.status(404).send("Remisión no encontrada.");
  }

  const archivo = path.join(REMISIONES_DIR, `${numero}.json`);

  if (!fs.existsSync(archivo)) {
    return res.status(404).send("Remisión no encontrada.");
  }

  let datos;
  try {
    datos = JSON.parse(fs.readFileSync(archivo, "utf8"));
  } catch (err) {
    return res.status(500).send("Error leyendo la remisión.");
  }

  const cliente = datos.cliente || {};
  const fecha = new Date(datos.fecha).toLocaleString("es-CO", {
    dateStyle: "long",
    timeStyle: "short"
  });

  let productosHtml = "";
  (datos.proveedores || []).forEach((prov) => {
    productosHtml += `<h3 class="proveedor-nombre">${escapeHtml(prov.proveedorNombre || "")}</h3>`;
    (prov.productos || []).forEach((p) => {
      productosHtml += `
        <div class="fila-producto">
          <span>${escapeHtml(p.nombre)} x${escapeHtml(String(p.cantidad))}</span>
          <strong>${escapeHtml(p.subtotalProducto)}</strong>
        </div>`;
    });
    productosHtml += `
      <div class="fila-subtotal">
        <span>Subtotal</span>
        <strong>${escapeHtml(prov.subtotal !== undefined ? String(prov.subtotal) : "")}</strong>
      </div>`;
  });

  const totalFormateado = typeof datos.total === "number"
    ? datos.total.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    : escapeHtml(String(datos.total || ""));

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Remisión ${escapeHtml(datos.numero)} | DescoApp</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #f2f2f2;
    color: #222;
    display: flex;
    justify-content: center;
    padding: 24px 12px;
  }
  #remision {
    background: #fff;
    width: 100%;
    max-width: 420px;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .encabezado { text-align: center; }
  .encabezado img { width: 160px; margin-bottom: 8px; }
  .encabezado h2 { margin: 6px 0 2px; }
  .encabezado p { margin: 2px 0; color: #555; font-size: 14px; }
  hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
  h3.seccion { margin-bottom: 6px; }
  .proveedor-nombre { margin-top: 14px; margin-bottom: 6px; color: #1565C0; }
  .fila-producto {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #eee;
    padding: 5px 0;
    font-size: 14px;
  }
  .fila-subtotal {
    display: flex;
    justify-content: space-between;
    padding: 6px 0 0;
    font-size: 14px;
    color: #555;
  }
  .total {
    text-align: right;
    font-size: 20px;
    margin-top: 10px;
  }
  .gracias { text-align: center; margin-top: 16px; color: #555; }
  .acciones { margin-top: 22px; text-align: center; }
  .btn {
    display: inline-block;
    padding: 12px 20px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
    margin: 6px;
  }
  .btn-descargar { background: #1565C0; color: #fff; }
  .btn-seguir { background: #ff6f00; color: #fff; }
</style>
</head>
<body>
<div id="remision">
  <div class="encabezado">
    <img src="/img/plataforma/newdescoappsinf.png" alt="DescoApp">
    <h2>REMISIÓN DE COMPRA</h2>
    <p>${escapeHtml(datos.numero)}</p>
    <p>${escapeHtml(fecha)}</p>
  </div>

  <hr>
  <h3 class="seccion">CLIENTE</h3>
  <p>${escapeHtml(cliente.nombre || "No registrado")}</p>
  <p>Cédula: ${escapeHtml(cliente.cedula || "No registrada")}</p>
  <p>Tel: ${escapeHtml(cliente.telefono || "No registrado")}</p>

  <hr>
  <h3 class="seccion">PRODUCTOS</h3>
  ${productosHtml}

  <hr>
  <div class="total">TOTAL: ${totalFormateado}</div>

  <p class="gracias">Gracias por comprar en DescoApp</p>

  <div class="acciones">
    <button class="btn btn-descargar" onclick="descargarComoImagen()">📥 Descargar como imagen</button>
    <a class="btn btn-seguir" href="${SITE_URL}">🛍️ Seguir comprando</a>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script>
  async function descargarComoImagen() {
    const nodo = document.getElementById('remision');
    const canvas = await html2canvas(nodo);
    const imagen = canvas.toDataURL('image/png');
    const enlace = document.createElement('a');
    enlace.href = imagen;
    enlace.download = '${escapeHtml(datos.numero)}.png';
    enlace.click();
  }
</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(html);
}

// =====================
// GET /api/admin/remision-de-carrito/:carritoId
// Usado por el dashboard para saber si un carrito
// ya tiene remisión, y obtener su link.
// =====================
function obtenerRemisionDeCarrito(req, res) {
  const { carritoId } = req.params;
  const indice = leerIndice();
  const numero = indice[String(carritoId)];

  if (!numero) {
    return res.json({ ok: false });
  }

  return res.json({
    ok: true,
    numero,
    url: `${SITE_URL}/remision/${numero}`
  });
}

module.exports = { crearRemision, verRemision, obtenerRemisionDeCarrito };