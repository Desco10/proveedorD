/* =========================================================
   DESCOAPP — CORPORATE SHOWCASE
   =========================================================

   MÓDULO EXCLUSIVO PARA PC

   ESTE ARCHIVO:
   - NO modifica mobile.
   - NO modifica el carrito.
   - NO modifica checkout.
   - NO modifica WhatsApp.
   - NO modifica server.js.
   - NO realiza peticiones al backend.
   - NO modifica main.js.
   - NO modifica el contenido central.

   Únicamente crea dos paneles visuales:
   1. Ecosistema comercial - izquierda.
   2. Centro comercial - derecha.

   Los datos de aliados y ofertas se leen del DOM existente.
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       1. SOLO PC
       ===================================================== */

    const mediaPC = window.matchMedia("(min-width: 1100px)");

    if (!mediaPC.matches) {
        return;
    }

    /* =====================================================
       2. CONFIGURACIÓN
       ===================================================== */

    const CONFIG = {

        maxAliados: 6,

        maxOfertas: 6,

        intervalo: 6000,

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
        ],

        logo: "/img/plataforma/newdescoappsinf.png"
    };

    /* =====================================================
       3. UTILIDADES
       ===================================================== */

    function escaparHTML(valor) {

        if (valor === null || valor === undefined) {
            return "";
        }

        return String(valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

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

    function obtenerTexto(elemento, selectores) {

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

    function obtenerImagen(elemento) {

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
       4. OBTENER ALIADOS EXISTENTES
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
                        obtenerTexto(elemento, [
                            "h1",
                            "h2",
                            "h3",
                            "h4",
                            ".nombre-proveedor",
                            ".proveedor-nombre",
                            ".nombre"
                        ]) ||
                        "Aliado DescoApp",

                    imagen:
                        obtenerImagen(elemento)
                };

            });
    }

    /* =====================================================
       5. OBTENER OFERTAS EXISTENTES
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
                        obtenerTexto(elemento, [
                            "h1",
                            "h2",
                            "h3",
                            "h4",
                            ".nombre-producto",
                            ".producto-nombre",
                            ".nombre"
                        ]) ||
                        "Oferta DescoApp",

                    imagen:
                        obtenerImagen(elemento)
                };

            });
    }

    /* =====================================================
       6. CREAR PANEL IZQUIERDO
       ===================================================== */

    function crearPanelIzquierdo() {

        const panel =
            document.createElement("aside");

        panel.id =
            "desco-corporate-left";

        panel.className =
            "desco-corporate-panel desco-panel-left";

        panel.setAttribute(
            "aria-label",
            "Ecosistema comercial DescoApp"
        );

        panel.innerHTML = `

            <div class="desco-panel-inner">

                <header class="desco-panel-header">

                    <img
                        class="desco-main-logo"
                        src="${CONFIG.logo}"
                        alt="DescoApp"
                    >

                    <div class="desco-logo-line"></div>

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
                        <span></span>
                        PLATAFORMA ACTIVA
                    </div>

                </header>

                <div class="desco-panel-scroll">

                    <section class="desco-data-section">

                        <div class="desco-section-heading">

                            <div>
                                <small>ECOSISTEMA</small>
                                <strong>
                                    Aliados estratégicos
                                </strong>
                            </div>

                            <span class="desco-heading-icon">
                                ✦
                            </span>

                        </div>

                        <p class="desco-section-description">
                            Proveedores conectados a DescoApp.
                        </p>

                        <div
                            id="desco-aliados-list"
                            class="desco-list"
                        ></div>

                    </section>

                    <section class="desco-data-section">

                        <div class="desco-section-heading">

                            <div>
                                <small>OPORTUNIDADES</small>
                                <strong>
                                    Ofertas destacadas
                                </strong>
                            </div>

                            <span class="desco-heading-icon oferta">
                                ★
                            </span>

                        </div>

                        <p class="desco-section-description">
                            Productos disponibles para tu negocio.
                        </p>

                        <div
                            id="desco-ofertas-list"
                            class="desco-list"
                        ></div>

                    </section>

                </div>

                <footer class="desco-panel-footer">

                    <strong>DESCOAPP</strong>

                    <span>
                        Siempre cerca de tu negocio
                    </span>

                </footer>

            </div>
        `;

        document.body.appendChild(panel);

        return panel;
    }

    /* =====================================================
       7. CREAR PANEL DERECHO
       ===================================================== */

    function crearPanelDerecho() {

        const panel =
            document.createElement("aside");

        panel.id =
            "desco-corporate-right";

        panel.className =
            "desco-corporate-panel desco-panel-right";

        panel.setAttribute(
            "aria-label",
            "Centro comercial DescoApp"
        );

        panel.innerHTML = `

            <div class="desco-panel-inner">

                <header class="desco-commercial-header">

                    <img
                        class="desco-commercial-logo"
                        src="${CONFIG.logo}"
                        alt="DescoApp"
                    >

                    <small>
                        DESCOAPP
                    </small>

                    <h2>
                        Centro comercial
                    </h2>

                    <p>
                        Todo tu negocio, más cerca.
                    </p>

                    <div class="desco-status">
                        <span></span>
                        PLATAFORMA ACTIVA
                    </div>

                </header>

                <div class="desco-panel-scroll">

                    <section class="desco-commercial-intro">

                        <div class="desco-commercial-line"></div>

                        <small>
                            TU ECOSISTEMA
                        </small>

                        <h3>
                            Un solo lugar para
                            hacer crecer tu negocio.
                        </h3>

                        <p>
                            Descubre aliados, productos,
                            ofertas y oportunidades
                            disponibles dentro de DescoApp.
                        </p>

                    </section>


                    <section class="desco-commercial-stats">

                        <div>
                            <strong
                                id="desco-stat-aliados"
                            >
                                0
                            </strong>

                            <span>
                                Aliados
                            </span>
                        </div>

                        <div>
                            <strong
                                id="desco-stat-ofertas"
                            >
                                0
                            </strong>

                            <span>
                                Ofertas
                            </span>
                        </div>

                        <div>
                            <strong>
                                24/7
                            </strong>

                            <span>
                                Disponible
                            </span>
                        </div>

                    </section>


                    <section class="desco-commercial-flow">

                        <div class="desco-flow-title">

                            <small>
                                EXPERIENCIA DESCOAPP
                            </small>

                            <strong>
                                Tu negocio en movimiento
                            </strong>

                        </div>


                        <div class="desco-flow-item">

                            <span class="desco-flow-number">
                                01
                            </span>

                            <div>
                                <strong>
                                    DESCUBRE
                                </strong>

                                <small>
                                    Encuentra aliados y productos.
                                </small>
                            </div>

                        </div>


                        <div class="desco-flow-connector"></div>


                        <div class="desco-flow-item">

                            <span class="desco-flow-number">
                                02
                            </span>

                            <div>
                                <strong>
                                    EXPLORA
                                </strong>

                                <small>
                                    Revisa oportunidades y ofertas.
                                </small>
                            </div>

                        </div>


                        <div class="desco-flow-connector"></div>


                        <div class="desco-flow-item">

                            <span class="desco-flow-number">
                                03
                            </span>

                            <div>
                                <strong>
                                    ELIGE
                                </strong>

                                <small>
                                    Selecciona lo que necesita tu negocio.
                                </small>
                            </div>

                        </div>


                        <div class="desco-flow-connector"></div>


                        <div class="desco-flow-item">

                            <span class="desco-flow-number">
                                04
                            </span>

                            <div>
                                <strong>
                                    COMPRA
                                </strong>

                                <small>
                                    Compra de forma rápida y sencilla.
                                </small>
                            </div>

                        </div>

                    </section>


                    <section class="desco-commercial-highlight">

                        <div class="desco-highlight-glow"></div>

                        <small>
                            DESCOAPP
                        </small>

                        <strong>
                            Un ecosistema comercial
                            pensado para tu negocio.
                        </strong>

                        <span>
                            ALIADOS · PRODUCTOS · OFERTAS
                        </span>

                    </section>


                    <section class="desco-commercial-benefits">

                        <div class="desco-benefit">

                            <span>✦</span>

                            <div>
                                <strong>
                                    Aliados estratégicos
                                </strong>

                                <small>
                                    Proveedores conectados.
                                </small>
                            </div>

                        </div>


                        <div class="desco-benefit">

                            <span>◆</span>

                            <div>
                                <strong>
                                    Portafolio
                                </strong>

                                <small>
                                    Productos para tu negocio.
                                </small>
                            </div>

                        </div>


                        <div class="desco-benefit">

                            <span>★</span>

                            <div>
                                <strong>
                                    Oportunidades
                                </strong>

                                <small>
                                    Ofertas disponibles.
                                </small>
                            </div>

                        </div>

                    </section>

                </div>

                <footer class="desco-commercial-footer">

                    <div class="desco-footer-line"></div>

                    <strong>
                        SERVICIO JUSTO A TIEMPO
                    </strong>

                    <span>
                        DescoApp · Tu plataforma comercial
                    </span>

                </footer>

            </div>
        `;

        document.body.appendChild(panel);

        return panel;
    }

    /* =====================================================
       8. CARD DE ALIADO
       ===================================================== */

    function crearCardAliado(aliado, index) {

        const imagen =
            aliado.imagen
                ? `
                    <img
                        src="${escaparHTML(aliado.imagen)}"
                        alt="${escaparHTML(aliado.nombre)}"
                    >
                  `
                : `
                    <span class="desco-card-placeholder">
                        D
                    </span>
                  `;

        return `

            <article
                class="desco-data-card aliado"
                style="--desco-delay:${index * 70}ms"
            >

                <div class="desco-data-image">

                    ${imagen}

                </div>

                <div class="desco-data-content">

                    <strong>
                        ${escaparHTML(aliado.nombre)}
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
    }

    /* =====================================================
       9. CARD DE OFERTA
       ===================================================== */

    function crearCardOferta(oferta, index) {

        const imagen =
            oferta.imagen
                ? `
                    <img
                        src="${escaparHTML(oferta.imagen)}"
                        alt="${escaparHTML(oferta.nombre)}"
                    >
                  `
                : `
                    <span class="desco-card-placeholder oferta">
                        ★
                    </span>
                  `;

        return `

            <article
                class="desco-data-card oferta"
                style="--desco-delay:${index * 70}ms"
            >

                <div class="desco-data-image">

                    ${imagen}

                </div>

                <div class="desco-data-content">

                    <strong>
                        ${escaparHTML(oferta.nombre)}
                    </strong>

                    <small>
                        Oferta disponible
                    </small>

                </div>

                <span class="desco-card-arrow oferta">
                    ›
                </span>

            </article>
        `;
    }

    /* =====================================================
       10. RENDERIZAR ALIADOS
       ===================================================== */

    function renderAliados(panel) {

        if (!panel) {
            return;
        }

        const contenedor =
            panel.querySelector(
                "#desco-aliados-list"
            );

        if (!contenedor) {
            return;
        }

        const aliados =
            obtenerAliados();

        if (!aliados.length) {

            contenedor.innerHTML = `

                <div class="desco-empty">

                    <span>
                        ✦
                    </span>

                    <strong>
                        Ecosistema DescoApp
                    </strong>

                    <small>
                        Aliados disponibles próximamente.
                    </small>

                </div>
            `;

            return;
        }

        contenedor.innerHTML =
            aliados
                .map(crearCardAliado)
                .join("");

        actualizarEstadisticas();
    }

    /* =====================================================
       11. RENDERIZAR OFERTAS
       ===================================================== */

    function renderOfertas(panel) {

        if (!panel) {
            return;
        }

        const contenedor =
            panel.querySelector(
                "#desco-ofertas-list"
            );

        if (!contenedor) {
            return;
        }

        const ofertas =
            obtenerOfertas();

        if (!ofertas.length) {

            contenedor.innerHTML = `

                <div class="desco-empty">

                    <span>
                        ★
                    </span>

                    <strong>
                        Oportunidades DescoApp
                    </strong>

                    <small>
                        Nuevas ofertas próximamente.
                    </small>

                </div>
            `;

            actualizarEstadisticas();

            return;
        }

        contenedor.innerHTML =
            ofertas
                .map(crearCardOferta)
                .join("");

        actualizarEstadisticas();
    }

    /* =====================================================
       12. ESTADÍSTICAS
       ===================================================== */

    function actualizarEstadisticas() {

        const aliados =
            obtenerAliados();

        const ofertas =
            obtenerOfertas();

        const statAliados =
            document.getElementById(
                "desco-stat-aliados"
            );

        const statOfertas =
            document.getElementById(
                "desco-stat-ofertas"
            );

        if (statAliados) {

            statAliados.textContent =
                aliados.length;
        }

        if (statOfertas) {

            statOfertas.textContent =
                ofertas.length;
        }
    }

    /* =====================================================
       13. INICIALIZAR
       ===================================================== */

    function iniciar() {

        if (!mediaPC.matches) {
            return;
        }

        if (
            document.getElementById(
                "desco-corporate-left"
            ) ||
            document.getElementById(
                "desco-corporate-right"
            )
        ) {
            return;
        }

        const panelIzquierdo =
            crearPanelIzquierdo();

        const panelDerecho =
            crearPanelDerecho();

        renderAliados(panelIzquierdo);

        renderOfertas(panelIzquierdo);

        actualizarEstadisticas();
    }

    /* =====================================================
       14. ESPERAR DOM
       ===================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciar,
            {
                once: true
            }
        );

    } else {

        iniciar();
    }

    /* =====================================================
       15. ACTUALIZACIÓN SUAVE

       SOLO LEE EL DOM.

       NO HACE FETCH.
       NO CONSULTA BACKEND.
       ===================================================== */

    const intervalo =
        setInterval(function () {

            if (!mediaPC.matches) {
                return;
            }

            const izquierdo =
                document.getElementById(
                    "desco-corporate-left"
                );

            if (!izquierdo) {
                return;
            }

            renderAliados(izquierdo);

            renderOfertas(izquierdo);

        }, CONFIG.intervalo);

    /* =====================================================
       16. CAMBIO DE TAMAÑO
       ===================================================== */

    mediaPC.addEventListener(
        "change",
        function (event) {

            const izquierdo =
                document.getElementById(
                    "desco-corporate-left"
                );

            const derecho =
                document.getElementById(
                    "desco-corporate-right"
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

            if (!izquierdo && !derecho) {

                iniciar();
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