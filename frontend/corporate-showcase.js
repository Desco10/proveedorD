/* =========================================================
   DESCOAPP — CORPORATE SHOWCASE
   =========================================================

   MÓDULO VISUAL INDEPENDIENTE

   SOLO PC / ESCRITORIO

   NO MODIFICA:

   - carrito
   - checkout
   - WhatsApp
   - backend
   - server.js
   - plataforma principal
   - lógica mobile

   Lee información que ya existe en el DOM.

   NO realiza peticiones al backend.

   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       1. SOLO PC
       ===================================================== */

    const mediaPC =
        window.matchMedia("(min-width: 1100px)");


    if (!mediaPC.matches) {
        return;
    }


    /* =====================================================
       2. CONFIGURACIÓN
       ===================================================== */

    const CONFIG = {

        logo:
            "/img/plataforma/newdescoappsinf.png",

        intervaloActualizacion:
            5000,

        maxAliados:
            6,

        maxOfertas:
            6,

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


    if (
        document.getElementById(
            "descoapp-corporate-showcase-right"
        )
    ) {

        return;
    }


    /* =====================================================
       4. OBTENER ELEMENTOS
       ===================================================== */

    function obtenerElementos(selectores) {

        for (
            const selector
            of selectores
        ) {

            try {

                const elementos =
                    document.querySelectorAll(
                        selector
                    );


                if (
                    elementos &&
                    elementos.length
                ) {

                    return Array.from(
                        elementos
                    );

                }

            } catch (error) {

                console.warn(
                    "DescoApp Corporate Showcase: selector omitido:",
                    selector
                );

            }

        }


        return [];

    }


    /* =====================================================
       5. TEXTO SEGURO
       ===================================================== */

    function textoSeguro(
        elemento,
        selectores
    ) {

        if (!elemento) {
            return "";
        }


        for (
            const selector
            of selectores
        ) {

            try {

                const nodo =
                    elemento.querySelector(
                        selector
                    );


                if (
                    nodo &&
                    nodo.textContent &&
                    nodo.textContent.trim()
                ) {

                    return nodo
                        .textContent
                        .trim();

                }

            } catch (error) {

                /* Selector no válido:
                   simplemente continuamos. */

            }

        }


        return "";
    }


    /* =====================================================
       6. ESCAPAR HTML
       ===================================================== */

    function escaparHTML(valor) {

        return String(
            valor || ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       7. OBTENER IMAGEN
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
            img.getAttribute(
                "data-src"
            ) ||
            ""
        );

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

            .slice(
                0,
                CONFIG.maxAliados
            )

            .map(
                function (elemento) {

                    return {

                        nombre:
                            textoSeguro(
                                elemento,
                                [
                                    "h3",
                                    "h2",
                                    ".nombre-proveedor",
                                    ".proveedor-nombre",
                                    ".nombre"
                                ]
                            ) ||
                            "Aliado DescoApp",

                        imagen:
                            imagenSegura(
                                elemento
                            ),

                        elemento:
                            elemento

                    };

                }
            );

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

            .slice(
                0,
                CONFIG.maxOfertas
            )

            .map(
                function (elemento) {

                    return {

                        nombre:
                            textoSeguro(
                                elemento,
                                [
                                    "h4",
                                    "h3",
                                    ".nombre-producto",
                                    ".producto-nombre",
                                    ".nombre"
                                ]
                            ) ||
                            "Oferta DescoApp",

                        imagen:
                            imagenSegura(
                                elemento
                            ),

                        elemento:
                            elemento

                    };

                }
            );

    }


    /* =====================================================
       10. CREAR PANEL IZQUIERDO
       ===================================================== */

    function crearPanelIzquierdo() {

        const showcase =
            document.createElement(
                "aside"
            );


        showcase.id =
            "descoapp-corporate-showcase";


        showcase.setAttribute(
            "aria-label",
            "Ecosistema comercial DescoApp"
        );


        showcase.innerHTML = `

            <div class="desco-corporate-inner">


                <!-- ===============================
                     CABECERA
                     =============================== -->

                <div class="desco-corporate-brand">


                    <img
                        class="desco-corporate-logo-image"
                        src="${CONFIG.logo}"
                        alt="DescoApp"
                    >


                    <div
                        class="desco-corporate-line"
                    ></div>


                    <div
                        class="desco-corporate-kicker"
                    >
                        DESCOAPP
                    </div>


                    <h2
                        class="desco-corporate-title"
                    >
                        Ecosistema comercial
                    </h2>


                    <p
                        class="desco-corporate-description"
                    >
                        Conectamos tu negocio con aliados,
                        productos y oportunidades.
                    </p>


                    <div
                        class="desco-platform-status"
                    >

                        <span
                            class="desco-status-dot"
                        ></span>

                        Plataforma activa

                    </div>

                </div>


                <!-- ===============================
                     CONTENIDO SCROLL
                     =============================== -->

                <div
                    class="desco-corporate-scroll"
                >


                    <!-- ALIADOS -->

                    <section
                        class="desco-corporate-section"
                    >

                        <div
                            class="desco-section-heading"
                        >

                            <div
                                class="desco-section-heading-text"
                            >

                                <span
                                    class="desco-section-kicker"
                                >
                                    Ecosistema
                                </span>

                                <span
                                    class="desco-section-title"
                                >
                                    Aliados estratégicos
                                </span>

                                <span
                                    class="desco-section-description"
                                >
                                    Proveedores conectados a DescoApp.
                                </span>

                            </div>


                            <div
                                class="desco-section-icon"
                            >
                                ✦
                            </div>

                        </div>


                        <div
                            id="desco-aliados-list"
                            class="desco-corporate-cards desco-aliados-list"
                        ></div>

                    </section>


                    <!-- OFERTAS -->

                    <section
                        class="desco-corporate-section"
                    >

                        <div
                            class="desco-section-heading"
                        >

                            <div
                                class="desco-section-heading-text"
                            >

                                <span
                                    class="desco-section-kicker"
                                >
                                    Oportunidades
                                </span>

                                <span
                                    class="desco-section-title"
                                >
                                    Ofertas destacadas
                                </span>

                                <span
                                    class="desco-section-description"
                                >
                                    Productos disponibles para tu negocio.
                                </span>

                            </div>


                            <div
                                class="desco-section-icon"
                            >
                                ★
                            </div>

                        </div>


                        <div
                            id="desco-ofertas-list"
                            class="desco-corporate-cards desco-ofertas-list"
                        ></div>

                    </section>


                </div>


                <!-- ===============================
                     FOOTER
                     =============================== -->

                <div
                    class="desco-corporate-footer"
                >

                    <div
                        class="desco-footer-line"
                    ></div>

                    <span>
                        DESCOAPP
                    </span>

                    <small>
                        Siempre cerca de tu negocio
                    </small>

                </div>


            </div>
        `;


        document.body.appendChild(
            showcase
        );


        return showcase;

    }


    /* =====================================================
       11. CREAR PANEL DERECHO
       ===================================================== */

    function crearPanelDerecho() {

        const panel =
            document.createElement(
                "aside"
            );


        panel.id =
            "descoapp-corporate-showcase-right";


        panel.setAttribute(
            "aria-label",
            "Centro comercial DescoApp"
        );


        panel.innerHTML = `

            <div class="desco-right-inner">


                <!-- ===============================
                     CABECERA
                     =============================== -->

                <div
                    class="desco-right-header"
                >

                    <img
                        class="desco-right-logo"
                        src="${CONFIG.logo}"
                        alt="DescoApp"
                    >


                    <div
                        class="desco-right-kicker"
                    >
                        DESCOAPP
                    </div>


                    <h2
                        class="desco-right-title"
                    >
                        Centro comercial
                    </h2>


                    <p
                        class="desco-right-subtitle"
                    >
                        Todo tu negocio, más cerca.
                    </p>


                    <div
                        class="desco-right-status"
                    >

                        <span
                            class="desco-status-dot"
                        ></span>

                        Plataforma activa

                    </div>

                </div>


                <!-- ===============================
                     CONTENIDO
                     =============================== -->

                <div
                    class="desco-right-scroll"
                >


                    <!-- INTRODUCCIÓN -->

                    <div
                        class="desco-right-intro"
                    >

                        <div
                            class="desco-right-line"
                        ></div>


                        <div
                            class="desco-right-section-kicker"
                        >
                            Tu ecosistema
                        </div>


                        <h3>
                            Un solo lugar para hacer
                            crecer tu negocio.
                        </h3>


                        <p>
                            Descubre aliados, productos,
                            ofertas y oportunidades
                            disponibles dentro de DescoApp.
                        </p>

                    </div>


                    <!-- ESTADÍSTICAS -->

                    <div
                        class="desco-right-stats"
                    >

                        <div
                            class="desco-stat"
                        >

                            <strong
                                id="desco-stat-aliados"
                            >
                                0
                            </strong>

                            <span>
                                Aliados
                            </span>

                        </div>


                        <div
                            class="desco-stat"
                        >

                            <strong
                                id="desco-stat-ofertas"
                            >
                                0
                            </strong>

                            <span>
                                Ofertas
                            </span>

                        </div>


                        <div
                            class="desco-stat"
                        >

                            <strong>
                                24/7
                            </strong>

                            <span>
                                Disponible
                            </span>

                        </div>

                    </div>


                    <!-- ECOSISTEMA -->

                    <div
                        class="desco-right-roadmap-title"
                    >
                        Ecosistema comercial
                    </div>


                    <div
                        class="desco-roadmap"
                    >


                        <div
                            class="desco-roadmap-item"
                        >

                            <div
                                class="desco-roadmap-number"
                            >
                                01
                            </div>


                            <div
                                class="desco-roadmap-content"
                            >

                                <strong>
                                    Aliados estratégicos
                                </strong>

                                <span>
                                    Proveedores conectados
                                </span>

                            </div>

                        </div>


                        <div
                            class="desco-roadmap-item"
                        >

                            <div
                                class="desco-roadmap-number"
                            >
                                02
                            </div>


                            <div
                                class="desco-roadmap-content"
                            >

                                <strong>
                                    Portafolio
                                </strong>

                                <span>
                                    Productos disponibles
                                </span>

                            </div>

                        </div>


                        <div
                            class="desco-roadmap-item"
                        >

                            <div
                                class="desco-roadmap-number"
                            >
                                03
                            </div>


                            <div
                                class="desco-roadmap-content"
                            >

                                <strong>
                                    Oportunidades
                                </strong>

                                <span>
                                    Ofertas para tu negocio
                                </span>

                            </div>

                        </div>


                        <div
                            class="desco-roadmap-item"
                        >

                            <div
                                class="desco-roadmap-number"
                            >
                                04
                            </div>


                            <div
                                class="desco-roadmap-content"
                            >

                                <strong>
                                    Compra
                                </strong>

                                <span>
                                    Pedido rápido y fácil
                                </span>

                            </div>

                        </div>


                    </div>


                    <!-- MENSAJE -->

                    <div
                        class="desco-commercial-message"
                    >

                        <small>
                            DESCOAPP
                        </small>


                        <strong>
                            Un ecosistema comercial
                            pensado para tu negocio.
                        </strong>

                    </div>


                </div>


                <!-- ===============================
                     FOOTER
                     =============================== -->

                <div
                    class="desco-right-footer"
                >

                    <div
                        class="desco-right-footer-line"
                    ></div>


                    <strong>
                        SERVICIO JUSTO A TIEMPO
                    </strong>


                    <small>
                        DescoApp · Tu plataforma comercial
                    </small>

                </div>


            </div>
        `;


        document.body.appendChild(
            panel
        );


        return panel;

    }


    /* =====================================================
       12. RENDER ALIADOS
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

                <div
                    class="desco-empty-card"
                >

                    <span
                        class="desco-empty-icon"
                    >
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

                .map(
                    function (aliado, index) {

                        const nombre =
                            escaparHTML(
                                aliado.nombre
                            );


                        const imagen =
                            escaparHTML(
                                aliado.imagen
                            );


                        return `

                            <div
                                class="
                                    desco-corporate-card
                                    desco-aliado-card
                                "
                                style="
                                    --desco-delay:${index * 80}ms
                                "
                            >

                                <div
                                    class="desco-card-image"
                                >

                                    ${
                                        imagen

                                        ? `

                                            <img
                                                src="${imagen}"
                                                alt="${nombre}"
                                                loading="lazy"
                                            >

                                          `

                                        : `

                                            <span
                                                class="
                                                    desco-card-placeholder
                                                "
                                            >
                                                D
                                            </span>

                                          `
                                    }

                                </div>


                                <div
                                    class="desco-card-content"
                                >

                                    <span
                                        class="desco-card-name"
                                    >
                                        ${nombre}
                                    </span>


                                    <span
                                        class="desco-card-subtitle"
                                    >
                                        Aliado DescoApp
                                    </span>

                                </div>


                                <div
                                    class="desco-card-tag"
                                >
                                    ALIADO
                                </div>

                            </div>

                        `;

                    }
                )

                .join("");

    }


    /* =====================================================
       13. RENDER OFERTAS
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

                <div
                    class="desco-empty-card"
                >

                    <span
                        class="desco-empty-icon"
                    >
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

                .map(
                    function (oferta, index) {

                        const nombre =
                            escaparHTML(
                                oferta.nombre
                            );


                        const imagen =
                            escaparHTML(
                                oferta.imagen
                            );


                        return `

                            <div
                                class="
                                    desco-corporate-card
                                    desco-oferta-card
                                "
                                style="
                                    --desco-delay:${index * 80}ms
                                "
                            >

                                <div
                                    class="desco-card-image"
                                >

                                    ${
                                        imagen

                                        ? `

                                            <img
                                                src="${imagen}"
                                                alt="${nombre}"
                                                loading="lazy"
                                            >

                                          `

                                        : `

                                            <span
                                                class="
                                                    desco-card-placeholder
                                                "
                                            >
                                                ★
                                            </span>

                                          `
                                    }

                                </div>


                                <div
                                    class="desco-card-content"
                                >

                                    <span
                                        class="desco-card-name"
                                    >
                                        ${nombre}
                                    </span>


                                    <span
                                        class="desco-card-subtitle"
                                    >
                                        Oferta disponible
                                    </span>

                                </div>


                                <div
                                    class="
                                        desco-card-tag
                                        oferta
                                    "
                                >
                                    OFERTA
                                </div>

                            </div>

                        `;

                    }
                )

                .join("");

    }


    /* =====================================================
       14. ACTUALIZAR ESTADÍSTICAS
       ===================================================== */

    function actualizarEstadisticas() {

        const aliados =
            obtenerAliados();


        const ofertas =
            obtenerOfertas();


        const elementoAliados =
            document.getElementById(
                "desco-stat-aliados"
            );


        const elementoOfertas =
            document.getElementById(
                "desco-stat-ofertas"
            );


        if (elementoAliados) {

            elementoAliados.textContent =
                aliados.length;

        }


        if (elementoOfertas) {

            elementoOfertas.textContent =
                ofertas.length;

        }

    }


    /* =====================================================
       15. INICIAR
       ===================================================== */

    function iniciarShowcase() {

        if (!mediaPC.matches) {
            return;
        }


        const existenteIzquierdo =
            document.getElementById(
                "descoapp-corporate-showcase"
            );


        const existenteDerecho =
            document.getElementById(
                "descoapp-corporate-showcase-right"
            );


        if (
            existenteIzquierdo ||
            existenteDerecho
        ) {

            return;
        }


        const panelIzquierdo =
            crearPanelIzquierdo();


        const panelDerecho =
            crearPanelDerecho();


        if (!panelIzquierdo) {
            return;
        }


        if (!panelDerecho) {
            return;
        }


        renderAliados(
            panelIzquierdo
        );


        renderOfertas(
            panelIzquierdo
        );


        actualizarEstadisticas();


        /* =================================================
           SEGUNDA LECTURA

           Permite que los elementos que todavía
           estén cargando aparezcan posteriormente.

           NO realiza ninguna petición.
           ================================================= */

        setTimeout(
            function () {

                renderAliados(
                    panelIzquierdo
                );


                renderOfertas(
                    panelIzquierdo
                );


                actualizarEstadisticas();

            },
            1500
        );

    }


    /* =====================================================
       16. ESPERAR DOM
       ===================================================== */

    if (
        document.readyState ===
        "loading"
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
        setInterval(
            function () {

                const showcase =
                    document.getElementById(
                        "descoapp-corporate-showcase"
                    );


                if (!showcase) {
                    return;
                }


                renderAliados(
                    showcase
                );


                renderOfertas(
                    showcase
                );


                actualizarEstadisticas();

            },
            CONFIG.intervaloActualizacion
        );


    /* =====================================================
       18. CAMBIO PC / MOBILE
       ===================================================== */

    function manejarCambioPantalla(event) {

        const izquierdo =
            document.getElementById(
                "descoapp-corporate-showcase"
            );


        const derecho =
            document.getElementById(
                "descoapp-corporate-showcase-right"
            );


        if (!event.matches) {

            if (izquierdo) {
                izquierdo.remove();
            }


            if (derecho) {
                derecho.remove();
            }


            return;
        }


        if (
            !izquierdo &&
            !derecho
        ) {

            iniciarShowcase();

        }

    }


    if (
        typeof mediaPC.addEventListener ===
        "function"
    ) {

        mediaPC.addEventListener(
            "change",
            manejarCambioPantalla
        );

    } else {

        mediaPC.addListener(
            manejarCambioPantalla
        );

    }


    /* =====================================================
       19. LIMPIEZA
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        function () {

            clearInterval(
                intervalo
            );

        },
        {
            once: true
        }
    );


})();