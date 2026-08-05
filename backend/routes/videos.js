// =========================================================
// RUTA: Vistas reales de videos (sin base de datos)
// Lee y escribe directamente en /data/videos.json,
// el mismo archivo que ya sirve tu servidor.
//
// Se registra en server.js con:
//   app.use("/api/videos", require("./routes/videos"));
//
// Endpoint expuesto:
//   POST /api/videos/:id/view  -> suma 1 vista real y la guarda
//   Responde: { ok: true, vistas: <numero actualizado> }
// =========================================================

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Misma carpeta /data que ya usa tu server.js (DATA_PATH)
const VIDEOS_FILE = path.join(__dirname, "..", "data", "videos.json");

// Cola simple en memoria para evitar que dos escrituras casi
// simultáneas se pisen entre sí (suficiente para el volumen normal
// de una plataforma como esta; si algún día crece mucho el tráfico,
// esto es lo primero que se migraría a una base de datos real).
let writeQueue = Promise.resolve();

function readVideos() {
  const raw = fs.readFileSync(VIDEOS_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeVideos(data) {
  fs.writeFileSync(VIDEOS_FILE, JSON.stringify(data, null, 2));
}

// POST /api/videos/:id/view
router.post("/:id/view", (req, res) => {
  const { id } = req.params;

  writeQueue = writeQueue
    .then(() => {
      const videos = readVideos();
      const video = videos.find((v) => v.id === id);

      if (!video) {
        return res.status(404).json({ ok: false, message: "Video no encontrado" });
      }

      video.vistas = (video.vistas || 0) + 1;
      writeVideos(videos);

      return res.json({ ok: true, vistas: video.vistas });
    })
    .catch((err) => {
      console.error("❌ Error registrando vista:", err);
      if (!res.headersSent) {
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
      }
    });
});

module.exports = router;