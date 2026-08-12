/* =========================================================
   DESCOAPP — CORPORATE SHOWCASE
   =========================================================

   MÓDULO EXCLUSIVO PARA PC

   Este módulo:

   - NO modifica el carrito.
   - NO modifica checkout.
   - NO modifica WhatsApp.
   - NO modifica backend.
   - NO modifica server.js.
   - NO modifica main.js.
   - NO modifica videos.js.
   - NO modifica compartir.js.
   - NO modifica rutasCompartidas.js.
   - NO modifica la lógica móvil.

   Solo crea:
   - Fondo corporativo de escritorio.
   - Panel izquierdo.
   - Panel derecho.

   Toma información que YA existe en el DOM.

   Archivos utilizados:
   /img/plataforma/newdescoappsinf.png
   /img/plataforma/TIENDATENDEROS2.png

   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       1. SOLO PC
       ===================================================== */

    const mediaPC = window.matchMedia("(min-width: 1200px)");


    if (!mediaPC.matches) {
        return;
    }


    /* =====================================================
       2. CONFIGURACIÓN
       ===================================================== */

    const CONFIG = {

        logo: "/img/plataforma/newdescoappsinf.png",

        fondo: "/img/plataforma/TIENDATENDEROS2.png",

        intervaloActualizacion: 5000,

        maxAliados: 5,

        maxOfertas: 6,

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
       4. OBTENER ELEMENTOS EXISTENTES
       ===================================================== */

    function obtenerElementos(selectores) {

        for (const selector of selectores) {

            try {

                const elementos =
                    document.querySelectorAll(selector);

                if (elementos.length) {

                    return Array.from(elementos);

                }

            } catch (error) {

                console.warn(
                    "DescoApp Corporate: selector inválido:",
                    selector
                );

            }

        }

        return [];

    }


    /* =====================================================
       5. OBTENER TEXTO
       ===================================================== */

    function textoSeguro(elemento, selectores) {

        if (!elemento) {
            return "";
        }

        for (const selector of selectores) {

            try {

                const nodo =
                    elemento.querySelector(selector);

                if (
                    nodo &&
                    nodo.textContent &&
                    nodo.textContent.trim()
                ) {

                    return nodo.textContent
                        .trim()
                        .replace(/\s+/g, " ");

                }

            } catch (error) {

                // No interrumpimos la plataforma.

            }

        }

        return "";

    }


    /* =====================================================
       6. OBTENER IMAGEN
       ===================================================== */

    function imagenSegura(elemento) {

        if (!elemento) {
            return "";
        }

        const img =
            elemento.querySelector("img");

        if (!img) {
            return "";
        }

        return (
            img.currentSrc ||
            img.src ||
            img.getAttribute("data-src") ||
            img.getAttribute("data-lazy-src") ||
            ""
        );

    }


    /* =====================================================
       7. ESCAPAR TEXTO PARA HTML
       ===================================================== */

    function escaparHTML(valor) {

        if (valor === undefined || valor === null) {
            return "";
        }

        return String(valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       8. OBTENER ALIADOS
       ===================================================== */

    function obtenerAliados() {

        const elementos =
            obtenerElementos(
                CONFIG.proveedoresSelectors
            );

        return elementos
            .slice(0, CONFIG.maxAliados)
            .map(function (elemento) {

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

                    elemento: elemento

                };

            });

    }


    /* =====================================================
       9. OBTENER OFERTAS
       ===================================================== */

    function obtenerOfertas() {

        const elementos =
            obtenerElementos(
                CONFIG.ofertasSelectors
            );

        return elementos
            .slice(0, CONFIG.maxOfertas)
            .map(function (elemento) {

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

                    elemento: elemento

                };

            });

    }


    /* =====================================================
       10. CREAR FONDO CORPORATIVO
       ===================================================== */

    function crearFondo() {

        if (
            document.getElementById(
                "descoapp-corporate-background"
            )
        ) {

            return;

        }

        const fondo =
            document.createElement("div");

        fondo.id =
            "descoapp-corporate-background";

        fondo.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.appendChild(fondo);

    }


    /* =====================================================
       11. CREAR SHOWCASE
       ===================================================== */

    function crearShowcase() {

        const showcase =
            document.createElement("aside");

        showcase.id =
            "descoapp-corporate-showcase";

        showcase.setAttribute(
            "aria-label",
            "Centro comercial DescoApp"
        );


        showcase.innerHTML = `

            <!-- =================================================
                 PANEL IZQUIERDO
                 ================================================= -->

            <section
                class="desco-corporate-panel desco-corporate-left"
                aria-label="Ecosistema comercial DescoApp"
            >

                <div class="desco-panel-shell">

                    <!-- CABECERA -->

                    <header class="desco-panel-header">

                        <div class="desco-logo-wrapper">

                            <img
                                class="desco-corporate-real-logo"
                                src="${CONFIG.logo}"
                                alt="DescoApp"
                            >

                        </div>

                        <div class="desco-panel-kicker">
                            DESCOAPP
                        </div>

                        <h2>
                            Ecosistema comercial
                        </h2>

                        <p>
                            Conectamos tu negocio con aliados,
                            productos y oportunidades.
                        </p>

                        <div class="desco-status">

                            <span class="desco-status-dot"></span>

                            PLATAFORMA ACTIVA

                        </div>

                    </header>


                    <!-- CONTENIDO CON SCROLL -->

                    <div class="desco-panel-scroll">

                        <!-- ALIADOS -->

                        <section class="desco-corporate-section">

                            <div class="desco-section-heading">

                                <div>

                                    <span class="desco-section-kicker">
                                        ECOSISTEMA
                                    </span>

                                    <h3>
                                        Aliados estratégicos
                                    </h3>

                                    <p>
                                        Proveedores conectados a DescoApp.
                                    </p>

                                </div>

                                <span class="desco-section-icon">
                                    ✦
                                </span>

                            </div>


                            <div
                                class="desco-corporate-cards desco-aliados-list"
                                id="desco-aliados-list"
                            ></div>

                        </section>


                        <!-- OFERTAS -->

                        <section class="desco-corporate-section">

                            <div class="desco-section-heading">

                                <div>

                                    <span class="desco-section-kicker ofertas-kicker">
                                        OPORTUNIDADES
                                    </span>

                                    <h3>
                                        Ofertas destacadas
                                    </h3>

                                    <p>
                                        Productos disponibles para tu negocio.
                                    </p>

                                </div>

                                <span class="desco-section-icon ofertas-icon">
                                    ★
                                </span>

                            </div>


                            <div
                                class="desco-corporate-cards desco-ofertas-list"
                                id="desco-ofertas-list"
                            ></div>

                        </section>

                    </div>


                    <!-- PIE IZQUIERDO -->

                    <footer class="desco-panel-footer">

                        <div class="desco-footer-line"></div>

                        <strong>
                            DESCOAPP
                        </strong>

                        <small>
                            Siempre cerca de tu negocio
                        </small>

                    </footer>

                </div>

            </section>


            <!-- =================================================
                 PANEL DERECHO
                 ================================================= -->

            <section
                class="desco-corporate-panel desco-corporate-right"
                aria-label="Centro comercial DescoApp"
            >

                <div class="desco-panel-shell">

                    <!-- CABECERA -->

                    <header class="desco-panel-header desco-right-header">

                        <div class="desco-logo-wrapper">

                            <img
                                class="desco-corporate-real-logo"
                                src="${CONFIG.logo}"
                                alt="DescoApp"
                            >

                        </div>

                        <div class="desco-panel-kicker">
                            DESCOAPP
                        </div>

                        <h2>
                            Centro comercial
                        </h2>

                        <p>
                            Todo tu negocio, más cerca.
                        </p>

                        <div class="desco-status">

                            <span class="desco-status-dot"></span>

                            PLATAFORMA ACTIVA

                        </div>

                    </header>


                    <!-- CONTENIDO DERECHO -->

                    <div class="desco-panel-scroll">

                        <!-- PRESENTACIÓN -->

                        <section class="desco-right-intro">

                            <div class="desco-footer-line"></div>

                            <span class="desco-section-kicker">
                                TU ECOSISTEMA
                            </span>

                            <h3>
                                Un solo lugar para hacer
                                crecer tu negocio.
                            </h3>

                            <p>
                                Descubre aliados, productos,
                                ofertas y oportunidades
                                disponibles dentro de DescoApp.
                            </p>

                        </section>


                        <!-- ESTADÍSTICAS -->

                        <section class="desco-stats">

                            <div class="desco-stat">

                                <strong
                                    id="desco-stat-aliados"
                                >
                                    0
                                </strong>

                                <span>
                                    Aliados
                                </span>

                            </div>


                            <div class="desco-stat">

                                <strong
                                    id="desco-stat-ofertas"
                                >
                                    0
                                </strong>

                                <span>
                                    Ofertas
                                </span>

                            </div>


                            <div class="desco-stat">

                                <strong>
                                    24/7
                                </strong>

                                <span>
                                    Disponible
                                </span>

                            </div>

                        </section>


                        <!-- RECORRIDO COMERCIAL -->

                        <section class="desco-commercial-flow">

                            <span class="desco-section-kicker">
                                ECOSISTEMA COMERCIAL
                            </span>


                            <div class="desco-flow-item">

                                <span class="desco-flow-number">
                                    01
                                </span>

                                <div>

                                    <strong>
                                        Aliados estratégicos
                                    </strong>

                                    <small>
                                        Proveedores conectados
                                    </small>

                                </div>

                            </div>


                            <div class="desco-flow-item">

                                <span class="desco-flow-number">
                                    02
                                </span>

                                <div>

                                    <strong>
                                        Portafolio
                                    </strong>

                                    <small>
                                        Productos para tu negocio
                                    </small>

                                </div>

                            </div>


                            <div class="desco-flow-item">

                                <span class="desco-flow-number">
                                    03
                                </span>

                                <div>

                                    <strong>
                                        Oportunidades
                                    </strong>

                                    <small>
                                        Ofertas para tu negocio
                                    </small>

                                </div>

                            </div>


                            <div class="desco-flow-item">

                                <span class="desco-flow-number">
                                    04
                                </span>

                                <div>

                                    <strong>
                                        Compra
                                    </strong>

                                    <small>
                                        Pedido rápido y fácil
                                    </small>

                                </div>

                            </div>

                        </section>


                        <!-- MENSAJE COMERCIAL -->

                        <section class="desco-commercial-message">

                            <span>
                                DESCOAPP
                            </span>

                            <strong>
                                Un ecosistema comercial
                                pensado para tu negocio.
                            </strong>

                            <small>
                                Aliados · Productos · Ofertas · Compra
                            </small>

                        </section>

                    </div>


                    <!-- PIE DERECHO -->

                    <footer class="desco-panel-footer">

                        <div class="desco-footer-line"></div>

                        <strong>
                            SERVICIO JUSTO A TIEMPO
                        </strong>

                        <small>
                            DescoApp · Tu plataforma comercial
                        </small>

                    </footer>

                </div>

            </section>

        `;


        document.body.appendChild(showcase);

        return showcase;

    }


    /* =====================================================
       12. RENDERIZAR ALIADOS
       ===================================================== */

    function renderAliados(showcase) {

        if (!showcase) {
            return;
        }

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

            actualizarEstadisticas();

            return;

        }


        contenedor.innerHTML =
            aliados
                .map(function (aliado, index) {

                    const nombre =
                        escaparHTML(
                            aliado.nombre
                        );


                    return `

                        <article
                            class="desco-corporate-card desco-aliado-card"
                            style="--desco-delay:${index * 70}ms"
                        >

                            <div class="desco-card-image">

                                ${
                                    aliado.imagen

                                        ? `

                                            <img
                                                src="${escaparHTML(aliado.imagen)}"
                                                alt="${nombre}"
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


                            <div class="desco-card-content">

                                <strong class="desco-card-name">
                                    ${nombre}
                                </strong>

                                <small>
                                    Aliado DescoApp
                                </small>

                            </div>


                            <span class="desco-card-arrow">
                                ›
                            </span>

                        </article>

                    `;

                })
                .join("");


        actualizarEstadisticas();

    }


    /* =====================================================
       13. RENDERIZAR OFERTAS
       ===================================================== */

    function renderOfertas(showcase) {

        if (!showcase) {
            return;
        }

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

            actualizarEstadisticas();

            return;

        }


        contenedor.innerHTML =
            ofertas
                .map(function (oferta, index) {

                    const nombre =
                        escaparHTML(
                            oferta.nombre
                        );


                    return `

                        <article
                            class="desco-corporate-card desco-oferta-card"
                            style="--desco-delay:${index * 70}ms"
                        >

                            <div class="desco-card-image">

                                ${
                                    oferta.imagen

                                        ? `

                                            <img
                                                src="${escaparHTML(oferta.imagen)}"
                                                alt="${nombre}"
                                                loading="lazy"
                                            >

                                          `

                                        : `

                                            <span class="desco-card-placeholder oferta-placeholder">
                                                ★
                                            </span>

                                          `
                                }

                            </div>


                            <div class="desco-card-content">

                                <strong class="desco-card-name">
                                    ${nombre}
                                </strong>

                                <small>
                                    Oferta disponible
                                </small>

                            </div>


                            <span class="desco-card-arrow oferta-arrow">
                                ›
                            </span>

                        </article>

                    `;

                })
                .join("");


        actualizarEstadisticas();

    }


    /* =====================================================
       14. ESTADÍSTICAS DEL PANEL DERECHO
       ===================================================== */

    function actualizarEstadisticas() {

        const aliados =
            obtenerElementos(
                CONFIG.proveedoresSelectors
            );

        const ofertas =
            obtenerElementos(
                CONFIG.ofertasSelectors
            );


        const contadorAliados =
            document.getElementById(
                "desco-stat-aliados"
            );

        const contadorOfertas =
            document.getElementById(
                "desco-stat-ofertas"
            );


        if (contadorAliados) {

            contadorAliados.textContent =
                aliados.length;

        }


        if (contadorOfertas) {

            contadorOfertas.textContent =
                ofertas.length;

        }

    }


    /* =====================================================
       15. INICIAR SHOWCASE
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


        crearFondo();


        const showcase =
            crearShowcase();


        if (!showcase) {
            return;
        }


        renderAliados(showcase);

        renderOfertas(showcase);

        actualizarEstadisticas();


        /* =================================================
           LECTURA POSTERIOR

           Permite que el DOM principal termine de cargar
           proveedores/ofertas.

           NO realiza peticiones.
           ================================================= */

        setTimeout(function () {

            renderAliados(showcase);

            renderOfertas(showcase);

            actualizarEstadisticas();

        }, 1500);

    }


    /* =====================================================
       16. INICIAR DESPUÉS DEL DOM
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
       17. ACTUALIZACIÓN SUAVE
       ===================================================== */

    const intervalo =
        setInterval(function () {

            const showcase =
                document.getElementById(
                    "descoapp-corporate-showcase"
                );


            if (!showcase) {
                return;
            }


            renderAliados(showcase);

            renderOfertas(showcase);

            actualizarEstadisticas();

        }, CONFIG.intervaloActualizacion);


    /* =====================================================
       18. CAMBIO DE TAMAÑO
       ===================================================== */

    mediaPC.addEventListener(
        "change",
        function (event) {

            const showcase =
                document.getElementById(
                    "descoapp-corporate-showcase"
                );


            const fondo =
                document.getElementById(
                    "descoapp-corporate-background"
                );


            /*
             * Si dejamos de estar en PC,
             * eliminamos únicamente nuestro módulo.
             */

            if (!event.matches) {

                if (showcase) {
                    showcase.remove();
                }

                if (fondo) {
                    fondo.remove();
                }

                return;

            }


            /*
             * Si volvemos a PC,
             * reconstruimos únicamente nuestro módulo.
             */

            if (!showcase) {

                iniciarShowcase();

            }

        }
    );


    /* =====================================================
       19. LIMPIEZA
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