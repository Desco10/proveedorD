/*=========================================================
    DESCOAPP
    RUTAS COMPARTIDAS
    FASE 2 - PASO 1
=========================================================*/

const RutasCompartidas = (() => {

    function obtenerSlugs() {

        // Elimina "/" inicial y final
        const path = window.location.pathname
            .replace(/^\/+|\/+$/g, "");

        if (!path) {
            return null;
        }

        const partes = path.split("/");

        if (partes.length < 2) {
            return null;
        }

        return {

            proveedorSlug: partes[0],

            productoSlug: partes[1]

        };

    }

    return {

        obtenerSlugs

    };

})();


const ruta = RutasCompartidas.obtenerSlugs();

console.log("RUTA DETECTADA:", ruta);