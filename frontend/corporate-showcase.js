/* =========================================================
   DESCOAPP — CORPORATE SHOWCASE
   =========================================================
   SOLO PC / ESCRITORIO

   Módulo visual independiente.

   NO modifica:
   - carrito
   - checkout
   - WhatsApp
   - backend
   - server.js
   - proveedores originales
   - lógica mobile

   Toma únicamente información que YA existe
   en el DOM de DescoApp.
   ========================================================= */

(function () {

    "use strict";

    /* =====================================================
       1. SOLO ESCRITORIO GRANDE
       ===================================================== */

    const mediaPC = window.matchMedia("(min-width: 1100px)");

    if (!mediaPC.matches) {
        return;
    }


    /* =====================================================
       2. CONFIGURACIÓN
       ===================================================== */

    const CONFIG = {

        maxAliados: 5,

        maxOfertas: 5,

        intervaloActualizacion: 6000,

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
       4. OBTENER ELEMENTOS
       ===================================================== */

    function obtenerElementos(selectores) {

        for (const selector of selectores) {

            const elementos =
                document.querySelectorAll(selector);

            if (elementos.length > 0) {

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
       7. OBTENER ALIADOS
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
                        imagenSegura(elemento)

                };

            });

    }


    /* =====================================================
       8. OBTENER OFERTAS
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
                        imagenSegura(elemento)

                };

            });

    }


    /* =====================================================
       9. CREAR PANEL
       ===================================================== */

    function crearShowcase() {

        const showcase =
            document.createElement("aside");

        showcase.id =
            "descoapp-corporate-showcase";

        showcase.setAttribute(
            "aria-label",
            "Centro corporativo DescoApp"
        );


        showcase.innerHTML = `

            <div class="dc-panel">


                <!-- =================================================
                     CABECERA
                     ================================================= -->

                <header class="dc-header">

                    <div class="dc-logo-box">

                        <img
                            src="/img/logo.png"
                            alt="DescoApp"
                            class="dc-logo"
                        >

                        <span class="dc-logo-glow"></span>

                    </div>


                    <div class="dc-header-title">

                        <strong>
                            DESCOAPP
                        </strong>

                        <span>
                            ECOSISTEMA COMERCIAL
                        </span>

                    </div>


                    <div class="dc-status">

                        <span class="dc-status-dot"></span>

                        ACTIVO

                    </div>

                </header>


                <!-- =================================================
                     MENSAJE CORPORATIVO
                     ================================================= -->

                <div class="dc-intro">

                    <span class="dc-intro-line"></span>

                    <p>
                        Conectamos tu negocio
                        con grandes aliados.
                    </p>

                    <span class="dc-intro-line"></span>

                </div>


                <!-- =================================================
                     CONTENIDO SCROLL
                     ================================================= -->

                <div class="dc-content">


                    <!-- ALIADOS -->

                    <section class="dc-section">

                        <div class="dc-section-header">

                            <div>

                                <span class="dc-kicker">
                                    ECOSISTEMA
                                </span>

                                <h3>
                                    Aliados estratégicos
                                </h3>

                            </div>

                            <span class="dc-section-icon">
                                ✦
                            </span>

                        </div>


                        <div
                            id="desco-aliados-list"
                            class="dc-list dc-aliados-list"
                        ></div>

                    </section>


                    <!-- OFERTAS -->

                    <section class="dc-section dc-offers-section">

                        <div class="dc-section-header">

                            <div>

                                <span class="dc-kicker">
                                    OPORTUNIDADES
                                </span>

                                <h3>
                                    Ofertas destacadas
                                </h3>

                            </div>

                            <span class="dc-section-icon">
                                ★
                            </span>

                        </div>


                        <div
                            id="desco-ofertas-list"
                            class="dc-list dc-ofertas-list"
                        ></div>

                    </section>


                </div>


                <!-- =================================================
                     FOOTER
                     ================================================= -->

                <footer class="dc-footer">

                    <div class="dc-footer-line"></div>

                    <strong>
                        DESCOAPP
                    </strong>

                    <span>
                        Siempre cerca de tu negocio
                    </span>

                </footer>


            </div>

        `;


        document.body.appendChild(showcase);

        return showcase;

    }


    /* =====================================================
       10. CREAR CARD
       ===================================================== */

    function crearCard(item, tipo, index) {

        const imagen =
            item.imagen
                ? `
                    <img
                        src="${item.imagen}"
                        alt=""
                        loading="lazy"
                    >
                  `
                : `
                    <span class="dc-placeholder">
                        ${
                            tipo === "oferta"
                                ? "★"
                                : "D"
                        }
                    </span>
                  `;


        return `

            <div
                class="dc-card ${tipo === "oferta"
                    ? "dc-card-oferta"
                    : "dc-card-aliado"}"
                style="--dc-delay:${index * 70}ms"
            >

                <div class="dc-card-logo">

                    ${imagen}

                </div>


                <div class="dc-card-info">

                    <strong>
                        ${item.nombre}
                    </strong>

                    <span>
                        ${
                            tipo === "oferta"
                                ? "Oferta disponible"
                                : "Aliado DescoApp"
                        }
                    </span>

                </div>


                <div class="dc-card-arrow">

                    ›
                    
                </div>

            </div>

        `;

    }


    /* =====================================================
       11. RENDER ALIADOS
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

                <div class="dc-empty">

                    <span>✦</span>

                    <strong>
                        Aliados DescoApp
                    </strong>

                </div>

            `;

            return;

        }


        contenedor.innerHTML =
            aliados
                .map(function (aliado, index) {

                    return crearCard(
                        aliado,
                        "aliado",
                        index
                    );

                })
                .join("");

    }


    /* =====================================================
       12. RENDER OFERTAS
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

                <div class="dc-empty">

                    <span>★</span>

                    <strong>
                        Ofertas DescoApp
                    </strong>

                </div>

            `;

            return;

        }


        contenedor.innerHTML =
            ofertas
                .map(function (oferta, index) {

                    return crearCard(
                        oferta,
                        "oferta",
                        index
                    );

                })
                .join("");

    }


    /* =====================================================
       13. INICIAR
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


        renderAliados(showcase);

        renderOfertas(showcase);

    }


    /* =====================================================
       14. DOM READY
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
       15. ACTUALIZACIÓN

       Solo vuelve a leer el DOM.
       No realiza peticiones.
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

        }, CONFIG.intervaloActualizacion);


    /* =====================================================
       16. RESPONSIVE

       Si pasa a tablet/mobile,
       eliminamos SOLO el showcase.
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
       17. LIMPIEZA
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