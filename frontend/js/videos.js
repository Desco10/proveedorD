// =========================================================
// DESCOAPP - REPRODUCTOR DE VIDEOS
// =========================================================
// - Autoplay inicialmente silenciado
// - Activación de sonido mediante interacción del usuario
// - Preferencia de sonido conservada durante la sesión
// - Contador real de vistas
// - Precarga del siguiente video
// - Navegación anterior / siguiente
// - El video continúa reproduciéndose al salir de la sección
// - Al salir de la sección se silencia, pero NO se pausa
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

  // =========================================================
  // ESTADO DE SONIDO
  // =========================================================
  // false = el usuario todavía no ha tomado una decisión
  // true  = el usuario decidió activar sonido
  //
  // Esta variable vive durante toda la sesión de la página.
  // No usamos localStorage para no forzar sonido en futuras visitas.
  // =========================================================

  let soundDecisionMade = false;
  let soundEnabled = false;

  // Evita registrar dos vistas durante la misma reproducción
  let countedThisLoad = false;

  // =========================================================
  // CONFIGURACIÓN DEL VIDEO
  // =========================================================

  videoEl.preload = "auto";
  videoEl.setAttribute("playsinline", "");

  // Volumen conservado
  videoEl.volume = 0.4;

  // El primer autoplay siempre comienza SILENCIADO.
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
    if (!videos.length) return;

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
  // ACTUALIZAR ICONO DE VOLUMEN
  // =========================================================

  function updateVolumeButton() {
    if (!volumeBtn) return;

    if (videoEl.muted) {
      volumeBtn.innerHTML =
        '<i class="fas fa-volume-mute"></i>';
    } else {
      volumeBtn.innerHTML =
        '<i class="fas fa-volume-up"></i>';
    }
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
            console.warn(
              "No se pudo reproducir el video:",
              err
            );
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

        // El usuario acaba de tomar una decisión explícita.
        soundDecisionMade = true;
        soundEnabled = true;

        videoEl.muted = false;
        videoEl.volume = 0.4;

        volumeBtn.innerHTML =
          '<i class="fas fa-volume-up"></i>';

        hideSoundHint();

        // El video normalmente ya está reproduciéndose.
        // Si estuviera pausado manualmente, intentamos continuar.
        if (videoEl.paused) {
          videoEl.play().catch((err) => {
            console.warn(
              "No se pudo reanudar el video con sonido:",
              err
            );
          });
        }

      } else {

        // El usuario decidió volver a silenciar.
        soundDecisionMade = true;
        soundEnabled = false;

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
  // SALIDA EXTERNA DE LA SECCIÓN DE VIDEOS
  // =========================================================
  //
  // IMPORTANTE:
  // Esta función conserva el nombre pauseStory() para no romper
  // código existente de la aplicación que pueda llamarla.
  //
  // PERO YA NO PAUSA EL VIDEO.
  //
  // Al abandonar la sección:
  // - el video continúa reproduciéndose
  // - se silencia
  // - se conserva la decisión de sonido del usuario
  //
  // Esto evita que el audio se escuche debajo del catálogo.
  // =========================================================

  window.pauseStory = function () {

    // NO hacemos videoEl.pause()
    // NO detenemos progressTimer

    videoEl.muted = true;

    updateVolumeButton();
  };

  // =========================================================
  // REGRESAR A LA SECCIÓN DE VIDEOS
  // =========================================================
  //
  // Si el usuario había activado sonido anteriormente,
  // recuperamos ese estado.
  //
  // No llamamos play() automáticamente aquí porque el video
  // nunca fue pausado por nuestra aplicación.
  // =========================================================

  window.resumeStory = function () {

    if (!soundDecisionMade) {

      videoEl.muted = true;

      updateVolumeButton();

      return;
    }

    if (soundEnabled) {

      videoEl.volume = 0.4;
      videoEl.muted = false;

    } else {

      videoEl.muted = true;
    }

    updateVolumeButton();
  };

  // =========================================================
  // AVISO PARA ACTIVAR SONIDO
  // =========================================================

  let soundHintEl = null;

  function showSoundHint() {

    if (!playerWrap) return;

    // Una sola vez por sesión.
    if (soundDecisionMade) return;

    if (!soundHintEl) {

      soundHintEl = document.createElement("div");

      soundHintEl.className = "sound-hint";

      soundHintEl.innerHTML =
        '<i class="fas fa-volume-mute"></i> Toca para activar sonido';

      soundHintEl.addEventListener("click", (e) => {

        e.preventDefault();
        e.stopPropagation();

        // El usuario acaba de tomar la decisión.
        soundDecisionMade = true;
        soundEnabled = true;

        videoEl.muted = false;
        videoEl.volume = 0.4;

        if (volumeBtn) {
          volumeBtn.innerHTML =
            '<i class="fas fa-volume-up"></i>';
        }

        hideSoundHint();

        // El video normalmente ya está reproduciéndose.
        // Si por alguna razón estaba pausado, intentamos
        // reproducirlo dentro de la interacción del usuario.
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

              // Seguridad:
              // volvemos a estado silencioso.
              soundEnabled = false;
              videoEl.muted = true;

              if (volumeBtn) {
                volumeBtn.innerHTML =
                  '<i class="fas fa-volume-mute"></i>';
              }
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
  // VISIBILIDAD DEL REPRODUCTOR
  // =========================================================
  //
  // YA NO PAUSAMOS EL VIDEO AL SALIR.
  //
  // Cuando el reproductor deja de estar visible:
  // - mantenemos la reproducción
  // - silenciamos el audio
  //
  // Cuando vuelve a estar visible:
  // - recuperamos el sonido si el usuario lo había activado
  //
  // El video continúa por debajo del catálogo.
  // =========================================================

  if (playerWrap && "IntersectionObserver" in window) {

    const videoVisibilityObserver =
      new IntersectionObserver(
        (entries) => {

          const entry = entries[0];

          if (!entry) return;

          if (!entry.isIntersecting) {

            // NO PAUSAR.
            // Solamente silenciar mientras el reproductor
            // está fuera de la zona visible.

            videoEl.muted = true;

            updateVolumeButton();

          } else {

            // El reproductor volvió a estar visible.

            if (soundDecisionMade && soundEnabled) {

              videoEl.volume = 0.4;
              videoEl.muted = false;

            } else {

              videoEl.muted = true;
            }

            updateVolumeButton();
          }
        },
        {
          threshold: 0.1
        }
      );

    videoVisibilityObserver.observe(playerWrap);
  }

  // =========================================================
  // VISIBILIDAD DE LA PÁGINA
  // =========================================================
  //
  // NO pausamos el video al cambiar de pestaña.
  //
  // El navegador puede limitar la reproducción de fondo por
  // sus propias políticas de ahorro de energía. Eso queda bajo
  // control del navegador.
  //
  // Nuestra aplicación NO ejecutará videoEl.pause().
  // =========================================================

  document.addEventListener(
    "visibilitychange",
    () => {

      if (document.hidden) {

        // Silenciar mientras la pestaña no está visible.
        // No detener la reproducción desde nuestro código.

        videoEl.muted = true;

        updateVolumeButton();

      } else {

        // Al regresar recuperamos la decisión del usuario.

        if (
          soundDecisionMade &&
          soundEnabled
        ) {

          videoEl.volume = 0.4;
          videoEl.muted = false;

        } else {

          videoEl.muted = true;
        }

        updateVolumeButton();
      }
    }
  );

  // =========================================================
  // CARGAR Y REPRODUCIR VIDEO
  // =========================================================
 
// =======================================================
// POSICIONES DE REPRODUCCIÓN DE LOS VIDEOS
// =======================================================

window.videoPositions =
  window.videoPositions || {};


  async function loadVideo(idx) {

    clearInterval(progressTimer);
 
    // Guardar la posición del video anterior antes de cambiarlo
if (
  videoEl.src &&
  videos[current] &&
  !isNaN(videoEl.currentTime) &&
  videoEl.currentTime > 0
) {
  window.videoPositions[
    String(videos[current].id)
  ] = videoEl.currentTime;
}
    // Detener inmediatamente el video anterior.
    //
    // Esto NO representa salir de la sección.
    // Es simplemente el cambio normal entre videos.
    videoEl.pause();

    progressBar.style.width = "0%";

    if (timeBarFill) {
      timeBarFill.style.width = "0%";
    }

    const v = videos[idx];

    if (!v) return;

    countedThisLoad = false;

    // Mostrar conteo real
    showViewCount(v);

    // =======================================================
    // CONFIGURAR FUENTE
    // =======================================================

    videoEl.src = v.src;

    // =======================================================
    // RESTAURAR ESTADO DE SONIDO
    // =======================================================
    //
    // PRIMER VIDEO:
    // soundDecisionMade = false
    // => muted
    //
    // DESPUÉS DE QUE EL USUARIO ACTIVE SONIDO:
    // soundDecisionMade = true
    // soundEnabled = true
    // => sonido activado
    //
    // SI EL USUARIO LO SILENCIÓ:
    // soundEnabled = false
    // => muted
    //
    // Nunca forzamos silencio simplemente porque cambió
    // el número del video.
    // =======================================================

    if (
      soundDecisionMade &&
      soundEnabled
    ) {

      videoEl.volume = 0.4;
      videoEl.muted = false;

    } else {

      videoEl.muted = true;
      videoEl.volume = 0.4;
    }

    videoEl.load();

// =======================================================
// RESTAURAR POSICIÓN DEL VIDEO
// =======================================================

const tiempoGuardado =
  window.videoPositions &&
  window.videoPositions[String(v.id)];

videoEl.addEventListener(
  "loadedmetadata",
  () => {

    if (
      typeof tiempoGuardado === "number" &&
      tiempoGuardado > 0 &&
      tiempoGuardado < videoEl.duration
    ) {
      videoEl.currentTime = tiempoGuardado;
    }

  },
  { once: true }
);

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

        // Conservamos el nombre de la función para
        // compatibilidad, pero ahora NO pausa.
        window.pauseStory();

        window.location.href =
          proveedorUrl;

        return;
      }

      requireLogin(() => {

        // Al entrar al catálogo:
        // NO pausamos.
        // Solamente silenciamos.
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
      // AUTOPLAY
      // =====================================================
      //
      // Nunca intentamos autoplay con sonido si el usuario
      // todavía no ha tomado una decisión.
      //
      // Si el usuario ya activó sonido anteriormente,
      // respetamos su preferencia.
      // =====================================================

      if (
        soundDecisionMade &&
        soundEnabled
      ) {

        videoEl.volume = 0.4;
        videoEl.muted = false;

      } else {

        videoEl.muted = true;
        videoEl.volume = 0.4;
      }

      updateVolumeButton();

      videoEl
        .play()
        .then(() => {

          if (playPauseBtn) {
            playPauseBtn.innerHTML =
              '<i class="fas fa-pause"></i>';
          }

          // Mostrar aviso únicamente si el usuario todavía
          // no ha tomado una decisión de sonido.
          if (!soundDecisionMade) {
            showSoundHint();
          }

        })
        .catch((err) => {

          // Puede ocurrir si el navegador bloquea incluso
          // el autoplay silenciado.
          console.warn(
            "Autoplay silenciado bloqueado:",
            err
          );

          if (playPauseBtn) {
            playPauseBtn.innerHTML =
              '<i class="fas fa-play"></i>';
          }

          if (!soundDecisionMade) {
            showSoundHint();
          }
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

      // Si el video está pausado manualmente,
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