/**
 * ==========================================================
 * DescoApp - Smart WhatsApp Launcher
 * ==========================================================
 * Versión estable
 *
 * ✔ No modifica finalizarCompra()
 * ✔ No modifica el historial del navegador
 * ✔ Mantiene DescoApp abierta
 * ✔ Intenta abrir WhatsApp directamente
 * ✔ Si falla usa la API oficial
 * ==========================================================
 */

function abrirWhatsApp(telefono, mensaje) {

    if (!telefono || !mensaje) {
        console.error("Teléfono o mensaje inválido.");
        return;
    }

    const texto = encodeURIComponent(mensaje);

    const deepLink =
        `whatsapp://send?phone=${telefono}&text=${texto}`;

    const apiUrl =
        `https://api.whatsapp.com/send?phone=${telefono}&text=${texto}`;

    const esMovil =
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // ==========================
    // ESCRITORIO
    // ==========================

    if (!esMovil) {

        window.open(
            apiUrl,
            "_blank",
            "noopener,noreferrer"
        );

        return;
    }

    // ==========================
    // MÓVIL
    // ==========================

    const popup = window.open(
        deepLink,
        "_blank"
    );

    // respaldo
    setTimeout(() => {

        if (!document.hidden) {

            window.open(
                apiUrl,
                "_blank"
            );

        }

    }, 1200);

}