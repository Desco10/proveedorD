/* =========================================================
   DESCOAPP — CORPORATE SHOWCASE
   ECOSISTEMA COMERCIAL PARA PC

   SOLO UTILIZA:
   /corporate-showcase.js
   /corporate-showcase.css

   NO MODIFICA:
   - carrito
   - checkout
   - WhatsApp
   - remisiones
   - backend
   - server.js
   - main.js
   - experiencia mobile

   Lee información que ya existe en el DOM.
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
        intervaloActualizacion: 8000,

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

    if (document.getElementById("descoapp-corporate-showcase")) {
        return;
    }

    /* =====================================================
       4. UTILIDADES
       ===================================================== */

    function obtenerElementos(selectores) {
        for (const selector of selectores) {
            try {
                const elementos = document.querySelectorAll(selector);

                if (elementos.length) {
                    return Array.from(elementos);
                }
            } catch (error) {
                console.warn(
                    "DescoApp Corporate: selector ignorado:",
                    selector
                );
            }
        }

        return [];
    }

    function textoSeguro(elemento, selectores) {
        for (const selector of selectores) {
            try {
                const nodo = elemento.querySelector(selector);

                if (
                    nodo &&
                    nodo.textContent &&
                    nodo.textContent.trim()
                ) {
                    return nodo.textContent.trim();
                }
            } catch (error) {
                continue;
            }
        }

        return "";
    }

    function imagenSegura(elemento) {
        if (!elemento) {
            return "";
        }

        const img = elemento.querySelector("img");

        if (!img) {
            return "";
        }

        return (
            img.currentSrc ||
            img.getAttribute("src") ||
            img.getAttribute("data-src") ||
            ""
        );
    }

    function escaparHTML(texto) {
        return String(texto || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       5. LEER ALIADOS EXISTENTES
       ===================================================== */

    function obtenerAliados() {
        const elementos = obtenerElementos(
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
                        ]) || "Aliado DescoApp",

                    imagen: imagenSegura(elemento)
                };
            });
    }

    /* =====================================================
       6. LEER OFERTAS EXISTENTES
       ===================================================== */

    function obtenerOfertas() {
        const elementos = obtenerElementos(
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
                        ]) || "Oferta DescoApp",

                    imagen: imagenSegura(elemento)
                };
            });
    }

    /* =====================================================
       7. CREAR PANEL IZQUIERDO
       ===================================================== */

    function crearPanelIzquierdo() {
        const showcase = document.createElement("aside");

        showcase.id = "descoapp-corporate-showcase";

        showcase.setAttribute(
            "aria-label",
            "Ecosistema comercial DescoApp"
        );

        showcase.innerHTML = `
            <div class="desco-corporate-inner">

                <div class="desco-corporate-brand">

                    <div class="desco-corporate-logo">
                        <span>Desco</span><strong>App</strong>
                    </div>

                    <div class="desco-corporate-line"></div>

                    <div class="desco-corporate-caption">
                        Ecosistema comercial
                    </div>

                    <div class="desco-corporate-status">
                        <span></span>
                        ACTIVO
                    </div>

                </div>

                <div class="desco-corporate-intro">
                    <span>ECOSISTEMA</span>
                    <strong>Aliados estratégicos</strong>
                    <small>
                        Conectamos tu negocio con grandes aliados.
                    </small>
                </div>

                <div
                    class="desco-corporate-cards desco-aliados-list"
                    id="desco-aliados-list"
                ></div>

                <div class="desco-corporate-intro desco-intro-ofertas">
                    <span>OPORTUNIDADES</span>
                    <strong>Ofertas destacadas</strong>
                    <small>
                        Productos disponibles para tu negocio.
                    </small>
                </div>

                <div
                    class="desco-corporate-cards desco-ofertas-list"
                    id="desco-ofertas-list"
                ></div>

                <div class="desco-corporate-footer">
                    <div class="desco-footer-line"></div>
                    <strong>DESCOAPP</strong>
                    <small>Siempre cerca de tu negocio</small>
                </div>

            </div>
        `;

        document.body.appendChild(showcase);

        return showcase;
    }

    /* =====================================================
       8. CREAR PANEL DERECHO
       ===================================================== */

    function crearPanelDerecho() {
        const panel = document.createElement("aside");

        panel.id = "descoapp-commercial-panel";

        panel.setAttribute(
            "aria-label",
            "Centro comercial DescoApp"
        );

        panel.innerHTML = `
            <div class="desco-commercial-inner">

                <div class="desco-commercial-header">

                    <div class="desco-commercial-eyebrow">
                        DESCOAPP
                    </div>

                    <div class="desco-commercial-title">
                        Centro comercial
                    </div>

                    <div class="desco-commercial-subtitle">
                        Todo tu negocio, más cerca.
                    </div>

                    <div class="desco-commercial-pulse">
                        <span></span>
                        Plataforma activa
                    </div>

                </div>


                <div class="desco-commercial-flow">

                    <div class="desco-flow-line"></div>

                    <div class="desco-flow-item">
                        <span class="desco-flow-icon">01</span>
                        <div>
                            <strong>ALIADOS</strong>
                            <small>Proveedores conectados</small>
                        </div>
                    </div>

                    <div class="desco-flow-item">
                        <span class="desco-flow-icon">02</span>
                        <div>
                            <strong>PORTAFOLIO</strong>
                            <small>Productos disponibles</small>
                        </div>
                    </div>

                    <div class="desco-flow-item">
                        <span class="desco-flow-icon">03</span>
                        <div>
                            <strong>OPORTUNIDADES</strong>
                            <small>Ofertas para tu negocio</small>
                        </div>
                    </div>

                    <div class="desco-flow-item">
                        <span class="desco-flow-icon">04</span>
                        <div>
                            <strong>COMPRA</strong>
                            <small>Pedido rápido y fácil</small>
                        </div>
                    </div>

                </div>


                <div class="desco-commercial-highlight">

                    <div class="desco-highlight-top">
                        <span>DESCOAPP</span>
                        <span class="desco-highlight-dot"></span>
                    </div>

                    <strong>
                        Un ecosistema comercial
                        pensado para tu negocio.
                    </strong>

                    <div class="desco-highlight-bottom">
                        <span>ALIADOS</span>
                        <span>•</span>
                        <span>PRODUCTOS</span>
                        <span>•</span>
                        <span>OFERTAS</span>
                    </div>

                </div>


                <div class="desco-commercial-stats">

                    <div class="desco-stat">
                        <strong id="desco-stat-aliados">0</strong>
                        <span>Aliados</span>
                    </div>

                    <div class="desco-stat-divider"></div>

                    <div class="desco-stat">
                        <strong id="desco-stat-ofertas">0</strong>
                        <span>Ofertas</span>
                    </div>

                    <div class="desco-stat-divider"></div>

                    <div class="desco-stat">
                        <strong>24/7</strong>
                        <span>Disponible</span>
                    </div>

                </div>


                <div class="desco-commercial-footer">

                    <div class="desco-commercial-light"></div>

                    <strong>
                        SERVICIO JUSTO A TIEMPO
                    </strong>

                    <small>
                        DescoApp · Tu plataforma comercial
                    </small>

                </div>

            </div>
        `;

        document.body.appendChild(panel);

        return panel;
    }

    /* =====================================================
       9. RENDER ALIADOS
       ===================================================== */

    function renderAliados(showcase) {
        const contenedor = showcase.querySelector(
            "#desco-aliados-list"
        );

        if (!contenedor) {
            return;
        }

        const aliados = obtenerAliados();

        const statAliados = document.getElementById(
            "desco-stat-aliados"
        );

        if (statAliados) {
            statAliados.textContent = aliados.length;
        }

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
            .map(function (aliado, index) {
                const nombre = escaparHTML(aliado.nombre);

                const imagen = aliado.imagen
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
                    `;

                return `
                    <div
                        class="desco-corporate-card desco-aliado-card"
                        style="--desco-delay:${index * 80}ms"
                    >

                        <div class="desco-card-image">
                            ${imagen}
                        </div>

                        <div class="desco-card-content">
                            <strong>${nombre}</strong>
                            <small>Aliado DescoApp</small>
                        </div>

                        <div class="desco-card-arrow">
                            ›
                        </div>

                    </div>
                `;
            })
            .join("");
    }

    /* =====================================================
       10. RENDER OFERTAS
       ===================================================== */

    function renderOfertas(showcase) {
        const contenedor = showcase.querySelector(
            "#desco-ofertas-list"
        );

        if (!contenedor) {
            return;
        }

        const ofertas = obtenerOfertas();

        const statOfertas = document.getElementById(
            "desco-stat-ofertas"
        );

        if (statOfertas) {
            statOfertas.textContent = ofertas.length;
        }

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
            .map(function (oferta, index) {
                const nombre = escaparHTML(oferta.nombre);

                const imagen = oferta.imagen
                    ? `
                        <img
                            src="${escaparHTML(oferta.imagen)}"
                            alt="${nombre}"
                            loading="lazy"
                        >
                    `
                    : `
                        <span class="desco-card-placeholder oferta">
                            ★
                        </span>
                    `;

                return `
                    <div
                        class="desco-corporate-card desco-oferta-card"
                        style="--desco-delay:${index * 80}ms"
                    >

                        <div class="desco-card-image">
                            ${imagen}
                        </div>

                        <div class="desco-card-content">
                            <strong>${nombre}</strong>
                            <small>Oferta disponible</small>
                        </div>

                        <div class="desco-card-arrow oferta">
                            ›
                        </div>

                    </div>
                `;
            })
            .join("");
    }

    /* =====================================================
       11. ACTUALIZAR ESTADÍSTICAS
       ===================================================== */

    function actualizarEstadisticas() {
        const aliados = obtenerAliados();
        const ofertas = obtenerOfertas();

        const statAliados = document.getElementById(
            "desco-stat-aliados"
        );

        const statOfertas = document.getElementById(
            "desco-stat-ofertas"
        );

        if (statAliados) {
            statAliados.textContent = aliados.length;
        }

        if (statOfertas) {
            statOfertas.textContent = ofertas.length;
        }
    }

    /* =====================================================
       12. INICIAR
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

        const izquierda = crearPanelIzquierdo();
        crearPanelDerecho();

        renderAliados(izquierda);
        renderOfertas(izquierda);
        actualizarEstadisticas();

        setTimeout(function () {
            renderAliados(izquierda);
            renderOfertas(izquierda);
            actualizarEstadisticas();
        }, 1500);
    }

    /* =====================================================
       13. ESPERAR DOM
       ===================================================== */

    if (document.readyState === "loading") {
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
       ===================================================== */

    const intervalo = setInterval(function () {
        const showcase = document.getElementById(
            "descoapp-corporate-showcase"
        );

        const panel = document.getElementById(
            "descoapp-commercial-panel"
        );

        if (!showcase || !panel) {
            return;
        }

        renderAliados(showcase);
        renderOfertas(showcase);
        actualizarEstadisticas();
    }, CONFIG.intervaloActualizacion);

    /* =====================================================
       15. CAMBIO DE TAMAÑO
       ===================================================== */

    mediaPC.addEventListener("change", function (event) {
        const izquierda = document.getElementById(
            "descoapp-corporate-showcase"
        );

        const derecha = document.getElementById(
            "descoapp-commercial-panel"
        );

        if (!event.matches) {
            if (izquierda) {
                izquierda.remove();
            }

            if (derecha) {
                derecha.remove();
            }

            return;
        }

        if (!izquierda) {
            iniciarShowcase();
        }
    });

    /* =====================================================
       16. LIMPIEZA
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