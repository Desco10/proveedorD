/**
 * ==========================================================
 * DescoApp - Smart WhatsApp Launcher
 * ----------------------------------------------------------
 * Abre WhatsApp utilizando la API oficial.
 *
 * Objetivos:
 * ✓ No modificar el historial de la página.
 * ✓ Mantener estable el flujo de finalizarCompra().
 * ✓ Funcionar en Android, iPhone y escritorio.
 * ✓ Evitar que al regresar aparezca la página de
 *   mensaje precargado sin funcionalidad.
 * ==========================================================
 */

function abrirWhatsApp(telefono, mensaje) {

    if (!telefono || !mensaje) {
        console.error("abrirWhatsApp(): teléfono o mensaje inválido.");
        return;
    }

    const texto = encodeURIComponent(mensaje);

    const url =
        `https://api.whatsapp.com/send?phone=${telefono}&text=${texto}`;

    // Abrir en una nueva pestaña/ventana.
    // Esto conserva la página actual de DescoApp
    // y evita alterar el historial del navegador.
    const nuevaVentana = window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

    // Si el navegador bloqueó la ventana emergente,
    // usar el mismo tab como último recurso.
    if (!nuevaVentana) {
        window.location.assign(url);
    }

}