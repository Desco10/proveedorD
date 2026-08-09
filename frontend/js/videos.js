// =========================================================
// DESCOAPP - REPRODUCTOR DE VIDEOS
// =========================================================
// - Autoplay inicialmente silenciado
// - Activación de sonido mediante interacción del usuario
// - Contador real de vistas
// - Precarga del siguiente video
// - Navegación anterior / siguiente
// - Pausa automática al abandonar la sección de videos
// - No modifica backend ni server.js
// =========================================================

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

  // Indica que el video fue pausado desde fuera del reproductor
  let isPausedExternally = false;

  // Evita registrar dos vistas durante la misma reproducción
  let countedThisLoad = false;

  // =========================================================
  // CONFIGURACIÓN DEL VIDEO
  // =========================================================

  videoEl.preload = "auto";
  videoEl.setAttribute("playsinline", "");

  // Volumen conservado
  videoEl.volume = 0.4;

  // IMPORTANTE:
  // El autoplay siempre comienza SILENCIADO.
  // Nunca intentamos autoplay con sonido.
  videoEl.muted = true;

  // =========================================================
  // VIDEO OCULTO PARA PRECARGAR EL SIGUIENTE
  // =========================================================

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

    const absoluteSrc = new URL(
      nextV.src,
      window.location.href
    ).href;

    if (preloadEl.src !== absoluteSrc) {
      preloadEl.src = nextV.src;
      preloadEl.load();
    }
  }

  // =========================================================
  // CARGAR DATA INICIAL
  // =========================================================

  try {
    const [videosRes, provRes] = await Promise.all([
      fetch("/data/videos.json"),
      fetch("/data/proveedores.json")
    ]);

    videos = await videosRes.json();
    proveedores = await provRes.json();

  } catch (err) {
    console.error("Error cargando archivos JSON:", err);
    return;
  }

  // =========================================================
  // CONTADOR DE VISTAS REAL
  // =========================================================

  function showViewCount(v) {
    if (viewCountEl) {
      viewCountEl.textContent = formatViews(v.vistas || 0);
    }
  }

  async function registerView(v) {
    if (!v.id) return;

    try {
      const res = await fetch(`/api/videos/${v.id}/view`, {
        method: "POST",
        keepalive: true
      });

      if (res.ok) {
        const data = await res.json();

        // Conservamos la lógica original
        v.vistas = data.vistas;

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

    // Forzar reflow para repetir animación
    void viewCountEl.offsetWidth;

    viewCountEl.classList.add("bump");
  }

  function formatViews(count) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }

    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }

    return count.toString();
  }

  // =========================================================
  // CONTROLES DE VIDEO
  // =========================================================

  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", () => {

      if (videoEl.paused) {

        videoEl.play()
          .then(() => {
            playPauseBtn.innerHTML =
              '<i class="fas fa-pause"></i>';
          })
          .catch((err) => {
            console.warn("No se pudo reproducir el video:", err);
          });

      } else {

        videoEl.pause();

        playPauseBtn.innerHTML =
          '<i class="fas fa-play"></i>';
      }
    });
  }

  // =========================================================
  // CONTROL DE VOLUMEN
  // =========================================================

  if (volumeBtn) {

    volumeBtn.addEventListener("click", () => {

      if (videoEl.muted) {

        // Esta acción ocurre por interacción real del usuario
        videoEl.muted = false;
        videoEl.volume = 0.4;

        volumeBtn.innerHTML =
          '<i class="fas fa-volume-up"></i>';

        hideSoundHint();

        // Si estuviera pausado, intentamos continuar
        videoEl.play().catch((err) => {
          console.warn(
            "No se pudo reanudar el video con sonido:",
            err
          );
        });

      } else {

        videoEl.muted = true;

        volumeBtn.innerHTML =
          '<i class="fas fa-volume-mute"></i>';
      }
    });
  }

  // =========================================================
  // BARRA DE TIEMPO
  // =========================================================

  if (timeBar) {

    timeBar.addEventListener("click", (e) => {

      const rect = timeBar.getBoundingClientRect();

      const percent =
        (e.clientX - rect.left) / rect.width;

      videoEl.currentTime =
        percent * videoEl.duration;
    });
  }

  // =========================================================
  // ACTUALIZAR TIEMPO
  // =========================================================

  videoEl.addEventListener("timeupdate", () => {

    if (videoEl.duration) {

      const percent =
        (videoEl.currentTime / videoEl.duration) * 100;

      if (timeBarFill) {
        timeBarFill.style.width = percent + "%";
      }

      if (currentTimeEl) {
        currentTimeEl.textContent =
          formatTime(videoEl.currentTime);
      }
    }
  });

  // =========================================================
  // BUFFER
  // =========================================================

  videoEl.addEventListener("waiting", () => {

    if (playerWrap) {
      playerWrap.classList.add("loading");
    }
  });

  // =========================================================
  // VIDEO REPRODUCIÉNDOSE
  // =========================================================

  videoEl.addEventListener("playing", () => {

    if (playerWrap) {
      playerWrap.classList.remove("loading");
    }

    // Mantener contador de vistas intacto
    if (!countedThisLoad) {

      countedThisLoad = true;

      registerView(videos[current]);
    }
  });

  // =========================================================
  // MOSTRAR CONTROLES AL MOVER EL MOUSE
  // =========================================================

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

  // =========================================================
  // FORMATO DEL TIEMPO
  // =========================================================

  function formatTime(seconds) {

    const mins = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // =========================================================
  // PAUSAR VIDEO EXTERNAMENTE
  // =========================================================

  window.pauseStory = function () {

    clearInterval(progressTimer);

    if (!videoEl.paused) {
      videoEl.pause();
    }

    isPausedExternally = true;

    if (playPauseBtn) {
      playPauseBtn.innerHTML =
        '<i class="fas fa-play"></i>';
    }
  };

  // =========================================================
  // REANUDAR VIDEO EXTERNAMENTE
  // =========================================================

  window.resumeStory = function () {

    if (!isPausedExternally) return;

    // Conservamos el estado actual de mute.
    // Nunca forzamos sonido durante una reanudación automática.
    videoEl.play()
      .then(() => {

        if (playPauseBtn) {
          playPauseBtn.innerHTML =
            '<i class="fas fa-pause"></i>';
        }

      })
      .catch((err) => {

        // Si el navegador bloquea la reproducción,
        // dejamos el video silenciado y mostramos la indicación.
        console.warn(
          "No se pudo reanudar automáticamente:",
          err
        );

        videoEl.muted = true;

        if (volumeBtn) {
          volumeBtn.innerHTML =
            '<i class="fas fa-volume-mute"></i>';
        }

        showSoundHint();
      });

    const remaining =
      (100 - parseFloat(progressBar.style.width || 0)) /
      100 *
      videoEl.duration;

    startProgress(remaining);

    isPausedExternally = false;

    if (playPauseBtn) {
      playPauseBtn.innerHTML =
        '<i class="fas fa-pause"></i>';
    }
  };

  // =========================================================
  // AVISO PARA ACTIVAR SONIDO
  // =========================================================

  let soundHintEl = null;

  function showSoundHint() {

    if (!playerWrap) return;

    if (!soundHintEl) {

      soundHintEl = document.createElement("div");

      soundHintEl.className = "sound-hint";

      soundHintEl.innerHTML =
        '<i class="fas fa-volume-mute"></i> Toca para activar sonido';

      soundHintEl.addEventListener("click", (e) => {

        e.preventDefault();
        e.stopPropagation();

        // Esta acción ocurre dentro del CLICK del usuario.
        videoEl.muted = false;
        videoEl.volume = 0.4;

        if (volumeBtn) {
          volumeBtn.innerHTML =
            '<i class="fas fa-volume-up"></i>';
        }

        hideSoundHint();

        // El video normalmente ya está reproduciéndose.
        // Si estuviera pausado, lo reanudamos.
        if (videoEl.paused) {

          videoEl.play()
            .then(() => {

              if (playPauseBtn) {
                playPauseBtn.innerHTML =
                  '<i class="fas fa-pause"></i>';
              }

            })
            .catch((err) => {

              console.warn(
                "No se pudo activar el sonido:",
                err
              );

              // Seguridad: si el navegador rechaza la operación,
              // volvemos a mute.
              videoEl.muted = true;

              if (volumeBtn) {
                volumeBtn.innerHTML =
                  '<i class="fas fa-volume-mute"></i>';
              }

              showSoundHint();
            });
        }
      });

      playerWrap.appendChild(soundHintEl);
    }

    soundHintEl.classList.add("show");
  }

  function hideSoundHint() {

    if (soundHintEl) {
      soundHintEl.classList.remove("show");
    }
  }

  // =========================================================
  // PAUSA AUTOMÁTICA CUANDO EL REPRODUCTOR SALE DE PANTALLA
  // =========================================================
  // Esto es importante para evitar que el video continúe
  // reproduciéndose debajo de los catálogos.

  if (playerWrap && "IntersectionObserver" in window) {

    const videoVisibilityObserver =
      new IntersectionObserver(
        (entries) => {

          const entry = entries[0];

          if (!entry) return;

          if (!entry.isIntersecting) {

            if (!videoEl.paused) {
              window.pauseStory();
            }

          }

        },
        {
          threshold: 0.1
        }
      );

    videoVisibilityObserver.observe(playerWrap);
  }

  // =========================================================
  // PAUSAR SI EL USUARIO CAMBIA DE PESTAÑA
  // =========================================================

  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {

        if (!videoEl.paused) {
          window.pauseStory();
        }
      }
    }
  );

  // =========================================================
  // CARGAR Y REPRODUCIR VIDEO
  // =========================================================

  async function loadVideo(idx) {

    clearInterval(progressTimer);

    // Detener inmediatamente el video anterior
    videoEl.pause();

    progressBar.style.width = "0%";

    if (timeBarFill) {
      timeBarFill.style.width = "0%";
    }

    const v = videos[idx];

    if (!v) return;

    countedThisLoad = false;

    isPausedExternally = false;

    // Mostrar conteo real
    showViewCount(v);

    // =======================================================
    // CONFIGURAR FUENTE
    // =======================================================

    videoEl.src = v.src;

    // IMPORTANTE:
    // Cada nuevo video comienza silenciado.
    videoEl.muted = true;
    videoEl.volume = 0.4;

    videoEl.load();

    // Precargar siguiente
    preloadNextVideo(idx);

    // =======================================================
    // PROVEEDOR
    // =======================================================

    const proveedor = proveedores.find(
      (p) => Number(p.id) === Number(v.proveedorId)
    );

    const proveedorUrl =
      proveedor
        ? `proveedor.html?id=${proveedor.id}`
        : "#";

    // =======================================================
    // OVERLAY
    // =======================================================

    overlayImg.src =
      v.thumbnail || "./img/logo.png";

    overlayTitle.textContent =
      proveedor?.nombre ||
      v.title ||
      "Proveedor sin nombre";

    overlayBtn.textContent =
      "Ver catálogo";

    overlayBtn.onclick = (e) => {

      e.preventDefault();

      if (
        !proveedor ||
        typeof abrirProveedor !== "function"
      ) {

        // Antes de abandonar el reproductor
        window.pauseStory();

        window.location.href =
          proveedorUrl;

        return;
      }

      requireLogin(() => {

        // Pausar antes de cambiar al catálogo
        window.pauseStory();

        abrirProveedor(
          proveedor.id,
          proveedor.nombre
        );
      });
    };

    // =======================================================
    // CLICK SOBRE VIDEO
    // =======================================================

    videoEl.onclick = () => {

      if (videoEl.paused) {

        videoEl.play()
          .then(() => {

            if (playPauseBtn) {
              playPauseBtn.innerHTML =
                '<i class="fas fa-pause"></i>';
            }

          })
          .catch((err) => {

            console.warn(
              "No se pudo reproducir el video:",
              err
            );
          });

      } else {

        videoEl.pause();

        if (playPauseBtn) {
          playPauseBtn.innerHTML =
            '<i class="fas fa-play"></i>';
        }
      }
    };

    // =======================================================
    // METADATA
    // =======================================================

    videoEl.onloadedmetadata = () => {

      const dur =
        isFinite(videoEl.duration)
          ? videoEl.duration
          : 15;

      if (durationEl) {
        durationEl.textContent =
          formatTime(dur);
      }

      // Detectar orientación
      const videoWidth =
        videoEl.videoWidth;

      const videoHeight =
        videoEl.videoHeight;

      const aspectRatio =
        videoWidth / videoHeight;

      if (aspectRatio < 1) {

        playerWrap.classList.add(
          "vertical-video"
        );

      } else {

        playerWrap.classList.remove(
          "vertical-video"
        );
      }

      startProgress(dur);

      // =====================================================
      // AUTOPLAY SILENCIADO
      // =====================================================
      // Nunca intentamos autoplay con sonido.
      // Esto elimina el NotAllowedError que estabas viendo.

      videoEl.muted = true;
      videoEl.volume = 0.4;

      if (volumeBtn) {
        volumeBtn.innerHTML =
          '<i class="fas fa-volume-mute"></i>';
      }

      videoEl
        .play()
        .then(() => {

          if (playPauseBtn) {
            playPauseBtn.innerHTML =
              '<i class="fas fa-pause"></i>';
          }

          // Mostrar aviso para que el usuario
          // pueda activar el sonido voluntariamente.
          showSoundHint();
        })
        .catch((err) => {

          // Puede ocurrir si el navegador bloquea
          // incluso el autoplay silenciado.
          console.warn(
            "Autoplay silenciado bloqueado:",
            err
          );

          if (playPauseBtn) {
            playPauseBtn.innerHTML =
              '<i class="fas fa-play"></i>';
          }

          showSoundHint();
        });
    };
  }

  // =========================================================
  // PROGRESO AUTOMÁTICO
  // =========================================================

  function startProgress(duration) {

    const start = performance.now();

    clearInterval(progressTimer);

    progressTimer = setInterval(() => {

      // Si el video ya no está reproduciéndose,
      // no continuamos avanzando el progreso.
      if (videoEl.paused) {
        return;
      }

      const elapsed =
        performance.now() - start;

      const pct =
        Math.min(
          100,
          (elapsed / (duration * 1000)) * 100
        );

      progressBar.style.width =
        pct + "%";

      if (pct >= 100) {

        clearInterval(progressTimer);

        nextVideo();
      }

    }, 100);
  }

  // =========================================================
  // SIGUIENTE VIDEO
  // =========================================================

  function nextVideo() {

    videoEl.pause();

    current =
      (current + 1) % videos.length;

    loadVideo(current);
  }

  // =========================================================
  // VIDEO ANTERIOR
  // =========================================================

  function prevVideo() {

    videoEl.pause();

    current =
      (current - 1 + videos.length) %
      videos.length;

    loadVideo(current);
  }

  // =========================================================
  // BOTONES
  // =========================================================

  if (nextBtn) {
    nextBtn.addEventListener(
      "click",
      nextVideo
    );
  }

  if (prevBtn) {
    prevBtn.addEventListener(
      "click",
      prevVideo
    );
  }

  // =========================================================
  // INICIAR
  // =========================================================

  loadVideo(current);
});