/* ==========================================
   COMPARTIR.JS
   Sistema centralizado de URLs y Slugs
========================================== */

const Compartir = (() => {

    // ==========================
    // Crear slug
    // ==========================
    function crearSlug(texto = "") {

        return texto
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    }

    // ==========================
    // Buscar proveedor por ID
    // ==========================
    function obtenerProveedor(id) {

        const cache = JSON.parse(
            localStorage.getItem("proveedores_cache")
        ) || [];

        return cache.find(
            p => String(p.id) === String(id)
        );

    }

    // ==========================
    // Construir URL
    // ==========================
    function crearUrl(producto) {

        if (!producto) return "";

        const proveedor = obtenerProveedor(producto.proveedorId);

        if (!proveedor) {

            console.error("Proveedor no encontrado.");

            return "";

        }

        const slugProducto = crearSlug(producto.nombre);

        return `${window.location.origin}/${proveedor.slug}/${slugProducto}`;

    }

    // ==========================
    // Copiar enlace
    // ==========================
    async function copiar(producto) {

        const url = crearUrl(producto);

        if (!url) return;

        try {

            await navigator.clipboard.writeText(url);

            alert("✅ Enlace copiado correctamente");

        } catch (err) {

            console.error(err);

            alert("No fue posible copiar el enlace.");

        }

    }

    // ==========================
    // Compartir
    // ==========================
// Compartir
// ==========================
// Compartir por WhatsApp
// ==========================
function compartir(producto) {

    const url = crearUrl(producto);

    if (!url) return;

    const proveedor = obtenerProveedor(producto.proveedorId);

    const descripcion = (producto.descripcion || "").trim();
    const precio = (producto.precio || "").trim();

    const mensaje =
`🛒 *${producto.nombre}*

${descripcion ? "💊 " + descripcion + "\n\n" : ""}${precio ? `💰 *Precio:*
${precio}

` : ""}${proveedor ? `🏪 *Disponible en:*
${proveedor.nombre}

` : ""}👇 *Ver producto*

${url}

🟢 Compra fácil y rápido con DescoApp.`;

    window.open(
        `https://wa.me/?text=${encodeURIComponent(mensaje)}`,
        "_blank"
    );

}

    return {

        crearSlug,

        crearUrl,

        copiar,

        compartir

    };

})();