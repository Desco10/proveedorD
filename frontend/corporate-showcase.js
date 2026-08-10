/* =========================================================
   DESCOAPP — CORPORATE SHOWCASE
   SOLO PC / ESCRITORIO

   Módulo independiente.
   NO modifica:
   - carrito
   - checkout
   - WhatsApp
   - backend
   - server.js
   - lógica mobile

   Toma información que ya existe en el DOM.
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       SOLO PC
       ===================================================== */

    const mediaPC = window.matchMedia("(min-width: 1100px)");

    if (!mediaPC.matches) {
        return;
    }

    /* =====================================================
       CONFIGURACIÓN
       ===================================================== */

    const CONFIG = {
        video: "/videos/desco-corporativo.mp4",
        maxAliados: 5,
        maxOfertas: 5,
        intervalo: 5000
    };

    /* =====================================================
       EVITAR DUPLICADOS
       ===================================================== */

    if (document.getElementById("descoapp-corporate-showcase")) {
        return;
    }

    /* =====================================================
       BUSCAR ELEMENTOS EXISTENTES
       ===================================================== */

    function obtenerElementos(selectores) {
        for (const selector of selectores) {
            const elementos = document.querySelectorAll(selector);

            if (elementos.length > 0) {
                return Array.from(elementos);
            }
        }

        return [];
    }

    /* =====================================================
       OBTENER TEXTO
       ===================================================== */

    function obtenerTexto(elemento, selectores) {
        for (const selector of selectores) {
            const nodo = elemento.querySelector(selector);

            if (nodo && nodo.textContent.trim()) {
                return nodo.textContent.trim();
            }
        }

        return "";
    }

    /* =====================================================
       OBTENER IMAGEN
       ===================================================== */

    function obtenerImagen(elemento) {
        const img = elemento.querySelector("img");

        if (!img) {
            return "";
        }

        return (
            img.currentSrc ||
            img.src ||
            img.getAttribute("data-src") ||
            ""
        );
    }

    /* =====================================================
       OBTENER ALIADOS
       ===================================================== */

    function obtenerAliados() {
        const elementos = obtenerElementos([
            ".card-proveedor",
            ".proveedor-card",
            ".cardProveedor",
            "[data-proveedor]"
        ]);

        return elementos
            .slice(0, CONFIG.maxAliados)
            .map((elemento) => ({
                nombre:
                    obtenerTexto(elemento, [
                        "h3",
                        "h2",
                        ".nombre-proveedor",
                        ".proveedor-nombre",
                        ".nombre"
                    ]) || "Aliado DescoApp",

                imagen: obtenerImagen(elemento)
            }));
    }

    /* =====================================================
       OBTENER OFERTAS
       ===================================================== */

    function obtenerOfertas() {
        const elementos = obtenerElementos([
            ".carrusel-3d .item",
            ".item-oferta",
            ".card-oferta",
            "[data-oferta]"
        ]);

        return elementos
            .slice(0, CONFIG.maxOfertas)
            .map((elemento) => ({
                nombre:
                    obtenerTexto(elemento, [
                        "h4",
                        "h3",
                        ".nombre-producto",
                        ".producto-nombre",
                        ".nombre"
                    ]) || "Oferta DescoApp",

                imagen: obtenerImagen(elemento)
            }));
    }

    /* =====================================================
       CREAR SHOWCASE
       ===================================================== */

    function crearShowcase() {
        const showcase = document.createElement("aside");

        showcase.id = "descoapp-corporate-showcase";

        showcase.setAttribute(
            "aria-label",
            "Información corporativa de DescoApp"
        );

        showcase.innerHTML = `
            <div class="desco-corporate-inner">

                <!-- MARCA -->

                <div class="desco-corporate-brand">

                    <div class="desco-corporate-logo">
                        <span>Desco</span><strong>App</strong>
                    </div>

                    <div class="desco-corporate-line"></div>

                    <div class="desco-corporate-caption">
                        Siempre cerca de tu negocio
                    </div>

                </div>


                <!-- VIDEO -->

                <div class="desco-corporate-video">

                    <video
                        class="desco-corporate-video-element"
                        muted
                        autoplay
                        loop
                        playsinline
                        preload="metadata"
                    >
                        <source
                            src="${CONFIG.video}"
                            type="video/mp4"
                        >
                    </video>

                    <div class="desco-video-overlay"></div>

                    <div class="desco-video-label">
                        <span class="desco-live-dot"></span>
                        DESCOAPP
                    </div>

                </div>


                <!-- ALIADOS -->

                <div class="desco-corporate-section">

                    <div class="desco-section-title">
                        ALIADOS
                    </div>

                    <div
                        class="desco-corporate-cards desco-aliados-list"
                        id="desco-aliados-list"
                    ></div>

                </div>


                <!-- OFERTAS -->

                <div class="desco-corporate-section">

                    <div class="desco-section-title">
                        OFERTAS
                    </div>

                    <div
                        class="desco-corporate-cards desco-ofertas-list"
                        id="desco-ofertas-list"
                    ></div>

                </div>


                <!-- PIE -->

                <div class="desco-corporate-footer">

                    <span>DESCOAPP</span>

                    <small>
                        Servicio justo a tiempo
                    </small>

                </div>

            </div>
        `;

        document.body.appendChild(showcase);

        return showcase;
    }

    /* =====================================================
       CREAR CARD
       ===================================================== */

    function crearCard(item, tipo, index) {
        const imagen = item.imagen
            ? `
                <img
                    src="${item.imagen}"
                    alt="${item.nombre}"
                    loading="lazy"
                >
            `
            : `
                <span class="desco-card-placeholder">
                    ${tipo === "oferta" ? "★" : "D"}
                </span>
            `;

        const etiqueta =
            tipo === "oferta"
                ? "OFERTA"
                : "ALIADO";

        const claseEtiqueta =
            tipo === "oferta"
                ? "desco-card-tag oferta"
                : "desco-card-tag";

        return `
            <div
                class="desco-corporate-card"
                style="--desco-delay:${index * 70}ms"
            >

                <div class="desco-card-image">
                    ${imagen}
                </div>

                <div class="desco-card-name">
                    ${item.nombre}
                </div>

                <div class="${claseEtiqueta}">
                    ${etiqueta}
                </div>

            </div>
        `;
    }

    /* =====================================================
       RENDER ALIADOS
       ===================================================== */

    function renderAliados(showcase) {
        const contenedor = showcase.querySelector(
            "#desco-aliados-list"
        );

        if (!contenedor) {
            return;
        }

        const aliados = obtenerAliados();

        if (!aliados.length) {
            contenedor.innerHTML = `
                <div class="desco-empty-card">
                    <strong>Aliados DescoApp</strong>
                    <small>Siempre cerca de tu negocio</small>
                </div>
            `;

            return;
        }

        contenedor.innerHTML = aliados
            .map((aliado, index) =>
                crearCard(aliado, "aliado", index)
            )
            .join("");
    }

    /* =====================================================
       RENDER OFERTAS
       ===================================================== */

    function renderOfertas(showcase) {
        const contenedor = showcase.querySelector(
            "#desco-ofertas-list"
        );

        if (!contenedor) {
            return;
        }

        const ofertas = obtenerOfertas();

        if (!ofertas.length) {
            contenedor.innerHTML = `
                <div class="desco-empty-card">
                    <strong>Ofertas DescoApp</strong>
                    <small>
                        Encuentra productos para tu negocio
                    </small>
                </div>
            `;

            return;
        }

        contenedor.innerHTML = ofertas
            .map((oferta, index) =>
                crearCard(oferta, "oferta", index)
            )
            .join("");
    }

    /* =====================================================
       INICIAR
       ===================================================== */

    function iniciarShowcase() {
        if (!mediaPC.matches) {
            return;
        }

        if (
            document.getElementById(
                "descoapp-corporate-showcase"
            )
        ) {
            return;
        }

        const showcase = crearShowcase();

        if (!showcase) {
            return;
        }

        renderAliados(showcase);
        renderOfertas(showcase);

        /* =================================================
           VIDEO
           ================================================= */

        const video = showcase.querySelector(
            ".desco-corporate-video-element"
        );

        if (video) {
            video.muted = true;

            video.play().catch(() => {
                /* Autoplay bloqueado: no afecta DescoApp */
            });
        }

        /* =================================================
           SEGUNDA LECTURA

           Permite esperar a que el DOM principal
           termine de cargar proveedores/ofertas.
           ================================================= */

        setTimeout(() => {
            renderAliados(showcase);
            renderOfertas(showcase);
        }, 1500);
    }

    /* =====================================================
       ESPERAR DOM
       ===================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciarShowcase,
            { once: true }
        );
    } else {
        iniciarShowcase();
    }

    /* =====================================================
       ACTUALIZACIÓN SUAVE
       ===================================================== */

    const intervalo = setInterval(() => {
        const showcase = document.getElementById(
            "descoapp-corporate-showcase"
        );

        if (!showcase) {
            return;
        }

        renderAliados(showcase);
        renderOfertas(showcase);
    }, CONFIG.intervalo);

    /* =====================================================
       CAMBIO DE TAMAÑO
       ===================================================== */

    mediaPC.addEventListener("change", (event) => {
        const existente = document.getElementById(
            "descoapp-corporate-showcase"
        );

        if (!event.matches) {
            if (existente) {
                existente.remove();
            }

            return;
        }

        if (!existente) {
            iniciarShowcase();
        }
    });

    /* =====================================================
       LIMPIEZA
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {
            clearInterval(intervalo);
        },
        { once: true }
    );

})();