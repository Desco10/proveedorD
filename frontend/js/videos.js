document.addEventListener("DOMContentLoaded", async () => {
  const videoEl = document.getElementById("story-video");
  const progressBar = document.getElementById("progressBar");
  const prevBtn = document.getElementById("prevVideo");
  const nextBtn = document.getElementById("nextVideo");
  const overlayImg = document.getElementById("overlayImage");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayBtn = document.getElementById("overlayBtn");

  // Controles
  const playPauseBtn = document.getElementById("playPauseBtn");
  const volumeBtn = document.getElementById("volumeBtn");
  const timeBar = document.getElementById("timeBar");
  const timeBarFill = document.getElementById("timeBarFill");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");
  const viewCountEl = document.getElementById("viewCount");
  const videoControls = document.querySelector(".video-controls");
  const playerWrap = document.querySelector(".video-player-wrap");

  if (!videoEl) return;

  let videos = [];
  let proveedores = [];
  let current = 0;
  let progressTimer = null;
  let isPausedExternally = false;
  let countedThisLoad = false; // evita registrar 2 veces la misma reproducción (pausa/resume)

  // Reproducción más fluida
  videoEl.preload = "auto";
  videoEl.setAttribute("playsinline", "");

  // Elemento oculto para precargar el SIGUIENTE video en segundo plano
  const preloadEl = document.createElement("video");
  preloadEl.muted = true;
  preloadEl.preload = "auto";
  preloadEl.style.display = "none";
  preloadEl.setAttribute("playsinline", "");
  document.body.appendChild(preloadEl);

  function preloadNextVideo(idx) {
    const nextIdx = (idx + 1) % videos.length;
    const nextV = videos[nextIdx];
    if (!nextV) return;
    const absoluteSrc = new URL(nextV.src, window.location.href).href;
    if (preloadEl.src !== absoluteSrc) {
      preloadEl.src = nextV.src;
      preloadEl.load();
    }
  }

  // === Cargar data inicial (videos + proveedores) ===
  try {
    const [videosRes, provRes] = await Promise.all([
      fetch("/data/videos.json"),
      fetch("/data/proveedores.json"),
    ]);
    videos = await videosRes.json();
    proveedores = await provRes.json();
  } catch (err) {
    console.error("Error cargando archivos JSON:", err);
    return;
  }

  // === Contador de vistas REAL (guardado en videos.json, sin base de datos) ===
  // Muestra el valor que ya viene en videos.json y, cuando el video
  // realmente se reproduce, suma 1 vista real en el servidor.
  function showViewCount(v) {
    if (viewCountEl) viewCountEl.textContent = formatViews(v.vistas || 0);
  }

  async function registerView(v) {
    if (!v.id) return; // por seguridad, si algún video no tiene id, no se cuenta
    try {
      const res = await fetch(`/api/videos/${v.id}/view`, {
        method: "POST",
        keepalive: true,
      });
      if (res.ok) {
        const data = await res.json();
        v.vistas = data.vistas; // actualiza el valor real en memoria
        if (videos[current] === v) {
          animateViewCount(data.vistas);
        }
      }
    } catch (err) {
      console.warn("No se pudo registrar la vista:", err);
    }
  }

  function animateViewCount(to) {
    if (!viewCountEl) return;
    viewCountEl.textContent = formatViews(to);
    viewCountEl.classList.remove("bump");
    // Forzar reflow para poder repetir la animación aunque ya tenga la clase
    void viewCountEl.offsetWidth;
    viewCountEl.classList.add("bump");
  }

  function formatViews(count) {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  }

  // === CONTROLES DE VIDEO ===
  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", () => {
      if (videoEl.paused) {
        videoEl.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        videoEl.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
    });
  }

  if (volumeBtn) {
    volumeBtn.addEventListener("click", () => {
      videoEl.muted = !videoEl.muted;
      volumeBtn.innerHTML = videoEl.muted
        ? '<i class="fas fa-volume-mute"></i>'
        : '<i class="fas fa-volume-up"></i>';
    });
  }

  if (timeBar) {
    timeBar.addEventListener("click", (e) => {
      const rect = timeBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoEl.currentTime = percent * videoEl.duration;
    });
  }

  videoEl.addEventListener("timeupdate", () => {
    if (videoEl.duration) {
      const percent = (videoEl.currentTime / videoEl.duration) * 100;
      if (timeBarFill) timeBarFill.style.width = percent + "%";
      if (currentTimeEl) currentTimeEl.textContent = formatTime(videoEl.currentTime);
    }
  });

  // Indicador de carga/buffer (usa la clase .loading ya existente en el CSS)
  videoEl.addEventListener("waiting", () => {
    if (playerWrap) playerWrap.classList.add("loading");
  });
  videoEl.addEventListener("playing", () => {
    if (playerWrap) playerWrap.classList.remove("loading");
    if (!countedThisLoad) {
      countedThisLoad = true;
      registerView(videos[current]);
    }
  });

  // Mostrar controles al mover el mouse
  let hideControlsTimeout;
  if (playerWrap && videoControls) {
    playerWrap.addEventListener("mousemove", () => {
      videoControls.classList.add("show");
      clearTimeout(hideControlsTimeout);
      hideControlsTimeout = setTimeout(() => {
        if (!videoEl.paused) {
          videoControls.classList.remove("show");
        }
      }, 3000);
    });

    playerWrap.addEventListener("mouseleave", () => {
      if (!videoEl.paused) {
        videoControls.classList.remove("show");
      }
    });
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // === Funciones globales para pausar/reanudar ===
  window.pauseStory = function () {
    if (!videoEl.paused) {
      videoEl.pause();
      clearInterval(progressTimer);
      isPausedExternally = true;
      if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  };

  window.resumeStory = function () {
    if (isPausedExternally) {
      videoEl.play().catch((err) => console.warn("Autoplay bloqueado:", err));
      const remaining =
        (100 - parseFloat(progressBar.style.width)) / 100 * videoEl.duration;
      startProgress(remaining);
      isPausedExternally = false;
      if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
  };

  // === Cargar y reproducir video ===
  async function loadVideo(idx) {
    clearInterval(progressTimer);
    progressBar.style.width = "0%";
    if (timeBarFill) timeBarFill.style.width = "0%";

    const v = videos[idx];
    if (!v) return;

    countedThisLoad = false;

    // Mostrar el conteo real que ya trae videos.json
    showViewCount(v);

    // Configurar fuente de video
    videoEl.src = v.src;
    videoEl.load();

    // Precargar el siguiente para que cargue instantáneo al hacer swipe/click
    preloadNextVideo(idx);

    // Buscar proveedor correspondiente
    const proveedor = proveedores.find(
      (p) => Number(p.id) === Number(v.proveedorId)
    );

    const proveedorUrl = proveedor ? `proveedor.html?id=${proveedor.id}` : "#";

    overlayImg.src = v.thumbnail || "./img/logo.png";
    overlayTitle.textContent =
      proveedor?.nombre || v.title || "Proveedor sin nombre";
    overlayBtn.textContent = "Ver catálogo";

    overlayBtn.onclick = (e) => {
      e.preventDefault();

      if (!proveedor || typeof abrirProveedor !== "function") {
        window.location.href = proveedorUrl;
        return;
      }

      requireLogin(() => {
        pauseStory();
        abrirProveedor(proveedor.id, proveedor.nombre);
      });
    };

    videoEl.onclick = () => {
      if (videoEl.paused) {
        videoEl.play();
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        videoEl.pause();
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
    };

    videoEl.onloadedmetadata = () => {
      const dur = isFinite(videoEl.duration) ? videoEl.duration : 15;

      if (durationEl) durationEl.textContent = formatTime(dur);

      const videoWidth = videoEl.videoWidth;
      const videoHeight = videoEl.videoHeight;
      const aspectRatio = videoWidth / videoHeight;

      if (aspectRatio < 1) {
        playerWrap.classList.add("vertical-video");
      } else {
        playerWrap.classList.remove("vertical-video");
      }

      startProgress(dur);
      videoEl
        .play()
        .then(() => {
          if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        })
        .catch((err) => console.warn("Autoplay bloqueado:", err));
    };
  }

  function startProgress(duration) {
    const start = performance.now();
    clearInterval(progressTimer);
    progressTimer = setInterval(() => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, (elapsed / (duration * 1000)) * 100);
      progressBar.style.width = pct + "%";
      if (pct >= 100) {
        clearInterval(progressTimer);
        nextVideo();
      }
    }, 100);
  }

  function nextVideo() {
    current = (current + 1) % videos.length;
    loadVideo(current);
  }

  function prevVideo() {
    current = (current - 1 + videos.length) % videos.length;
    loadVideo(current);
  }

  if (nextBtn) nextBtn.addEventListener("click", nextVideo);
  if (prevBtn) prevBtn.addEventListener("click", prevVideo);

  loadVideo(current);
});