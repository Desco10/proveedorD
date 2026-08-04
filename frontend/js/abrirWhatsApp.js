/**
 * ==========================================================
 * DescoApp - Smart WhatsApp Launcher
 * ----------------------------------------------------------
 * Abre WhatsApp utilizando la mejor estrategia disponible
 * según el dispositivo del usuario.
 *
 * Prioridad:
 * 1. Deep Link (whatsapp://)
 * 2. API oficial de WhatsApp
 *
 * Compatible con:
 * ✓ Android
 * ✓ iPhone
 * ✓ WhatsApp Messenger
 * ✓ WhatsApp Business
 * ✓ Navegadores de escritorio
 * ==========================================================
 */

function abrirWhatsApp(telefono, mensaje) {

    if (!telefono || !mensaje) {
        console.error("abrirWhatsApp(): teléfono o mensaje inválido.");
        return;
    }

    const texto = encodeURIComponent(mensaje);
    const apiUrl = `https://api.whatsapp.com/send?phone=${telefono}&text=${texto}`;
    const deepLink = `whatsapp://send?phone=${telefono}&text=${texto}`;

    const ua = navigator.userAgent.toLowerCase();
    const esMovil = /android|iphone|ipad|ipod/.test(ua);

    // ==========================
    // DISPOSITIVOS MÓVILES
    // ==========================
    if (esMovil) {

        // Intentar abrir directamente la aplicación instalada.
        window.location.href = deepLink;

        // Si el navegador continúa abierto,
        // usar el enlace oficial como respaldo.
        setTimeout(() => {

            if (!document.hidden) {
                window.location.href = apiUrl;
            }

        }, 1200);

        return;
    }

    // ==========================
    // ESCRITORIO
    // ==========================
    window.open(apiUrl, "_blank", "noopener,noreferrer");
}