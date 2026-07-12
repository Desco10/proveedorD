/* ==========================================
   COMPARTIR.JS
   Sistema centralizado de URLs y Slugs
========================================== */

const Compartir = (() => {

    // Convierte cualquier nombre en slug
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

    // Construye la URL completa del producto
    function crearUrl(producto) {

        if (!producto) return "";

        if (!proveedorActual || !proveedorActual.slug) {
            console.error("Proveedor actual no disponible.");
            return "";
        }

        const slugProducto = crearSlug(producto.nombre);

        return `${window.location.origin}/${proveedorActual.slug}/${slugProducto}`;
    }

    // Copiar URL
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

    // Compartir usando Web Share API
    async function compartir(producto) {

        const url = crearUrl(producto);

        if (!url) return;

        const datos = {
            title: producto.nombre,
            text: producto.descripcion || producto.nombre,
            url
        };

        if (navigator.share) {

            try {

                await navigator.share(datos);

            } catch (e) {

                console.log("Compartir cancelado");

            }

        } else {

            copiar(producto);

        }

    }

    return {

        crearSlug,
        crearUrl,
        copiar,
        compartir

    };

})();