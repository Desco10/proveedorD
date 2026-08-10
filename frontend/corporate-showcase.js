/* =========================================================
   DESCOAPP — CORPORATE SHOWCASE
   PC / ESCRITORIO ÚNICAMENTE

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
       1. SOLO ESCRITORIO
       ===================================================== */

    const mediaPC = window.matchMedia("(min-width: 769px)");

    if (!mediaPC.matches) {
        return;
    }

    /* =====================================================
       2. CONFIGURACIÓN
       ===================================================== */

    const CONFIG = {
        video: "/videos/desco-corporativo.mp4",

        intervaloActualizacion: 5000,

        maxAliados: 5,
        maxOfertas: 5,

        proveedoresSelectors: [
            ".card-proveedor",
            ".proveedor-card",
            ".cardProveedor",
            "[data-proveedor]"
        ],

        ofertasSelectors: [
            ".carrusel-3d .item",
            ".item-oferta",
            ".card-oferta",
            "[data-oferta]"
        ]
    };

    /* =====================================================
       3. EVITAR DUPLICADOS
       ===================================================== */

    if (
        document.getElementById(
            "descoapp-corporate-showcase"
        )
    ) {
        return;
    }

    /* =====================================================
       4. OBTENER ELEMENTOS DEL DOM
       ===================================================== */

    function obtenerElementos(selectores) {

        for (const selector of selectores) {

            const elementos =
                document.querySelectorAll(selector);

            if (elementos.length) {
                return Array.from(elementos);
            }
        }

        return [];
    }

    /* =====================================================
       5. OBTENER TEXTO
       ===================================================== */

    function textoSeguro(elemento, selectores) {

        for (const selector of selectores) {

            const nodo =
                elemento.querySelector(selector);

            if (
                nodo &&
                nodo.textContent &&
                nodo.textContent.trim()
            ) {
                return nodo.textContent.trim();
            }
        }

        return "";
    }

    /* =====================================================
       6. OBTENER IMAGEN
       ===================================================== */

    function imagenSegura(elemento) {

        const img =
            elemento.querySelector("img");

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
       7. OBTENER PROVEEDORES EXISTENTES
       ===================================================== */

    function obtenerAliados() {

        const elementos =
            obtenerElementos(
                CONFIG.proveedoresSelectors
            );

        return elementos
            .slice(0, CONFIG.maxAliados)
            .map((elemento) => {

                return {

                    nombre:
                        textoSeguro(elemento, [
                            "h3",
                            "h2",
                            ".nombre-proveedor",
                            ".proveedor-nombre",
                            ".nombre"
                        ]) ||
                        "Aliado DescoApp",

                    imagen:
                        imagenSegura(elemento),

                    elemento
                };

            });
    }

    /* =====================================================
       8. OBTENER OFERTAS EXISTENTES
       ===================================================== */

    function obtenerOfertas() {

        const elementos =
            obtenerElementos(
                CONFIG.ofertasSelectors
            );

        return elementos
            .slice(0, CONFIG.maxOfertas)
            .map((elemento) => {

                return {

                    nombre:
                        textoSeguro(elemento, [
                            "h4",
                            "h3",
                            ".nombre-producto",
                            ".producto-nombre",
                            ".nombre"
                        ]) ||
                        "Oferta DescoApp",

                    imagen:
                        imagenSegura(elemento),

                    elemento
                };

            });
    }

    /* =====================================================
       9. CREAR SHOWCASE
       ===================================================== */

    function crearShowcase() {

        const showcase =
            document.createElement("aside");

        showcase.id =
            "descoapp-corporate-showcase";

        showcase.setAttribute(
            "aria-label",
            "DescoApp corporativo"
        );

        showcase.innerHTML = `

            <div class="desco-corporate-inner">

                <!-- MARCA -->

                <div class="desco-corporate-brand">

                    <div class="desco-corporate-logo">

                        <span>Desco</span>
                        <strong>App</strong>

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

                        <span>ALIADOS</span>

                    </div>


                    <div
                        class="desco-corporate-cards desco-aliados-list"
                        id="desco-aliados-list"
                    ></div>

                </div>


                <!-- OFERTAS -->

                <div class="desco-corporate-section">

                    <div class="desco-section-title">

                        <span>OFERTAS</span>

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
       10. MOSTRAR ALIADOS
       ===================================================== */

    function renderAliados(showcase) {

        const contenedor =
            showcase.querySelector(
                "#desco-aliados-list"
            );

        if (!contenedor) {
            return;
        }

        const aliados =
            obtenerAliados();


        if (!aliados.length) {

            contenedor.innerHTML = `

                <div class="desco-empty-card">

                    <span class="desco-empty-icon">
                        ✦
                    </span>

                    <strong>
                        Aliados DescoApp
                    </strong>

                    <small>
                        Siempre cerca de tu negocio
                    </small>

                </div>

            `;

            return;
        }


        contenedor.innerHTML =
            aliados
                .map((aliado, index) => {

                    return `

                        <div
                            class="desco-corporate-card desco-aliado-card"
                            style="--desco-delay:${index * 90}ms"
                        >

                            <div class="desco-card-image">

                                ${
                                    aliado.imagen

                                        ? `
                                            <img
                                                src="${aliado.imagen}"
                                                alt="${aliado.nombre}"
                                                loading="lazy"
                                            >
                                          `

                                        : `
                                            <span class="desco-card-placeholder">
                                                D
                                            </span>
                                          `
                                }

                            </div>


                            <div class="desco-card-name">

                                ${aliado.nombre}

                            </div>


                            <div class="desco-card-tag">

                                ALIADO

                            </div>

                        </div>

                    `;

                })
                .join("");
    }

    /* =====================================================
       11. MOSTRAR OFERTAS
       ===================================================== */

    function renderOfertas(showcase) {

        const contenedor =
            showcase.querySelector(
                "#desco-ofertas-list"
            );

        if (!contenedor) {
            return;
        }

        const ofertas =
            obtenerOfertas();


        if (!ofertas.length) {

            contenedor.innerHTML = `

                <div class="desco-empty-card">

                    <span class="desco-empty-icon">
                        ★
                    </span>

                    <strong>
                        Ofertas DescoApp
                    </strong>

                    <small>
                        Encuentra productos para tu negocio
                    </small>

                </div>

            `;

            return;
        }


        contenedor.innerHTML =
            ofertas
                .map((oferta, index) => {

                    return `

                        <div
                            class="desco-corporate-card desco-oferta-card"
                            style="--desco-delay:${index * 90}ms"
                        >

                            <div class="desco-card-image">

                                ${
                                    oferta.imagen

                                        ? `
                                            <img
                                                src="${oferta.imagen}"
                                                alt="${oferta.nombre}"
                                                loading="lazy"
                                            >
                                          `

                                        : `
                                            <span class="desco-card-placeholder">
                                                ★
                                            </span>
                                          `
                                }

                            </div>


                            <div class="desco-card-name">

                                ${oferta.nombre}

                            </div>


                            <div class="desco-card-tag oferta">

                                OFERTA

                            </div>

                        </div>

                    `;

                })
                .join("");
    }

    /* =====================================================
       12. INICIAR SHOWCASE
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


        const showcase =
            crearShowcase();


        if (!showcase) {
            return;
        }


        /* Cargar información existente */

        renderAliados(showcase);

        renderOfertas(showcase);


        /* =================================================
           VIDEO
           ================================================= */

        const video =
            showcase.querySelector(
                ".desco-corporate-video-element"
            );


        if (video) {

            video.muted = true;

            video.setAttribute(
                "playsinline",
                ""
            );

            video.play().catch(() => {

                /*
                 Algunos navegadores pueden bloquear
                 autoplay. No generamos ningún error
                 que afecte a DescoApp.
                */

            });

        }


        /* =================================================
           SEGUNDA LECTURA

           Esto permite que los proveedores/ofertas
           que todavía estén cargando en el DOM puedan
           aparecer posteriormente.

           NO realiza ninguna petición.
           ================================================= */

        setTimeout(() => {

            renderAliados(showcase);

            renderOfertas(showcase);

        }, 1500);

    }

    /* =====================================================
       13. ESPERAR DOM
       ===================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciarShowcase,
            {
                once: true
            }
        );

    } else {

        iniciarShowcase();

    }


    /* =====================================================
       14. ACTUALIZACIÓN SUAVE

       No consulta backend.

       Solo vuelve a leer elementos que ya existen
       en la página.
       ===================================================== */

    const intervalo =
        setInterval(() => {

            const showcase =
                document.getElementById(
                    "descoapp-corporate-showcase"
                );

            if (!showcase) {
                return;
            }

            renderAliados(showcase);

            renderOfertas(showcase);

        }, CONFIG.intervaloActualizacion);


    /* =====================================================
       15. CAMBIO PC / MOBILE

       Si cambia el tamaño de pantalla y deja de ser PC,
       eliminamos únicamente este módulo.

       NO tocamos el resto de DescoApp.
       ===================================================== */

    mediaPC.addEventListener(
        "change",
        function (event) {

            const existente =
                document.getElementById(
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

        }
    );


    /* =====================================================
       16. LIMPIEZA

       Si el documento se descarga, detenemos el intervalo.
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        function () {

            clearInterval(intervalo);

        },
        {
            once: true
        }
    );

})();