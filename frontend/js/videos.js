document.addEventListener("DOMContentLoaded", async () => {
  const videoEl = document.getElementById("story-video");
  const progressBar = document.getElementById("progressBar");
  const prevBtn = document.getElementById("prevVideo");
  const nextBtn = document.getElementById("nextVideo");
  const overlayImg = document.getElementById("overlayImage");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayBtn = document.getElementById("overlayBtn");
  
  // Nuevos elementos de control
  const playPauseBtn = document.getElementById("playPauseBtn");
  const volumeBtn = document.getElementById("volumeBtn");
  const timeBar = document.getElementById("timeBar");
  const timeBarFill = document.getElementById("timeBarFill");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");
  const viewCountEl = document.getElementById("viewCount");
  const videoControls = document.querySelector(".video-controls");

  if (!videoEl) return;

  let videos = [];
  let proveedores = [];
  let current = 0;
  let progressTimer = null;
  let isPausedExternally = false;
  let viewCounts = {}; // Almacenar vistas por video

  // === Cargar data inicial ===
  try {
    const [videosRes, provRes] = await Promise.all([
      fetch("/data/videos.json"),
      fetch("/data/proveedores.json"),
    ]);
    videos = await videosRes.json();
    proveedores = await provRes.json();
    
    // Inicializar contadores de vistas
    videos.forEach((v, idx) => {
      const storedViews = localStorage.getItem(`video_views_${idx}`);
      viewCounts[idx] = storedViews ? parseInt(storedViews) : 0;
    });
  } catch (err) {
    console.error("Error cargando archivos JSON:", err);
    return;
  }

  // === CONTROLES DE VIDEO ===
  
  // Play/Pause
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

  // Volumen
  if (volumeBtn) {
    volumeBtn.addEventListener("click", () => {
      videoEl.muted = !videoEl.muted;
      volumeBtn.innerHTML = videoEl.muted 
        ? '<i class="fas fa-volume-mute"></i>' 
        : '<i class="fas fa-volume-up"></i>';
    });
  }

  // Barra de tiempo
  if (timeBar) {
    timeBar.addEventListener("click", (e) => {
      const rect = timeBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoEl.currentTime = percent * videoEl.duration;
    });
  }

  // Actualizar tiempo
  videoEl.addEventListener("timeupdate", () => {
    if (videoEl.duration) {
      const percent = (videoEl.currentTime / videoEl.duration) * 100;
      if (timeBarFill) timeBarFill.style.width = percent + "%";
      if (currentTimeEl) currentTimeEl.textContent = formatTime(videoEl.currentTime);
    }
  });

  // Mostrar controles al mover el mouse
  let hideControlsTimeout;
  const playerWrap = document.querySelector(".video-player-wrap");
  
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

  // === Función para formatear tiempo ===
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  // === Incrementar y mostrar vistas ===
  function incrementViews(videoIndex) {
    viewCounts[videoIndex] = (viewCounts[videoIndex] || 0) + 1;
    localStorage.setItem(`video_views_${videoIndex}`, viewCounts[videoIndex]);
    
    if (viewCountEl) {
      // Animación de contador
      const targetCount = viewCounts[videoIndex];
      let currentCount = 0;
      const increment = Math.ceil(targetCount / 20);
      const timer = setInterval(() => {
        currentCount += increment;
        if (currentCount >= targetCount) {
          currentCount = targetCount;
          clearInterval(timer);
        }
        viewCountEl.textContent = formatViews(currentCount);
      }, 30);
    }
  }

  // Formatear número de vistas (1000 = 1K)
  function formatViews(count) {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  }

  // === Cargar y reproducir video ===
  async function loadVideo(idx) {
    clearInterval(progressTimer);
    progressBar.style.width = "0%";
    if (timeBarFill) timeBarFill.style.width = "0%";

    const v = videos[idx];
    if (!v) return;

    // Incrementar vistas
    incrementViews(idx);

    // Configurar fuente de video
    videoEl.src = v.src;
    videoEl.load();

    // Buscar proveedor correspondiente
    const proveedor = proveedores.find(
      (p) => Number(p.id) === Number(v.proveedorId)
    );

    const proveedorUrl = proveedor ? `proveedor.html?id=${proveedor.id}` : "#";

    // Actualizar overlay
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

  // Pedir login, pero no pausar todavía
  requireLogin(() => {
    // Solo aquí pausamos y abrimos el catálogo si el login fue exitoso
    pauseStory();
    abrirProveedor(proveedor.id, proveedor.nombre);
  });

  // Si cierra el modal de login, no pasa nada, el video sigue reproduciéndose
};



    // Click sobre el video → pausa/play
    videoEl.onclick = () => {
      if (videoEl.paused) {
        videoEl.play();
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        videoEl.pause();
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
    };

    // Reproducir video y barra
    videoEl.onloadedmetadata = () => {
      const dur = isFinite(videoEl.duration) ? videoEl.duration : 15;
      
      // Actualizar duración
      if (durationEl) durationEl.textContent = formatTime(dur);
      
      // Detectar si el video es vertical (TikTok) u horizontal (YouTube)
      const videoWidth = videoEl.videoWidth;
      const videoHeight = videoEl.videoHeight;
      const aspectRatio = videoWidth / videoHeight;
      
      const playerWrap = document.querySelector(".video-player-wrap");
      
      if (aspectRatio < 1) {
        // Video vertical (TikTok/Reels/Stories)
        playerWrap.classList.add("vertical-video");
        console.log("📱 Video vertical detectado (TikTok/Reels)");
      } else {
        // Video horizontal (YouTube)
        playerWrap.classList.remove("vertical-video");
        console.log("🎬 Video horizontal detectado (YouTube)");
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

  // === Barra de progreso ===
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

  // === Navegación entre videos ===
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

  // === Iniciar el primer video ===
  loadVideo(current);
});