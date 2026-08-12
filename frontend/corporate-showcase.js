/* =========================================================
   DESCOAPP — CORPORATE SHOWCASE
   =========================================================

   SOLO PC / ESCRITORIO

   Este módulo:
   - NO toca mobile
   - NO toca carrito
   - NO toca checkout
   - NO toca WhatsApp
   - NO toca backend
   - NO hace peticiones
   - NO modifica server.js

   Utiliza únicamente información que ya existe en el DOM.
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

        logo: "/img/plataforma/newdescoappsinf.png",

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
       4. BUSCAR ELEMENTOS EXISTENTES
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

    /* =====================================================
       6. OBTENER IMAGEN
       ===================================================== */

    function obtenerImagen(elemento) {

        const imagen =
            elemento.querySelector("img");

        if (!imagen) {
            return "";
        }

        return (
            imagen.currentSrc ||
            imagen.src ||
            imagen.getAttribute("data-src") ||
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
                        obtenerTexto(elemento, [
                            "h3",
                            "h2",
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
                        obtenerTexto(elemento, [
                            "h4",
                            "h3",
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
       9. CREAR PANEL
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

            <div class="dc-commercial-panel">

                <!-- ======================================
                     CABECERA
                     ====================================== -->

                <div class="dc-commercial-header">

                    <img
                        class="dc-commercial-logo"
                        src="${CONFIG.logo}"
                        alt="DescoApp"
                    >

                    <div class="dc-commercial-eyebrow">
                        DESCOAPP
                    </div>

                    <h2>
                        Centro comercial
                    </h2>

                    <p>
                        Todo tu negocio, más cerca.
                    </p>

                    <div class="dc-status">
                        <span></span>
                        Plataforma activa
                    </div>

                </div>


                <!-- ======================================
                     RESUMEN
                     ====================================== -->

                <div class="dc-commercial-summary">

                    <div class="dc-summary-title">
                        TU ECOSISTEMA
                    </div>

                    <div class="dc-summary-text">
                        Conecta proveedores,
                        productos y oportunidades
                        desde un mismo lugar.
                    </div>

                </div>


                <!-- ======================================
                     MÉTRICAS
                     ====================================== -->

                <div class="dc-commercial-metrics">

                    <div class="dc-metric">

                        <strong
                            id="dc-total-aliados"
                        >
                            0
                        </strong>

                        <span>
                            Aliados
                        </span>

                    </div>


                    <div class="dc-metric">

                        <strong
                            id="dc-total-ofertas"
                        >
                            0
                        </strong>

                        <span>
                            Ofertas
                        </span>

                    </div>


                    <div class="dc-metric">

                        <strong>
                            24/7
                        </strong>

                        <span>
                            Disponible
                        </span>

                    </div>

                </div>


                <!-- ======================================
                     ECOSISTEMA
                     ====================================== -->

                <div class="dc-commercial-section">

                    <div class="dc-section-heading">

                        <span>
                            ECOSISTEMA COMERCIAL
                        </span>

                    </div>


                    <div class="dc-commercial-item">

                        <div class="dc-item-icon">
                            01
                        </div>

                        <div class="dc-item-content">

                            <strong>
                                Aliados estratégicos
                            </strong>

                            <small>
                                Proveedores conectados
                            </small>

                        </div>

                    </div>


                    <div class="dc-commercial-item">

                        <div class="dc-item-icon">
                            02
                        </div>

                        <div class="dc-item-content">

                            <strong>
                                Portafolio
                            </strong>

                            <small>
                                Productos para tu negocio
                            </small>

                        </div>

                    </div>


                    <div class="dc-commercial-item">

                        <div class="dc-item-icon">
                            03
                        </div>

                        <div class="dc-item-content">

                            <strong>
                                Oportunidades
                            </strong>

                            <small>
                                Ofertas disponibles
                            </small>

                        </div>

                    </div>


                    <div class="dc-commercial-item">

                        <div class="dc-item-icon">
                            04
                        </div>

                        <div class="dc-item-content">

                            <strong>
                                Compra
                            </strong>

                            <small>
                                Pedido rápido y fácil
                            </small>

                        </div>

                    </div>

                </div>


                <!-- ======================================
                     MENSAJE CORPORATIVO
                     ====================================== -->

                <div class="dc-commercial-message">

                    <div class="dc-message-label">
                        DESCOAPP
                    </div>

                    <strong>
                        Un ecosistema comercial
                        pensado para tu negocio.
                    </strong>

                    <p>
                        Aliados, productos y ofertas
                        conectados para facilitar
                        cada compra.
                    </p>

                </div>


                <!-- ======================================
                     PIE
                     ====================================== -->

                <div class="dc-commercial-footer">

                    <div class="dc-footer-line"></div>

                    <strong>
                        SERVICIO JUSTO A TIEMPO
                    </strong>

                    <small>
                        DescoApp · Tu plataforma comercial
                    </small>

                </div>

            </div>

        `;

        document.body.appendChild(showcase);

        return showcase;

    }

    /* =====================================================
       10. ACTUALIZAR MÉTRICAS
       ===================================================== */

    function actualizarMetricas(
        showcase,
        aliados,
        ofertas
    ) {

        const totalAliados =
            showcase.querySelector(
                "#dc-total-aliados"
            );

        const totalOfertas =
            showcase.querySelector(
                "#dc-total-ofertas"
            );

        if (totalAliados) {

            totalAliados.textContent =
                aliados.length;

        }

        if (totalOfertas) {

            totalOfertas.textContent =
                ofertas.length;

        }

    }

    /* =====================================================
       11. CREAR
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

        const aliados =
            obtenerAliados();

        const ofertas =
            obtenerOfertas();

        actualizarMetricas(
            showcase,
            aliados,
            ofertas
        );

    }

    /* =====================================================
       12. DOM
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
       13. CAMBIO DE TAMAÑO
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

})();