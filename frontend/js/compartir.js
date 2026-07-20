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
    async function compartir(producto) {

        const url = crearUrl(producto);

        if (!url) return;

        const datos = {

            title: producto.nombre,

            text: producto.descripcion || producto.nombre,

            

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